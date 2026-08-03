// Edge function: legal-chat
// Streams a legal-orientation chatbot reply for the public website.
// - Uses settings from `ai_settings` (provider, model, system prompt, custom API key).
// - Persists user + assistant messages to chat_conversations / chat_messages.
// - Supports providers: lovable (default, via LOVABLE_API_KEY), openai, anthropic.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ChatMessage = { role: "user" | "assistant"; content: string };

type RequestBody = {
  conversationId?: string;
  visitorKey: string;
  lang?: "fr" | "en";
  messages: ChatMessage[];
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type Expertise = { title: string; slug: string; tagline: string; intro?: string | null };
type ContactInfo = {
  address?: string | null;
  hours_fr?: string | null;
  hours_en?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp_number?: string | null;
  appointment_url?: string | null;
  cabinet_name_fr?: string | null;
  cabinet_name_en?: string | null;
  linkedin_url?: string | null;
};
type TeamMember = {
  name: string;
  role_fr: string | null;
  role_en: string | null;
  is_founder: boolean | null;
};
type NewsArticle = {
  id: string;
  lang: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  published_date: string;
  content_type: string | null;
};

function buildContextSnippet(opts: {
  origin: string;
  lang: "fr" | "en";
  expertises: Expertise[];
  contact: ContactInfo | null;
  team: TeamMember[];
  news: NewsArticle[];
}) {
  const { origin, lang, expertises, contact, team, news } = opts;
  const parts: string[] = [];

  // 1) Pages principales
  const pages = [
    { fr: "Accueil", en: "Home", path: "/" },
    { fr: "Cabinet", en: "Firm", path: "/cabinet" },
    { fr: "Expertises", en: "Practice areas", path: "/expertises" },
    { fr: "Équipe", en: "Team", path: "/equipe" },
    { fr: "Actualités", en: "News", path: "/actualites" },
    { fr: "Contact", en: "Contact", path: "/contact" },
  ];
  parts.push(
    `\n\nPAGES PRINCIPALES DU SITE (utilise UNIQUEMENT ces URLs absolues) :\n` +
      pages.map((p) => `- ${lang === "en" ? p.en : p.fr} : ${origin}${p.path}`).join("\n"),
  );

  // 2) Expertises avec slugs réels
  if (expertises.length) {
    parts.push(
      `\n\nDOMAINES D'EXPERTISE (chaque domaine a une page dédiée) :\n` +
        expertises
          .slice(0, 30)
          .map(
            (e) =>
              `- ${e.title} : ${origin}/expertises/${e.slug}${
                e.tagline ? ` — ${e.tagline}` : ""
              }`,
          )
          .join("\n"),
    );
  }

  // 3) Contact / RDV / WhatsApp
  if (contact) {
    const cabinetName =
      (lang === "en" ? contact.cabinet_name_en : contact.cabinet_name_fr) ||
      contact.cabinet_name_fr ||
      "";
    const hours = (lang === "en" ? contact.hours_en : contact.hours_fr) || "";
    const lines: string[] = [];
    if (cabinetName) lines.push(`- Nom du cabinet : ${cabinetName}`);
    if (contact.address) lines.push(`- Adresse : ${contact.address}`);
    if (hours) lines.push(`- Horaires : ${hours}`);
    if (contact.phone) lines.push(`- Téléphone : ${contact.phone} (lien : tel:${contact.phone.replace(/\s+/g, "")})`);
    if (contact.email) lines.push(`- Email : ${contact.email} (lien : mailto:${contact.email})`);
    if (contact.whatsapp_number) {
      const waDigits = contact.whatsapp_number.replace(/[^0-9]/g, "");
      lines.push(`- WhatsApp : ${contact.whatsapp_number} (lien : https://wa.me/${waDigits})`);
    }
    if (contact.appointment_url) {
      lines.push(`- Prise de rendez-vous en ligne : ${contact.appointment_url}`);
    }
    if (contact.linkedin_url) lines.push(`- LinkedIn : ${contact.linkedin_url}`);
    if (lines.length) {
      parts.push(`\n\nCONTACT & PRISE DE RENDEZ-VOUS (utilise ces liens EXACTS, ne les invente pas) :\n${lines.join("\n")}`);
    }
  }

  // 4) Équipe
  if (team.length) {
    parts.push(
      `\n\nÉQUIPE DU CABINET :\n` +
        team
          .slice(0, 20)
          .map((m) => {
            const role = (lang === "en" ? m.role_en : m.role_fr) || "";
            return `- ${m.name}${role ? ` — ${role}` : ""}${m.is_founder ? " (Fondateur)" : ""}`;
          })
          .join("\n") +
        `\n(Page équipe : ${origin}/equipe)`,
    );
  }

  // 5) Actualités récentes
  if (news.length) {
    parts.push(
      `\n\nACTUALITÉS / ARTICLES RÉCENTS :\n` +
        news
          .slice(0, 8)
          .map(
            (n) =>
              `- [${n.published_date}] ${n.title}${n.category ? ` (${n.category})` : ""} : ${origin}/actualites/${n.id}`,
          )
          .join("\n") +
        `\n(Toutes les actualités : ${origin}/actualites)`,
    );
  }

  parts.push(
    `\n\nRÈGLES DE LIENS :\n- Quand tu orientes l'utilisateur, INSÈRE le lien Markdown exact ci-dessus (ex : [Prendre rendez-vous](URL)).\n- N'INVENTE JAMAIS d'URL, d'email, de téléphone ou de nom de page qui ne figure pas ci-dessus.\n- Préfère toujours la page d'expertise spécifique si la question correspond à un domaine listé.`,
  );

  return parts.join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const { visitorKey, messages, lang = "fr" } = body;
  let { conversationId } = body;

  if (!visitorKey || visitorKey.length < 16 || visitorKey.length > 128) {
    return jsonResponse({ error: "Invalid visitor key" }, 400);
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonResponse({ error: "messages required" }, 400);
  }
  if (messages.length > 40) {
    return jsonResponse({ error: "Too many messages" }, 400);
  }
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMsg || lastUserMsg.content.trim().length === 0 || lastUserMsg.content.length > 4000) {
    return jsonResponse({ error: "Invalid last user message" }, 400);
  }

  // 1. Load AI settings
  const { data: settings, error: settingsErr } = await admin
    .from("ai_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (settingsErr || !settings) {
    console.error("Failed to load ai_settings", settingsErr);
    return jsonResponse({ error: "Chatbot not configured" }, 500);
  }
  if (!settings.enabled) {
    return jsonResponse({ error: "Chatbot disabled" }, 403);
  }

  // 2. Load context (expertises, contact, team, news) to ground the bot
  const today = new Date().toISOString().slice(0, 10);
  const [expertisesRes, contactRes, teamRes, newsRes] = await Promise.all([
    admin
      .from("expertises")
      .select("title, slug, tagline, intro")
      .eq("published", true)
      .order("sort_order"),
    admin.from("contact_info").select("*").limit(1).maybeSingle(),
    admin
      .from("team_members")
      .select("name, role_fr, role_en, is_founder")
      .eq("published", true)
      .order("sort_order"),
    admin
      .from("news_articles")
      .select("id, lang, title, excerpt, category, published_date, content_type")
      .eq("published", true)
      .lte("published_date", today)
      .order("published_date", { ascending: false })
      .limit(8),
  ]);

  // Derive site origin for absolute links (fallback to known prod domain).
  const reqOrigin = req.headers.get("origin") || req.headers.get("referer") || "";
  let origin = "https://cabinevan.lovable.app";
  try {
    if (reqOrigin) origin = new URL(reqOrigin).origin;
  } catch { /* keep fallback */ }

  const systemPrompt =
    (lang === "en" ? settings.system_prompt_en : settings.system_prompt_fr) +
    buildContextSnippet({
      origin,
      lang,
      expertises: (expertisesRes.data as Expertise[]) ?? [],
      contact: (contactRes.data as ContactInfo) ?? null,
      team: (teamRes.data as TeamMember[]) ?? [],
      news: (newsRes.data as NewsArticle[]) ?? [],
    });

  // 3. Ensure conversation exists
  if (!conversationId) {
    const { data: conv, error: convErr } = await admin
      .from("chat_conversations")
      .insert({
        visitor_key: visitorKey,
        lang,
        user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
      })
      .select("id, message_count")
      .single();
    if (convErr || !conv) {
      console.error("Failed to create conversation", convErr);
      return jsonResponse({ error: "Could not start conversation" }, 500);
    }
    conversationId = conv.id;
  } else {
    // Verify conversation exists and is open + matches visitor_key
    const { data: existing } = await admin
      .from("chat_conversations")
      .select("id, status, visitor_key, message_count")
      .eq("id", conversationId)
      .maybeSingle();
    if (!existing || existing.visitor_key !== visitorKey || existing.status !== "open") {
      return jsonResponse({ error: "Conversation not available" }, 403);
    }
    if (existing.message_count >= settings.max_messages_per_conversation * 2) {
      return jsonResponse({ error: "Conversation length limit reached" }, 429);
    }
  }

  // 4. Persist the user message
  await admin.from("chat_messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: lastUserMsg.content,
  });

  // 5. Build provider request
  const provider: string = settings.provider ?? "lovable";
  const model: string = settings.model ?? "google/gemini-2.5-flash";
  const customKey: string | null = settings.api_key && settings.api_key.trim() !== "" ? settings.api_key : null;

  let endpoint = "";
  let authHeader = "";
  let payload: Record<string, unknown> = {};

  if (provider === "openai") {
    const key = customKey;
    if (!key) return jsonResponse({ error: "OpenAI API key missing" }, 500);
    endpoint = "https://api.openai.com/v1/chat/completions";
    authHeader = `Bearer ${key}`;
    payload = {
      model: model.startsWith("gpt-") ? model : "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
    };
  } else if (provider === "anthropic") {
    const key = customKey;
    if (!key) return jsonResponse({ error: "Anthropic API key missing" }, 500);
    // Anthropic Messages API streams SSE in a different shape. We convert the response to OpenAI-style SSE.
    endpoint = "https://api.anthropic.com/v1/messages";
    payload = {
      model: model.startsWith("claude-") ? model : "claude-3-5-haiku-latest",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
      stream: true,
    };
  } else {
    // lovable (default)
    const key = customKey || LOVABLE_API_KEY;
    if (!key) return jsonResponse({ error: "LOVABLE_API_KEY missing" }, 500);
    endpoint = "https://ai.gateway.lovable.dev/v1/chat/completions";
    authHeader = `Bearer ${key}`;
    payload = {
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
    };
  }

  const upstreamHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (provider === "anthropic") {
    upstreamHeaders["x-api-key"] = customKey!;
    upstreamHeaders["anthropic-version"] = "2023-06-01";
  } else {
    upstreamHeaders["Authorization"] = authHeader;
  }

  const upstream = await fetch(endpoint, {
    method: "POST",
    headers: upstreamHeaders,
    body: JSON.stringify(payload),
  });

  if (!upstream.ok || !upstream.body) {
    if (upstream.status === 429) {
      return jsonResponse({ error: "rate_limit", message: "Trop de requêtes, veuillez réessayer dans quelques instants." }, 429);
    }
    if (upstream.status === 402) {
      return jsonResponse({ error: "payment_required", message: "Crédits IA épuisés. L'administrateur doit recharger." }, 402);
    }
    const errText = await upstream.text();
    console.error("Upstream error", upstream.status, errText);
    return jsonResponse({ error: "upstream_error", status: upstream.status }, 502);
  }

  // 6. Stream back to client. We re-emit a uniform OpenAI-style SSE stream
  //    (data: { choices: [{ delta: { content } }] }) regardless of provider,
  //    and we accumulate the assistant text to persist at the end.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let assistantText = "";

  const stream = new ReadableStream({
    async start(controller) {
      // First chunk: send conversationId so the frontend can store it.
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ conversationId })}\n\n`),
      );

      const reader = upstream.body!.getReader();
      let buffer = "";

      const emitDelta = (text: string) => {
        if (!text) return;
        assistantText += text;
        const evt = { choices: [{ delta: { content: text } }] };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`));
      };

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let nl: number;
          while ((nl = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, nl);
            buffer = buffer.slice(nl + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line || line.startsWith(":")) continue;
            if (!line.startsWith("data:") && !line.startsWith("event:")) continue;

            if (provider === "anthropic") {
              if (!line.startsWith("data:")) continue;
              const json = line.slice(5).trim();
              if (!json) continue;
              try {
                const evt = JSON.parse(json);
                if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
                  emitDelta(evt.delta.text || "");
                }
              } catch { /* ignore partial */ }
            } else {
              if (!line.startsWith("data:")) continue;
              const json = line.slice(5).trim();
              if (!json || json === "[DONE]") continue;
              try {
                const parsed = JSON.parse(json);
                const content: string | undefined = parsed.choices?.[0]?.delta?.content;
                if (content) emitDelta(content);
              } catch {
                // partial — push back
                buffer = line + "\n" + buffer;
                break;
              }
            }
          }
        }
      } catch (e) {
        console.error("Stream error", e);
      } finally {
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();

        // Persist the assistant message after the stream is done.
        if (assistantText.trim()) {
          await admin.from("chat_messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: assistantText.slice(0, 8000),
          });
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Conversation-Id": conversationId!,
    },
  });
});
