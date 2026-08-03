import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImage } from "@/lib/imageOptimizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Plus, Upload, ChevronDown, ChevronRight, Save } from "lucide-react";
import { EXPERTISE_ICON_NAMES } from "@/data/expertiseIcons";
import { logAudit } from "@/lib/audit";
import { cn } from "@/lib/utils";
import { ExpertisesSlugCheck } from "./ExpertisesSlugCheck";
import { PerContentSeoPanel } from "./PerContentSeoPanel";
import type {
  ExpertiseRow,
  ExpertiseSection,
  ExpertiseStep,
  ExpertiseFAQ,
} from "@/hooks/useExpertises";
import { FALLBACK_SECTIONS } from "@/data/expertiseSections";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const ExpertisesAdmin = () => {
  const [items, setItems] = useState<ExpertiseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("expertises")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    else
      setItems(
        (data ?? []).map((r: any) => ({
          ...r,
          sections: (Array.isArray(r.sections) && r.sections.length > 0) ? r.sections : (FALLBACK_SECTIONS[r.slug] || []),
          methodology: r.methodology ?? [],
          faq: r.faq ?? [],
        }))
      );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    const newSlug = `nouvelle-expertise-${Date.now()}`;
    const { data, error } = await supabase
      .from("expertises")
      .insert({
        slug: newSlug,
        title: "Nouvelle expertise",
        icon: "Briefcase",
        sort_order: items.length + 1,
      })
      .select()
      .single();
    if (error) toast.error(error.message);
    else {
      logAudit({ action: "expertise.create", target_type: "expertises", target_id: data?.id, details: { slug: newSlug } });
      toast.success("Expertise créée");
      load();
    }
  };

  const update = async (id: string, patch: Partial<ExpertiseRow>) => {
    const { error } = await supabase.from("expertises").update(patch as any).eq("id", id);
    if (error) toast.error(error.message);
    else logAudit({ action: "expertise.update", target_type: "expertises", target_id: id, details: { fields: Object.keys(patch) } });
  };

  const patchLocal = (id: string, patch: Partial<ExpertiseRow>) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const saveLocal = (id: string, patch: Partial<ExpertiseRow>) => {
    patchLocal(id, patch);
    update(id, patch);
  };

  const saveExpertise = async (expertise: ExpertiseRow) => {
    await update(expertise.id, {
      slug: slugify(expertise.slug || expertise.title),
      title: expertise.title,
      icon: expertise.icon,
      tagline: expertise.tagline,
      intro: expertise.intro,
      approach: expertise.approach,
      conclusion: expertise.conclusion,
      image_url: expertise.image_url,
      sections: expertise.sections,
      methodology: expertise.methodology,
      faq: expertise.faq,
      published: expertise.published,
      sort_order: expertise.sort_order,
    });
    toast.success("Modifications sauvegardées");
  };

  const del = async (id: string) => {
    if (!confirm("Supprimer cette expertise ?")) return;
    const item = items.find((i) => i.id === id);
    const { error } = await supabase.from("expertises").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      logAudit({ action: "expertise.delete", target_type: "expertises", target_id: id, details: { slug: item?.slug, title: item?.title } });
      toast.success("Supprimé");
      load();
    }
  };

  const upload = async (id: string, file: File) => {
    const optimized = await optimizeImage(file);
    const path = `expertises/${id}-${Date.now()}-${optimized.name}`;
    const { error } = await supabase.storage
      .from("site-images")
      .upload(path, optimized, { upsert: true, contentType: optimized.type });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    await update(id, { image_url: data.publicUrl });
    patchLocal(id, { image_url: data.publicUrl });
    toast.success("Image optimisée et téléversée");
  };

  if (loading) return <p className="text-muted-foreground">Chargement…</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-3xl text-primary">Expertises</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Domaines d'intervention affichés sur la page /expertises et les pages détail.
          </p>
        </div>
        <Button onClick={add} variant="gold">
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      <ExpertisesSlugCheck onChange={load} />

      <div className="space-y-3">
        {items.map((e) => {
          const isOpen = openId === e.id;
          return (
            <div key={e.id} className="border border-border bg-card">
              {/* Header row */}
              <div className="flex items-center gap-3 p-4">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : e.id)}
                  className="text-muted-foreground hover:text-primary"
                  aria-label={isOpen ? "Réduire" : "Développer"}
                >
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <Input
                  value={e.title}
                  onChange={(ev) => patchLocal(e.id, { title: ev.target.value })}
                  onBlur={(ev) => update(e.id, { title: ev.target.value })}
                  className="font-serif text-base flex-1"
                />
                <Input
                  type="number"
                  value={e.sort_order}
                  onChange={(ev) => patchLocal(e.id, { sort_order: Number(ev.target.value) })}
                  onBlur={(ev) => update(e.id, { sort_order: Number(ev.target.value) })}
                  className="w-20"
                  title="Ordre"
                />
                <span
                  className={cn(
                    "inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] px-3 py-1.5 border whitespace-nowrap",
                    e.published
                      ? "bg-accent/15 text-accent border-accent/30"
                      : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", e.published ? "bg-accent" : "bg-muted-foreground")} />
                  {e.published ? "Publié" : "Brouillon"}
                </span>
                <Button
                  type="button"
                  variant={e.published ? "outline" : "gold"}
                  size="sm"
                  onClick={() => saveLocal(e.id, { published: !e.published })}
                >
                  {e.published ? "Dépublier" : "Publier"}
                </Button>
                <Button type="button" size="sm" onClick={() => saveExpertise(e)}>
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </Button>
                <Button variant="ghost" size="sm" onClick={() => del(e.id)} className="text-destructive" title="Supprimer l'expertise">
                  <Trash2 className="h-4 w-4 mr-1.5" /> Supprimer
                </Button>
              </div>

              {isOpen && (
                <div className="border-t border-border p-6 space-y-6">
                  {/* Slug + icon + image */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Slug (URL)</label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={e.slug}
                          onChange={(ev) => patchLocal(e.id, { slug: ev.target.value })}
                          onBlur={(ev) => update(e.id, { slug: slugify(ev.target.value) })}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => saveLocal(e.id, { slug: slugify(e.title) })}
                        >
                          Auto
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Icône</label>
                      <select
                        value={e.icon}
                        onChange={(ev) => saveLocal(e.id, { icon: ev.target.value })}
                        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {EXPERTISE_ICON_NAMES.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Image</label>
                      <div className="mt-1 flex items-center gap-3">
                        {e.image_url && (
                          <div className="relative group">
                            <img src={e.image_url} alt="" className="h-10 w-16 object-cover border border-border" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                              onClick={() => saveLocal(e.id, { image_url: null })}
                              title="Supprimer l'image"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs border border-border px-3 py-2 hover:bg-secondary">
                          <Upload className="h-3.5 w-3.5" /> Téléverser
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(ev) => ev.target.files?.[0] && upload(e.id, ev.target.files[0])}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Tagline */}
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Accroche</label>
                    <Input
                      className="mt-1"
                      value={e.tagline}
                      onChange={(ev) => patchLocal(e.id, { tagline: ev.target.value })}
                      onBlur={(ev) => update(e.id, { tagline: ev.target.value })}
                    />
                  </div>

                  {/* Intro */}
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Introduction</label>
                    <Textarea
                      className="mt-1 min-h-[100px]"
                      value={e.intro}
                      onChange={(ev) => patchLocal(e.id, { intro: ev.target.value })}
                      onBlur={(ev) => update(e.id, { intro: ev.target.value })}
                    />
                  </div>

                  {/* Approche */}
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Notre approche</label>
                    <Textarea
                      className="mt-1 min-h-[100px]"
                      value={e.approach}
                      onChange={(ev) => patchLocal(e.id, { approach: ev.target.value })}
                      onBlur={(ev) => update(e.id, { approach: ev.target.value })}
                    />
                  </div>

                  {/* Conclusion */}
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Conclusion (optionnelle)</label>
                    <Textarea
                      className="mt-1 min-h-[60px]"
                      value={e.conclusion}
                      onChange={(ev) => patchLocal(e.id, { conclusion: ev.target.value })}
                      onBlur={(ev) => update(e.id, { conclusion: ev.target.value })}
                    />
                  </div>

                  {/* Sections */}
                  <SectionsEditor
                    value={e.sections}
                    onChange={(sections) => saveLocal(e.id, { sections })}
                  />

                  {/* Méthodologie */}
                  <MethodologyEditor
                    value={e.methodology}
                    onChange={(methodology) => saveLocal(e.id, { methodology })}
                  />

                  {/* FAQ */}
                  <FAQEditor value={e.faq} onChange={(faq) => saveLocal(e.id, { faq })} />

                  {/* SEO personnalisé par expertise */}
                  <PerContentSeoPanel
                    storagePrefix="expertises"
                    recordId={e.id}
                    seoTitle={e.seo_title}
                    seoDescription={e.seo_description}
                    ogImageUrl={e.og_image_url}
                    fallbackTitle={e.title}
                    fallbackDescription={e.tagline || e.intro}
                    onChange={(patch) => saveLocal(e.id, patch as Partial<ExpertiseRow>)}
                  />

                  {/* Formulaire de contact (spécifique à cette fiche) */}
                  <ContactFormEditor slug={e.slug} title={e.title} />
                </div>
              )}
            </div>
          );
        })}
        {items.length === 0 && <p className="text-muted-foreground text-sm">Aucune expertise.</p>}
      </div>
    </div>
  );
};

