import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, MessageSquare, RefreshCw, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageContext";
import { useVisitorKey } from "@/hooks/useVisitorKey";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

type PublicSettings = {
  enabled: boolean;
  welcome_message_fr: string;
  welcome_message_en: string;
  button_color?: string | null;
  button_icon_color?: string | null;
};

const STORAGE_OPEN = "rv_chat_open";

export const Chatbot = () => {
  const { lang } = useLang();
  const visitorKey = useVisitorKey();

  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load public settings (enabled flag + welcome message). Lightweight, single row.
  useEffect(() => {
    let cancelled = false;
    supabase
      .rpc("get_chatbot_public_settings" as never)
      .then(({ data }) => {
        if (cancelled) return;
        if (!data) return;
        const row = Array.isArray(data) ? data[0] : data;
        if (row) setSettings(row as unknown as PublicSettings);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Restore "open" state across navigations.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_OPEN) === "1") setOpen(true);
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (open) sessionStorage.setItem(STORAGE_OPEN, "1");
    else sessionStorage.removeItem(STORAGE_OPEN);
  }, [open]);

  // Auto-scroll on new content.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  if (!settings || !settings.enabled) return null;

  const welcome = lang === "en" ? settings.welcome_message_en : settings.welcome_message_fr;
  const btnBg = settings.button_color || undefined;
  const btnFg = settings.button_icon_color || undefined;
  const t = lang === "en"
    ? {
        title: "Legal Assistant",
        subtitle: "Information & guidance — not legal advice",
        placeholder: "Ask a question about our practice areas…",
        send: "Send",
        reset: "New conversation",
        close: "Close chat",
        open: "Open chat",
        disclaimer:
          "AI assistant. Replies are informational only and do not constitute legal advice.",
        thinking: "Thinking…",
      }
    : {
        title: "Assistant juridique",
        subtitle: "Information et orientation — pas un conseil juridique",
        placeholder: "Posez une question sur nos domaines d'expertise…",
        send: "Envoyer",
        reset: "Nouvelle conversation",
        close: "Fermer le chat",
        open: "Ouvrir le chat",
        disclaimer:
          "Assistant IA. Les réponses sont informatives et ne constituent pas un conseil juridique.",
        thinking: "Réflexion…",
      };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setConversationId(null);
    setInput("");
    setIsStreaming(false);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isStreaming || !visitorKey) return;
    setInput("");

    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages([...next, { role: "assistant", content: "" }]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/legal-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          conversationId,
          visitorKey,
          lang,
          messages: next,
        }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        let msg = lang === "en" ? "Connection error." : "Erreur de connexion.";
        if (resp.status === 429) {
          msg = lang === "en" ? "Too many requests, please retry shortly." : "Trop de requêtes, réessayez dans un instant.";
        } else if (resp.status === 402) {
          msg = lang === "en" ? "AI service temporarily unavailable." : "Service IA temporairement indisponible.";
        } else if (resp.status === 403) {
          msg = lang === "en" ? "Chat is currently disabled." : "Le chat est actuellement désactivé.";
        }
        toast.error(msg);
        // Drop the empty assistant placeholder
        setMessages((m) => m.slice(0, -1));
        setIsStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantSoFar = "";
      let done = false;

      while (!done) {
        const { value, done: chunkDone } = await reader.read();
        if (chunkDone) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json) continue;
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            if (parsed.conversationId && !conversationId) {
              setConversationId(parsed.conversationId);
            }
            const delta: string | undefined = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantSoFar += delta;
              setMessages((m) => {
                const copy = [...m];
                const last = copy[copy.length - 1];
                if (last && last.role === "assistant") {
                  copy[copy.length - 1] = { ...last, content: assistantSoFar };
                }
                return copy;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error(err);
        toast.error(lang === "en" ? "Network error." : "Erreur réseau.");
        setMessages((m) => m.slice(0, -1));
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  return (
    <>
      {/* Toggle button (placed above the WhatsApp/RDV stack via FloatingActions z-index) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t.close : t.open}
        className={cn(
          "fixed z-40 grid place-items-center h-12 w-12 sm:h-14 sm:w-14 rounded-full",
          "shadow-elegant hover:scale-105",
          !btnBg && "bg-primary text-primary-foreground",
          "transition-transform duration-300 ease-luxe",
        )}
        style={{
          bottom: "calc(max(1rem, env(safe-area-inset-bottom)) + 8.5rem)",
          right: "max(1rem, env(safe-area-inset-right))",
          ...(btnBg ? { backgroundColor: btnBg } : {}),
          ...(btnFg ? { color: btnFg } : {}),
        }}
      >
        {open ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label={t.title}
          className={cn(
            "fixed z-40 flex flex-col bg-background border border-border shadow-elegant",
            "right-2 left-2 sm:left-auto sm:right-6",
            "rounded-lg overflow-hidden",
          )}
          style={{
            bottom: "calc(max(1rem, env(safe-area-inset-bottom)) + 14rem)",
            width: "min(420px, calc(100vw - 1rem))",
            height: "min(560px, calc(100vh - 18rem))",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center gap-2 min-w-0">
              <div className="grid place-items-center h-8 w-8 rounded-full bg-accent/15 text-accent shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-serif text-sm text-primary leading-tight truncate">{t.title}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground truncate">
                  {t.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  aria-label={t.reset}
                  title={t.reset}
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.close}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background">
            {messages.length === 0 && (
              <div className="flex gap-2">
                <div className="grid place-items-center h-7 w-7 rounded-full bg-accent/15 text-accent shrink-0">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="bg-muted/50 text-foreground rounded-lg px-3 py-2 text-sm max-w-[85%]">
                  {welcome}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex gap-2", m.role === "user" ? "flex-row-reverse" : "")}
              >
                {m.role === "assistant" && (
                  <div className="grid place-items-center h-7 w-7 rounded-full bg-accent/15 text-accent shrink-0">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm max-w-[85%] break-words",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-foreground",
                  )}
                >
                  {m.role === "assistant" ? (
                    m.content ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-a:text-accent">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="inline-flex gap-1 text-muted-foreground italic">
                        <span className="animate-pulse">●</span>
                        <span className="animate-pulse [animation-delay:120ms]">●</span>
                        <span className="animate-pulse [animation-delay:240ms]">●</span>
                      </span>
                    )
                  ) : (
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-border bg-card p-3 space-y-2"
          >
            <div className="flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={t.placeholder}
                rows={1}
                maxLength={2000}
                className="resize-none min-h-[40px] max-h-32 text-sm"
                disabled={isStreaming}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isStreaming}
                aria-label={t.send}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/80 leading-tight">
              {t.disclaimer}
            </p>
          </form>
        </div>
      )}
    </>
  );
};
