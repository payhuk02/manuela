import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImage } from "@/lib/imageOptimizer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { Upload, Trash2 } from "lucide-react";

// Use the WebP variant (~180 KB) instead of the original 1.7 MB JPG —
// this asset is only a fallback shown in the admin upload preview.
import heroDefault from "@/assets/hero-law.webp";


type LogoEntry = {
  key: string;
  label: string;
  description: string;
  fallback: string;
  bg: string;
};

const LOGOS: LogoEntry[] = [
  {
    key: "logo.header",
    label: "Logo en-tête (fond clair)",
    description: "Affiché sur la barre de navigation blanche.",
    fallback: "",
    bg: "bg-background",
  },
  {
    key: "seo.home.image",
    label: "Image de partage (Réseaux Sociaux / Lien web)",
    description: "Le logo ou l'image qui s'affiche lorsque vous partagez le lien du site (WhatsApp, LinkedIn, etc.). Format paysage 1200x630 recommandé.",
    fallback: "",
    bg: "bg-background",
  },
  {
    key: "logo.footer",
    label: "Logo pied de page (fond sombre)",
    description: "Affiché sur le footer sombre. Utilisez une version claire/blanche.",
    fallback: "",
    bg: "bg-night",
  },
  {
    key: "hero.image",
    label: "Image Hero (page d'accueil)",
    description: "Image de fond du hero. Format paysage recommandé (≥ 1920×1080).",
    fallback: heroDefault,
    bg: "bg-night",
  },
  {
    key: "about.portrait",
    label: "Portrait — Accueil (section « Présentation »)",
    description: "Photo affichée à gauche de la présentation sur la page d'accueil. Format portrait 4/5 recommandé. Si vide, aucune image n'est affichée.",
    fallback: "",
    bg: "bg-background",
  },
  {
    key: "founder_quote_image",
    label: "Image « Le Mot de l'Avocate » (Accueil)",
    description: "Photo affichée pour la section « Le Mot de l'Avocate » sur l'accueil. Format portrait 4/5 recommandé. Si vide, l'image par défaut est utilisée.",
    fallback: "",
    bg: "bg-night",
  },
  {
    key: "card.photo",
    label: "Photo pour la « Carte de visite » (/carte)",
    description: "Photo affichée sur la page Carte de Visite. Si vide, la photo du profil Fondateur est utilisée.",
    fallback: "",
    bg: "bg-background",
  },
  {
    key: "cabinet.portrait",
    label: "Portrait — Page « Cabinet »",
    description: "Photo affichée à gauche de la présentation sur la page /cabinet. Format portrait 4/5 recommandé. Si vide, aucune image n'est affichée.",
    fallback: "",
    bg: "bg-background",
  },
  // Carrousel Hero — 9 slides d'arrière-plan affichées après l'animation d'encre.
  ...Array.from({ length: 9 }, (_, i) => ({
    key: `hero.s${i + 1}.image`,
    label: `Image carrousel Hero — Slide ${i + 1}`,
    description: `Image de fond du slide ${i + 1} du carrousel d'accueil. Format paysage (≥ 1920×1080) recommandé. Si vide, l'image par défaut est utilisée.`,
    fallback: "",
    bg: "bg-night",
  })),
];

