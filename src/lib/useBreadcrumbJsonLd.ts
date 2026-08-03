import { useEffect } from "react";
import { breadcrumbJsonLd } from "./seoSchemas";

/**
 * Inject a schema.org BreadcrumbList JSON-LD into <head> for the current page.
 * Independent from useSeo so it can coexist with another @type JSON-LD block.
 */
export const useBreadcrumbJsonLd = (
  items: { name: string; path: string }[],
  id = "breadcrumb-jsonld",
) => {
  useEffect(() => {
    if (!items.length) return;
    document.getElementById(id)?.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.text = JSON.stringify(breadcrumbJsonLd(items));
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items), id]);
};
