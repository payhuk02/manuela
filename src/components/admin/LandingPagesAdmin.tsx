/**
 * Admin for the 12 SEO landing pages (geo-targeted).
 * Lists rows from `landing_pages`, allows full edit FR/EN, publish toggle,
 * and one-click IndexNow ping.
 */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { pingSeo } from "@/lib/seoPing";
import { ExternalLink, Save, Send, Loader2 } from "lucide-react";

type Row = {
  id: string;
  slug: string;
  city: string;
  country: string;
  country_code: string;
  expertise_slug: string | null;
  title_fr: string;
  title_en: string;
  meta_description_fr: string;
  meta_description_en: string;
  h1_fr: string;
  h1_en: string;
  intro_fr: string;
  intro_en: string;
  content_fr: string;
  content_en: string;
  image_url: string | null;
  published: boolean;
  sort_order: number;
};

export const LandingPagesAdmin = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [pinging, setPinging] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from as any)("landing_pages")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    setRows(data ?? []);
    setLoading(false);
    if (data?.length && !selectedId) {
      setSelectedId(data[0].id);
      setDraft(data[0]);
    }
  };

  useEffect(() => { load(); }, []);

  const select = (r: Row) => {
    setSelectedId(r.id);
    setDraft({ ...r });
  };

  const update = <K extends keyof Row>(k: K, v: Row[K]) => {
    if (!draft) return;
    setDraft({ ...draft, [k]: v });
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    const { id, ...patch } = draft;
    const { error } = await (supabase.from as any)("landing_pages").update(patch).eq("id", id);
    setSaving(false);
    if (error) {
      toast({ title: "Échec", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Enregistré", description: `Page « ${draft.slug} » mise à jour.` });
    setRows((prev) => prev.map((r) => (r.id === id ? draft : r)));
  };

  const pingAll = async () => {
    setPinging(true);
    const paths = rows.filter((r) => r.published).map((r) => `/${r.slug}`);
    paths.push("/sitemap.xml");
    await pingSeo(paths);
    setPinging(false);
    toast({ title: "Sitemap envoyé", description: `${paths.length} URLs notifiées via IndexNow.` });
  };

  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

  if (loading) return <div className="text-muted-foreground">Chargement…</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-primary">Pages SEO géo-localisées</h2>
          <p className="text-sm text-muted-foreground">
            12 pages d'atterrissage ciblant Paris / France / Abidjan / Côte d'Ivoire.
          </p>
        </div>
        <Button onClick={pingAll} disabled={pinging} variant="outline">
          {pinging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Resoumettre sitemap (IndexNow)
        </Button>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-4">
        {/* List */}
        <div className="border border-border rounded-md divide-y max-h-[70vh] overflow-auto">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => select(r)}
              className={`w-full text-left p-3 hover:bg-muted/50 transition ${
                selectedId === r.id ? "bg-muted" : ""
              }`}
            >
              <div className="text-sm font-medium truncate">{r.title_fr || r.slug}</div>
              <div className="text-xs text-muted-foreground truncate">/{r.slug}</div>
              <div className="text-[10px] uppercase tracking-wider mt-1">
                {r.published ? (
                  <span className="text-emerald-600">Publié</span>
                ) : (
                  <span className="text-muted-foreground">Brouillon</span>
                )}{" "}
                · {r.city}
              </div>
            </button>
          ))}
        </div>

        {/* Editor */}
        {draft && selected && (
          <div className="space-y-4 border border-border rounded-md p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
              <div className="flex items-center gap-3">
                <Switch
                  checked={draft.published}
                  onCheckedChange={(v) => update("published", v)}
                  id="published"
                />
                <Label htmlFor="published">Publié</Label>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={`/${draft.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> Aperçu
                  </a>
                </Button>
                <Button onClick={save} disabled={saving} variant="gold" size="sm">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Enregistrer
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Slug (URL)</Label>
                <Input value={draft.slug} onChange={(e) => update("slug", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Ville</Label>
                <Input value={draft.city} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Pays</Label>
                <Input value={draft.country} onChange={(e) => update("country", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Code pays (FR / CI)</Label>
                <Input
                  value={draft.country_code}
                  onChange={(e) => update("country_code", e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Slug expertise liée (optionnel)</Label>
                <Input
                  value={draft.expertise_slug ?? ""}
                  onChange={(e) => update("expertise_slug", e.target.value || null)}
                  placeholder="ex: droit-des-affaires"
                />
              </div>
            </div>

            <Tabs defaultValue="fr">
              <TabsList>
                <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
              </TabsList>

              {(["fr", "en"] as const).map((l) => (
                <TabsContent key={l} value={l} className="space-y-3 pt-3">
                  <div className="space-y-1">
                    <Label>Title (SEO, &lt;60 caractères)</Label>
                    <Input
                      value={draft[`title_${l}` as const]}
                      onChange={(e) => update(`title_${l}` as const, e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      {draft[`title_${l}` as const].length} caractères
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label>Meta description (&lt;160 caractères)</Label>
                    <Textarea
                      rows={2}
                      value={draft[`meta_description_${l}` as const]}
                      onChange={(e) => update(`meta_description_${l}` as const, e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      {draft[`meta_description_${l}` as const].length} caractères
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label>H1</Label>
                    <Input
                      value={draft[`h1_${l}` as const]}
                      onChange={(e) => update(`h1_${l}` as const, e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Intro (1 paragraphe)</Label>
                    <Textarea
                      rows={3}
                      value={draft[`intro_${l}` as const]}
                      onChange={(e) => update(`intro_${l}` as const, e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Contenu (markdown : ## H2, ### H3, - liste, **gras**)</Label>
                    <Textarea
                      rows={18}
                      className="font-mono text-xs"
                      value={draft[`content_${l}` as const]}
                      onChange={(e) => update(`content_${l}` as const, e.target.value)}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPagesAdmin;