/* ---------- Sub-editors ---------- */

const SectionsEditor = ({
  value,
  onChange,
}: {
  value: ExpertiseSection[];
  onChange: (v: ExpertiseSection[]) => void;
}) => (
  <div className="border-t border-border pt-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-serif text-lg text-primary">Sections / Rubriques</h3>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...value, { title: "Nouvelle rubrique", items: [] }])}
      >
        <Plus className="h-3.5 w-3.5" /> Rubrique
      </Button>
    </div>
    <div className="space-y-4">
      {value.map((section, sIdx) => (
        <div key={sIdx} className="border border-border p-4 space-y-3 bg-secondary/30">
          <div className="flex gap-2">
            <Input
              value={section.title}
              onChange={(ev) => {
                const next = [...value];
                next[sIdx] = { ...section, title: ev.target.value };
                onChange(next);
              }}
              placeholder="Titre de la rubrique"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => onChange(value.filter((_, i) => i !== sIdx))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {section.items.map((item, iIdx) => (
              <div key={iIdx} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(ev) => {
                    const next = [...value];
                    const items = [...section.items];
                    items[iIdx] = ev.target.value;
                    next[sIdx] = { ...section, items };
                    onChange(next);
                  }}
                  placeholder="Prestation"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const next = [...value];
                    next[sIdx] = {
                      ...section,
                      items: section.items.filter((_, i) => i !== iIdx),
                    };
                    onChange(next);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const next = [...value];
                next[sIdx] = { ...section, items: [...section.items, ""] };
                onChange(next);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Prestation
            </Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MethodologyEditor = ({
  value,
  onChange,
}: {
  value: ExpertiseStep[];
  onChange: (v: ExpertiseStep[]) => void;
}) => (
  <div className="border-t border-border pt-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-serif text-lg text-primary">Méthodologie</h3>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...value, { title: "Nouvelle étape", description: "" }])}
      >
        <Plus className="h-3.5 w-3.5" /> Étape
      </Button>
    </div>
    <div className="space-y-3">
      {value.map((step, idx) => (
        <div key={idx} className="border border-border p-4 space-y-2 bg-secondary/30">
          <div className="flex gap-2">
            <Input
              value={step.title}
              onChange={(ev) => {
                const next = [...value];
                next[idx] = { ...step, title: ev.target.value };
                onChange(next);
              }}
              placeholder="Titre de l'étape"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => onChange(value.filter((_, i) => i !== idx))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            value={step.description}
            onChange={(ev) => {
              const next = [...value];
              next[idx] = { ...step, description: ev.target.value };
              onChange(next);
            }}
            placeholder="Description de l'étape"
            className="min-h-[70px]"
          />
        </div>
      ))}
    </div>
  </div>
);

const FAQEditor = ({
  value,
  onChange,
}: {
  value: ExpertiseFAQ[];
  onChange: (v: ExpertiseFAQ[]) => void;
}) => (
  <div className="border-t border-border pt-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-serif text-lg text-primary">FAQ</h3>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...value, { question: "Nouvelle question", answer: "" }])}
      >
        <Plus className="h-3.5 w-3.5" /> Question
      </Button>
    </div>
    <div className="space-y-3">
      {value.map((qa, idx) => (
        <div key={idx} className="border border-border p-4 space-y-2 bg-secondary/30">
          <div className="flex gap-2">
            <Input
              value={qa.question}
              onChange={(ev) => {
                const next = [...value];
                next[idx] = { ...qa, question: ev.target.value };
                onChange(next);
              }}
              placeholder="Question"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => onChange(value.filter((_, i) => i !== idx))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            value={qa.answer}
            onChange={(ev) => {
              const next = [...value];
              next[idx] = { ...qa, answer: ev.target.value };
              onChange(next);
            }}
            placeholder="Réponse"
            className="min-h-[80px]"
          />
        </div>
      ))}
    </div>
  </div>
);

