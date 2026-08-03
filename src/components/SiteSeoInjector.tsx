/**
 * Reads site-wide SEO settings (GSC verification, Plausible) from `site_content`
 * and injects them into <head> at runtime. Re-evaluates only on first load.
 */
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const KEYS = ["seo.site.gsc_verification", "seo.site.plausible_domain"] as const;

const setMeta = (name: string, content: string) => {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

export const SiteSeoInjector = () => {
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_content")
      .select("key,value")
      .in("key", KEYS as unknown as string[])
      .eq("lang", "fr")
      .then(({ data }) => {
        if (cancelled) return;
        const map: Record<string, string> = {};
        (data ?? []).forEach((r) => (map[r.key] = (r.value ?? "").trim()));

        const gsc = map["seo.site.gsc_verification"];
        if (gsc) setMeta("google-site-verification", gsc);

        const plausibleDomain = map["seo.site.plausible_domain"];
        if (plausibleDomain && !document.getElementById("plausible-script")) {
          const s = document.createElement("script");
          s.id = "plausible-script";
          s.defer = true;
          s.src = "https://plausible.io/js/script.js";
          s.setAttribute("data-domain", plausibleDomain);
          document.head.appendChild(s);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
};
