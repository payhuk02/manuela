import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr as frLocale, enUS } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImage } from "@/lib/imageOptimizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NewsSection } from "@/components/sections/NewsSection";
import { ArticleDetailPreview } from "./ArticleDetailPreview";
import { toast } from "sonner";
import { Trash2, Plus, Upload, Eye, CalendarIcon, Save, X, Star, ArrowUp, ArrowDown } from "lucide-react";
import { RichEditor } from "./RichEditor";
import { NewsAiAssistant } from "./NewsAiAssistant";
import { PerContentSeoPanel } from "./PerContentSeoPanel";
import { pingSeo } from "@/lib/seoPing";
import { sanitizeHtml, isRichTextEmpty } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";
import { cn } from "@/lib/utils";

type ContentType = "news" | "article";

type News = {
  id: string;
  lang: "fr" | "en";
  title: string;
  excerpt: string;
  body: string;
  category: string;
  published_date: string; // YYYY-MM-DD
  image_url: string | null;
  images: string[];
  published: boolean;
  sort_order: number;
  content_type: ContentType;
  slug: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
};

const TYPE_META: Record<ContentType, { label: string; defaultCategory: string; defaultTitle: string; emptyLabel: string; description: string }> = {
  news: {
    label: "Actualités",
    defaultCategory: "Actualité",
    defaultTitle: "Nouvelle actualité",
    emptyLabel: "Aucune actualité.",
    description: "Brèves et communiqués du cabinet — affichés sur la page d'accueil et la page Actualités.",
  },
  article: {
    label: "Articles",
    defaultCategory: "Analyse",
    defaultTitle: "Nouvel article",
    emptyLabel: "Aucun article.",
    description: "Analyses juridiques de fond — affichées dans la section Articles de la page Actualités.",
  },
};

type Status = "draft" | "scheduled" | "published";

const validateForPublish = (n: News): string[] => {
  const errs: string[] = [];
  if (!n.title.trim()) errs.push("Le titre est requis.");
  if (isRichTextEmpty(n.body)) errs.push("Le contenu (body) est requis.");
  return errs;
};

const getStatus = (n: News): Status => {
  if (!n.published) return "draft";
  const today = new Date().toISOString().slice(0, 10);
  return n.published_date > today ? "scheduled" : "published";
};