/* ---------- Contact form editor (per expertise) ---------- */

type FormFieldDef = {
  field: string;
  label: string;
  multiline?: boolean;
  defaultValue: string;
  hint?: string;
};

const FORM_GROUPS: { label: string; fields: FormFieldDef[] }[] = [
  {
    label: "Libellés",
    fields: [
      { field: "eyebrow", label: "Eyebrow", defaultValue: "Demande dédiée" },
      {
        field: "title",
        label: "Titre",
        defaultValue: "Une question en {expertise} ?",
        hint: "Utilisez {expertise} pour insérer le nom de la fiche.",
      },
      {
        field: "subtitle",
        label: "Sous-titre",
        multiline: true,
        defaultValue: "Décrivez votre situation. Nous vous répondons sous 24h ouvrées.",
      },
      {
        field: "confidential",
        label: "Mention de confidentialité",
        multiline: true,
        defaultValue: "Vos informations restent strictement confidentielles.",
      },
    ],
  },
  {
    label: "Champs & boutons",
    fields: [
      { field: "nameLabel", label: "Libellé Nom", defaultValue: "Nom complet" },
      { field: "emailLabel", label: "Libellé Email", defaultValue: "Email" },
      { field: "phoneLabel", label: "Libellé Téléphone", defaultValue: "Téléphone" },
      { field: "messageLabel", label: "Libellé Message", defaultValue: "Message" },
      {
        field: "messagePlaceholder",
        label: "Placeholder du message",
        multiline: true,
        defaultValue: "Décrivez votre dossier en {expertise}…",
        hint: "Utilisez {expertise} pour insérer le nom de la fiche.",
      },
      { field: "submit", label: "Bouton — envoyer", defaultValue: "Envoyer ma demande" },
      { field: "sending", label: "Bouton — état envoi", defaultValue: "Envoi…" },
    ],
  },
  {
    label: "Confirmation & erreurs",
    fields: [
      { field: "sentTitle", label: "Confirmation — titre", defaultValue: "Demande transmise" },
      {
        field: "sentDesc",
        label: "Confirmation — description",
        multiline: true,
        defaultValue: "Merci, votre demande a été enregistrée. Notre équipe vous recontactera rapidement.",
      },
      { field: "limit", label: "Erreur — limite atteinte", defaultValue: "Limite d'envois atteinte. Réessayez plus tard." },
      { field: "error", label: "Erreur — générique", defaultValue: "Une erreur est survenue. Merci de réessayer." },
    ],
  },
];

