/**
 * Build a schema.org BreadcrumbList JSON-LD object.
 * Pass an array of `{ name, path }` (path = absolute path on the site).
 */
export const breadcrumbJsonLd = (
  items: { name: string; path: string }[],
  origin?: string,
) => {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "https://www.cabinet-diabate.com");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${base}${it.path}`,
    })),
  };
};
