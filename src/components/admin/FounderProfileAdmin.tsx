import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Save, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { logAudit } from "@/lib/audit";
import { FounderCard } from "@/components/FounderCard";
import type { FounderItem } from "@/hooks/useFounderProfile";

type FounderMember = {
  id: string;
  name: string;
  role_fr: string;
  role_en: string;
  bio_fr: string;
  bio_en: string;
  presentation_fr: string;
  presentation_en: string;
  photo_url: string | null;
  cv_url: string | null;
  linkedin_url: string | null;
};

type Item = {
  id: string;
  category: string;
  title_fr: string;
  title_en: string;
  subtitle_fr: string;
  subtitle_en: string;
  icon: string;
  meta: string;
  color: string;
  sort_order: number;
  published: boolean;
};

const CATEGORIES: {
  key: string;
  label: string;
  description: string;
  iconHelp: string;
  metaLabel?: string;
  metaHelp?: string;
  showSubtitle?: boolean;
}[] = [
  {
    key: "expertise",
    label: "Domaines d'expertise",
    description: "Liste affichée dans la carte « Domaines d'expertise » à gauche.",
    iconHelp: "Nom Lucide (ex. Briefcase, Scale, Building, Trophy, Gavel)",
    showSubtitle: true,
  },
  {
    key: "language",
    label: "Langues",
    description: "Affiché dans la carte « Langues » avec barre de niveau.",
    iconHelp: "Nom Lucide (ex. Globe, Languages)",
    metaLabel: "Niveau (0-100)",
    metaHelp: "Pourcentage de maîtrise pour la barre de progression",
  },
  {
    key: "formation",
    label: "Formation",
    description: "Diplômes — affichés dans la carte « Formation ».",
    iconHelp: "Nom Lucide (ex. GraduationCap, BookOpen)",
    metaLabel: "Année",
    showSubtitle: true,
  },
  {
    key: "parcours",
    label: "Parcours professionnel",
    description: "Expériences — affichées dans la carte « Parcours ».",
    iconHelp: "Nom Lucide (ex. Briefcase, Building2)",
    metaLabel: "Période (ex. 2020-2024)",
    showSubtitle: true,
  },
  {
    key: "association",
    label: "Associations professionnelles",
    description: "Affiliations — bas de page de la fiche fondateur.",
    iconHelp: "Nom Lucide (ex. Users, Award, Network)",
    showSubtitle: false,
  },
];

