import { useRef, useState } from "react";
import { Sparkles, Wand2, Tags, FileText, Loader2, ImagePlus, Check, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ContentType = "news" | "article";

type SeoResult = {
  seo_title: string;
  seo_description: string;
  keywords: string[];
  slug: string;
};

type Props = {
  lang: "fr" | "en";
  contentType: ContentType;
  title: string;
  body: string;
  excerpt: string;
  category: string;
  /**
   * Apply a partial update to the article: any of these fields will be
   * forwarded to the parent so it can update local state and persist to DB.
   */
  onApply: (patch: {
    title?: string;
    excerpt?: string;
    body?: string;
    seo_title?: string | null;
    seo_description?: string | null;
    slug?: string | null;
  }) => void;
  /** Optional: when provided, an "Generate cover image" button is shown. */
  onCoverImage?: (file: File) => Promise<void> | void;
};

async function callAi<T = unknown>(payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("news-ai-assist", {
    body: payload,
  });
  if (error) throw new Error(error.message || "AI request failed");
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as T;
}

export const NewsAiAssistant = ({
  lang,
  contentType,
  title,
  body,
  excerpt,
  category,
  onApply,
  onCoverImage,
}: Props) => {
  const [topic, setTopic] = useState("");
  const [draftOpen, setDraftOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [seoResult, setSeoResult] = useState<SeoResult | null>(null);

  // Cover-image options
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "4:3">("16:9");
  const [imgQuality, setImgQuality] = useState<"standard" | "premium">("premium");
  const [imgStyle, setImgStyle] = useState<"institutionnel" | "moderne" | "classique">(
    "institutionnel",
  );
  const [coverPreviewOpen, setCoverPreviewOpen] = useState(false);
  const [coverPreview, setCoverPreview] = useState<{
    dataUrl: string;
    mimeType: string;
    base64: string;
    cached: boolean;
  } | null>(null);

  // In-memory cache: key (title|topic|body|category|style|ratio|quality) -> result
  const coverCache = useRef<
    Map<string, { mime_type: string; image_base64: string }>
  >(new Map());

  const cacheKey = () =>
    JSON.stringify([
      (title || "").trim(),
      topic.trim(),
      (body || "").trim(),
      (category || "").trim(),
      contentType,
      lang,
      imgStyle,
      aspectRatio,
      imgQuality,
    ]);

  const isEmptyHtml = (html: string) =>
    !html || html.replace(/<[^>]+>/g, "").trim().length === 0;

  const handleDraft = async () => {
    if (!topic.trim() && !title.trim()) {
      toast.error("Décris le sujet ou renseigne au moins un titre.");
      return;
    }
    setBusy("draft");
    try {
      const out = await callAi<{ title: string; excerpt: string; body_html: string }>({
        action: "draft",
        lang,
        contentType,
        topic: topic.trim() || undefined,
        title: title || undefined,
        category: category || undefined,
      });
      onApply({ title: out.title, excerpt: out.excerpt, body: out.body_html });
      toast.success("Brouillon généré ✨");
      setDraftOpen(false);
      setTopic("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const handleImprove = async () => {
    if (isEmptyHtml(body)) {
      toast.error("Écris un peu de contenu avant de l'améliorer.");
      return;
    }
    setBusy("improve");
    try {
      const out = await callAi<{ body_html: string }>({
        action: "improve",
        lang,
        contentType,
        body,
      });
      onApply({ body: out.body_html });
      toast.success("Texte amélioré.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const handleExcerpt = async () => {
    if (isEmptyHtml(body) && !title) {
      toast.error("Ajoute du contenu ou un titre d'abord.");
      return;
    }
    setBusy("excerpt");
    try {
      const out = await callAi<{ excerpt: string }>({
        action: "excerpt",
        lang,
        contentType,
        title,
        body,
      });
      onApply({ excerpt: out.excerpt });
      toast.success("Résumé généré.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const handleSeo = async () => {
    if (isEmptyHtml(body) && !title) {
      toast.error("Ajoute du contenu ou un titre d'abord.");
      return;
    }
    setBusy("seo");
    try {
      const out = await callAi<SeoResult>({
        action: "seo",
        lang,
        contentType,
        title,
        body,
        category,
      });
      setSeoResult(out);
      setSeoOpen(true);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const handleCoverImage = async () => {
    if (!onCoverImage) return;
    if (!title.trim() && isEmptyHtml(body) && !topic.trim()) {
      toast.error("Renseigne un titre, un sujet ou du contenu d'abord.");
      return;
    }
    const key = cacheKey();
    const hit = coverCache.current.get(key);
    if (hit) {
      setCoverPreview({
        dataUrl: `data:${hit.mime_type};base64,${hit.image_base64}`,
        mimeType: hit.mime_type,
        base64: hit.image_base64,
        cached: true,
      });
      setCoverPreviewOpen(true);
      toast.success("Couverture restaurée depuis le cache ✨");
      return;
    }
    setBusy("cover");
    const tId = toast.loading(
      `Génération ${imgQuality === "premium" ? "premium" : "standard"} en cours… (≈ ${imgQuality === "premium" ? "45-90" : "15-30"} s)`,
    );
    try {
      const out = await callAi<{ image_base64: string; mime_type: string }>({
        action: "cover_image",
        lang,
        contentType,
        topic: topic.trim() || undefined,
        title: title || undefined,
        body: body || undefined,
        category: category || undefined,
        aspect_ratio: aspectRatio,
        quality: imgQuality,
        style: imgStyle,
      });
      coverCache.current.set(key, out);
      setCoverPreview({
        dataUrl: `data:${out.mime_type};base64,${out.image_base64}`,
        mimeType: out.mime_type,
        base64: out.image_base64,
        cached: false,
      });
      setCoverPreviewOpen(true);
      toast.success("Aperçu prêt — confirme pour l'appliquer.", { id: tId });
    } catch (e) {
      toast.error((e as Error).message, { id: tId });
    } finally {
      setBusy(null);
    }
  };

  const confirmCoverPreview = async () => {
    if (!coverPreview || !onCoverImage) return;
    const bin = atob(coverPreview.base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const ext = (coverPreview.mimeType.split("/")[1] || "png").toLowerCase();
    const file = new File([bytes], `ia-cover-${Date.now()}.${ext}`, {
      type: coverPreview.mimeType,
    });
    setBusy("cover");
    try {
      await onCoverImage(file);
      toast.success("Couverture appliquée ✨");
      setCoverPreviewOpen(false);
      setCoverPreview(null);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Assistant IA</h4>
          <Badge variant="outline" className="text-[10px] uppercase">
            {lang}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Rédige, améliore, optimise pour le SEO.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Draft from topic */}
        <Dialog open={draftOpen} onOpenChange={setDraftOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="default" disabled={!!busy}>
              <Wand2 className="h-3.5 w-3.5 mr-1.5" />
              Générer un brouillon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Générer un brouillon</DialogTitle>
              <DialogDescription>
                Décris le sujet en quelques phrases. L'IA produira un titre, un résumé
                et un contenu structuré que tu pourras ensuite ajuster.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="ex. Réforme OHADA 2026 sur les sociétés commerciales : ce qui change pour les dirigeants ivoiriens et leurs investisseurs français…"
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Astuce : ajoute angle, public cible, événement, source — plus c'est
                précis, meilleur sera le rendu.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDraftOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleDraft} disabled={busy === "draft"}>
                {busy === "draft" ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                )}
                Générer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button size="sm" variant="outline" onClick={handleImprove} disabled={!!busy}>
          {busy === "improve" ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Wand2 className="h-3.5 w-3.5 mr-1.5" />
          )}
          Améliorer le texte
        </Button>

        <Button size="sm" variant="outline" onClick={handleExcerpt} disabled={!!busy}>
          {busy === "excerpt" ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <FileText className="h-3.5 w-3.5 mr-1.5" />
          )}
          Générer le résumé
        </Button>

        <Button size="sm" variant="outline" onClick={handleSeo} disabled={!!busy}>
          {busy === "seo" ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Tags className="h-3.5 w-3.5 mr-1.5" />
          )}
          Mots-clés & SEO
        </Button>

        {onCoverImage && (
          <Button size="sm" variant="outline" onClick={handleCoverImage} disabled={!!busy}>
            {busy === "cover" ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5 mr-1.5" />
            )}
            Générer l'image de couverture
          </Button>
        )}
      </div>

      {onCoverImage && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Style
            </label>
            <Select value={imgStyle} onValueChange={(v) => setImgStyle(v as typeof imgStyle)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="institutionnel">Institutionnel</SelectItem>
                <SelectItem value="moderne">Moderne</SelectItem>
                <SelectItem value="classique">Classique</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Format
            </label>
            <Select
              value={aspectRatio}
              onValueChange={(v) => setAspectRatio(v as typeof aspectRatio)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 (panoramique)</SelectItem>
                <SelectItem value="4:3">4:3 (classique)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Qualité
            </label>
            <Select
              value={imgQuality}
              onValueChange={(v) => setImgQuality(v as typeof imgQuality)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (rapide)</SelectItem>
                <SelectItem value="premium">Premium (Nano Banana Pro)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Cover preview dialog */}
      <Dialog open={coverPreviewOpen} onOpenChange={setCoverPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu de la couverture</DialogTitle>
            <DialogDescription>
              {coverPreview?.cached
                ? "Image restaurée depuis le cache (mêmes paramètres)."
                : "Vérifie le rendu avant de l'appliquer comme image de couverture."}
            </DialogDescription>
          </DialogHeader>
          {coverPreview && (
            <div className="space-y-3">
              <div className="rounded-md overflow-hidden border bg-muted/30">
                <img
                  src={coverPreview.dataUrl}
                  alt="Aperçu couverture générée par IA"
                  className="w-full h-auto block"
                />
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">Style : {imgStyle}</Badge>
                <Badge variant="secondary">Format : {aspectRatio}</Badge>
                <Badge variant="secondary">Qualité : {imgQuality}</Badge>
                {coverPreview.cached && <Badge variant="outline">Depuis le cache</Badge>}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCoverPreviewOpen(false);
                    setCoverPreview(null);
                  }}
                  disabled={busy === "cover"}
                >
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Annuler
                </Button>
                <Button onClick={confirmCoverPreview} disabled={busy === "cover"}>
                  {busy === "cover" ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Confirmer & appliquer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* SEO results dialog */}
      <Dialog open={seoOpen} onOpenChange={setSeoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Suggestions SEO</DialogTitle>
            <DialogDescription>
              Vérifie puis applique en un clic. Les champs SEO de l'article seront
              mis à jour.
            </DialogDescription>
          </DialogHeader>
          {seoResult && (
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Titre SEO ({seoResult.seo_title.length} car.)
                </p>
                <Input
                  value={seoResult.seo_title}
                  onChange={(e) =>
                    setSeoResult({ ...seoResult, seo_title: e.target.value })
                  }
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Description SEO ({seoResult.seo_description.length} car.)
                </p>
                <Textarea
                  value={seoResult.seo_description}
                  onChange={(e) =>
                    setSeoResult({ ...seoResult, seo_description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Slug
                </p>
                <Input
                  value={seoResult.slug}
                  onChange={(e) =>
                    setSeoResult({ ...seoResult, slug: e.target.value })
                  }
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Mots-clés suggérés
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {seoResult.keywords.map((k, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {k}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Utilise ces expressions naturellement dans le titre, le résumé et
                  les sous-titres du contenu.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSeoOpen(false)}>
                  Fermer
                </Button>
                <Button
                  onClick={() => {
                    onApply({
                      seo_title: seoResult.seo_title,
                      seo_description: seoResult.seo_description,
                      slug: seoResult.slug,
                    });
                    toast.success("Métadonnées SEO appliquées.");
                    setSeoOpen(false);
                  }}
                >
                  Appliquer au formulaire
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
