import { supabase } from "@/integrations/supabase/client";

const SITE_ORIGIN = "https://www.cabinet-diabate.com";

/** Fire-and-forget IndexNow ping after a publish. Silently ignores errors. */
export const pingSeo = async (paths: string[]) => {
  try {
    const urls = paths.filter(Boolean).map((p) => `${SITE_ORIGIN}${p.startsWith("/") ? p : `/${p}`}`);
    if (urls.length === 0) return;
    await supabase.functions.invoke("seo-ping", { body: { urls } });
  } catch {
    // intentionally silent — ping is best-effort
  }
};
