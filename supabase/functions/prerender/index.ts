// Prerender SEO meta tags for crawlers (Google, Bing, Facebook, LinkedIn,
// WhatsApp, Twitter, Slack, etc.) on the React SPA.
//
// Vercel rewrites bot user-agents to:
//   /functions/v1/prerender?path=<original-path>
//
// We fetch the deployed shell HTML once per cold start, then for each request
// we look up the matching content in Supabase (expertise, news article,
// landing page, or static page) and rewrite <title>, meta description,
// canonical, hreflang, OpenGraph/Twitter tags, and JSON-LD before returning.
//
// Fully public — no auth required (these are public bot-facing pages).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_ORIGIN = "https://www.vangah-avocats.com";
const DEFAULT_OG = `${SITE_ORIGIN}/og-image.jpg`;

const xmlEscape = (s: string) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripHtml = (s: string) =>
  String(s)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (s: string, max = 160) =>
  s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";

type Meta = {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  ogType: "website" | "article";
  lang: "fr" | "en";
  jsonLd: object[];
};

const baseLegalServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: "Cabinet ROGER VANGAH",
  url: SITE_ORIGIN,
  logo: DEFAULT_OG,
  image: DEFAULT_OG,
  address: {
    "@type": "PostalAddress",
    streetAddress: "3 avenue des Ternes",
    postalCode: "75017",
    addressLocality: "Paris",
    addressCountry: "FR",
  },
  knowsLanguage: ["fr", "en"],
  telephone: "+33176586737",
};

const breadcrumb = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: `${SITE_ORIGIN}${it.path}`,
  })),
});

/**
 * Replace tags in the shell HTML so crawlers see route-specific metadata.
 */
function patchHtml(shell: string, meta: Meta, path: string): string {
  const enUrl = `${meta.canonical}${meta.canonical.includes("?") ? "&" : "?"}lang=en`;
  const frUrl = meta.canonical.replace(/[?&]lang=en\b/, "").replace(/\?$/, "");

  const head = [
    `<title>${xmlEscape(meta.title)}</title>`,
    `<meta name="description" content="${xmlEscape(meta.description)}">`,
    `<link rel="canonical" href="${xmlEscape(meta.canonical)}">`,
    `<link rel="alternate" hreflang="fr" href="${xmlEscape(frUrl)}">`,
    `<link rel="alternate" hreflang="en" href="${xmlEscape(enUrl)}">`,
    `<link rel="alternate" hreflang="x-default" href="${xmlEscape(frUrl)}">`,
    `<meta property="og:type" content="${meta.ogType}">`,
    `<meta property="og:url" content="${xmlEscape(meta.canonical)}">`,
    `<meta property="og:title" content="${xmlEscape(meta.title)}">`,
    `<meta property="og:description" content="${xmlEscape(meta.description)}">`,
    `<meta property="og:image" content="${xmlEscape(meta.ogImage)}">`,
    `<meta property="og:site_name" content="Cabinet ROGER VANGAH">`,
    `<meta property="og:locale" content="${meta.lang === "en" ? "en_US" : "fr_FR"}">`,
    `<meta property="og:locale:alternate" content="${meta.lang === "en" ? "fr_FR" : "en_US"}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${xmlEscape(meta.title)}">`,
    `<meta name="twitter:description" content="${xmlEscape(meta.description)}">`,
    `<meta name="twitter:image" content="${xmlEscape(meta.ogImage)}">`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">`,
    ...meta.jsonLd.map(
      (j) =>
        `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`,
    ),
    `<!-- prerendered for ${xmlEscape(path)} -->`,
  ].join("\n    ");

  // Strip every existing tag we're going to replace, then inject ours.
  let out = shell
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name="description"[^>]*>/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>/gi, "")
    .replace(/<link\s+rel="alternate"\s+hreflang="[^"]+"[^>]*>/gi, "")
    .replace(/<meta\s+property="og:[^"]+"[^>]*>/gi, "")
    .replace(/<meta\s+name="twitter:[^"]+"[^>]*>/gi, "")
    .replace(/<meta\s+name="robots"[^>]*>/gi, "")
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");

  // Set <html lang>
  out = out.replace(/<html\b[^>]*>/i, `<html lang="${meta.lang}">`);

  // Inject our block right before </head>
  out = out.replace(/<\/head>/i, `    ${head}\n  </head>`);
  return out;
}

let cachedShell: string | null = null;
let cachedShellAt = 0;
const SHELL_TTL_MS = 5 * 60 * 1000;

async function fetchShell(): Promise<string> {
  const now = Date.now();
  if (cachedShell && now - cachedShellAt < SHELL_TTL_MS) return cachedShell;
  const r = await fetch(`${SITE_ORIGIN}/index.html`, {
    headers: { "User-Agent": "VangahPrerender/1.0" },
  });
  if (!r.ok) throw new Error(`shell fetch failed: ${r.status}`);
  cachedShell = await r.text();
  cachedShellAt = now;
  return cachedShell;
}

