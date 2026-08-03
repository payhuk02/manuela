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
import { toast } from "sonner";
import { Bot, Eye, EyeOff, Save, Trash2, Trash } from "lucide-react";
import { logAudit } from "@/lib/audit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Provider = "lovable" | "openai" | "anthropic";

type Settings = {
  id: string;
  enabled: boolean;
  provider: Provider;
  model: string;
  api_key: string | null;
  system_prompt_fr: string;
  system_prompt_en: string;
  welcome_message_fr: string;
  welcome_message_en: string;
  max_messages_per_conversation: number;
  button_color: string;
  button_icon_color: string;
};

type Conversation = {
  id: string;
  visitor_key: string;
  lang: "fr" | "en";
  visitor_name: string | null;
  visitor_email: string | null;
  status: string;
  message_count: number;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

const MODEL_OPTIONS: Record<Provider, { value: string; label: string }[]> = {
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

export const ChatbotAdmin = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [keyDirty, setKeyDirty] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [deleting, setDeleting] = useState(false);

  // Load settings
  useEffect(() => {
    supabase
      .from("ai_settings" as never)
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        if (data) setSettings(data as unknown as Settings);
        setLoading(false);
      });
  }, []);

  // Load conversations
  const reloadConversations = () => {
    supabase
      .from("chat_conversations" as never)
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) setConversations(data as unknown as Conversation[]);
      });
  };
  useEffect(reloadConversations, []);

  const deleteConversation = async (conv: Conversation) => {
    setDeleting(true);
    // Delete messages first (no FK cascade)
    const { error: msgErr } = await supabase
      .from("chat_messages" as never)
      .delete()
      .eq("conversation_id", conv.id);
    if (msgErr) {
      setDeleting(false);
      toast.error(msgErr.message);
      return;
    }
    const { error: convErr } = await supabase
      .from("chat_conversations" as never)
      .delete()
      .eq("id", conv.id);
    setDeleting(false);
    if (convErr) {
      toast.error(convErr.message);
      return;
    }
    toast.success("Conversation supprimée");
    if (selectedConv?.id === conv.id) {
      setSelectedConv(null);
      setMessages([]);
    }
    setConversations((list) => list.filter((c) => c.id !== conv.id));
    logAudit({
      action: "chat_conversation.delete",
      target_type: "chat_conversation",
      target_id: conv.id,
    });
  };

  const deleteAllConversations = async () => {
    setDeleting(true);
    const { error: msgErr } = await supabase
      .from("chat_messages" as never)
      .delete()
      .not("id", "is", null);
    if (msgErr) {
      setDeleting(false);
      toast.error(msgErr.message);
      return;
    }
    const { error: convErr } = await supabase
      .from("chat_conversations" as never)
      .delete()
      .not("id", "is", null);
    setDeleting(false);
    if (convErr) {
      toast.error(convErr.message);
      return;
    }
    toast.success("Toutes les conversations ont été supprimées");
    setSelectedConv(null);
    setMessages([]);
    setConversations([]);
    logAudit({
      action: "chat_conversation.delete_all",
      target_type: "chat_conversation",
    });
  };

  // Load messages when a conversation is selected
  useEffect(() => {
    if (!selectedConv) {
      setMessages([]);
      return;
    }
    supabase
      .from("chat_messages" as never)
      .select("*")
      .eq("conversation_id", selectedConv.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as unknown as Message[]);
      });
  }, [selectedConv]);

  if (loading || !settings) {
    return <p className="text-sm text-muted-foreground">Chargement…</p>;
  }

  const update = (patch: Partial<Settings>) => setSettings((s) => (s ? { ...s, ...patch } : s));

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    // If the user didn't touch the key field, don't overwrite the stored value with the masked one
    const payload: Partial<Settings> = {
      enabled: settings.enabled,
      provider: settings.provider,
      model: settings.model,
      system_prompt_fr: settings.system_prompt_fr,
      system_prompt_en: settings.system_prompt_en,
      welcome_message_fr: settings.welcome_message_fr,
      welcome_message_en: settings.welcome_message_en,
      max_messages_per_conversation: settings.max_messages_per_conversation,
      button_color: settings.button_color,
      button_icon_color: settings.button_icon_color,
    };
    if (keyDirty) payload.api_key = settings.api_key || null;

    const { error } = await supabase
      .from("ai_settings" as never)
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
      action: "ai_settings.update",
      target_type: "ai_settings",
      details: { provider: settings.provider, model: settings.model, enabled: settings.enabled },
    });
  };

  const clearKey = async () => {
    if (!settings) return;
    const { error } = await supabase
      .from("ai_settings" as never)
      .update({ api_key: null } as never)
      .eq("id", settings.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    update({ api_key: null });
    setKeyDirty(false);
    toast.success("Clé API supprimée");
    logAudit({
      action: "ai_settings.api_key_cleared",
      target_type: "ai_settings",
    });
  };

  const needsCustomKey = settings.provider === "openai" || settings.provider === "anthropic";
  const keyHelp =
    settings.provider === "lovable"
      ? "Lovable AI utilise la clé interne du projet — aucune saisie requise. Vous pouvez quand même fournir une clé personnelle pour basculer dessus."
      : settings.provider === "openai"
        ? "Récupérez votre clé sur https://platform.openai.com/api-keys"
        : "Récupérez votre clé sur https://console.anthropic.com/settings/keys";

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-accent" />
          <h2 className="font-serif text-3xl text-primary">Chatbot juridique IA</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Configurez l'assistant virtuel affiché en bas à droite du site, et consultez les conversations des visiteurs.
        </p>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
          <TabsTrigger value="conversations">Conversations ({conversations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6 pt-4">
          {/* Activation */}
          <section className="bg-card border border-border p-6 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Activer le chatbot</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Le chatbot n'apparaît sur le site que si activé.
                </p>
              </div>
              <Switch checked={settings.enabled} onCheckedChange={(v) => update({ enabled: v })} />
            </div>
          </section>

          {/* Provider & model */}
          <section className="bg-card border border-border p-6 space-y-4">
            <h3 className="font-serif text-xl text-primary border-b border-border pb-2">
              Fournisseur IA
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fournisseur</Label>
                <Select
                  value={settings.provider}
                  onValueChange={(v) => {
                    const newProvider = v as Provider;
                    const firstModel = MODEL_OPTIONS[newProvider][0]?.value || "";
                    update({ provider: newProvider, model: firstModel });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS[settings.provider].map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
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
                  onChange={(e) => {
                    update({ api_key: e.target.value });
                    setKeyDirty(true);
                  }}
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
              <p className="text-xs text-muted-foreground">{keyHelp}</p>
              <p className="text-xs text-muted-foreground/80">
                ⚠️ La clé est stockée chiffrée côté serveur et n'est jamais exposée au public.
              </p>
            </div>
          </section>

          {/* Welcome messages */}
          <section className="bg-card border border-border p-6 space-y-4">
            <h3 className="font-serif text-xl text-primary border-b border-border pb-2">
              Message d'accueil
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Français</Label>
                <Textarea
                  value={settings.welcome_message_fr}
                  onChange={(e) => update({ welcome_message_fr: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>English</Label>
                <Textarea
                  value={settings.welcome_message_en}
                  onChange={(e) => update({ welcome_message_en: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* Apparence du bouton */}
          <section className="bg-card border border-border p-6 space-y-4">
            <h3 className="font-serif text-xl text-primary border-b border-border pb-2">
              Apparence du bouton
            </h3>
            <p className="text-xs text-muted-foreground">
              Personnalisez les couleurs du bouton flottant du chatbot affiché en bas à droite du site.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Couleur de fond</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.button_color}
                    onChange={(e) => update({ button_color: e.target.value })}
                    className="h-10 w-14 rounded border border-border cursor-pointer bg-transparent"
                    aria-label="Couleur de fond du bouton"
                  />
                  <Input
                    value={settings.button_color}
                    onChange={(e) => update({ button_color: e.target.value })}
                    placeholder="#C8A35B"
                    className="font-mono text-xs uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Couleur de l'icône</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.button_icon_color}
                    onChange={(e) => update({ button_icon_color: e.target.value })}
                    className="h-10 w-14 rounded border border-border cursor-pointer bg-transparent"
                    aria-label="Couleur de l'icône du bouton"
                  />
                  <Input
                    value={settings.button_icon_color}
                    onChange={(e) => update({ button_icon_color: e.target.value })}
                    placeholder="#FFFFFF"
                    className="font-mono text-xs uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
              <div
                className="grid place-items-center h-14 w-14 rounded-full shadow-elegant"
                style={{ backgroundColor: settings.button_color, color: settings.button_icon_color }}
              >
                <Bot className="h-6 w-6" />
              </div>
            </div>
          </section>

          {/* System prompts */}
          <section className="bg-card border border-border p-6 space-y-4">
            <h3 className="font-serif text-xl text-primary border-b border-border pb-2">
              Instructions système (prompt)
            </h3>
            <p className="text-xs text-muted-foreground">
              Ces instructions définissent le ton, le rôle et les garde-fous du chatbot.
              Les domaines d'expertise du cabinet sont injectés automatiquement à chaque requête — pas besoin de les répéter ici.
            </p>
            <div className="space-y-2">
              <Label>Prompt FR</Label>
              <Textarea
                value={settings.system_prompt_fr}
                onChange={(e) => update({ system_prompt_fr: e.target.value })}
                rows={12}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label>Prompt EN</Label>
              <Textarea
                value={settings.system_prompt_en}
                onChange={(e) => update({ system_prompt_en: e.target.value })}
                rows={12}
                className="font-mono text-xs"
              />
            </div>
          </section>

          {/* Limits */}
          <section className="bg-card border border-border p-6 space-y-4">
            <h3 className="font-serif text-xl text-primary border-b border-border pb-2">
              Limites
            </h3>
            <div className="space-y-2 max-w-xs">
              <Label>Messages max par conversation</Label>
              <Input
                type="number"
                min={5}
                max={100}
                value={settings.max_messages_per_conversation}
                onChange={(e) =>
                  update({ max_messages_per_conversation: parseInt(e.target.value, 10) || 30 })
                }
              />
            </div>
          </section>

          <Button onClick={save} variant="gold" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </Button>
        </TabsContent>

        <TabsContent value="conversations" className="pt-4">
          <div className="grid md:grid-cols-[320px_1fr] gap-4 min-h-[500px]">
            <div className="border border-border rounded-md overflow-hidden flex flex-col">
              <div className="p-3 border-b border-border bg-card flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  100 dernières
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={reloadConversations}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Actualiser
                  </button>
                  {conversations.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="text-xs text-destructive hover:underline inline-flex items-center gap-1"
                          title="Tout supprimer"
                          disabled={deleting}
                        >
                          <Trash className="h-3 w-3" />
                          Tout
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer toutes les conversations ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action supprimera définitivement toutes les conversations et leurs messages. Elle est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={deleteAllConversations}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Tout supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {conversations.length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground">Aucune conversation pour l'instant.</p>
                )}
                {conversations.map((c) => (
                  <div
                    key={c.id}
                    className={`group relative flex items-stretch ${
                      selectedConv?.id === c.id ? "bg-muted" : ""
                    } hover:bg-muted/50`}
                  >
                    <button
                      onClick={() => setSelectedConv(c)}
                      className="flex-1 text-left p-3 min-w-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs uppercase tracking-[0.15em] text-accent">
                          {c.lang}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(c.updated_at), "dd MMM HH:mm", { locale: fr })}
                        </span>
                      </div>
                      <p className="text-sm mt-1 truncate">
                        {c.visitor_email || c.visitor_name || `Visiteur anonyme`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.message_count} message{c.message_count > 1 ? "s" : ""}
                      </p>
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="px-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                          title="Supprimer"
                          aria-label="Supprimer la conversation"
                          disabled={deleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer cette conversation ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tous les messages associés seront définitivement supprimés.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteConversation(c)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border rounded-md p-4 overflow-y-auto">
              {!selectedConv ? (
                <p className="text-sm text-muted-foreground">
                  Sélectionnez une conversation pour voir les messages.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="border-b border-border pb-3 mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {selectedConv.visitor_email || selectedConv.visitor_name || "Visiteur anonyme"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(selectedConv.created_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={deleting}>
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer cette conversation ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tous les messages associés seront définitivement supprimés.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteConversation(selectedConv)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`rounded-lg px-3 py-2 text-sm max-w-[80%] whitespace-pre-wrap break-words ${
                          m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
