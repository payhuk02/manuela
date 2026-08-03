import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { Save } from "lucide-react";

type Info = {
  id: string;
  address: string;
  hours_fr: string;
  hours_en: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  appointment_url: string;
  cabinet_name_fr: string;
  cabinet_name_en: string;
  linkedin_url: string;
};

export const ContactAdmin = () => {
  const [info, setInfo] = useState<Info | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data) {
        setInfo(data as Info);
        return;
      }
      // No row yet — create a default one so admins can edit it.
      const { data: created, error: insertError } = await supabase
        .from("contact_info")
        .insert({})
        .select("*")
        .single();
      if (insertError) {
        toast.error(insertError.message);
        return;
      }
      setInfo(created as Info);
    })();
  }, []);

  const save = async () => {
    if (!info) return;
    setBusy(true);
    const { id, ...patch } = info;
    const { error } = await supabase.from("contact_info").update(patch).eq("id", id);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Enregistré");
      logAudit({
        action: "contact.update",
        target_type: "contact_info",
        target_id: id,
        details: { fields: Object.keys(patch) },
      });
    }
  };

  if (!info) return <p className="text-muted-foreground">Chargement…</p>;

  const set = <K extends keyof Info>(k: K, v: Info[K]) => setInfo({ ...info, [k]: v });

  // Valeurs effectivement affichées dans le pied de page (fallbacks)
  const FOOTER_DEFAULTS = {
    address: "3 avenue des Ternes, 75017 Paris",
    phone: "+33 (0) 1 76 58 67 37",
    whatsapp: "+33 (0) 6 68 44 10 49",
    email: "contact@cabinet-diabate.com",
    linkedin: "https://www.linkedin.com/in/manuela-diabate-88a775220",
  };

  // Aperçu live des valeurs qui apparaîtront dans le pied de page
  const footerPreview = {
    address: info.address || FOOTER_DEFAULTS.address,
    phone: info.phone || FOOTER_DEFAULTS.phone,
    whatsapp: info.whatsapp_number || FOOTER_DEFAULTS.whatsapp,
    email: info.email || FOOTER_DEFAULTS.email,
    linkedin: info.linkedin_url || FOOTER_DEFAULTS.linkedin,
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-serif text-3xl text-primary">Page Contact & Pied de page</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ces informations alimentent la page <code className="text-xs">/contact</code>, le pied de page et les boutons de prise de rendez-vous (WhatsApp, Calendly…).
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Les champs marqués <FooterBadge /> sont visibles dans le pied de page du site (colonne « Contact »).
        </p>
      </div>

      {/* Aperçu Pied de page */}
      <section className="bg-night text-primary-foreground p-6 rounded-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-accent mb-4">Aperçu — Pied de page</p>
        <ul className="space-y-2 text-sm text-primary-foreground/80">
          <li>📍 {footerPreview.address}</li>
          <li>📞 {footerPreview.phone}</li>
          <li>💬 {footerPreview.whatsapp} <span className="text-primary-foreground/40">· WhatsApp</span></li>
          <li>✉️ {footerPreview.email}</li>
          <li className="break-all">in {footerPreview.linkedin}</li>
        </ul>
      </section>

      {/* Section 1 — Coordonnées principales (alimentent le pied de page) */}
      <section className="space-y-4 bg-card border border-border p-6">
        <header>
          <h3 className="font-serif text-xl text-primary">Coordonnées</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Affichées sur la page Contact <strong>et dans le pied de page</strong> du site.
          </p>
        </header>
        <Field label="Adresse postale" inFooter>
          <Input value={info.address} onChange={(e) => set("address", e.target.value)} placeholder={FOOTER_DEFAULTS.address} />
        </Field>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Horaires (FR)" hint="Page Contact uniquement">
            <Input value={info.hours_fr} onChange={(e) => set("hours_fr", e.target.value)} placeholder="Lundi – Vendredi : 9h00 – 19h00" />
          </Field>
          <Field label="Hours (EN)" hint="Contact page only">
            <Input value={info.hours_en} onChange={(e) => set("hours_en", e.target.value)} placeholder="Monday – Friday: 9:00 – 19:00" />
          </Field>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Téléphone" inFooter>
            <Input value={info.phone} onChange={(e) => set("phone", e.target.value)} placeholder={FOOTER_DEFAULTS.phone} />
          </Field>
          <Field label="Email" inFooter>
            <Input type="email" value={info.email} onChange={(e) => set("email", e.target.value)} placeholder={FOOTER_DEFAULTS.email} />
          </Field>
        </div>
        <Field label="LinkedIn (URL complète)" inFooter hint="Icône LinkedIn personnelle dans le pied de page">
          <Input value={info.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} placeholder={FOOTER_DEFAULTS.linkedin} />
        </Field>
      </section>

      {/* Section 2 — Prise de rendez-vous & WhatsApp */}
      <section className="space-y-4 bg-card border border-border p-6">
        <header>
          <h3 className="font-serif text-xl text-primary">WhatsApp & prise de rendez-vous</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Le numéro WhatsApp est <strong>affiché dans le pied de page</strong> et utilisé par tous les CTA « Prendre rendez-vous » (bouton flottant, formulaires d'expertise…).
          </p>
        </header>
        <Field
          label="Numéro WhatsApp"
          inFooter
          hint="Format international, ex : +33 6 68 44 10 49 ou 33668441049"
        >
          <Input value={info.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} placeholder={FOOTER_DEFAULTS.whatsapp} />
        </Field>
        <Field label="Lien de prise de rendez-vous (Calendly, Google Agenda, …)" hint="Optionnel — si vide, les CTA basculent sur WhatsApp">
          <Input value={info.appointment_url} onChange={(e) => set("appointment_url", e.target.value)} placeholder="https://consultation.avocat.fr/avocat-paris/..." />
        </Field>
      </section>

      {/* Section 3 — Identité du cabinet */}
      <section className="space-y-4 bg-card border border-border p-6">
        <header>
          <h3 className="font-serif text-xl text-primary">Identité du cabinet</h3>
          <p className="text-xs text-muted-foreground mt-1">Utilisée dans les messages WhatsApp préremplis (FR/EN).</p>
        </header>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Nom du cabinet (FR)">
            <Input
              value={info.cabinet_name_fr}
              onChange={(e) => set("cabinet_name_fr", e.target.value)}
              placeholder="Cabinet Manuela Diabate — Avocat au Barreau de Paris"
            />
          </Field>
          <Field label="Cabinet name (EN)">
            <Input
              value={info.cabinet_name_en}
              onChange={(e) => set("cabinet_name_en", e.target.value)}
              placeholder="Manuela Diabate Law Firm — Attorney at the Paris Bar"
            />
          </Field>
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={save} variant="gold" disabled={busy} size="lg">
          <Save className="h-4 w-4" />
          {busy ? "Sauvegarde…" : "Sauvegarder"}
        </Button>
      </div>
    </div>
  );
};

const FooterBadge = () => (
  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-accent/15 text-accent text-[10px] uppercase tracking-[0.15em] font-medium">
    Pied de page
  </span>
);

const Field = ({
  label,
  children,
  inFooter,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  inFooter?: boolean;
  hint?: string;
}) => (
  <div>
    <div className="flex items-center gap-2 flex-wrap">
      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      {inFooter && <FooterBadge />}
    </div>
    <div className="mt-2">{children}</div>
    {hint && <p className="mt-1.5 text-xs text-muted-foreground/70">{hint}</p>}
  </div>
);
