import { useEffect, useState } from "react";
import { Save, Search, FileText, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";

/**
 * Site-wide SEO configuration: Google Search Console verification meta-tag,
 * IndexNow key (search-engine ping), and Plausible (privacy-friendly analytics).
 *
 * Stored in `site_content` under reserved keys:
 *   - seo.site.gsc_verification        → tag injected as <meta name="google-site-verification">
 *   - seo.site.indexnow_key            → published at /<key>.txt and used by the seo-ping function
 *   - seo.site.plausible_domain        → if set, loads plausible.io tracking
 */
const KEYS = [
  "seo.site.gsc_verification",
  "seo.site.indexnow_key",
  "seo.site.plausible_domain",
] as const;

type Key = (typeof KEYS)[number];

export const SeoSiteAdmin = () => {
  const [values, setValues] = useState<Record<Key, string>>({
    "seo.site.gsc_verification": "",
    "seo.site.indexnow_key": "",
    "seo.site.plausible_domain": "",
  });
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("key,value")
      .in("key", KEYS as unknown as string[])
      .eq("lang", "fr")
      .then(({ data }) => {
        const next = { ...values };
        (data ?? []).forEach((r) => {
          (next as Record<string, string>)[r.key] = r.value ?? "";
        });
        setValues(next);
        setLoaded(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setBusy(true);
    const payload = KEYS.map((k) => ({ key: k, lang: "fr", value: values[k] ?? "" }));
    const { error } = await supabase
      .from("site_content")
      .upsert(payload, { onConflict: "key,lang" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Configuration SEO enregistrée");
    logAudit({ action: "seo.site.update", target_type: "site_content", details: { keys: KEYS } });
  };

  if (!loaded) return <p className="text-sm text-muted-foreground">Chargement…</p>;

  const indexNowKey = values["seo.site.indexnow_key"].trim();

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="font-serif text-3xl text-primary">SEO — Suivi & moteurs de recherche</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Vérifiez votre site auprès de Google, activez la notification automatique des mises à jour
          aux moteurs de recherche (IndexNow → Bing, Yandex) et activez un suivi d'audience respectueux de la vie privée.
        </p>
      </div>

      {/* GSC */}
      <section className="bg-card border border-border p-6 space-y-3">
        <div className="flex items-start gap-3">
          <Search className="h-5 w-5 text-accent mt-1" />
          <div className="flex-1">
            <h3 className="font-serif text-lg text-primary">Google Search Console</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Méthode « Balise HTML » : copiez ici la valeur du <code>content</code> du tag fourni par Google
              (ex. <code>abcdEFGh1234…</code>). Sera injectée automatiquement dans le <code>&lt;head&gt;</code>.
            </p>
          </div>
        </div>
        <Input
          value={values["seo.site.gsc_verification"]}
          onChange={(e) => setValues({ ...values, "seo.site.gsc_verification": e.target.value })}
          placeholder="Code de vérification Google"
        />
      </section>

      {/* IndexNow */}
      <section className="bg-card border border-border p-6 space-y-3">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-accent mt-1" />
          <div className="flex-1">
            <h3 className="font-serif text-lg text-primary">IndexNow — ping automatique</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Permet d'avertir Bing &amp; Yandex à chaque publication. Générez une clé alphanumérique
              (8 à 128 caractères) sur{" "}
              <a className="underline" href="https://www.bing.com/indexnow" target="_blank" rel="noreferrer">
                bing.com/indexnow
              </a>{" "}
              et collez-la ici. Elle sera publiée à <code>/{indexNowKey || "VOTRE-CLE"}.txt</code>.
            </p>
          </div>
        </div>
        <Input
          value={values["seo.site.indexnow_key"]}
          onChange={(e) =>
            setValues({
              ...values,
              "seo.site.indexnow_key": e.target.value.replace(/[^a-zA-Z0-9-]/g, ""),
            })
          }
          placeholder="ex. a1b2c3d4e5f6g7h8"
        />
        <p className="text-[11px] text-muted-foreground/80">
          ⚠️ Pour finaliser : (1) ajoutez ce même code comme secret <code>INDEXNOW_KEY</code> dans Supabase,
          (2) déployez un fichier <code>{indexNowKey || "&lt;clé&gt;"}.txt</code> à la racine de Vercel
          contenant exactement la clé.
        </p>
      </section>

      {/* Plausible */}
      <section className="bg-card border border-border p-6 space-y-3">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-accent mt-1" />
          <div className="flex-1">
            <h3 className="font-serif text-lg text-primary">Plausible Analytics (optionnel)</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Suivi d'audience anonyme et conforme RGPD, sans cookie. Indiquez le domaine déclaré dans
              Plausible (ex. <code>cabinet-diabate.com</code>). Laissez vide pour désactiver.
            </p>
          </div>
        </div>
        <Input
          value={values["seo.site.plausible_domain"]}
          onChange={(e) => setValues({ ...values, "seo.site.plausible_domain": e.target.value })}
          placeholder="cabinet-diabate.com"
        />
      </section>

      <Button onClick={save} variant="gold" disabled={busy}>
        <Save className="h-4 w-4" /> {busy ? "Enregistrement…" : "Sauvegarder"}
      </Button>
    </div>
  );
};
