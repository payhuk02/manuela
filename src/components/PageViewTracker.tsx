import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const VISITOR_KEY_STORAGE = "site_page_view_visitor_key";
const SKIP_PREFIXES = ["/admin", "/auth", "/403"];

const getVisitorKey = () => {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY_STORAGE);
    if (existing && existing.length >= 16) return existing;
    const key = crypto.randomUUID().replace(/-/g, "") + Date.now().toString(36);
    window.localStorage.setItem(VISITOR_KEY_STORAGE, key);
    return key;
  } catch {
    return crypto.randomUUID().replace(/-/g, "") + Date.now().toString(36);
  }
};

const normalizePath = (pathname: string) => {
  if (!pathname) return "/";
  const clean = pathname.split("?")[0].split("#")[0] || "/";
  return clean.length > 500 ? clean.slice(0, 500) : clean;
};

const shouldSkip = (path: string) =>
  SKIP_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

/**
 * Records anonymized page views for the admin Statistiques dashboard.
 * Skips admin/auth routes and avoids duplicate hits for the same path in one session tick.
 */
export const PageViewTracker = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastRecorded = useRef<string | null>(null);

  useEffect(() => {
    const path = normalizePath(pathname);
    if (shouldSkip(path)) return;
    if (lastRecorded.current === path) return;
    lastRecorded.current = path;

    const lang =
      typeof document !== "undefined" && document.documentElement.lang
        ? document.documentElement.lang.slice(0, 8)
        : "fr";

    const referrer =
      typeof document !== "undefined" && document.referrer
        ? document.referrer.slice(0, 500)
        : null;

    void (supabase as any)
      .from("site_page_views")
      .insert({
        path,
        visitor_key: getVisitorKey(),
        lang: lang || "fr",
        referrer,
      })
      .then(({ error }: { error: { message: string } | null }) => {
        if (error && import.meta.env.DEV) {
          console.warn("page view tracking", error.message);
        }
      });
  }, [pathname]);

  return null;
};