const STATIC_TITLES: Record<string, { fr: { t: string; d: string }; en: { t: string; d: string } }> = {
  "/": {
    fr: {
      t: "Cabinet ROGER VANGAH — Avocats Paris | Affaires, OHADA, Pénal",
      d: "Cabinet d'avocats à Paris : droit des affaires, OHADA, immobilier, pénal, étrangers. Conseil et contentieux entre la France et l'Afrique.",
    },
    en: {
      t: "ROGER VANGAH Law Firm — Paris Lawyers | Business, OHADA",
      d: "Paris law firm: business law, OHADA, real estate, criminal, immigration. Advisory & litigation between France and Africa.",
    },
  },
  "/cabinet": {
    fr: { t: "Le Cabinet — ROGER VANGAH", d: "Présentation du Cabinet ROGER VANGAH, avocats à Paris : valeurs, méthodologie, équipe et engagement client." },
    en: { t: "The Firm — ROGER VANGAH", d: "About ROGER VANGAH Law Firm in Paris: values, methodology, team and client commitment." },
  },
  "/expertises": {
    fr: { t: "Nos expertises — Cabinet ROGER VANGAH", d: "Domaines d'intervention : droit des affaires, OHADA, droit bancaire, immobilier, pénal des affaires, droit des étrangers, fiscalité, arbitrage." },
    en: { t: "Our expertise — ROGER VANGAH Law Firm", d: "Practice areas: business law, OHADA, banking, real estate, white-collar crime, immigration, tax, arbitration." },
  },
  "/equipe": {
    fr: { t: "L'équipe — Cabinet ROGER VANGAH", d: "Découvrez les avocats du Cabinet ROGER VANGAH : parcours, expertises et engagement au service de nos clients." },
    en: { t: "Our team — ROGER VANGAH Law Firm", d: "Meet the lawyers of ROGER VANGAH Law Firm: backgrounds, expertise and client commitment." },
  },
  "/actualites": {
    fr: { t: "Actualités juridiques — Cabinet ROGER VANGAH", d: "Analyses, décisions et veille juridique du Cabinet ROGER VANGAH : droit des affaires, OHADA, fiscalité, arbitrage international." },
    en: { t: "Legal news — ROGER VANGAH Law Firm", d: "Legal insights and updates from ROGER VANGAH Law Firm: business law, OHADA, tax, international arbitration." },
  },
  "/contact": {
    fr: { t: "Contact — Cabinet ROGER VANGAH, Paris", d: "Contactez le Cabinet ROGER VANGAH : 3 avenue des Ternes, 75017 Paris. Téléphone, e-mail, prise de rendez-vous." },
    en: { t: "Contact — ROGER VANGAH Law Firm, Paris", d: "Contact ROGER VANGAH Law Firm: 3 avenue des Ternes, 75017 Paris. Phone, email, appointments." },
  },
};

function staticMeta(path: string, lang: "fr" | "en"): Meta {
  const entry = STATIC_TITLES[path] ?? STATIC_TITLES["/"];
  const t = entry[lang];
  const canonical = `${SITE_ORIGIN}${path}${lang === "en" ? "?lang=en" : ""}`;
  const crumbs = path === "/"
    ? []
    : [
        { name: lang === "fr" ? "Accueil" : "Home", path: "/" },
        { name: t.t, path },
      ];
  return {
    title: t.t,
    description: t.d,
    canonical,
    ogImage: DEFAULT_OG,
    ogType: "website",
    lang,
    jsonLd: [
      baseLegalServiceJsonLd,
      ...(crumbs.length ? [breadcrumb(crumbs)] : []),
    ],
  };
}

