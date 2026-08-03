import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Severity = "ok" | "warn" | "error";
type Issue = { severity: Severity; label: string; detail?: string };
type PageReport = {
  key: string;
  label: string;
  path: string;
  title: string;
  description: string;
  imageUrl: string;
  issues: Issue[];
  score: number; // 0-100
};

const STATIC_PAGES: { key: string; label: string; path: string; titleKey: string; descKey: string; imageKey: string }[] = [
  { key: "home", label: "Accueil", path: "/", titleKey: "seo.home.title", descKey: "seo.home.description", imageKey: "seo.home.image" },
  { key: "cabinet", label: "Cabinet", path: "/cabinet", titleKey: "seo.cabinet.title", descKey: "seo.cabinet.description", imageKey: "seo.cabinet.image" },
  { key: "expertises", label: "Expertises", path: "/expertises", titleKey: "seo.expertises.title", descKey: "seo.expertises.description", imageKey: "seo.expertises.image" },
  { key: "team", label: "Équipe", path: "/equipe", titleKey: "seo.team.title", descKey: "seo.team.description", imageKey: "seo.team.image" },
  { key: "news", label: "Actualités", path: "/actualites", titleKey: "seo.news.title", descKey: "seo.news.description", imageKey: "seo.news.image" },
  { key: "contact", label: "Contact", path: "/contact", titleKey: "seo.contact.title", descKey: "seo.contact.description", imageKey: "seo.contact.image" },
];

const audit = (
  title: string,
  description: string,
  imageUrl: string,
  duplicates: { titleDup: boolean; descDup: boolean },
): { issues: Issue[]; score: number } => {
  const issues: Issue[] = [];
  const t = title.trim();
  const d = description.trim();

  if (!t) issues.push({ severity: "error", label: "Titre absent" });
  else {
    if (t.length < 30) issues.push({ severity: "warn", label: `Titre trop court (${t.length} car.)`, detail: "Idéal : 50–60 caractères." });
    else if (t.length > 60) issues.push({ severity: "warn", label: `Titre trop long (${t.length} car.)`, detail: "Google tronque au-delà de 60 caractères." });
  }

  if (!d) issues.push({ severity: "error", label: "Description absente" });
  else {
    if (d.length < 80) issues.push({ severity: "warn", label: `Description trop courte (${d.length} car.)`, detail: "Idéal : 120–160 caractères." });
    else if (d.length > 160) issues.push({ severity: "warn", label: `Description trop longue (${d.length} car.)`, detail: "Google tronque au-delà de 160 caractères." });
  }

  if (!imageUrl) issues.push({ severity: "warn", label: "Image OG absente", detail: "Une image de partage personnalisée améliore le CTR sur les réseaux sociaux." });

  if (duplicates.titleDup) issues.push({ severity: "error", label: "Titre dupliqué", detail: "Plusieurs pages partagent ce même titre." });
  if (duplicates.descDup) issues.push({ severity: "error", label: "Description dupliquée", detail: "Plusieurs pages partagent cette même description." });

  // Score = 100 - 25*errors - 8*warns, floored at 0.
  const errs = issues.filter((i) => i.severity === "error").length;
  const warns = issues.filter((i) => i.severity === "warn").length;
  const score = Math.max(0, 100 - errs * 25 - warns * 8);
  return { issues, score };
};

const ScoreBadge = ({ score }: { score: number }) => {
  const tone = score >= 85 ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" : score >= 60 ? "bg-amber-500/15 text-amber-700 border-amber-500/40" : "bg-destructive/15 text-destructive border-destructive/40";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 text-xs font-semibold border rounded", tone)}>
      {score}/100
    </span>
  );
};

const SevIcon = ({ s }: { s: Severity }) => {
  if (s === "ok") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (s === "warn") return <AlertTriangle className="h-4 w-4 text-amber-600" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
};