const STATUS_META: Record<Status, { label: string; classes: string; dot: string }> = {
  draft: {
    label: "Brouillon",
    classes: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
  scheduled: {
    label: "À venir",
    classes: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  published: {
    label: "Publié",
    classes: "bg-accent/15 text-accent border-accent/30",
    dot: "bg-accent",
  },
};

const formatPublishDate = (iso: string, lang: "fr" | "en") =>
  new Date(iso + "T00:00:00").toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const NewsAdmin = () => {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<ContentType>("news");
  const previewItem = items.find((i) => i.id === previewId) ?? null;

  const filteredItems = items.filter((i) => (i.content_type ?? "news") === activeType);
  const counts = {
    news: items.filter((i) => (i.content_type ?? "news") === "news").length,
    article: items.filter((i) => (i.content_type ?? "news") === "article").length,
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("news_articles")
      .select("*")
      .order("published_date", { ascending: false });
    if (error) toast.error(error.message);
    else {
      const normalized = ((data as unknown as News[]) ?? []).map((n) => ({
        ...n,
        images: Array.isArray((n as unknown as { images?: unknown }).images)
          ? ((n as unknown as { images: unknown[] }).images.filter((u) => typeof u === "string") as string[])
          : [],
      }));
      setItems(normalized);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    const meta = TYPE_META[activeType];
    const { data, error } = await supabase
      .from("news_articles")
      .insert({
        lang: "fr",
        title: meta.defaultTitle,
        excerpt: "",
        body: "",
        category: meta.defaultCategory,
        published_date: new Date().toISOString().slice(0, 10),
        published: false,
        content_type: activeType,
      })
      .select()
      .single();
    if (error) toast.error(error.message);
    else {
      logAudit({ action: "news.create", target_type: "news_articles", target_id: data?.id, details: { content_type: activeType } });
      load();
    }
  };

  const update = async (id: string, patch: Partial<News>) => {
    // Block save that would persist publish=true without required fields
    const current = items.find((i) => i.id === id);
    const merged = { ...(current as News), ...patch } as News;
    if (merged.published) {
      const errs = validateForPublish(merged);
      if (errs.length) {
        errs.forEach((e) => toast.error(e));
        // Revert local state if needed (caller should re-load on failure)
        return;
      }
    }
    const { error } = await supabase
      .from("news_articles")
      .update(patch as never)
      .eq("id", id);
    if (error) toast.error(error.message);
    else
      logAudit({
        action: "news.update",
        target_type: "news_articles",
        target_id: id,
        details: { fields: Object.keys(patch) },
      });
  };

  const del = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    const item = items.find((i) => i.id === id);
    const { error } = await supabase.from("news_articles").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      logAudit({
        action: "news.delete",
        target_type: "news_articles",
        target_id: id,
        details: { title: item?.title },
      });
      toast.success("Supprimé");
      load();
    }
  };

  const saveNews = async (item: News) => {
    await update(item.id, {
      lang: item.lang,
      title: item.title,
      excerpt: sanitizeHtml(item.excerpt),
      body: sanitizeHtml(item.body),
      category: item.category,
      published_date: item.published_date,
      image_url: item.image_url,
      images: item.images,
      published: item.published,
      sort_order: item.sort_order,
      content_type: item.content_type,
      slug: item.slug,
      seo_title: item.seo_title,
      seo_description: item.seo_description,
      og_image_url: item.og_image_url,
    });
    if (item.published) {
      const ref = item.slug || item.id;
      const base = item.lang === "en" ? "/news" : "/actualites";
      pingSeo([base, `${base}/${ref}`]);
    }
    toast.success("Modifications sauvegardées");
  };

  const uploadCover = async (id: string, file: File) => {
    const optimized = await optimizeImage(file);
    const path = `news/${id}-${Date.now()}-${optimized.name}`;
    const { error } = await supabase.storage
      .from("site-images")
      .upload(path, optimized, { upsert: true, contentType: optimized.type });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    await update(id, { image_url: data.publicUrl });
    setItems((p) => p.map((i) => (i.id === id ? { ...i, image_url: data.publicUrl } : i)));
    const saved = Math.max(0, file.size - optimized.size);
    toast.success(
      saved > 1024
        ? `Image de couverture optimisée (-${Math.round((saved / file.size) * 100)} %) et téléversée`
        : "Image de couverture téléversée"
    );
  };

  const uploadGallery = async (id: string, files: FileList) => {
    const current = items.find((i) => i.id === id);
    if (!current) return;
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const optimized = await optimizeImage(file);
      const path = `news/${id}-gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${optimized.name}`;
      const { error } = await supabase.storage
        .from("site-images")
        .upload(path, optimized, { upsert: true, contentType: optimized.type });
      if (error) {
        toast.error(error.message);
        continue;
      }
      const { data } = supabase.storage.from("site-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    if (urls.length === 0) return;
    const nextImages = [...(current.images ?? []), ...urls];
    await update(id, { images: nextImages });
    setItems((p) => p.map((i) => (i.id === id ? { ...i, images: nextImages } : i)));
    toast.success(`${urls.length} image(s) ajoutée(s) à la galerie`);
  };

  const removeGalleryImage = async (id: string, index: number) => {
    const current = items.find((i) => i.id === id);
    if (!current) return;
    const nextImages = current.images.filter((_, i) => i !== index);
    setItems((p) => p.map((i) => (i.id === id ? { ...i, images: nextImages } : i)));
    await update(id, { images: nextImages });
  };

  const moveGalleryImage = async (id: string, index: number, dir: -1 | 1) => {
    const current = items.find((i) => i.id === id);
    if (!current) return;
    const next = [...current.images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems((p) => p.map((i) => (i.id === id ? { ...i, images: next } : i)));
    await update(id, { images: next });
  };

  const setAsCover = async (id: string, index: number) => {
    const current = items.find((i) => i.id === id);
    if (!current) return;
    const newCover = current.images[index];
    if (!newCover) return;
    const remaining = current.images.filter((_, i) => i !== index);
    const nextImages = current.image_url ? [current.image_url, ...remaining] : remaining;
    setItems((p) =>
      p.map((i) => (i.id === id ? { ...i, image_url: newCover, images: nextImages } : i))
    );
    await update(id, { image_url: newCover, images: nextImages });
    toast.success("Image définie comme couverture");
  };

  if (loading) return <p className="text-muted-foreground">Chargement…</p>;

  const activeMeta = TYPE_META[activeType];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-3xl text-primary">Actualités / Articles</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Brouillon, programmation et publication des contenus du cabinet.
          </p>
        </div>
        <Button onClick={add} variant="gold">
          <Plus className="h-4 w-4" /> Ajouter {activeType === "news" ? "une actualité" : "un article"}
        </Button>
      </div>

      <Tabs value={activeType} onValueChange={(v) => setActiveType(v as ContentType)}>
        <TabsList>
          <TabsTrigger value="news">Actualités ({counts.news})</TabsTrigger>
          <TabsTrigger value="article">Articles ({counts.article})</TabsTrigger>
        </TabsList>
      </Tabs>

      <p className="text-xs text-muted-foreground">{activeMeta.description}</p>

      <div className="space-y-4">
        {filteredItems.map((n) => {
          const status = getStatus(n);
          const meta = STATUS_META[status];
          const dateObj = new Date(n.published_date + "T00:00:00");
          const locale = n.lang === "fr" ? frLocale : enUS;
          const bodyEmpty = isRichTextEmpty(n.body);
          const titleEmpty = !n.title.trim();
          const canPublish = !bodyEmpty && !titleEmpty;

          return (
            <div key={n.id} className="border border-border bg-card p-6 space-y-4">
              {/* Header: status + date + actions */}
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-border flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] px-3 py-1.5 border",
                      meta.classes,
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                    {meta.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {status === "scheduled"
                      ? `Publication prévue le ${formatPublishDate(n.published_date, n.lang)}`
                      : formatPublishDate(n.published_date, n.lang)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPreviewId(n.id)}>
                    <Eye className="h-4 w-4" /> Prévisualiser
                  </Button>
                  <Button type="button" size="sm" onClick={() => saveNews(n)}>
                    <Save className="h-4 w-4" /> Sauvegarder
                  </Button>
                  <Button
                    variant={n.published ? "outline" : "gold"}
                    size="sm"
                    disabled={!n.published && !canPublish}
                    title={
                      !n.published && !canPublish
                        ? titleEmpty
                          ? "Le titre est requis."
                          : "Le contenu de l'article est vide."
                        : undefined
                    }
                    onClick={() => {
                      const next = !n.published;
                      if (next && !canPublish) {
                        if (titleEmpty) toast.error("Impossible de publier : le titre est requis.");
                        if (bodyEmpty) toast.error("Impossible de publier : le contenu est vide.");
                        return;
                      }
                      setItems((p) => p.map((i) => (i.id === n.id ? { ...i, published: next } : i)));
                      update(n.id, { published: next });
                    }}
                  >
                    {n.published ? "Dépublier" : "Publier"}
                  </Button>
                </div>
              </div>

              {/* Lang / Category / Date picker */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Langue</p>
                  <select
                    value={n.lang}
                    onChange={(e) => {
                      const v = e.target.value as "fr" | "en";
                      setItems((p) => p.map((i) => (i.id === n.id ? { ...i, lang: v } : i)));
                      update(n.id, { lang: v });
                    }}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Catégorie</p>
                  <Input
                    value={n.category}
                    onChange={(e) =>
                      setItems((p) => p.map((i) => (i.id === n.id ? { ...i, category: e.target.value } : i)))
                    }
                    onBlur={(e) => update(n.id, { category: e.target.value })}
                    placeholder="Catégorie"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                    Date de publication
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !n.published_date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {n.published_date ? format(dateObj, "PPP", { locale }) : "Choisir une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateObj}
                        onSelect={(d) => {
                          if (!d) return;
                          const iso = format(d, "yyyy-MM-dd");
                          setItems((p) =>
                            p.map((i) => (i.id === n.id ? { ...i, published_date: iso } : i)),
                          );
                          update(n.id, { published_date: iso });
                        }}
                        initialFocus
                        locale={locale}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Title */}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Titre</p>
                <Input
                  value={n.title}
                  onChange={(e) =>
                    setItems((p) => p.map((i) => (i.id === n.id ? { ...i, title: e.target.value } : i)))
                  }
                  onBlur={(e) => update(n.id, { title: e.target.value })}
                  placeholder="Titre"
                  className="font-serif text-lg"
                />
              </div>

              {/* Slug */}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                  Slug (URL) <span className="normal-case tracking-normal text-muted-foreground/70">— laissez vide pour utiliser l'identifiant</span>
                </p>
                <Input
                  value={n.slug ?? ""}
                  onChange={(e) =>
                    setItems((p) => p.map((i) => (i.id === n.id ? { ...i, slug: e.target.value } : i)))
                  }
                  onBlur={(e) => {
                    const v = e.target.value
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    setItems((p) => p.map((i) => (i.id === n.id ? { ...i, slug: v || null } : i)));
                    update(n.id, { slug: v || null });
                  }}
                  placeholder="ex. reforme-ohada-2026"
                  className="font-mono text-sm"
                />
              </div>

              {/* AI assistant */}
              <NewsAiAssistant
                lang={n.lang}
                contentType={n.content_type}
                title={n.title}
                body={n.body}
                excerpt={n.excerpt}
                category={n.category}
                onApply={(patch) => {
                  const safe: Partial<News> = {};
                  if (patch.title !== undefined) safe.title = patch.title;
                  if (patch.excerpt !== undefined) safe.excerpt = sanitizeHtml(patch.excerpt);
                  if (patch.body !== undefined) safe.body = sanitizeHtml(patch.body);
                  if (patch.seo_title !== undefined) safe.seo_title = patch.seo_title;
                  if (patch.seo_description !== undefined) safe.seo_description = patch.seo_description;
                  if (patch.slug !== undefined) safe.slug = patch.slug;
                  setItems((p) => p.map((i) => (i.id === n.id ? { ...i, ...safe } : i)));
                  update(n.id, safe);
                }}
                onCoverImage={async (file) => { await uploadCover(n.id, file); }}
              />

              {/* Per-article SEO */}
              <PerContentSeoPanel
                storagePrefix="news"
                recordId={n.id}
                seoTitle={n.seo_title}
                seoDescription={n.seo_description}
                ogImageUrl={n.og_image_url}
                fallbackTitle={`${n.title} — Cabinet Manuela DIABATE`}
                fallbackDescription={(n.excerpt || "").replace(/<[^>]+>/g, "").slice(0, 160)}
                onChange={(patch) => {
                  setItems((p) => p.map((i) => (i.id === n.id ? { ...i, ...patch } : i)));
                  update(n.id, patch);
                }}
              />


              {/* Excerpt */}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                  Résumé <span className="normal-case tracking-normal text-muted-foreground/70">— affiché sur la page d'accueil</span>
                </p>
                <RichEditor
                  value={n.excerpt}
                  onChange={(html) =>
                    setItems((p) => p.map((i) => (i.id === n.id ? { ...i, excerpt: html } : i)))
                  }
                  onBlur={(html) => update(n.id, { excerpt: sanitizeHtml(html) })}
                  placeholder="Résumé de l'article"
                  minHeight={120}
                />
              </div>

              {/* Body */}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                  Contenu <span className="normal-case tracking-normal text-muted-foreground/70">— page détail de l'article</span>
                </p>
                <RichEditor
                  value={n.body}
                  onChange={(html) =>
                    setItems((p) => p.map((i) => (i.id === n.id ? { ...i, body: html } : i)))
                  }
                  onBlur={(html) => update(n.id, { body: sanitizeHtml(html) })}
                  placeholder="Contenu complet de l'article"
                  minHeight={240}
                  invalid={bodyEmpty}
                />
                {bodyEmpty && (
                  <p className="text-xs text-destructive mt-1.5">
                    Le contenu est vide — la publication sera bloquée tant qu'il n'y a pas de texte.
                  </p>
                )}
              </div>

              {/* Cover image */}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                  Image de couverture
                  <span className="normal-case tracking-normal text-muted-foreground/70"> — affichée sur la carte et le hero</span>
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  {n.image_url ? (
                    <div className="relative">
                      <img src={n.image_url} alt="" className="h-20 w-32 object-cover rounded border border-border" />
                      <button
                        type="button"
                        onClick={() => {
                          setItems((p) => p.map((i) => (i.id === n.id ? { ...i, image_url: null } : i)));
                          update(n.id, { image_url: null });
                        }}
                        className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground transition"
                        title="Retirer la couverture"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 w-32 grid place-items-center text-xs text-muted-foreground border border-dashed border-border rounded">
                      Aucune
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm border border-border px-4 py-2 hover:bg-secondary rounded">
                    <Upload className="h-4 w-4" /> {n.image_url ? "Remplacer la couverture" : "Téléverser une couverture"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => e.target.files?.[0] && uploadCover(n.id, e.target.files[0])}
                    />
                  </label>
                </div>
              </div>

              {/* Gallery (multiple images) */}
              <div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Galerie d'images
                    <span className="normal-case tracking-normal text-muted-foreground/70"> — affichée en bas de la page détail</span>
                  </p>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs border border-border px-3 py-1.5 hover:bg-secondary rounded">
                    <Plus className="h-3.5 w-3.5" /> Ajouter des images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(e) => e.target.files && e.target.files.length > 0 && uploadGallery(n.id, e.target.files)}
                    />
                  </label>
                </div>
                {n.images && n.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {n.images.map((url, idx) => (
                      <div key={`${url}-${idx}`} className="relative group border border-border rounded overflow-hidden">
                        <img src={url} alt="" className="w-full aspect-[4/3] object-cover" />
                        <div className="absolute inset-0 bg-night/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveGalleryImage(n.id, idx, -1)}
                            disabled={idx === 0}
                            className="bg-background/90 text-foreground rounded p-1.5 disabled:opacity-40 hover:bg-background"
                            title="Déplacer à gauche"
                          >
                            <ArrowUp className="h-3.5 w-3.5 -rotate-90" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveGalleryImage(n.id, idx, 1)}
                            disabled={idx === n.images.length - 1}
                            className="bg-background/90 text-foreground rounded p-1.5 disabled:opacity-40 hover:bg-background"
                            title="Déplacer à droite"
                          >
                            <ArrowDown className="h-3.5 w-3.5 -rotate-90" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setAsCover(n.id, idx)}
                            className="bg-accent/90 text-accent-foreground rounded p-1.5 hover:bg-accent"
                            title="Définir comme couverture"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(n.id, idx)}
                            className="bg-destructive/90 text-destructive-foreground rounded p-1.5 hover:bg-destructive"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Aucune image dans la galerie.</p>
                )}
              </div>

              {/* Delete */}
              <div className="flex items-center justify-end pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => del(n.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Supprimer
                </Button>
              </div>
            </div>
          );
        })}
        {filteredItems.length === 0 && <p className="text-muted-foreground text-sm">{activeMeta.emptyLabel}</p>}
      </div>

      {/* Preview dialog */}
      <Dialog open={!!previewItem} onOpenChange={(o) => !o && setPreviewId(null)}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden gap-0">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border bg-background">
            <DialogTitle className="flex items-center gap-3 text-sm font-normal text-muted-foreground">
              <Eye className="h-4 w-4 text-accent" />
              Prévisualisation — aperçu site
              {previewItem && (() => {
                const s = getStatus(previewItem);
                const m = STATUS_META[s];
                return (
                  <span
                    className={cn(
                      "ml-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] px-2 py-1 border",
                      m.classes,
                    )}
                  >
                    <span className={cn("h-1 w-1 rounded-full", m.dot)} />
                    {m.label}
                  </span>
                );
              })()}
            </DialogTitle>
          </DialogHeader>

          {previewItem && (
            <Tabs defaultValue="card" className="flex flex-col">
              <TabsList className="mx-6 mt-4 self-start">
                <TabsTrigger value="card">Carte (accueil)</TabsTrigger>
                <TabsTrigger value="detail">Page détail</TabsTrigger>
              </TabsList>

              <TabsContent value="card" className="m-0">
                <div className="max-h-[75vh] overflow-y-auto">
                  <NewsSection
                    eyebrow={previewItem.lang === "fr" ? "Actualités" : "Insights"}
                    title={
                      previewItem.lang === "fr"
                        ? "Décryptages & publications"
                        : "Analysis & publications"
                    }
                    readMoreLabel={previewItem.lang === "fr" ? "Lire l'article" : "Read article"}
                    items={[
                      {
                        key: previewItem.id,
                        category: previewItem.category || "—",
                        date: formatPublishDate(previewItem.published_date, previewItem.lang),
                        title: previewItem.title || "(Sans titre)",
                        excerpt: previewItem.excerpt,
                        image_url: previewItem.image_url,
                      },
                    ]}
                  />
                </div>
              </TabsContent>

              <TabsContent value="detail" className="m-0">
                <div className="max-h-[75vh] overflow-y-auto">
                  <ArticleDetailPreview
                    lang={previewItem.lang}
                    category={previewItem.category}
                    date={formatPublishDate(previewItem.published_date, previewItem.lang)}
                    title={previewItem.title}
                    excerpt={previewItem.excerpt}
                    body={previewItem.body}
                    image_url={previewItem.image_url}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
