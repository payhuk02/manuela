import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Action =
  | { type: "list" }
  | { type: "invite"; email: string; role: "admin" | "editor" }
  | { type: "set_role"; user_id: string; role: "admin" | "editor" }
  | { type: "remove_role"; user_id: string; role: "admin" | "editor" }
  | { type: "delete_user"; user_id: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const reqId = crypto.randomUUID().slice(0, 8);
    const log = (...args: unknown[]) => console.log(`[admin-users:${reqId}]`, ...args);

    const authHeader = req.headers.get("Authorization") ?? "";
    log("incoming", {
      method: req.method,
      url: req.url,
      hasAuthHeader: !!authHeader,
      authScheme: authHeader ? authHeader.split(" ")[0] : null,
      tokenLen: authHeader ? authHeader.replace(/^Bearer\s+/i, "").length : 0,
      origin: req.headers.get("origin"),
      referer: req.headers.get("referer"),
      hasApikey: !!req.headers.get("apikey"),
    });

    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      log("401 reason: missing or malformed Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized", reason: "missing_authorization_header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      log("401 reason: getUser failed", {
        error: userErr?.message,
        status: (userErr as { status?: number } | null)?.status,
        name: userErr?.name,
      });
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          reason: "invalid_or_expired_jwt",
          detail: userErr?.message ?? "no user returned",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    log("authenticated", { user_id: userData.user.id, email: userData.user.email });

    const admin = createClient(SUPABASE_URL, SERVICE);

    // Verify caller is admin
    const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (roleErr) {
      log("403 reason: has_role rpc error", { error: roleErr.message });
      return new Response(
        JSON.stringify({ error: "Forbidden", reason: "role_check_failed", detail: roleErr.message }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!isAdmin) {
      log("403 reason: user is not admin", { user_id: userData.user.id, email: userData.user.email });
      return new Response(
        JSON.stringify({
          error: "Forbidden",
          reason: "not_admin",
          detail: `User ${userData.user.email ?? userData.user.id} does not have the 'admin' role.`,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    log("authorized as admin");

    const body = (await req.json()) as Action;

    if (body.type === "list") {
      const { data: list, error } = await admin.auth.admin.listUsers({ perPage: 200 });
      if (error) throw error;
      const { data: roles, error: rErr } = await admin.from("user_roles").select("user_id, role");
      if (rErr) throw rErr;

      const users = list.users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        roles: roles?.filter((r) => r.user_id === u.id).map((r) => r.role) ?? [],
      }));

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const actorId = userData.user.id;
    const actorEmail = userData.user.email ?? null;
    const logAudit = async (
      action: string,
      target: { type?: string; id?: string; email?: string | null } = {},
      details: Record<string, unknown> = {},
    ) => {
      try {
        await admin.from("audit_log").insert({
          actor_id: actorId,
          actor_email: actorEmail,
          action,
          target_type: target.type ?? null,
          target_id: target.id ?? null,
          target_email: target.email ?? null,
          details,
        });
      } catch (e) {
        console.error("audit_log insert failed", e);
      }
    };

    if (body.type === "invite") {
      const { data: inv, error } = await admin.auth.admin.inviteUserByEmail(body.email);
      if (error) throw error;
      if (inv.user) {
        await admin.from("user_roles").insert({ user_id: inv.user.id, role: body.role });
      }
      await logAudit(
        "user.invite",
        { type: "user", id: inv.user?.id, email: body.email },
        { role: body.role },
      );
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.type === "set_role") {
      const { error } = await admin
        .from("user_roles")
        .insert({ user_id: body.user_id, role: body.role });
      if (error && !error.message.includes("duplicate")) throw error;
      await logAudit("role.grant", { type: "user", id: body.user_id }, { role: body.role });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.type === "remove_role") {
      if (body.role === "admin") {
        const { count } = await admin
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .eq("role", "admin");
        if ((count ?? 0) <= 1) {
          return new Response(
            JSON.stringify({ error: "Impossible de retirer le dernier administrateur." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      }
      const { error } = await admin
        .from("user_roles")
        .delete()
        .eq("user_id", body.user_id)
        .eq("role", body.role);
      if (error) throw error;
      await logAudit("role.revoke", { type: "user", id: body.user_id }, { role: body.role });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.type === "delete_user") {
      if (body.user_id === actorId) {
        return new Response(
          JSON.stringify({ error: "Vous ne pouvez pas supprimer votre propre compte." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const { data: targetData } = await admin.auth.admin.getUserById(body.user_id);
      const { error } = await admin.auth.admin.deleteUser(body.user_id);
      if (error) throw error;
      await logAudit("user.delete", {
        type: "user",
        id: body.user_id,
        email: targetData?.user?.email ?? null,
      });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-users error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