const ContactFormEditor = ({ slug, title }: { slug: string; title: string }) => {
  const [rows, setRows] = useState<Record<string, string>>({});
  const [globals, setGlobals] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  const allFields = FORM_GROUPS.flatMap((g) => g.fields);
  const specificKeys = allFields.map((f) => `expertiseForm.${slug}.${f.field}`);
  const globalKeys = allFields.map((f) => `expertiseForm.${f.field}`);

  useEffect(() => {
    if (!slug) return;
    setLoaded(false);
    supabase
      .from("site_content")
      .select("key,value")
      .in("key", [...specificKeys, ...globalKeys])
      .eq("lang", "fr")
      .then(({ data, error }) => {
        if (error) {
          toast.error(error.message);
          setLoaded(true);
          return;
        }
        const spec: Record<string, string> = {};
        const glob: Record<string, string> = {};
        (data ?? []).forEach((r: any) => {
          if (r.key.startsWith(`expertiseForm.${slug}.`)) spec[r.key] = r.value ?? "";
          else if (r.key.startsWith("expertiseForm.")) glob[r.key] = r.value ?? "";
        });
        setRows(spec);
        setGlobals(glob);
        setLoaded(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const effectiveFor = (f: FormFieldDef) => {
    const sk = `expertiseForm.${slug}.${f.field}`;
    if (sk in rows) return rows[sk];
    const gk = `expertiseForm.${f.field}`;
    if (globals[gk]) return globals[gk];
    return f.defaultValue;
  };

  const setField = (field: string, value: string) => {
    setRows((p) => ({ ...p, [`expertiseForm.${slug}.${field}`]: value }));
  };

  const reset = (field: string) => {
    const sk = `expertiseForm.${slug}.${field}`;
    setRows((p) => {
      const n = { ...p };
      delete n[sk];
      return n;
    });
  };

  const save = async () => {
    setBusy(true);
    // Persist only fields where the per-expertise value differs from the inherited default
    // (global override or hard-coded fallback). Keys that match the inherited value are
    // deleted so they keep inheriting from the global override.
    const upserts: { key: string; lang: "fr"; value: string }[] = [];
    const deletes: string[] = [];
    allFields.forEach((f) => {
      const sk = `expertiseForm.${slug}.${f.field}`;
      const inherited = globals[`expertiseForm.${f.field}`] ?? f.defaultValue;
      if (sk in rows) {
        const v = rows[sk];
        if (v === inherited) deletes.push(sk);
        else upserts.push({ key: sk, lang: "fr", value: v });
      }
    });
    try {
      if (upserts.length > 0) {
        const { error } = await supabase
          .from("site_content")
          .upsert(upserts, { onConflict: "key,lang" });
        if (error) throw error;
      }
      if (deletes.length > 0) {
        const { error } = await supabase
          .from("site_content")
          .delete()
          .in("key", deletes)
          .eq("lang", "fr");
        if (error) throw error;
      }
      logAudit({
        action: "expertise.contact_form.update",
        target_type: "site_content",
        details: { slug, upserts: upserts.map((u) => u.key), deletes },
      });
      toast.success("Formulaire de contact enregistré");
    } catch (e: any) {
      toast.error(e.message ?? "Erreur d'enregistrement");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-border pt-6">
      <div className="flex items-center justify-between mb-1 gap-3 flex-wrap">
        <h3 className="font-serif text-lg text-primary">Formulaire de contact (cette fiche)</h3>
        <Button type="button" size="sm" onClick={save} disabled={busy || !loaded}>
          <Save className="h-4 w-4" />
          {busy ? "Sauvegarde…" : "Sauvegarder le formulaire"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Personnalisez le formulaire affiché en bas de la page <span className="font-mono">/expertises/{slug}</span>.
        Si un champ est laissé tel quel, il hérite des valeurs globales définies dans <em>Page Expertises</em>.
        Le marqueur <span className="font-mono">{"{expertise}"}</span> est remplacé par « {title.toLowerCase()} ».
      </p>

      {!loaded ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <div className="space-y-6">
          {FORM_GROUPS.map((group) => (
            <div key={group.label} className="space-y-3">
              <h4 className="text-xs uppercase tracking-[0.2em] text-accent">{group.label}</h4>
              <div className="space-y-3">
                {group.fields.map((f) => {
                  const sk = `expertiseForm.${slug}.${f.field}`;
                  const v = effectiveFor(f);
                  const isOverridden = sk in rows;
                  return (
                    <div key={f.field} className="bg-secondary/30 border border-border p-4 space-y-2">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {f.label}
                          {isOverridden && (
                            <span className="ml-2 normal-case tracking-normal text-[10px] text-accent">
                              (spécifique à cette fiche)
                            </span>
                          )}
                        </label>
                        {isOverridden && (
                          <button
                            type="button"
                            onClick={() => reset(f.field)}
                            title="Hériter à nouveau de la valeur globale"
                            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-accent transition-colors"
                          >
                            ↺ Hériter
                          </button>
                        )}
                      </div>
                      {f.multiline ? (
                        <Textarea
                          value={v}
                          onChange={(ev) => setField(f.field, ev.target.value)}
                          rows={Math.min(6, Math.max(2, v.split("\n").length + 1))}
                        />
                      ) : (
                        <Input value={v} onChange={(ev) => setField(f.field, ev.target.value)} />
                      )}
                      {f.hint && <p className="text-[11px] text-muted-foreground/80">{f.hint}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

