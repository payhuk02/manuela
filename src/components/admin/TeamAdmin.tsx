import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImage } from "@/lib/imageOptimizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, Plus, Upload, Eye, EyeOff, FileText, ExternalLink, Save } from "lucide-react";
import { RichEditor } from "./RichEditor";
import { sanitizeHtml } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";
import { TeamPagePreview } from "./TeamPagePreview";

type Member = {
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
  sort_order: number;
  published: boolean;
  is_founder: boolean;
};

export const TeamAdmin = () => {
  const [items, setItems] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [cvPreview, setCvPreview] = useState<{ url: string; name: string } | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("team_members").select("*").order("sort_order");
    if (error) toast.error(error.message);
    else setItems((data as Member[]) ?? []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    const { data, error } = await supabase
      .from("team_members")
      .insert({ name: "Nouveau membre", sort_order: items.length, published: true })
      .select()
      .single();
    if (error) toast.error(error.message);
    else {
      logAudit({ action: "team.create", target_type: "team_members", target_id: data?.id });
      load();
    }
  };
  const update = async (id: string, patch: Partial<Member>) => {
    const { error } = await supabase.from("team_members").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else logAudit({ action: "team.update", target_type: "team_members", target_id: id, details: { fields: Object.keys(patch) } });
  };
  const saveMember = async (member: Member) => {
    await update(member.id, {
      name: member.name,
      role_fr: member.role_fr,
      role_en: member.role_en,
      bio_fr: sanitizeHtml(member.bio_fr),
      bio_en: sanitizeHtml(member.bio_en),
      presentation_fr: sanitizeHtml(member.presentation_fr),
      presentation_en: sanitizeHtml(member.presentation_en),
      photo_url: member.photo_url,
      cv_url: member.cv_url,
      sort_order: member.sort_order,
      published: member.published,
      is_founder: member.is_founder,
    });
    toast.success("Modifications sauvegardées");
  };
  const del = async (id: string) => {
    if (!confirm("Supprimer ?")) return;
    const item = items.find((i) => i.id === id);
    await supabase.from("team_members").delete().eq("id", id);
    logAudit({ action: "team.delete", target_type: "team_members", target_id: id, details: { name: item?.name } });
    load();
  };
  const upload = async (id: string, file: File) => {
    const optimized = await optimizeImage(file);
    const path = `team/${id}-${Date.now()}-${optimized.name}`;
    const { error } = await supabase.storage
      .from("site-images")
      .upload(path, optimized, { upsert: true, contentType: optimized.type });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    await update(id, { photo_url: data.publicUrl });
    setItems((p) => p.map((i) => (i.id === id ? { ...i, photo_url: data.publicUrl } : i)));
    toast.success("Photo optimisée et téléversée");
  };

  const uploadCv = async (id: string, file: File) => {
    const path = `cv/${id}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("documents").getPublicUrl(path);
    await update(id, { cv_url: data.publicUrl });
    setItems((p) => p.map((i) => (i.id === id ? { ...i, cv_url: data.publicUrl } : i)));
    toast.success("CV téléversé");
  };

  if (loading) return <p className="text-muted-foreground">Chargement…</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-3xl text-primary">Équipe</h2>
          <p className="text-sm text-muted-foreground mt-1">Membres affichés sur le site.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? "Masquer aperçu" : "Afficher aperçu"}
          </Button>
          <Button onClick={add} variant="gold">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>
      </div>

      <div className={showPreview ? "grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6" : ""}>
        <div className="grid md:grid-cols-2 gap-4 min-w-0">
        {items.map((m) => (
          <div key={m.id} className="border border-border bg-card p-6 space-y-3">
            <div className="flex gap-4">
              {m.photo_url ? (
                <img src={m.photo_url} alt={m.name} className="h-20 w-20 object-cover" />
              ) : (
                <div className="h-20 w-20 bg-secondary grid place-items-center text-xs text-muted-foreground">
                  Photo
                </div>
              )}
              <div className="flex-1 space-y-2">
                <Input
                  value={m.name}
                  onChange={(e) => setItems((p) => p.map((i) => (i.id === m.id ? { ...i, name: e.target.value } : i)))}
                  onBlur={(e) => update(m.id, { name: e.target.value })}
                  placeholder="Nom"
                  className="font-serif"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs border border-border px-3 py-1.5 hover:bg-secondary">
                    <Upload className="h-3 w-3" /> Photo
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => e.target.files?.[0] && upload(m.id, e.target.files[0])}
                    />
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs border border-border px-3 py-1.5 hover:bg-secondary">
                    <Upload className="h-3 w-3" /> CV (PDF)
                    <input
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={(e) => e.target.files?.[0] && uploadCv(m.id, e.target.files[0])}
                    />
                  </label>
                  {m.cv_url && (
                    <button
                      type="button"
                      onClick={() => setCvPreview({ url: m.cv_url!, name: m.name })}
                      className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
                      title="Aperçu du CV avant publication"
                    >
                      <FileText className="h-3 w-3" /> Aperçu CV
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <Input
                value={m.role_fr}
                onChange={(e) => setItems((p) => p.map((i) => (i.id === m.id ? { ...i, role_fr: e.target.value } : i)))}
                onBlur={(e) => update(m.id, { role_fr: e.target.value })}
                placeholder="Rôle (FR)"
              />
              <Input
                value={m.role_en}
                onChange={(e) => setItems((p) => p.map((i) => (i.id === m.id ? { ...i, role_en: e.target.value } : i)))}
                onBlur={(e) => update(m.id, { role_en: e.target.value })}
                placeholder="Role (EN)"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Bio courte (FR)</p>
              <RichEditor
                value={m.bio_fr}
                onChange={(html) => setItems((p) => p.map((i) => (i.id === m.id ? { ...i, bio_fr: html } : i)))}
                onBlur={(html) => update(m.id, { bio_fr: sanitizeHtml(html) })}
                placeholder="Biographie en français (page d'accueil)"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Short bio (EN)</p>
              <RichEditor
                value={m.bio_en}
                onChange={(html) => setItems((p) => p.map((i) => (i.id === m.id ? { ...i, bio_en: html } : i)))}
                onBlur={(html) => update(m.id, { bio_en: sanitizeHtml(html) })}
                placeholder="Short biography in English (home page)"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                Présentation détaillée (FR) — page Équipe
              </p>
              <RichEditor
                value={m.presentation_fr}
                onChange={(html) => setItems((p) => p.map((i) => (i.id === m.id ? { ...i, presentation_fr: html } : i)))}
                onBlur={(html) => update(m.id, { presentation_fr: sanitizeHtml(html) })}
                placeholder="Présentation longue (carrière, distinctions, langues…)"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                Detailed presentation (EN) — Team page
              </p>
              <RichEditor
                value={m.presentation_en}
                onChange={(html) => setItems((p) => p.map((i) => (i.id === m.id ? { ...i, presentation_en: html } : i)))}
                onBlur={(html) => update(m.id, { presentation_en: sanitizeHtml(html) })}
                placeholder="Long presentation (career, awards, languages…)"
              />
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-border">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={m.published}
                  onChange={(e) => {
                    setItems((p) => p.map((i) => (i.id === m.id ? { ...i, published: e.target.checked } : i)));
                    update(m.id, { published: e.target.checked });
                  }}
                />
                Publié
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={m.is_founder}
                  onChange={(e) => {
                    setItems((p) => p.map((i) => (i.id === m.id ? { ...i, is_founder: e.target.checked } : i)));
                    update(m.id, { is_founder: e.target.checked });
                  }}
                />
                Fondateur
              </label>
              <Input
                type="number"
                value={m.sort_order}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setItems((p) => p.map((i) => (i.id === m.id ? { ...i, sort_order: v } : i)));
                  update(m.id, { sort_order: v });
                }}
                className="w-20"
              />
              <Button type="button" size="sm" onClick={() => saveMember(m)}>
                <Save className="h-4 w-4" />
                Sauvegarder
              </Button>
              <Button variant="ghost" size="sm" onClick={() => del(m.id)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm">Aucun membre.</p>}
        </div>

        {showPreview && (
          <div className="min-w-0">
            <div className="xl:sticky xl:top-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Aperçu temps réel — page /equipe
              </p>
              <div className="border border-border bg-card overflow-hidden shadow-soft max-h-[calc(100vh-8rem)] overflow-y-auto">
                <TeamPagePreview lang="fr" members={items} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CV PDF preview dialog — vérification du document avant qu'il ne soit téléchargeable depuis la page publique. */}
      <Dialog open={!!cvPreview} onOpenChange={(o) => !o && setCvPreview(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 flex flex-col gap-0 overflow-hidden">
          <DialogHeader className="px-5 py-3 border-b border-border bg-card">
            <DialogTitle className="font-serif text-lg text-primary flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              Aperçu CV — {cvPreview?.name}
            </DialogTitle>
            <DialogDescription className="text-xs flex items-center gap-3 flex-wrap">
              <span className="text-muted-foreground">
                Vérifiez le document avant publication. C'est exactement ce que les visiteurs téléchargeront.
              </span>
              {cvPreview && (
                <a
                  href={cvPreview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  Ouvrir dans un nouvel onglet <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </DialogDescription>
          </DialogHeader>
          {cvPreview && (
            <iframe
              src={cvPreview.url}
              title={`CV — ${cvPreview.name}`}
              className="flex-1 w-full bg-muted"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
