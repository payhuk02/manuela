// Public dynamic sitemap.xml — built live from the database.
// Includes static pages, all published expertises, all published articles
// (using slug when available, falling back to id), and SEO landing pages.
// Each entry exposes FR/EN hreflang alternates so Google can index both
// language variants of the SPA.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_ORIGIN = "https://www.vangah-avocats.com";

const STATIC_PAGES: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "monthly" },
  { path: "/cabinet", priority: "0.9", changefreq: "monthly" },
  { path: "/expertises", priority: "0.9", changefreq: "monthly" },
  { path: "/equipe", priority: "0.8", changefreq: "monthly" },
  { path: "/actualites", priority: "0.8", changefreq: "weekly" },
  { path: "/contact", priority: "0.8", changefreq: "monthly" },
];

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/**
 * Build a `<url>` block with FR + EN alternates.
 * We use the `?lang=en` convention currently implemented in the React app.
 */
const urlEntry = (
  path: string,
  opts: { lastmod: string; changefreq: string; priority: string },
): string => {
  // Indexation FR uniquement : on n'émet plus d'hreflang EN,
  // sinon Google indexerait aussi la variante ?lang=en.
  const fr = `${SITE_ORIGIN}${path}`;
  return [
    `<url>`,
    `<loc>${xmlEscape(fr)}</loc>`,
    `<lastmod>${opts.lastmod}</lastmod>`,
    `<changefreq>${opts.changefreq}</changefreq>`,
    `<priority>${opts.priority}</priority>`,
    `</url>`,
  ].join("");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: expertises }, { data: articles }, { data: landings }] = await Promise.all([
    supabase
      .from("expertises")
      .select("slug, updated_at, published")
      .eq("published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("news_articles")
      .select("id, slug, updated_at, published_date, published, title, lang")
      .eq("published", true)
      .lte("published_date", today)
      .order("published_date", { ascending: false }),
    (supabase.from as any)("landing_pages")
      .select("slug, updated_at, published")
      .eq("published", true)
      .order("sort_order", { ascending: true }),
  ]);

  // Most-recent content update drives the home page's lastmod, so the signal
  // is stable instead of "today" on every fetch (which Google ends up ignoring).
  const allUpdatedAt = [
    ...(expertises ?? []).map((e) => e.updated_at),
    ...(articles ?? []).map((a) => a.updated_at),
    ...((landings as any[]) ?? []).map((l) => l.updated_at),
  ]
    .filter(Boolean)
    .sort()
    .reverse();
  const newestLastmod = (allUpdatedAt[0] ?? `${today}T00:00:00Z`).slice(0, 10);

  const urls: string[] = [];

  for (const p of STATIC_PAGES) {
    urls.push(
      urlEntry(p.path, {
        lastmod: newestLastmod,
        changefreq: p.changefreq,
        priority: p.priority,
      }),
    );
  }

  for (const e of expertises ?? []) {
    if (!e.slug) continue;
    const lastmod = (e.updated_at ?? "").slice(0, 10) || newestLastmod;
    urls.push(
      urlEntry(`/expertises/${e.slug}`, {
        lastmod,
        changefreq: "monthly",
        priority: "0.8",
      }),
    );
  }

  // Dedupe articles: when the same title was published multiple times (data
  // import artifact) we keep only the most recently created entry per title.
  const seenTitles = new Set<string>();
  for (const a of articles ?? []) {
    const ref = a.slug || a.id;
    if (!ref) continue;
    const titleKey = (a.title ?? "").trim().toLowerCase();
    if (titleKey && seenTitles.has(titleKey)) continue;
    if (titleKey) seenTitles.add(titleKey);
    const lastmod =
      (a.updated_at ?? "").slice(0, 10) || a.published_date || newestLastmod;
    urls.push(
      urlEntry(`/actualites/${ref}`, {
        lastmod,
        changefreq: "monthly",
        priority: "0.7",
      }),
    );
  }

  for (const lp of (landings as any[]) ?? []) {
    if (!lp.slug) continue;
    const lastmod = (lp.updated_at ?? "").slice(0, 10) || newestLastmod;
    urls.push(
      urlEntry(`/${lp.slug}`, {
        lastmod,
        changefreq: "monthly",
        priority: "0.9",
      }),
    );
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    urls.join("\n") +
    `\n</urlset>`;

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
});
