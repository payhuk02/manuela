import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { ExternalLink, Save, RotateCcw, QrCode } from "lucide-react";

type Field = {
  key: string;
  label: string;
  hint?: string;
  multiline?: boolean;
  placeholder: string;
};

const FIELDS: Field[] = [
  { key: "card.cabinet", label: "Nom du cabinet (ligne dorée)", placeholder: "CABINET Manuela DIABATE" },
  { key: "card.name", label: "Nom affiché", placeholder: "Maître Manuela DIABATE" },
  { key: "card.subtitle", label: "Titre / Profession", placeholder: "Avocat au Barreau de Paris" },
  {
    key: "card.tagline",
    label: "Phrase d'accroche",
    multiline: true,
    placeholder: "Conseil & Contentieux — Expertise France & Afrique",
  },
  { key: "card.phone", label: "Téléphone du cabinet", placeholder: "+33 1 76 58 67 37" },
  { key: "card.whatsapp", label: "Mobile / WhatsApp", placeholder: "+33 6 68 44 10 49" },
  { key: "card.email", label: "Email", placeholder: "contact@cabinet-diabate.com" },
  { key: "card.address", label: "Adresse", placeholder: "3 avenue des Ternes, 75017 Paris" },
  { key: "card.hours", label: "Horaires", placeholder: "Lundi – Vendredi : 9h00 – 19h00" },
  { key: "card.website", label: "Site web", placeholder: "https://cabinet-diabate.com" },
  { key: "card.linkedin", label: "LinkedIn", placeholder: "https://www.linkedin.com/in/manuela-diabate" },
  { key: "card.appointment", label: "Lien de prise de rendez-vous", placeholder: "https://consultation.avocat.fr/avocat-paris/manuela-diabate-48544.html" },
];

export const BusinessCardAdmin = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("key,value")
        .eq("lang", "fr")
        .like("key", "card.%");
      if (error) {
        toast.error(error.message);
        return;
      }
      const map: Record<string, string> = {};
      (data ?? []).forEach((r: any) => {
        map[r.key] = r.value ?? "";
      });
      setValues(map);
      setLoaded(true);
    })();
  }, []);

  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const cardUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/carte`;

  const save = async () => {
    setBusy(true);
    const rows = FIELDS.map((f) => ({
      key: f.key,
      lang: "fr",
      value: values[f.key] ?? "",
    }));
    const { error } = await supabase
      .from("site_content")
      .upsert(rows, { onConflict: "key,lang" });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Carte de visite enregistrée");
    logAudit({
      action: "business_card.update",
      target_type: "site_content",
      details: { fields: rows.map((r) => r.key) },
    });
  };

  const resetField = (k: string) => set(k, "");

  if (!loaded) return <p className="text-muted-foreground">Chargement…</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <QrCode className="h-3 w-3" /> Carte de visite numérique
        </div>
        <h2 className="font-serif text-2xl text-foreground">Carte de visite — QR code</h2>
        <p className="text-sm text-muted-foreground">
          Cette page sert d'URL pour le QR code de la carte de visite physique.
          Laissez un champ vide pour utiliser la valeur par défaut récupérée depuis{" "}
          <strong>Contact</strong> et <strong>Équipe</strong>.
        </p>
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-secondary/40 p-3 text-sm">
          <span className="font-mono text-xs text-foreground/80">{cardUrl}</span>
          <Button asChild variant="outline" size="sm">
            <a href="/carte" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Aperçu
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(cardUrl);
              toast.success("URL copiée");
            }}
          >
            Copier l'URL
          </Button>
          <Button asChild variant="outline" size="sm">
            <a
              href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
                cardUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <QrCode className="mr-2 h-3.5 w-3.5" />
              Générer un QR code
            </a>
          </Button>
        </div>
      </header>

      <div className="grid gap-5">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={f.key} className="text-xs uppercase tracking-wider text-foreground/80">
              {f.label}
            </Label>
            <div className="flex items-start gap-2">
              {f.multiline ? (
                <Textarea
                  id={f.key}
                  rows={2}
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              ) : (
                <Input
                  id={f.key}
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              )}
              {(values[f.key] ?? "") !== "" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => resetField(f.key)}
                  title="Réinitialiser ce champ (utilisera la valeur par défaut)"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Par défaut : <span className="font-mono">{f.placeholder}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <Button onClick={save} disabled={busy} variant="gold">
          <Save className="mr-2 h-4 w-4" />
          {busy ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Photo et coordonnées principales sont aussi modifiables dans{" "}
          <strong>Contact</strong> et <strong>Équipe</strong>.
        </p>
      </div>
    </div>
  );
};

export default BusinessCardAdmin;
