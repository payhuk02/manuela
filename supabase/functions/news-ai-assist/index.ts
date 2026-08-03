// AI assistant for the news/article admin: drafts content, improves prose,
// generates excerpts, and produces SEO metadata using a configurable provider
// (Lovable AI Gateway, OpenAI, Anthropic). Settings live in
// public.editorial_ai_settings and are editable in /admin.
//
// Implementation note: we use OpenAI-compatible "tool calling" to obtain
// structured JSON output. This works with Lovable AI Gateway (Gemini & GPT)
// as well as OpenAI directly. We avoid `response_format: json_schema` because
// Gemini via the Lovable Gateway does not support it.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "npm:zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type Provider = "lovable" | "openai" | "anthropic";

type Settings = {
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

const DEFAULTS: Settings = {
  enabled: true,
  provider: "lovable",
  model: "google/gemini-2.5-flash",
  api_key: null,
  firm_context:
    "Tu rédiges pour le Cabinet ROGER VANGAH, cabinet d'avocats international basé à Paris. Domaines : droit des affaires, OHADA, bancaire, immobilier, pénal des affaires, droit des étrangers, fiscalité, arbitrage international. Forte présence France ↔ Côte d'Ivoire.",
  system_prompt_fr:
    "Reste factuel : pas de citation de jurisprudence inventée, pas de chiffres inventés.",
  system_prompt_en:
    "Stay factual: do not invent case law or figures.",
  tone: "professionnel, précis, sobre, accessible",
  target_audience: "décideurs, chefs d'entreprise, investisseurs",
  brand_keywords: [],
  news_min_words: 180,
  news_max_words: 400,
  article_min_words: 600,
  article_max_words: 1200,
  seo_title_min: 50,
  seo_title_max: 60,
  seo_desc_min: 140,
  seo_desc_max: 160,
  temperature: 0.7,
  max_retries: 2,
  request_timeout_ms: 60000,
};

const Action = z.enum(["draft", "improve", "excerpt", "seo", "translate", "keywords", "cover_image"]);

const BodySchema = z.object({
  action: Action,
  lang: z.enum(["fr", "en"]).default("fr"),
  topic: z.string().max(2000).optional(),
  title: z.string().max(300).optional(),
  body: z.string().max(50000).optional(),
  category: z.string().max(100).optional(),
  contentType: z.enum(["news", "article"]).default("news"),
  targetLang: z.enum(["fr", "en"]).optional(),
  // Cover-image options
  aspect_ratio: z.enum(["16:9", "4:3"]).optional(),
  quality: z.enum(["standard", "premium"]).optional(),
  style: z.enum(["institutionnel", "moderne", "classique"]).optional(),
});

const stripHtml = (s: string) =>
  String(s ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function endpointFor(s: Settings): { url: string; headers: Record<string, string> } {
  if (s.provider === "lovable") {
    const key = s.api_key || Deno.env.get("LOVABLE_API_KEY") || "";
    if (!key) throw new Error("LOVABLE_API_KEY non configurée.");
    return {
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    };
  }
  if (s.provider === "openai") {
    if (!s.api_key) throw new Error("Clé API OpenAI manquante (Admin → Assistant Rédaction IA).");
    return {
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${s.api_key}`,
        "Content-Type": "application/json",
      },
    };
  }
  if (!s.api_key) throw new Error("Clé API Anthropic manquante (Admin → Assistant Rédaction IA).");
  return {
    url: "https://api.anthropic.com/v1/chat/completions",
    headers: {
      "x-api-key": s.api_key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
  };
}

async function callTool(
  s: Settings,
  args: {
    system: string;
    user: string;
    toolName: string;
    description: string;
    parameters: Record<string, unknown>;
  },
): Promise<Record<string, unknown>> {
  const { url, headers } = endpointFor(s);
  const body = {
    model: s.model,
    temperature: s.temperature,
    messages: [
      { role: "system", content: args.system },
      { role: "user", content: args.user },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: args.toolName,
          description: args.description,
          parameters: args.parameters,
        },
      },
    ],
    tool_choice: { type: "function", function: { name: args.toolName } },
  };

  let lastErr: unknown;
  for (let i = 0; i <= s.max_retries; i++) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), s.request_timeout_ms);
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: ac.signal,
      });
      clearTimeout(t);
      if (!resp.ok) {
        const text = await resp.text();
        const err = new Error(`AI ${resp.status}: ${text.slice(0, 400)}`);
        // @ts-expect-error attach status
        err.status = resp.status;
        if (resp.status === 401 || resp.status === 402 || resp.status === 403) throw err;
        lastErr = err;
        if (i < s.max_retries) {
          await sleep(500 * (i + 1));
          continue;
        }
        throw err;
      }
      const data = await resp.json();
      const call = data?.choices?.[0]?.message?.tool_calls?.[0];
      const raw = call?.function?.arguments;
      if (!raw) {
        // Fallback: model may have replied in plain content
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content === "string") {
          try {
            return JSON.parse(content);
          } catch {
            // fallthrough
          }
        }
        throw new Error("Réponse IA invalide (pas d'appel d'outil).");
      }
      try {
        return typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        throw new Error("Réponse IA non-JSON.");
      }
    } catch (err) {
      clearTimeout(t);
      lastErr = err;
      const msg = (err as Error).message ?? "";
      if (/401|402|403|invalid|forbidden|unauthor/i.test(msg)) break;
      if (i >= s.max_retries) break;
      await sleep(500 * (i + 1));
    }
  }
  throw lastErr;
}

async function loadSettings(supabase: ReturnType<typeof createClient>): Promise<Settings> {
  const { data } = await supabase
    .from("editorial_ai_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (!data) return DEFAULTS;
  return { ...DEFAULTS, ...(data as Partial<Settings>) };
}

function buildSystem(s: Settings, lang: "fr" | "en") {
  const language = lang === "en" ? "English" : "French";
  const extras = lang === "en" ? s.system_prompt_en : s.system_prompt_fr;
  const kw = s.brand_keywords?.length
    ? `\nMots-clés de marque à privilégier quand pertinent : ${s.brand_keywords.join(", ")}.`
    : "";
  return [
    s.firm_context,
    `Écris en ${language}.`,
    `Ton : ${s.tone}.`,
    `Audience : ${s.target_audience}.`,
    extras,
    kw,
  ]
    .filter(Boolean)
    .join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: userResp } = await supabase.auth.getUser(auth.replace(/^Bearer\s+/i, ""));
    const user = userResp?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { data: isStaff } = await supabase.rpc("is_staff", { _user_id: user.id });
    if (!isStaff) return json({ error: "Forbidden" }, 403);

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
    const { action, lang, topic, title, body, category, contentType, targetLang, aspect_ratio, quality, style } = parsed.data;

    const settings = await loadSettings(supabase);
    if (!settings.enabled) return json({ error: "L'assistant IA est désactivé." }, 503);

    const sysBase = buildSystem(settings, lang);

    if (action === "draft") {
      if (!topic && !title) return json({ error: "Sujet ou titre requis." }, 400);
      const isArticle = contentType === "article";
      const wmin = isArticle ? settings.article_min_words : settings.news_min_words;
      const wmax = isArticle ? settings.article_max_words : settings.news_max_words;
      const out = await callTool(settings, {
        system: `${sysBase}\nTu rédiges ${isArticle ? "un article d'analyse juridique de fond" : "une brève d'actualité"} (${wmin}-${wmax} mots). HTML autorisé : <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <a>. Pas de styles inline ni de classes.`,
        user: `Sujet : ${topic || title}\n${title ? `Titre suggéré : ${title}\n` : ""}${category ? `Catégorie : ${category}\n` : ""}\nProduis un titre accrocheur (≤ 90 caractères), un résumé court (140-220 caractères) et le contenu HTML.`,
        toolName: "save_draft",
        description: "Enregistre le brouillon rédigé.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            excerpt: { type: "string" },
            body_html: { type: "string" },
          },
          required: ["title", "excerpt", "body_html"],
          additionalProperties: false,
        },
      });
      return json(out);
    }

    if (action === "improve") {
      if (!body) return json({ error: "Contenu requis." }, 400);
      const out = await callTool(settings, {
        system: `${sysBase}\nAméliore le texte fourni : clarté, fluidité, structure, ponctuation, concision. Conserve l'intention, les faits, les noms propres et les chiffres exacts. Retourne un HTML propre avec uniquement <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <a>.`,
        user: `Texte HTML à améliorer :\n\n${body}`,
        toolName: "save_improved",
        description: "Enregistre la version améliorée.",
        parameters: {
          type: "object",
          properties: { body_html: { type: "string" } },
          required: ["body_html"],
          additionalProperties: false,
        },
      });
      return json(out);
    }

    if (action === "excerpt") {
      if (!body && !title) return json({ error: "Contenu ou titre requis." }, 400);
      const plain = body ? stripHtml(body).slice(0, 6000) : "";
      const out = await callTool(settings, {
        system: `${sysBase}\nRédige un résumé éditorial (160-220 caractères) qui donne envie de lire, sans cliché.`,
        user: `Titre : ${title || ""}\nContenu :\n${plain}`,
        toolName: "save_excerpt",
        description: "Enregistre le résumé.",
        parameters: {
          type: "object",
          properties: { excerpt: { type: "string" } },
          required: ["excerpt"],
          additionalProperties: false,
        },
      });
      return json(out);
    }

    if (action === "seo") {
      const plain = body ? stripHtml(body).slice(0, 6000) : "";
      const out = await callTool(settings, {
        system: `${sysBase}\nProduis des métadonnées SEO orientées Google France/Côte d'Ivoire pour un cabinet d'avocats. seo_title ${settings.seo_title_min}-${settings.seo_title_max} caractères, inclut le mot-clé principal et le nom du cabinet quand pertinent. seo_description ${settings.seo_desc_min}-${settings.seo_desc_max} caractères, descriptive et incitative. keywords : 6-10 expressions courtes (2-4 mots), minuscules, sans doublon. slug : court (3-7 mots), kebab-case, sans accent.`,
        user: `Titre : ${title || ""}\nCatégorie : ${category || ""}\nContenu :\n${plain || topic || ""}`,
        toolName: "save_seo",
        description: "Enregistre les métadonnées SEO.",
        parameters: {
          type: "object",
          properties: {
            seo_title: { type: "string" },
            seo_description: { type: "string" },
            keywords: { type: "array", items: { type: "string" } },
            slug: { type: "string" },
          },
          required: ["seo_title", "seo_description", "keywords", "slug"],
          additionalProperties: false,
        },
      });
      return json(out);
    }

    if (action === "keywords") {
      const plain = body ? stripHtml(body).slice(0, 6000) : "";
      const out = await callTool(settings, {
        system: `${sysBase}\nGénère 8 à 12 mots-clés / expressions SEO pertinents (2-4 mots, minuscules, sans doublon, sans accents inutiles), classés du plus important au moins important.`,
        user: `Titre : ${title || ""}\nCatégorie : ${category || ""}\nContenu :\n${plain || topic || ""}`,
        toolName: "save_keywords",
        description: "Enregistre les mots-clés.",
        parameters: {
          type: "object",
          properties: {
            keywords: { type: "array", items: { type: "string" } },
          },
          required: ["keywords"],
          additionalProperties: false,
        },
      });
      return json(out);
    }

    if (action === "translate") {
      if (!body && !title) return json({ error: "Contenu ou titre requis." }, 400);
      const tgt = targetLang ?? (lang === "fr" ? "en" : "fr");
      const tgtName = tgt === "en" ? "English" : "French";
      const out = await callTool(settings, {
        system: `${settings.firm_context}\nTraduis fidèlement en ${tgtName}, en gardant le HTML structurel intact (mêmes balises). Adapte les expressions juridiques aux usages locaux sans inventer de terminologie.`,
        user: `${title ? `Titre source : ${title}\n` : ""}${body ? `\nHTML source :\n${body}` : ""}`,
        toolName: "save_translation",
        description: "Enregistre la traduction.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            body_html: { type: "string" },
          },
          additionalProperties: false,
        },
      });
      return json(out);
    }


    if (action === "cover_image") {
      if (!title && !topic && !body) {
        return json({ error: "Titre, sujet ou contenu requis pour générer l'image." }, 400);
      }
      const plain = body ? stripHtml(body).slice(0, 1500) : "";
      const ratio = aspect_ratio ?? "16:9";
      const qual = quality ?? "premium";
      const sty = style ?? "institutionnel";

      const styleDescriptions: Record<string, string> = {
        institutionnel:
          "Style institutionnel et corporate haut de gamme : photographie éditoriale solennelle, composition symétrique et structurée, palette sobre (or, ivoire, bleu nuit, marbre), atmosphère prestigieuse, intemporelle, qui inspire confiance et autorité.",
        moderne:
          "Style moderne et contemporain : direction artistique épurée et minimaliste, lumière naturelle vive, couleurs fraîches (blanc cassé, bleu acier, accents émeraude ou cuivre), composition asymétrique dynamique, esthétique magazine business actuel.",
        classique:
          "Style classique et patrimonial : ambiance feutrée d'un cabinet d'avocats traditionnel, boiseries, cuir, livres anciens, lumière chaude tamisée, palette terreuse (acajou, bordeaux, ocre, beige), composition équilibrée, dignité et tradition.",
      };

      const qualityDescriptions: Record<string, string> = {
        standard:
          "Qualité éditoriale soignée, netteté propre, rendu professionnel.",
        premium:
          "Qualité magazine premium ultra-détaillée, rendu cinématographique 8K, micro-textures, profondeur de champ maîtrisée, étalonnage colorimétrique professionnel.",
      };

      const promptDescription = [
        `Image éditoriale ${qual === "premium" ? "premium" : ""} pour ${contentType === "article" ? "un article d'analyse juridique" : "une actualité"} d'un cabinet d'avocats international (Cabinet ROGER VANGAH, Paris ↔ Côte d'Ivoire).`,
        title ? `Titre : "${title}".` : "",
        category ? `Catégorie : ${category}.` : "",
        topic ? `Sujet : ${topic}.` : "",
        plain ? `Contexte : ${plain}` : "",
        styleDescriptions[sty],
        qualityDescriptions[qual],
        "Évite absolument : tout texte, lettrage, logo, watermark, drapeau, visage reconnaissable, symbole religieux, cliché juridique kitsch (marteau de juge, balance dorée caricaturale).",
        `Format paysage strict ${ratio} (cadrage ${ratio === "16:9" ? "panoramique cinématographique" : "classique 4:3"}), sans aucun texte ni inscription.`,
      ].filter(Boolean).join("\n");

      const key = settings.api_key || Deno.env.get("LOVABLE_API_KEY") || "";
      if (!key) return json({ error: "LOVABLE_API_KEY non configurée." }, 500);

      const imageModel = qual === "premium"
        ? "google/gemini-3-pro-image-preview"
        : "google/gemini-2.5-flash-image";

      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), Math.max(settings.request_timeout_ms, 90000));
      try {
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: imageModel,
            messages: [{ role: "user", content: promptDescription }],
            modalities: ["image", "text"],
          }),
          signal: ac.signal,
        });
        clearTimeout(t);
        if (!resp.ok) {
          const txt = await resp.text();
          if (resp.status === 402) return json({ error: "Crédits Lovable AI épuisés." }, 402);
          if (resp.status === 429) return json({ error: "Trop de requêtes — réessayez dans un instant." }, 429);
          return json({ error: `Génération image échouée (${resp.status}): ${txt.slice(0, 300)}` }, 500);
        }
        const data = await resp.json();
        const url: string | undefined = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (!url || !url.startsWith("data:")) {
          return json({ error: "Aucune image renvoyée par le modèle." }, 502);
        }
        const m = url.match(/^data:([^;]+);base64,(.+)$/);
        if (!m) return json({ error: "Format d'image inattendu." }, 502);
        return json({ mime_type: m[1], image_base64: m[2] });
      } catch (e) {
        clearTimeout(t);
        const msg = (e as Error).message ?? "image generation failed";
        if (/abort/i.test(msg)) return json({ error: "Délai dépassé pour la génération d'image." }, 504);
        return json({ error: msg }, 500);
      }
    }

    return json({ error: "Action inconnue." }, 400);
  } catch (err) {
    const message = (err as Error).message ?? "AI request failed";
    console.error("news-ai-assist error:", message);
    if (/abort/i.test(message)) return json({ error: "Délai dépassé — réessayez." }, 504);
    if (/402/.test(message)) return json({ error: "Crédits Lovable AI épuisés." }, 402);
    if (/429/.test(message)) return json({ error: "Trop de requêtes — réessayez dans un instant." }, 429);
    if (/401|403|invalid|unauthor/i.test(message))
      return json({ error: "Clé API invalide ou refusée par le fournisseur." }, 401);
    return json({ error: message }, 500);
  }
});
