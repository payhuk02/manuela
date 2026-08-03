import { useEffect } from "react";

type AlternateLink = { lang: string; url: string };

type SeoOptions = {
  title: string;
  description?: string;
  image?: string | null;
  url?: string;
  type?: "website" | "article";
  jsonLd?: object | null;
  jsonLdId?: string;
  /** Current page language (e.g. "fr" | "en"). Used for og:locale & html lang hint. */
  lang?: string;
  /** Canonical URL — defaults to current URL stripped of query/hash. */
  canonical?: string;
  /** hreflang alternates. Include x-default for the canonical fallback. */
  alternates?: AlternateLink[];
  /** Open Graph article:published_time */
  publishedTime?: string;
  /** Open Graph article:modified_time */
  modifiedTime?: string;
  /** Open Graph article:author */
  author?: string;
};

const setMeta = (
  selector: string,
  attr: "name" | "property",
  attrValue: string,
  content: string
) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setLink = (rel: string, href: string, hreflang?: string) => {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const removeAlternates = () => {
  document.head
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((el) => el.remove());
};

const stripQueryHash = (url: string) => {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return url;
  }
};

export const applySeo = (opts: SeoOptions) => {
  const {
    title,
    description = "",
    image,
    url = typeof window !== "undefined" ? window.location.href : "/",
    type = "website",
    jsonLd = null,
    jsonLdId = "page-jsonld",
    lang,
    canonical,
    alternates,
  } = opts;

  document.title = title;

  // SEO : on force toujours le français pour l'indexation (html lang + og:locale),
  // quelle que soit la langue d'affichage choisie par l'utilisateur.
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", "fr");
  }

  if (description) {
    setMeta('meta[name="description"]', "name", "description", description);
  }

  // Canonical (always strip query/hash to avoid duplicates)
  const canonicalUrl = canonical ?? stripQueryHash(url);
  setLink("canonical", canonicalUrl);

  // hreflang alternates
  removeAlternates();
  if (alternates && alternates.length > 0) {
    alternates.forEach((alt) => setLink("alternate", alt.url, alt.lang));
  }

  // Open Graph
  setMeta('meta[property="og:title"]', "property", "og:title", title);
  if (description)
    setMeta('meta[property="og:description"]', "property", "og:description", description);
  setMeta('meta[property="og:type"]', "property", "og:type", type);
  setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
  if (image) setMeta('meta[property="og:image"]', "property", "og:image", image);
  // Toujours fr_FR pour le référencement — la langue d'affichage (lang) n'influence pas les métadonnées.
  void lang;
  setMeta('meta[property="og:locale"]', "property", "og:locale", "fr_FR");

  // Article specific
  const cleanupMeta = (selector: string) => {
    document.head.querySelector(selector)?.remove();
  };
  if (type === "article") {
    if (opts.publishedTime) setMeta('meta[property="article:published_time"]', "property", "article:published_time", opts.publishedTime);
    else cleanupMeta('meta[property="article:published_time"]');
    
    if (opts.modifiedTime) setMeta('meta[property="article:modified_time"]', "property", "article:modified_time", opts.modifiedTime);
    else cleanupMeta('meta[property="article:modified_time"]');
    
    if (opts.author) setMeta('meta[property="article:author"]', "property", "article:author", opts.author);
    else cleanupMeta('meta[property="article:author"]');
  } else {
    cleanupMeta('meta[property="article:published_time"]');
    cleanupMeta('meta[property="article:modified_time"]');
    cleanupMeta('meta[property="article:author"]');
  }

  // Twitter
  setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
  setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
  if (description)
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
  if (image) setMeta('meta[name="twitter:image"]', "name", "twitter:image", image);

  // JSON-LD
  document.getElementById(jsonLdId)?.remove();
  if (jsonLd) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = jsonLdId;
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }
};

export const useSeo = (opts: SeoOptions | null) => {
  useEffect(() => {
    if (!opts) return;
    applySeo(opts);
    const id = opts.jsonLdId ?? "page-jsonld";
    return () => {
      document.getElementById(id)?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    opts?.title,
    opts?.description,
    opts?.image,
    opts?.url,
    opts?.type,
    opts?.lang,
    opts?.canonical,
    opts?.publishedTime,
    opts?.modifiedTime,
    opts?.author,
    JSON.stringify(opts?.alternates ?? null),
    JSON.stringify(opts?.jsonLd ?? null),
  ]);
};

/**
 * Build canonical + hreflang alternates for a path.
 * Indexation SEO : FRANÇAIS UNIQUEMENT.
 * Le canonical pointe toujours vers la version FR (sans paramètre de langue),
 * même quand l'utilisateur consulte la version EN. Aucun hreflang n'est émis
 * pour ne pas signaler la version anglaise aux moteurs de recherche.
 */
export const buildLangAlternates = (
  path: string,
  _currentLang: "fr" | "en"
): { canonical: string; alternates: AlternateLink[] } => {
  const siteUrl = import.meta.env.VITE_SITE_URL || "https://www.diabate-avocat.com";
  const origin =
    typeof window !== "undefined" ? window.location.origin : siteUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const frUrl = `${origin}${cleanPath}`;
  return {
    canonical: frUrl,
    alternates: [],
  };
};
