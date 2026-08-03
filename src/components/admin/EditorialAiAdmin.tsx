import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Save, Eye, EyeOff, Trash2, Loader2, Wand2, Plus, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logAudit } from "@/lib/audit";

type Provider = "lovable" | "openai" | "anthropic";

type Settings = {
  id: string;
  enabled: boolean;
  provider: Provider;
  model: string;
  api_key: string | null;
  firm_context: string;
  system_prompt_fr: string;
  system_prompt_en: string;
  tone: string;
  target_audience: string;
  brand_keywords: string[];
  news_min_words: number;
  news_max_words: number;
  article_min_words: number;
  article_max_words: number;
  seo_title_min: number;
  seo_title_max: number;
  seo_desc_min: number;
  seo_desc_max: number;
  temperature: number;
  max_retries: number;
  request_timeout_ms: number;
};

const MODELS: Record<Provider, { value: string; label: string }[]> = {
  lovable: [
    { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash (rapide, recommandé)" },
    { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite (le moins cher)" },
    { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (plus précis)" },
    { value: "openai/gpt-5-mini", label: "GPT-5 Mini" },
    { value: "openai/gpt-5", label: "GPT-5 (le plus puissant)" },
  ],
  openai: [
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
    { value: "gpt-4.1", label: "GPT-4.1" },
  ],
  anthropic: [
    { value: "claude-3-5-haiku-latest", label: "Claude 3.5 Haiku (rapide)" },
    { value: "claude-3-5-sonnet-latest", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-7-sonnet-latest", label: "Claude 3.7 Sonnet" },
  ],
};

export const EditorialAiAdmin = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [keyDirty, setKeyDirty] = useState(false);
  const [newKw, setNewKw] = useState("");

  // test panel
  const [testTopic, setTestTopic] = useState(
    "Réforme OHADA 2026 : ce qui change pour les sociétés commerciales",
  );
  const [testBusy, setTestBusy] = useState(false);
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    supabase
      .from("editorial_ai_settings" as never)
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        if (data) setSettings(data as unknown as Settings);
        setLoading(false);
      });
  }, []);

  if (loading || !settings) {
    return <p className="text-sm text-muted-foreground">Chargement…</p>;
  }

  const update = (patch: Partial<Settings>) => setSettings((s) => (s ? { ...s, ...patch } : s));

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const payload: Partial<Settings> = {
      enabled: settings.enabled,
      provider: settings.provider,
      model: settings.model,
      firm_context: settings.firm_context,
      system_prompt_fr: settings.system_prompt_fr,
      system_prompt_en: settings.system_prompt_en,
      tone: settings.tone,
      target_audience: settings.target_audience,
      brand_keywords: settings.brand_keywords,
      news_min_words: Number(settings.news_min_words) || 180,
      news_max_words: Number(settings.news_max_words) || 400,
      article_min_words: Number(settings.article_min_words) || 600,
      article_max_words: Number(settings.article_max_words) || 1200,
      seo_title_min: Number(settings.seo_title_min) || 50,
      seo_title_max: Number(settings.seo_title_max) || 60,
      seo_desc_min: Number(settings.seo_desc_min) || 140,
      seo_desc_max: Number(settings.seo_desc_max) || 160,
      temperature: Number(settings.temperature),
      max_retries: Number(settings.max_retries) || 0,
      request_timeout_ms: Number(settings.request_timeout_ms) || 60000,
    };
    if (keyDirty) payload.api_key = settings.api_key || null;

    const { error } = await supabase
      .from("editorial_ai_settings" as never)
      .update(payload as never)
      .eq("id", settings.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Configuration enregistrée");
    setKeyDirty(false);
    logAudit({
      action: "editorial_ai_settings.update",
      target_type: "editorial_ai_settings",
      details: { provider: settings.provider, model: settings.model },
    });
  };

  const clearKey = async () => {
    const { error } = await supabase
      .from("editorial_ai_settings" as never)
      .update({ api_key: null } as never)
      .eq("id", settings.id);
    if (error) return toast.error(error.message);
    update({ api_key: null });
    setKeyDirty(false);
    toast.success("Clé API supprimée");
  };

  const addKeyword = () => {
    const v = newKw.trim();
    if (!v) return;
    if (settings.brand_keywords.includes(v)) return;
    update({ brand_keywords: [...settings.brand_keywords, v] });
    setNewKw("");
  };

  const runTest = async () => {
    setTestBusy(true);
    setTestResult("");
    try {
      const { data, error } = await supabase.functions.invoke("news-ai-assist", {
        body: {
          action: "draft",
          lang: "fr",
          contentType: "news",
          topic: testTopic,
        },
      });
      if (error) throw new Error(error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      const d = data as { title: string; excerpt: string; body_html: string };
      setTestResult(
        `<h3>${d.title}</h3><p><em>${d.excerpt}</em></p>${d.body_html}`,
      );
      toast.success("Test réussi");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setTestBusy(false);
    }
  };

  const needsCustomKey = settings.provider !== "lovable";

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          <h2 className="font-serif text-3xl text-primary">Assistant Rédaction IA</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Configurez l'assistant qui rédige les actualités et articles, génère les résumés,
          mots-clés et métadonnées SEO depuis l'éditeur.
        </p>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
          <TabsTrigger value="brand">Marque & ton</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>

        {/* SETTINGS */}
        <TabsContent value="settings" className="space-y-6 pt-4">
          <section className="bg-card border border-border p-6 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Activer l'assistant rédactionnel</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Lorsqu'il est désactivé, les boutons IA dans l'éditeur d'articles renvoient une erreur explicite.
                </p>
              </div>
              <Switch checked={settings.enabled} onCheckedChange={(v) => update({ enabled: v })} />
            </div>
          </section>

          <section className="bg-card border border-border p-6 space-y-4">
            <h3 className="font-serif text-xl text-primary border-b border-border pb-2">Fournisseur IA</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fournisseur</Label>
                <Select
                  value={settings.provider}
                  onValueChange={(v) => {
                    const p = v as Provider;
                    update({ provider: p, model: MODELS[p][0]?.value || "" });
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lovable">Lovable AI (recommandé, sans configuration)</SelectItem>
                    <SelectItem value="openai">OpenAI (clé personnelle)</SelectItem>
                    <SelectItem value="anthropic">Anthropic Claude (clé personnelle)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modèle</Label>
                <Select value={settings.model} onValueChange={(v) => update({ model: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MODELS[settings.provider].map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between gap-2">
                <span>Clé API personnalisée {needsCustomKey && <span className="text-destructive">*</span>}</span>
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showKey ? "Masquer" : "Afficher"}
                </button>
              </Label>
              <div className="flex gap-2">
                <Input
                  type={showKey ? "text" : "password"}
                  value={settings.api_key || ""}
                  onChange={(e) => { update({ api_key: e.target.value }); setKeyDirty(true); }}
                  placeholder={needsCustomKey ? "sk-... (obligatoire)" : "Optionnel — laisser vide pour utiliser Lovable AI"}
                  className="font-mono text-xs"
                  autoComplete="off"
                />
                {settings.api_key && (
                  <Button type="button" variant="outline" size="icon" onClick={clearKey} title="Supprimer la clé">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground/80">
                ⚠️ La clé est stockée côté serveur et n'est jamais exposée publiquement.
              </p>
            </div>
          </section>
        </TabsContent>

        {/* BRAND & TONE */}
        <TabsContent value="brand" className="space-y-6 pt-4">
          <section className="bg-card border border-border p-6 space-y-4">
            <h3 className="font-serif text-xl text-primary border-b border-border pb-2">Contexte du cabinet</h3>
            <Textarea
              rows={4}
              value={settings.firm_context}
              onChange={(e) => update({ firm_context: e.target.value })}
              placeholder="Description courte du cabinet, domaines d'expertise, géographies…"
            />
            <p className="text-xs text-muted-foreground">
              Ce texte est inséré dans toutes les requêtes IA pour cadrer le contexte.
            </p>
          </section>

          <section className="bg-card border border-border p-6 space-y-4">
            <h3 className="font-serif text-xl text-primary border-b border-border pb-2">Ton & audience</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ton éditorial</Label>
                <Input
                  value={settings.tone}
                  onChange={(e) => update({ tone: e.target.value })}
                  placeholder="professionnel, précis, sobre, accessible"
                />
              </div>
              <div className="space-y-2">
                <Label>Audience cible</Label>
                <Input
                  value={settings.target_audience}
                  onChange={(e) => update({ target_audience: e.target.value })}
                  placeholder="décideurs, chefs d'entreprise, investisseurs"
                />
              </div>
            </div>
          </section>

          <section className="bg-card border border-border p-6 space-y-4">
            <h3 className="font-serif text-xl text-primary border-b border-border pb-2">Mots-clés de marque</h3>
            <p className="text-xs text-muted-foreground">
              Ces expressions seront privilégiées par l'IA quand elles s'insèrent naturellement.
            </p>
            <div className="flex flex-wrap gap-2">
              {settings.brand_keywords.map((k) => (
                <Badge key={k} variant="secondary" className="gap-1">
                  {k}
                  <button
                    type="button"
                    onClick={() =>
                      update({ brand_keywords: settings.brand_keywords.filter((x) => x !== k) })
                    }
                    className="hover:text-destructive"
                    aria-label={`Retirer ${k}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {settings.brand_keywords.length === 0 && (
                <span className="text-xs text-muted-foreground">Aucun mot-clé.</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={newKw}
                onChange={(e) => setNewKw(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                placeholder="ex. arbitrage CCJA"
              />
              <Button type="button" variant="outline" onClick={addKeyword}>
                <Plus className="h-4 w-4 mr-1" /> Ajouter
              </Button>
            </div>
          </section>

          <section className="bg-card border border-border p-6 space-y-4">
            <h3 className="font-serif text-xl text-primary border-b border-border pb-2">
              Instructions complémentaires (prompt système)
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Français</Label>
                <Textarea
                  rows={5}
                  value={settings.system_prompt_fr}
                  onChange={(e) => update({ system_prompt_fr: e.target.value })}
                  placeholder="Reste factuel, n'invente pas de jurisprudence…"
                />
              </div>
              <div className="space-y-2">
                <Label>English</Label>
                <Textarea
                  rows={5}
                  value={settings.system_prompt_en}
                  onChange={(e) => update({ system_prompt_en: e.target.value })}
                  placeholder="Stay factual, do not invent case law…"
                />
              </div>
            </div>
          </section>
        </TabsContent>

        {/* ADVANCED */}
        <TabsContent value="advanced" className="space-y-6 pt-4">
          <section className="bg-card border border-border p-6 space-y-4">
            <h3 className="font-serif text-xl text-primary border-b border-border pb-2">
              Longueurs cibles
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <NumPair label="Brève (mots)" min={settings.news_min_words} max={settings.news_max_words}
                onMin={(v) => update({ news_min_words: v })} onMax={(v) => update({ news_max_words: v })} />
              <NumPair label="Article de fond (mots)" min={settings.article_min_words} max={settings.article_max_words}
                onMin={(v) => update({ article_min_words: v })} onMax={(v) => update({ article_max_words: v })} />
              <NumPair label="Titre SEO (caractères)" min={settings.seo_title_min} max={settings.seo_title_max}
                onMin={(v) => update({ seo_title_min: v })} onMax={(v) => update({ seo_title_max: v })} />
              <NumPair label="Description SEO (caractères)" min={settings.seo_desc_min} max={settings.seo_desc_max}
                onMin={(v) => update({ seo_desc_min: v })} onMax={(v) => update({ seo_desc_max: v })} />
            </div>
          </section>

          <section className="bg-card border border-border p-6 space-y-4">
            <h3 className="font-serif text-xl text-primary border-b border-border pb-2">Robustesse</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Température</Label>
                <Input
                  type="number" step="0.1" min={0} max={2}
                  value={settings.temperature}
                  onChange={(e) => update({ temperature: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">0 = factuel, 1 = créatif</p>
              </div>
              <div className="space-y-2">
                <Label>Tentatives max.</Label>
                <Input
                  type="number" min={0} max={5}
                  value={settings.max_retries}
                  onChange={(e) => update({ max_retries: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Réessais en cas d'échec transitoire</p>
              </div>
              <div className="space-y-2">
                <Label>Délai max. (ms)</Label>
                <Input
                  type="number" min={5000} max={180000} step={1000}
                  value={settings.request_timeout_ms}
                  onChange={(e) => update({ request_timeout_ms: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Avorte si l'API met trop de temps</p>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* TEST */}
        <TabsContent value="test" className="space-y-4 pt-4">
          <section className="bg-card border border-border p-6 space-y-4">
            <h3 className="font-serif text-xl text-primary border-b border-border pb-2">
              Tester la configuration
            </h3>
            <p className="text-xs text-muted-foreground">
              Génère une brève à partir d'un sujet pour vérifier que la connexion, le modèle et le ton fonctionnent.
            </p>
            <Textarea
              rows={3}
              value={testTopic}
              onChange={(e) => setTestTopic(e.target.value)}
              placeholder="Sujet de test…"
            />
            <Button onClick={runTest} disabled={testBusy || !testTopic.trim()}>
              {testBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
              Lancer un test
            </Button>
            {testResult && (
              <div
                className="prose prose-sm max-w-none border border-border rounded-md p-4 bg-background"
                dangerouslySetInnerHTML={{ __html: testResult }}
              />
            )}
          </section>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end sticky bottom-4">
        <Button onClick={save} disabled={saving} variant="gold" size="lg" className="shadow-elegant">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Enregistrer
        </Button>
      </div>
    </div>
  );
};

const NumPair = ({
  label, min, max, onMin, onMax,
}: { label: string; min: number; max: number; onMin: (v: number) => void; onMax: (v: number) => void }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="flex items-center gap-2">
      <Input type="number" value={min} onChange={(e) => onMin(Number(e.target.value))} />
      <span className="text-muted-foreground">→</span>
      <Input type="number" value={max} onChange={(e) => onMax(Number(e.target.value))} />
    </div>
  </div>
);
