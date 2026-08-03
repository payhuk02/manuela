import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImage } from "@/lib/imageOptimizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { Upload, Trash2, Palette, Image as ImageIcon } from "lucide-react";

export const ThemeAdmin = () => {
  const [primaryColor, setPrimaryColor] = useState("");
  const [accentColor, setAccentColor] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("*")
      .in("key", ["theme.color.primary", "theme.color.accent", "theme.favicon"])
      .eq("lang", "fr")
      .then(({ data, error }) => {
        if (error) return toast.error(error.message);
        const map: Record<string, string> = {};
        (data ?? []).forEach((r: any) => {
          if (r.value) map[r.key] = r.value;
        });
        setPrimaryColor(map["theme.color.primary"] || "");
        setAccentColor(map["theme.color.accent"] || "");
        setFaviconUrl(map["theme.favicon"] || "");
      });
  }, []);

  const saveColors = async () => {
    setSaving(true);
    try {
      const payloadRows = [
        { key: "theme.color.primary", lang: "fr", value: primaryColor },
        { key: "theme.color.primary", lang: "en", value: primaryColor },
        { key: "theme.color.accent", lang: "fr", value: accentColor },
        { key: "theme.color.accent", lang: "en", value: accentColor },
      ];
      
      const { error } = await supabase
        .from("site_content")
        .upsert(payloadRows, { onConflict: "key,lang" });
        
      if (error) throw error;
      toast.success("Couleurs sauvegardées. Rafraîchissez le site pour voir les changements !");
      logAudit({ action: "theme.update_colors", target_type: "site_content", target_id: "colors" });
    } catch (e: any) {
      toast.error(e.message ?? "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const uploadFavicon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const shouldOptimize = file.type.startsWith("image/") && file.type !== "image/svg+xml" && !file.name.endsWith(".ico");
      const payload = shouldOptimize ? await optimizeImage(file) : file;
      const ext = payload.name.split(".").pop() || "png";
      const path = `theme/favicon-${Date.now()}.${ext}`;
      
      const { error: upErr } = await supabase.storage
        .from("site-images")
        .upload(path, payload, { upsert: true, contentType: payload.type });
        
      if (upErr) throw upErr;
      
      const { data: pub } = supabase.storage.from("site-images").getPublicUrl(path);
      const url = pub.publicUrl;

      const payloadRows = ["fr", "en"].map((lang) => ({ key: "theme.favicon", lang, value: url }));
      const { error: dbErr } = await supabase
        .from("site_content")
        .upsert(payloadRows, { onConflict: "key,lang" });
        
      if (dbErr) throw dbErr;

      setFaviconUrl(url);
      toast.success("Favicon mis à jour !");
      logAudit({ action: "theme.update_favicon", target_type: "site_content", target_id: "favicon" });
    } catch (e: any) {
      toast.error(e.message ?? "Échec de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const resetFavicon = async () => {
    const payload = ["fr", "en"].map((lang) => ({ key: "theme.favicon", lang, value: "" }));
    const { error } = await supabase
      .from("site_content")
      .upsert(payload, { onConflict: "key,lang" });
    if (error) return toast.error(error.message);
    setFaviconUrl("");
    toast.success("Favicon réinitialisé (valeur par défaut)");
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="font-serif text-3xl text-primary flex items-center gap-2">
          <Palette className="w-8 h-8" />
          Thème & Couleurs
        </h2>
        <p className="text-muted-foreground mt-2">
          Personnalisez les couleurs principales de votre site et l'icône du navigateur (favicon). 
          Laissez vide pour utiliser les couleurs d'origine.
        </p>
      </div>

      <div className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" /> Couleurs du site
        </h3>
        
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Couleur Principale (Boutons, Liens, Fonds)</label>
            <div className="flex items-center gap-4">
              <Input 
                type="color" 
                value={primaryColor || "#0e4194"} 
                onChange={(e) => setPrimaryColor(e.target.value)} 
                className="w-16 h-12 p-1 cursor-pointer"
              />
              <Input 
                type="text" 
                value={primaryColor} 
                onChange={(e) => setPrimaryColor(e.target.value)} 
                placeholder="#0e4194 (Laissez vide pour par défaut)"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">Couleur dominante (ex: bleu roi).</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Couleur d'Accentuation</label>
            <div className="flex items-center gap-4">
              <Input 
                type="color" 
                value={accentColor || "#262626"} 
                onChange={(e) => setAccentColor(e.target.value)} 
                className="w-16 h-12 p-1 cursor-pointer"
              />
              <Input 
                type="text" 
                value={accentColor} 
                onChange={(e) => setAccentColor(e.target.value)} 
                placeholder="#262626 (Laissez vide pour par défaut)"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">Utilisée pour souligner certains éléments (ex: gris foncé).</p>
          </div>
        </div>

        <Button onClick={saveColors} disabled={saving} className="w-full">
          {saving ? "Sauvegarde..." : "Sauvegarder les couleurs"}
        </Button>
      </div>

      <div className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" /> Favicon (Icône du navigateur)
        </h3>
        
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 shrink-0 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden relative">
            {faviconUrl ? (
              <img src={faviconUrl} alt="Favicon preview" className="w-12 h-12 object-contain" />
            ) : (
              <span className="text-xs text-muted-foreground text-center px-2">Par défaut</span>
            )}
          </div>
          
          <div className="space-y-3 flex-1">
            <p className="text-sm text-muted-foreground">
              Format recommandé : PNG, ICO, ou SVG (format carré, ex: 64x64px ou 512x512px).
            </p>
            
            <div className="flex gap-2">
              <Button variant="outline" className="relative overflow-hidden w-full sm:w-auto" disabled={uploading}>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Envoi..." : "Changer l'icône"}
                <input
                  type="file"
                  accept="image/*,.ico"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={uploadFavicon}
                  disabled={uploading}
                />
              </Button>
              {faviconUrl && (
                <Button variant="destructive" onClick={resetFavicon} disabled={uploading}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