export const FounderProfileAdmin = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [previewLang, setPreviewLang] = useState<"fr" | "en">("fr");
  const [founder, setFounder] = useState<FounderMember | null>(null);

  // Tagline (single editorial title shown above the bio, e.g. "Polyvalent par nature")
  const [taglineFr, setTaglineFr] = useState("");
  const [taglineEn, setTaglineEn] = useState("");
  const [taglineId, setTaglineId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [profileRes, founderRes] = await Promise.all([
      supabase
        .from("founder_profile_items")
        .select("*")
        .order("category")
        .order("sort_order"),
      supabase
        .from("team_members")
        .select("id,name,role_fr,role_en,bio_fr,bio_en,presentation_fr,presentation_en,photo_url,cv_url,linkedin_url")
        .eq("is_founder", true)
        .eq("published", true)
        .limit(1)
        .maybeSingle(),
    ]);
    if (profileRes.error) {
      toast.error(profileRes.error.message);
      setLoading(false);
      return;
    }
    const all = (profileRes.data as Item[]) ?? [];
    setItems(all.filter((i) => i.category !== "tagline"));
    const tag = all.find((i) => i.category === "tagline");
    if (tag) {
      setTaglineId(tag.id);
      setTaglineFr(tag.title_fr);
      setTaglineEn(tag.title_en);
    } else {
      setTaglineId(null);
      setTaglineFr("");
      setTaglineEn("");
    }
    setFounder((founderRes.data as FounderMember) ?? null);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  // Build the items array exactly as <FounderCard> expects, mixing the editable
  // tagline (kept in dedicated state) with the regular items so the live
  // preview reflects edits instantly — no debounce, no DB round-trip.
  const previewItems: FounderItem[] = useMemo(() => {
    const tagline: FounderItem[] = (taglineFr || taglineEn)
      ? [{
          id: taglineId ?? "tagline-draft",
          category: "tagline",
          title_fr: taglineFr,
          title_en: taglineEn,
          subtitle_fr: "",
          subtitle_en: "",
          icon: "",
          meta: "",
          color: "",
          sort_order: 0,
          published: true,
        }]
      : [];
    return [...tagline, ...items];
  }, [items, taglineFr, taglineEn, taglineId]);

  const saveTagline = async () => {
    if (taglineId) {
      const { error } = await supabase
        .from("founder_profile_items")
        .update({ title_fr: taglineFr, title_en: taglineEn })
        .eq("id", taglineId);
      if (error) return toast.error(error.message);
    } else {
      const { data, error } = await supabase
        .from("founder_profile_items")
        .insert({
          category: "tagline",
          title_fr: taglineFr,
          title_en: taglineEn,
          published: true,
        })
        .select()
        .single();
      if (error) return toast.error(error.message);
      if (data) setTaglineId((data as Item).id);
    }
    logAudit({ action: "founder.tagline.update", target_type: "founder_profile_items" });
    toast.success("Titre éditorial sauvegardé");
  };

  const addItem = async (category: string) => {
    const max = items.filter((i) => i.category === category).reduce(
      (m, i) => Math.max(m, i.sort_order),
      -1
    );
    const { data, error } = await supabase
      .from("founder_profile_items")
      .insert({ category, sort_order: max + 1, published: true })
      .select()
      .single();
    if (error) return toast.error(error.message);
    if (data) {
      setItems((p) => [...p, data as Item]);
      logAudit({ action: "founder.item.create", target_type: "founder_profile_items", target_id: data.id, details: { category } });
    }
  };

  const updateField = (id: string, patch: Partial<Item>) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const persist = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const { error } = await supabase
      .from("founder_profile_items")
      .update({
        title_fr: item.title_fr,
        title_en: item.title_en,
        subtitle_fr: item.subtitle_fr,
        subtitle_en: item.subtitle_en,
        icon: item.icon,
        meta: item.meta,
        color: item.color,
        sort_order: item.sort_order,
        published: item.published,
      })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      logAudit({ action: "founder.item.update", target_type: "founder_profile_items", target_id: id });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette entrée ?")) return;
    const { error } = await supabase.from("founder_profile_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    logAudit({ action: "founder.item.delete", target_type: "founder_profile_items", target_id: id });
    setItems((p) => p.filter((i) => i.id !== id));
  };

  /** Swap sort_order of two items in the same category and persist both. */
  const reorder = async (id: string, direction: "up" | "down") => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const siblings = items
      .filter((i) => i.category === item.category)
      .sort((a, b) => a.sort_order - b.sort_order);
    const idx = siblings.findIndex((i) => i.id === id);
    const swapWith = direction === "up" ? siblings[idx - 1] : siblings[idx + 1];
    if (!swapWith) return;
    const a = item.sort_order;
    const b = swapWith.sort_order;
    // Optimistic local update so the preview reflects the move immediately.
    setItems((p) =>
      p.map((i) => {
        if (i.id === item.id) return { ...i, sort_order: b };
        if (i.id === swapWith.id) return { ...i, sort_order: a };
        return i;
      })
    );
    const [r1, r2] = await Promise.all([
      supabase.from("founder_profile_items").update({ sort_order: b }).eq("id", item.id),
      supabase.from("founder_profile_items").update({ sort_order: a }).eq("id", swapWith.id),
    ]);
    if (r1.error || r2.error) {
      toast.error((r1.error || r2.error)?.message ?? "Erreur de réordonnancement");
      // Re-sync from DB on failure.
      load();
    } else {
      logAudit({
        action: "founder.item.reorder",
        target_type: "founder_profile_items",
        target_id: item.id,
        details: { direction },
      });
    }
  };

  if (loading) return <p className="text-muted-foreground">Chargement…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl text-primary">Profil détaillé du fondateur</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Personnalisez la fiche premium du fondateur sur la page <code>/equipe</code> :
            titre éditorial, domaines d'expertise, langues, formation, parcours et associations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex border border-border rounded-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setPreviewLang("fr")}
              className={`px-3 py-1.5 text-xs uppercase tracking-[0.2em] ${
                previewLang === "fr" ? "bg-primary text-primary-foreground" : "bg-background"
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setPreviewLang("en")}
              className={`px-3 py-1.5 text-xs uppercase tracking-[0.2em] ${
                previewLang === "en" ? "bg-primary text-primary-foreground" : "bg-background"
              }`}
            >
              EN
            </button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? "Masquer aperçu" : "Afficher aperçu"}
          </Button>
        </div>
      </div>

      <div className={showPreview ? "grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6" : ""}>
        <div className="space-y-8 min-w-0">

      {/* Tagline */}
      <section className="border border-border bg-card p-5 space-y-3">
        <div>
          <h3 className="font-serif text-xl text-primary">Titre éditorial</h3>
          <p className="text-xs text-muted-foreground">
            Ex. « Polyvalent par nature » — affiché en gros à droite de la photo.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Titre (FR)</Label>
            <Input value={taglineFr} onChange={(e) => setTaglineFr(e.target.value)} placeholder="Polyvalent par nature" />
          </div>
          <div>
            <Label className="text-xs">Title (EN)</Label>
            <Input value={taglineEn} onChange={(e) => setTaglineEn(e.target.value)} placeholder="Versatile by nature" />
          </div>
        </div>
        <Button size="sm" onClick={saveTagline}>
          <Save className="h-4 w-4" /> Sauvegarder le titre
        </Button>
      </section>

      {CATEGORIES.map((cat) => {
        const list = items
          .filter((i) => i.category === cat.key)
          .sort((a, b) => a.sort_order - b.sort_order);
        return (
          <section key={cat.key} className="border border-border bg-card p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-serif text-xl text-primary">{cat.label}</h3>
                <p className="text-xs text-muted-foreground">{cat.description}</p>
              </div>
              <Button size="sm" variant="gold" onClick={() => addItem(cat.key)}>
                <Plus className="h-4 w-4" /> Ajouter
              </Button>
            </div>

            {list.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Aucune entrée.</p>
            ) : (
              <div className="space-y-3">
                {list.map((item) => (
                  <div
                    key={item.id}
                    className="border border-border bg-background p-4 space-y-3"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <GripVertical className="h-3 w-3" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => reorder(item.id, "up")}
                        title="Monter"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => reorder(item.id, "down")}
                        title="Descendre"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <span className="ml-1">Ordre :</span>
                      <Input
                        type="number"
                        value={item.sort_order}
                        onChange={(e) => updateField(item.id, { sort_order: Number(e.target.value) })}
                        onBlur={() => persist(item.id)}
                        className="w-20 h-7"
                      />
                      <label className="ml-auto inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.published}
                          onChange={(e) => {
                            updateField(item.id, { published: e.target.checked });
                            setTimeout(() => persist(item.id), 0);
                          }}
                        />
                        Publié
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => remove(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>


                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Titre (FR)</Label>
                        <Input
                          value={item.title_fr}
                          onChange={(e) => updateField(item.id, { title_fr: e.target.value })}
                          onBlur={() => persist(item.id)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Title (EN)</Label>
                        <Input
                          value={item.title_en}
                          onChange={(e) => updateField(item.id, { title_en: e.target.value })}
                          onBlur={() => persist(item.id)}
                        />
                      </div>
                    </div>

                    {cat.showSubtitle && (
                      <>
                        <p className="text-[11px] text-muted-foreground -mb-1">
                          Astuce : chaque ligne sera affichée avec une coche dorée ✓ devant. Appuyez sur Entrée pour ajouter un item.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Sous-titre (FR) — une ligne par coche</Label>
                            <Textarea
                              rows={4}
                              placeholder={"Première mission\nDeuxième mission\nTroisième mission"}
                              value={item.subtitle_fr}
                              onChange={(e) => updateField(item.id, { subtitle_fr: e.target.value })}
                              onBlur={() => persist(item.id)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Subtitle (EN) — one line per check</Label>
                            <Textarea
                              rows={4}
                              placeholder={"First mission\nSecond mission\nThird mission"}
                              value={item.subtitle_en}
                              onChange={(e) => updateField(item.id, { subtitle_en: e.target.value })}
                              onBlur={() => persist(item.id)}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Icône</Label>
                        <Input
                          value={item.icon}
                          onChange={(e) => updateField(item.id, { icon: e.target.value })}
                          onBlur={() => persist(item.id)}
                          placeholder="Briefcase"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">{cat.iconHelp}</p>
                      </div>
                      {cat.metaLabel && (
                        <div>
                          <Label className="text-xs">{cat.metaLabel}</Label>
                          <Input
                            value={item.meta}
                            onChange={(e) => updateField(item.id, { meta: e.target.value })}
                            onBlur={() => persist(item.id)}
                          />
                          {cat.metaHelp && (
                            <p className="text-[10px] text-muted-foreground mt-1">{cat.metaHelp}</p>
                          )}
                        </div>
                      )}
                      <div>
                        <Label className="text-xs">Couleur d'accent (HSL ou hex, optionnel)</Label>
                        <Input
                          value={item.color}
                          onChange={(e) => updateField(item.id, { color: e.target.value })}
                          onBlur={() => persist(item.id)}
                          placeholder="ex. 142 71% 45%"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
        </div>

        {showPreview && (
          <div className="min-w-0">
            <div className="xl:sticky xl:top-4 space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Aperçu temps réel — fiche fondateur sur /equipe
              </p>
              <div className="border border-border bg-card overflow-hidden shadow-soft max-h-[calc(100vh-6rem)] overflow-y-auto">
                {founder ? (
                  <div className="origin-top-left scale-[0.78] xl:scale-[0.7] w-[128.2%] xl:w-[142.86%]">
                    <FounderCard
                      founder={founder}
                      itemsOverride={previewItems}
                      langOverride={previewLang}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-sm text-muted-foreground">
                    Aucun membre marqué comme « Fondateur » et publié. Cochez « Fondateur »
                    sur un membre dans l'onglet <strong>Équipe (membres)</strong> pour voir l'aperçu.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
