// Notifies search engines (IndexNow → Bing, Yandex) that a list of URLs
// changed. Called from the admin when an article or expertise is published.
// Google deprecated its sitemap-ping endpoint in 2023, so we don't call it.
//
// Usage:
//   POST { urls: ["https://www.vangah-avocats.com/actualites/xyz"] }
//
// Authenticated callers only (verify_jwt = true via signing key validation).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_HOST = "www.vangah-avocats.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );

    const { data: userResp } = await supabase.auth.getUser(token);
    const user = userResp?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isStaff } = await supabase.rpc("is_staff", { _user_id: user.id });
    if (!isStaff) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const urls: unknown = body?.urls;
    if (!Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: "urls[] required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const cleanUrls = (urls as unknown[])
      .filter((u): u is string => typeof u === "string" && u.startsWith(`https://${SITE_HOST}`))
      .slice(0, 100);

    const indexNowKey = Deno.env.get("INDEXNOW_KEY") ?? "";
    const results: Record<string, unknown> = {};

    if (indexNowKey && cleanUrls.length > 0) {
      const payload = {
        host: SITE_HOST,
        key: indexNowKey,
        keyLocation: `https://${SITE_HOST}/${indexNowKey}.txt`,
        urlList: cleanUrls,
      };
      const r = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      results.indexnow = { status: r.status, ok: r.ok };
    } else {
      results.indexnow = { skipped: true, reason: "INDEXNOW_KEY not configured" };
    }

    return new Response(
      JSON.stringify({ ok: true, count: cleanUrls.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