export const SeoAuditAdmin = () => {
  const [reports, setReports] = useState<PageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [extra, setExtra] = useState<{ articlesMissing: number; articlesNoSlug: number; expertisesMissing: number }>({
    articlesMissing: 0,
    articlesNoSlug: 0,
    expertisesMissing: 0,
  });

  const run = async () => {
    setLoading(true);
    const allKeys = STATIC_PAGES.flatMap((p) => [p.titleKey, p.descKey, p.imageKey]);
    const [{ data: contentRows }, { data: articles }, { data: expertises }] = await Promise.all([
      supabase.from("site_content").select("key,value").in("key", allKeys).eq("lang", "fr"),
      supabase.from("news_articles").select("id,title,seo_title,seo_description,slug,published"),
      supabase.from("expertises").select("id,title,seo_title,seo_description,slug,published"),
    ]);

    const contentMap: Record<string, string> = {};
    (contentRows ?? []).forEach((r) => (contentMap[r.key] = r.value ?? ""));

    // Default values come from each page's defaultValue in SeoAdmin — we read
    // overrides from DB only; if absent the audit treats them as the published
    // default which is *not* dynamic here, but we approximate by using empty
    // string. The admin UI is the source of truth for the editor; this audit
    // checks what's actually stored (overrides).
    const titles = STATIC_PAGES.map((p) => contentMap[p.titleKey] ?? "");
    const descriptions = STATIC_PAGES.map((p) => contentMap[p.descKey] ?? "");

    const titleDupSet = new Set(
      titles.filter((t, i) => t && titles.indexOf(t) !== i).map((t) => t.toLowerCase()),
    );
    const descDupSet = new Set(
      descriptions.filter((d, i) => d && descriptions.indexOf(d) !== i).map((d) => d.toLowerCase()),
    );

    const out: PageReport[] = STATIC_PAGES.map((p) => {
      const title = contentMap[p.titleKey] ?? "";
      const description = contentMap[p.descKey] ?? "";
      const imageUrl = contentMap[p.imageKey] ?? "";
      const { issues, score } = audit(title, description, imageUrl, {
        titleDup: title ? titleDupSet.has(title.toLowerCase()) : false,
        descDup: description ? descDupSet.has(description.toLowerCase()) : false,
      });
      return { key: p.key, label: p.label, path: p.path, title, description, imageUrl, issues, score };
    });

    setReports(out);

    setExtra({
      articlesMissing: (articles ?? []).filter(
        (a) => a.published && (!a.seo_title || !a.seo_description),
      ).length,
      articlesNoSlug: (articles ?? []).filter((a) => a.published && !a.slug).length,
      expertisesMissing: (expertises ?? []).filter(
        (e) => e.published && (!e.seo_title || !e.seo_description),
      ).length,
    });

    setLoading(false);
  };

  useEffect(() => {
    run();
  }, []);

  const overall = useMemo(() => {
    if (reports.length === 0) return 0;
    return Math.round(reports.reduce((s, r) => s + r.score, 0) / reports.length);
  }, [reports]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-3xl text-primary">Audit SEO — Tableau de bord</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Vérifie en temps réel les méta-titres, descriptions, images de partage et doublons sur toutes les pages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Score global :</span>
          <ScoreBadge score={overall} />
          <Button variant="outline" size="sm" onClick={run} disabled={loading}>
            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} /> Relancer
          </Button>
        </div>
      </div>

      {(extra.articlesMissing > 0 || extra.articlesNoSlug > 0 || extra.expertisesMissing > 0) && (
        <div className="border border-amber-500/40 bg-amber-500/10 p-4 rounded text-sm space-y-1">
          <p className="font-semibold text-amber-800 dark:text-amber-300">Points d'attention contenu :</p>
          <ul className="list-disc list-inside text-amber-900/80 dark:text-amber-200/80">
            {extra.articlesMissing > 0 && <li>{extra.articlesMissing} article(s) publié(s) sans titre SEO ou description SEO personnalisés.</li>}
            {extra.articlesNoSlug > 0 && <li>{extra.articlesNoSlug} article(s) publié(s) sans slug d'URL (URL avec ID).</li>}
            {extra.expertisesMissing > 0 && <li>{extra.expertisesMissing} expertise(s) publiée(s) sans titre SEO ou description SEO personnalisés.</li>}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Analyse en cours…</p>}
        {!loading &&
          reports.map((r) => (
            <div key={r.key} className="border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{r.path}</p>
                  <h3 className="font-serif text-xl text-primary">{r.label}</h3>
                </div>
                <ScoreBadge score={r.score} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    Titre ({r.title.trim().length} car.)
                  </p>
                  <p className="text-foreground line-clamp-2">{r.title || <span className="italic text-muted-foreground">(vide — utilise la valeur par défaut)</span>}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    Description ({r.description.trim().length} car.)
                  </p>
                  <p className="text-foreground line-clamp-3">{r.description || <span className="italic text-muted-foreground">(vide — utilise la valeur par défaut)</span>}</p>
                </div>
              </div>

              {r.issues.length === 0 ? (
                <div className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Aucun problème détecté.
                </div>
              ) : (
                <ul className="mt-4 space-y-1.5">
                  {r.issues.map((i, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <SevIcon s={i.severity} />
                      <div>
                        <span className="font-medium text-foreground">{i.label}</span>
                        {i.detail && <span className="text-muted-foreground"> — {i.detail}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
      </div>

      <p className="text-[11px] text-muted-foreground/70 italic">
        Note : l'audit lit uniquement les valeurs personnalisées enregistrées en base. Les pages dont les
        champs sont vides utilisent la valeur par défaut prévue dans le code et sont marquées ainsi.
      </p>
    </div>
  );
};
