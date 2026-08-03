// Recompress images in Supabase Storage buckets and log to audit_log.
// Admin-only. Uses imagescript (pure TS) to decode/reencode JPEG/PNG/WebP.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { decode, Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Body = {
  buckets?: string[];
  prefix?: string;
  maxWidth?: number;
  quality?: number;
  dryRun?: boolean;
  limit?: number;
  minBytes?: number;
};

const ALLOWED_BUCKETS = new Set(["site-images", "editor-media", "documents"]);
const SUPPORTED_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (status: number, data: unknown) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return json(401, { error: "Unauthorized" });
    }

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json(401, { error: "Unauthorized" });

    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json(403, { error: "Forbidden" });

    const body = (await req.json().catch(() => ({}))) as Body;
    const buckets = (body.buckets?.length ? body.buckets : ["site-images", "editor-media"])
      .filter((b) => ALLOWED_BUCKETS.has(b));
    const prefix = body.prefix ?? "";
    const maxWidth = Math.min(Math.max(body.maxWidth ?? 1920, 320), 2560);
    const quality = Math.min(Math.max(body.quality ?? 82, 50), 95);
    const dryRun = !!body.dryRun;
    const limit = Math.min(body.limit ?? 500, 2000);
    const minBytes = body.minBytes ?? 80_000; // skip already-small files

    const results: Array<Record<string, unknown>> = [];
    let totalBefore = 0;
    let totalAfter = 0;
    let processed = 0;

    async function walk(bucket: string, dir: string) {
      if (processed >= limit) return;
      const { data: entries, error } = await admin.storage.from(bucket).list(dir, {
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw error;
      for (const e of entries ?? []) {
        if (processed >= limit) return;
        const path = dir ? `${dir}/${e.name}` : e.name;
        const isFolder = !e.id && !e.metadata;
        if (isFolder) {
          await walk(bucket, path);
          continue;
        }
        const mime = (e.metadata?.mimetype as string | undefined) ?? "";
        const size = Number(e.metadata?.size ?? 0);
        if (!SUPPORTED_MIMES.has(mime)) continue;
        if (size < minBytes) continue;

        processed++;
        try {
          const { data: blob, error: dErr } = await admin.storage.from(bucket).download(path);
          if (dErr || !blob) throw dErr ?? new Error("download failed");
          const buf = new Uint8Array(await blob.arrayBuffer());

          const img = (await decode(buf)) as Image;
          if (img.width > maxWidth) {
            img.resize(maxWidth, Image.RESIZE_AUTO);
          }
          const outBuf = await img.encodeJPEG(quality);
          const before = buf.byteLength;
          const after = outBuf.byteLength;

          totalBefore += before;
          if (after < before * 0.92) {
            totalAfter += after;
            if (!dryRun) {
              const { error: uErr } = await admin.storage
                .from(bucket)
                .update(path, outBuf, {
                  contentType: "image/jpeg",
                  upsert: true,
                  cacheControl: "31536000",
                });
              if (uErr) throw uErr;
            }
            results.push({ bucket, path, before, after, savedPct: Math.round((1 - after / before) * 100), action: dryRun ? "would-replace" : "replaced" });
          } else {
            totalAfter += before;
            results.push({ bucket, path, before, after, action: "skipped-no-gain" });
          }
        } catch (err) {
          results.push({ bucket, path, action: "error", error: (err as Error).message });
        }
      }
    }

    for (const b of buckets) {
      await walk(b, prefix);
    }

    const summary = {
      processed,
      replaced: results.filter((r) => r.action === "replaced").length,
      wouldReplace: results.filter((r) => r.action === "would-replace").length,
      skipped: results.filter((r) => r.action === "skipped-no-gain").length,
      errors: results.filter((r) => r.action === "error").length,
      totalBefore,
      totalAfter,
      savedBytes: totalBefore - totalAfter,
      savedPct: totalBefore ? Math.round((1 - totalAfter / totalBefore) * 100) : 0,
    };

    await admin.from("audit_log").insert({
      action: dryRun ? "storage.optimize.dry_run" : "storage.optimize.run",
      actor_id: userData.user.id,
      actor_email: userData.user.email,
      target_type: "storage",
      target_id: buckets.join(","),
      details: { params: { buckets, prefix, maxWidth, quality, limit, minBytes }, summary, results },
    });

    return json(200, { ok: true, summary, results });
  } catch (err) {
    console.error("optimize-storage-images error", err);
    return json(500, { error: (err as Error).message });
  }
});
