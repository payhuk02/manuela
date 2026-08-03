import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, RefreshCw } from "lucide-react";
import { EXPERTISE_SEED, EXPECTED_SLUGS } from "@/data/expertiseSeed";
import { EXPERTISE_IMAGES } from "@/data/expertiseImages";
import { logAudit } from "@/lib/audit";

type Row = { id: string; slug: string; title: string };

type RowStatus = {
  slug: string;
  title: string;
  inDb: boolean;
  hasImage: boolean;
  expected: boolean;
};

export const ExpertisesSlugCheck = ({ onChange }: { onChange?: () => void }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("expertises")
      .select("id, slug, title")
      .order("sort_order");
    if (error) toast.error(error.message);
    else setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const dbSlugs = new Set(rows.map((r) => r.slug));
  const expectedSet = new Set(EXPECTED_SLUGS);

  const statuses: RowStatus[] = [
    ...EXPERTISE_SEED.map((s) => ({
      slug: s.slug,
      title: s.title,
      inDb: dbSlugs.has(s.slug),
      hasImage: !!EXPERTISE_IMAGES[s.slug],
      expected: true,
    })),
    ...rows
      .filter((r) => !expectedSet.has(r.slug))
      .map((r) => ({
        slug: r.slug,
        title: r.title,
        inDb: true,
        hasImage: !!EXPERTISE_IMAGES[r.slug],
        expected: false,
      })),
  ];

  const missingCount = statuses.filter((s) => s.expected && !s.inDb).length;
  const orphanCount = statuses.filter((s) => !s.expected).length;
  const noImageCount = statuses.filter((s) => s.expected && !s.hasImage).length;

  const seedMissing = async () => {
    setSeeding(true);
    const toInsert = EXPERTISE_SEED.filter((s) => !dbSlugs.has(s.slug)).map((s, i) => ({
      slug: s.slug,
      title: s.title,
      icon: s.icon,
      tagline: s.tagline,
      intro: s.intro,
      approach: s.approach,
      conclusion: s.conclusion,
      sort_order: rows.length + i + 1,
      published: true,
    }));
    if (toInsert.length === 0) {
      toast.info("Aucune expertise manquante.");
      setSeeding(false);
      return;
    }
    const { error } = await supabase.from("expertises").insert(toInsert);
    if (error) toast.error(error.message);
    else {
      logAudit({
        action: "expertise.seed",
        target_type: "expertises",
        details: { count: toInsert.length, slugs: toInsert.map((e) => e.slug) },
      });
      toast.success(`${toInsert.length} expertise(s) créée(s)`);
      await load();
      onChange?.();
    }
    setSeeding(false);
  };

  const fixSlug = async (id: string, newSlug: string) => {
    const { error } = await supabase.from("expertises").update({ slug: newSlug }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      logAudit({
        action: "expertise.update",
        target_type: "expertises",
        target_id: id,
        details: { slug: newSlug, reason: "slug-check-fix" },
      });
      toast.success("Slug mis à jour");
      await load();
      onChange?.();
    }
  };

  if (loading)
    return <p className="text-sm text-muted-foreground">Vérification des slugs…</p>;

  const allOk = missingCount === 0 && orphanCount === 0 && noImageCount === 0;

  return (
    <div className="border border-border bg-card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-serif text-lg text-primary flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Cohérence slugs ↔ images
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Les slugs en base doivent correspondre aux clés du mapping d'images
            (<code className="text-[10px]">src/data/expertiseImages.ts</code>) pour profiter
            des images de fallback.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" /> Recharger
          </Button>
          {missingCount > 0 && (
            <Button variant="gold" size="sm" onClick={seedMissing} disabled={seeding}>
              <Sparkles className="h-3.5 w-3.5" />
              Pré-remplir ({missingCount})
            </Button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Attendues" value={EXPERTISE_SEED.length} tone="muted" />
        <Stat label="En base" value={rows.length} tone="muted" />
        <Stat
          label="Manquantes"
          value={missingCount}
          tone={missingCount === 0 ? "ok" : "warn"}
        />
        <Stat
          label="Orphelines / sans image"
          value={orphanCount + noImageCount}
          tone={orphanCount + noImageCount === 0 ? "ok" : "warn"}
        />
      </div>

      {allOk && (
        <p className="text-sm text-accent flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Tout est cohérent : les 8 expertises sont en base avec leur image.
        </p>
      )}

      {/* Detail table */}
      <div className="border border-border divide-y divide-border text-sm">
        {statuses.map((s) => {
          let icon = <CheckCircle2 className="h-4 w-4 text-accent" />;
          let tone = "text-foreground";
          let note = "OK";

          if (!s.expected) {
            icon = <AlertTriangle className="h-4 w-4 text-primary/60" />;
            tone = "text-muted-foreground";
            note = "Slug hors mapping (pas d'image fallback)";
          } else if (!s.inDb) {
            icon = <XCircle className="h-4 w-4 text-destructive" />;
            tone = "text-destructive";
            note = "Manquante en base";
          } else if (!s.hasImage) {
            icon = <AlertTriangle className="h-4 w-4 text-primary/60" />;
            tone = "text-muted-foreground";
            note = "Pas d'image fallback (uploader une image_url)";
          }

          const dbRow = rows.find((r) => r.slug === s.slug);
          const suggestion = !s.expected
            ? EXPECTED_SLUGS.find((es) => es.replace(/-/g, "") === s.slug.replace(/-/g, ""))
            : undefined;

          return (
            <div key={s.slug} className="flex items-center gap-3 p-3">
              {icon}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.title}</p>
                <p className="text-xs text-muted-foreground truncate font-mono">
                  {s.slug}
                </p>
              </div>
              <span className={`text-xs ${tone} text-right`}>{note}</span>
              {suggestion && dbRow && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fixSlug(dbRow.id, suggestion)}
                  title={`Renommer en ${suggestion}`}
                >
                  → {suggestion}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Stat = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ok" | "warn" | "muted";
}) => {
  const color =
    tone === "ok"
      ? "text-accent"
      : tone === "warn"
      ? "text-destructive"
      : "text-primary";
  return (
    <div className="border border-border p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 font-serif text-2xl ${color}`}>{value}</p>
    </div>
  );
};