async function buildMeta(
  supabase: ReturnType<typeof createClient>,
  path: string,
  lang: "fr" | "en",
): Promise<Meta> {
  // /expertises/:slug
  const expMatch = path.match(/^\/expertises\/([^\/]+?)(?:\/(?:faq))?$/);
  if (expMatch && expMatch[1]) {
    const slug = decodeURIComponent(expMatch[1]);
    const { data } = await supabase
      .from("expertises")
      .select("title, tagline, intro, seo_title, seo_description, image_url, og_image_url, slug")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (data) {
      const title = (data.seo_title as string) || `${data.title} — Cabinet ROGER VANGAH`;
      const desc = truncate(
        (data.seo_description as string) ||
          stripHtml((data.tagline as string) || (data.intro as string) || ""),
      );
      const canonical = `${SITE_ORIGIN}${path}${lang === "en" ? "?lang=en" : ""}`;
      const img = (data.og_image_url as string) || (data.image_url as string) || DEFAULT_OG;
      return {
        title,
        description: desc,
        canonical,
        ogImage: img,
        ogType: "website",
        lang,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: data.title,
            description: desc,
            provider: baseLegalServiceJsonLd,
            url: canonical,
            areaServed: ["France", "Côte d'Ivoire", "OHADA"],
          },
          breadcrumb([
            { name: lang === "fr" ? "Accueil" : "Home", path: "/" },
            { name: lang === "fr" ? "Expertises" : "Expertise", path: "/expertises" },
            { name: data.title as string, path },
          ]),
        ],
      };
    }
  }

  // /actualites/:idOrSlug
  const newsMatch = path.match(/^\/actualites\/([^\/]+)$/);
  if (newsMatch && newsMatch[1]) {
    const ref = decodeURIComponent(newsMatch[1]);
    let q = supabase
      .from("news_articles")
      .select("id, slug, title, excerpt, body, image_url, og_image_url, seo_title, seo_description, published_date, updated_at, lang")
      .eq("published", true)
      .lte("published_date", new Date().toISOString().slice(0, 10));
    // Try slug first, then id.
    const { data: bySlug } = await q.eq("slug", ref).maybeSingle();
    const article =
      bySlug ??
      (await supabase
        .from("news_articles")
        .select("id, slug, title, excerpt, body, image_url, og_image_url, seo_title, seo_description, published_date, updated_at, lang")
        .eq("id", ref)
        .eq("published", true)
        .maybeSingle()).data;
    if (article) {
      const title = (article.seo_title as string) || `${article.title} — Cabinet ROGER VANGAH`;
      const desc = truncate(
        (article.seo_description as string) ||
          (article.excerpt as string) ||
          stripHtml((article.body as string) || ""),
      );
      const canonical = `${SITE_ORIGIN}${path}${lang === "en" ? "?lang=en" : ""}`;
      const img = (article.og_image_url as string) || (article.image_url as string) || DEFAULT_OG;
      return {
        title,
        description: desc,
        canonical,
        ogImage: img,
        ogType: "article",
        lang,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: desc,
            image: img,
            datePublished: article.published_date,
            dateModified: (article.updated_at as string)?.slice(0, 10) || article.published_date,
            inLanguage: (article.lang as string) || "fr",
            author: { "@type": "Organization", name: "Cabinet ROGER VANGAH" },
            publisher: {
              "@type": "Organization",
              name: "Cabinet ROGER VANGAH",
              logo: { "@type": "ImageObject", url: DEFAULT_OG },
            },
            mainEntityOfPage: canonical,
          },
          breadcrumb([
            { name: lang === "fr" ? "Accueil" : "Home", path: "/" },
            { name: lang === "fr" ? "Actualités" : "News", path: "/actualites" },
            { name: article.title as string, path },
          ]),
        ],
      };
    }
  }

  // Static known route
  if (STATIC_TITLES[path]) return staticMeta(path, lang);

  // Landing page (/:slug catch-all in the SPA)
  const lpMatch = path.match(/^\/([^\/?#]+)$/);
  if (lpMatch && lpMatch[1] && !["cabinet", "expertises", "equipe", "team", "actualites", "news", "contact", "auth", "admin", "reset-password", "403"].includes(lpMatch[1])) {
    const slug = decodeURIComponent(lpMatch[1]);
    const { data } = await (supabase.from as any)("landing_pages")
      .select("title_fr, title_en, meta_description_fr, meta_description_en, h1_fr, h1_en, intro_fr, intro_en, image_url, city, country, slug")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (data) {
      const title = (lang === "en" ? data.title_en : data.title_fr) || (lang === "en" ? data.h1_en : data.h1_fr) || data.slug;
      const desc = truncate(
        (lang === "en" ? data.meta_description_en : data.meta_description_fr) ||
          stripHtml((lang === "en" ? data.intro_en : data.intro_fr) || ""),
      );
      const canonical = `${SITE_ORIGIN}${path}${lang === "en" ? "?lang=en" : ""}`;
      return {
        title,
        description: desc,
        canonical,
        ogImage: (data.image_url as string) || DEFAULT_OG,
        ogType: "website",
        lang,
        jsonLd: [
          baseLegalServiceJsonLd,
          breadcrumb([
            { name: lang === "fr" ? "Accueil" : "Home", path: "/" },
            { name: title, path },
          ]),
        ],
      };
    }
  }

  // Fallback: home meta with the requested canonical
  const fallback = staticMeta("/", lang);
  fallback.canonical = `${SITE_ORIGIN}${path}${lang === "en" ? "?lang=en" : ""}`;
  return fallback;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const rawPath = url.searchParams.get("path") || url.pathname.replace(/^\/functions\/v1\/prerender/, "") || "/";
    // Sanitize path: strip query, ensure single leading slash.
    let path = rawPath.split("?")[0].split("#")[0];
    if (!path.startsWith("/")) path = "/" + path;
    if (path.length > 300) path = path.slice(0, 300);
    const lang: "fr" | "en" = url.searchParams.get("lang") === "en" ? "en" : "fr";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const [shell, meta] = await Promise.all([fetchShell(), buildMeta(supabase, path, lang)]);
    const html = patchHtml(shell, meta, path);

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
        "X-Prerendered": "1",
      },
    });
  } catch (err) {
    return new Response(
      `<!doctype html><html><head><title>Prerender error</title></head><body><pre>${
        xmlEscape((err as Error).message)
      }</pre></body></html>`,
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }
});
