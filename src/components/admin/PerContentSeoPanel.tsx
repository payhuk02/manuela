import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Search, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImage } from "@/lib/imageOptimizer";
import { toast } from "sonner";

type Props = {
  /** Storage path prefix (e.g. "news", "expertises") */
  storagePrefix: string;
  recordId: string;
  seoTitle: string | null | undefined;
  seoDescription: string | null | undefined;
  ogImageUrl: string | null | undefined;
  fallbackTitle: string;
  fallbackDescription: string;
  onChange: (patch: { seo_title?: string | null; seo_description?: string | null; og_image_url?: string | null }) => void;
};

const counter = (val: string, max: number) => {
  const len = val.length;
  const tone = len === 0 ? "text-muted-foreground" : len > max ? "text-destructive" : len > max * 0.95 ? "text-amber-600" : "text-emerald-600";
  return <span className={tone}>{len}/{max}</span>;
};

/** Compact SEO panel reused in NewsAdmin & ExpertisesAdmin to override per-item meta. */
export const PerContentSeoPanel = ({
  storagePrefix,
  recordId,
  seoTitle,
  seoDescription,
  ogImageUrl,
  fallbackTitle,
  fallbackDescription,
  onChange,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const optimized = await optimizeImage(file);
      const path = `${storagePrefix}/${recordId}-og-${Date.now()}-${optimized.name}`;
      const { error } = await supabase.storage
        .from("site-images")
        .upload(path, optimized, { upsert: true, contentType: optimized.type });
      if (error) throw error;
      const { data } = supabase.storage.from("site-images").getPublicUrl(path);
      onChange({ og_image_url: data.publicUrl });
      toast.success("Image OG téléversée");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-border bg-secondary/20 rounded">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-secondary/50"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <Search className="h-4 w-4 text-accent" />
        SEO — Référencement personnalisé
        <span className="ml-auto text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          {(seoTitle?.trim() || seoDescription?.trim() || ogImageUrl) ? "Personnalisé" : "Automatique"}
        </span>
      </button>
      {open && (
        <div className="p-4 space-y-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Si vous laissez vide, le titre sera dérivé du contenu. Idéal : 50–60 caractères pour le titre, 120–160 pour la description.
          </p>
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.15em] mb-1">
              <span className="text-muted-foreground">Titre SEO</span>
              {counter(seoTitle ?? "", 60)}
            </div>
            <Input
              value={seoTitle ?? ""}
              onChange={(e) => onChange({ seo_title: e.target.value })}
              placeholder={fallbackTitle}
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.15em] mb-1">
              <span className="text-muted-foreground">Description SEO</span>
              {counter(seoDescription ?? "", 160)}
            </div>
            <Textarea
              value={seoDescription ?? ""}
              onChange={(e) => onChange({ seo_description: e.target.value })}
              placeholder={fallbackDescription.slice(0, 160)}
              rows={3}
            />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
              Image de partage (Open Graph) — 1200×630
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {ogImageUrl ? (
                <div className="relative">
                  <img src={ogImageUrl} alt="" className="h-16 w-28 object-cover rounded border border-border" />
                  <button
                    type="button"
                    onClick={() => onChange({ og_image_url: null })}
                    className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-16 w-28 grid place-items-center text-[10px] text-muted-foreground border border-dashed border-border rounded">
                  Image de couverture
                </div>
              )}
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs border border-border px-3 py-1.5 hover:bg-secondary rounded">
                <Upload className="h-3.5 w-3.5" /> {uploading ? "…" : (ogImageUrl ? "Remplacer" : "Téléverser")}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={uploading}
                  onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