export const LogosAdmin = () => {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("*")
      .in("key", LOGOS.map((l) => l.key))
      .then(({ data, error }) => {
        if (error) return toast.error(error.message);
        const map: Record<string, string> = {};
        (data ?? []).forEach((r: any) => {
          if (r.value) map[r.key] = r.value;
        });
        setUrls(map);
      });
  }, []);

  const upload = async (key: string, file: File) => {
    setUploading(key);
    try {
      const shouldOptimize = file.type.startsWith("image/") && file.type !== "image/svg+xml";
      const payload = shouldOptimize ? await optimizeImage(file) : file;
      const ext = payload.name.split(".").pop() || "png";
      const path = `logos/${key.replace(".", "-")}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("site-images")
        .upload(path, payload, { upsert: true, contentType: payload.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("site-images").getPublicUrl(path);
      const url = pub.publicUrl;

      const payloadRows = ["fr", "en"].map((lang) => ({ key, lang, value: url }));
      const { error: dbErr } = await supabase
        .from("site_content")
        .upsert(payloadRows, { onConflict: "key,lang" });
      if (dbErr) throw dbErr;

      setUrls((prev) => ({ ...prev, [key]: url }));
      const saved = Math.max(0, file.size - payload.size);
      toast.success(saved > 1024 ? `Image optimisée et mise à jour (-${Math.round((saved / file.size) * 100)} %)` : "Logo mis à jour");
      logAudit({ action: "logo.update", target_type: "site_content", target_id: key, details: { url } });
    } catch (e: any) {
      toast.error(e.message ?? "Échec de l'upload");
    } finally {
      setUploading(null);
    }
  };

  const reset = async (key: string) => {
    const payload = ["fr", "en"].map((lang) => ({ key, lang, value: "" }));
    const { error } = await supabase
      .from("site_content")
      .upsert(payload, { onConflict: "key,lang" });
    if (error) return toast.error(error.message);
    setUrls((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    toast.success("Logo réinitialisé");
    logAudit({ action: "logo.reset", target_type: "site_content", target_id: key });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-serif text-3xl text-primary">Logos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Téléversez les logos affichés dans l'en-tête et le pied de page. Format recommandé : PNG transparent.
        </p>
      </div>

      <div className="space-y-6">
        {LOGOS.map((l) => {
          const current = urls[l.key] || l.fallback;
          const isCustom = !!urls[l.key];
          return (
            <div key={l.key} className="bg-card border border-border p-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-accent">{l.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{l.description}</p>
              </div>

              <div className={`${l.bg} border border-border rounded p-6 flex items-center justify-center`}>
                <img src={current} alt={l.label} className="h-16 w-auto" />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    disabled={uploading === l.key}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) upload(l.key, f);
                      e.target.value = "";
                    }}
                  />
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border bg-background hover:bg-accent/10 cursor-pointer rounded"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading === l.key ? "Téléversement…" : "Téléverser un logo"}
                  </span>
                </label>
                {isCustom && (
                  <Button variant="ghost" size="sm" onClick={() => reset(l.key)}>
                    <Trash2 className="h-4 w-4" /> Réinitialiser
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <StorageOptimizer />
    </div>
  );
};

const StorageOptimizer = () => {
  const [running, setRunning] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [result, setResult] = useState<any>(null);

  const run = async () => {
    setRunning(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("optimize-storage-images", {
        body: { dryRun, buckets: ["site-images", "editor-media"], maxWidth: 1920, quality: 82 },
      });
      if (error) throw error;
      setResult(data);
      toast.success(
        dryRun
          ? `Simulation : ${data.summary.wouldReplace} fichier(s) à recompresser (~${Math.round(data.summary.savedBytes / 1024)} Ko économisés)`
          : `Recompression terminée : ${data.summary.replaced} fichier(s), ${data.summary.savedPct}% économisés`
      );
    } catch (e: any) {
      toast.error(e.message ?? "Erreur recompression");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-card border border-border p-6 space-y-4 mt-10">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Optimisation Storage</p>
        <h3 className="font-serif text-xl text-primary mt-1">Recompresser les images existantes</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Parcourt les buckets <code>site-images</code> et <code>editor-media</code>, recompresse les JPEG/PNG/WebP au-dessus de 80&nbsp;Ko (max 1920&nbsp;px, qualité 82) et remplace les fichiers en place. Chaque exécution est enregistrée dans l'audit.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
        Mode simulation (n'écrit rien)
      </label>

      <Button onClick={run} disabled={running}>
        {running ? "En cours…" : dryRun ? "Lancer la simulation" : "Lancer la recompression"}
      </Button>

      {result?.summary && (
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            Analysés : <strong>{result.summary.processed}</strong> · Remplacés :{" "}
            <strong>{result.summary.replaced}</strong> · À remplacer :{" "}
            <strong>{result.summary.wouldReplace}</strong> · Sans gain :{" "}
            <strong>{result.summary.skipped}</strong> · Erreurs :{" "}
            <strong>{result.summary.errors}</strong>
          </p>
          <p>
            Avant : {(result.summary.totalBefore / 1024).toFixed(0)} Ko → Après :{" "}
            {(result.summary.totalAfter / 1024).toFixed(0)} Ko (
            <strong>{result.summary.savedPct}%</strong> économisés)
          </p>
        </div>
      )}
    </div>
  );
};
