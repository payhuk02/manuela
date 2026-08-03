import { supabase } from "@/integrations/supabase/client";

export type AuditPayload = {
  action: string;
  target_type?: string;
  target_id?: string;
  target_email?: string | null;
  details?: Record<string, unknown>;
};

/**
 * Best-effort audit log call. Never throws — failures are silently logged.
 * Uses the `audit-log` edge function which validates staff role server-side
 * and inserts into the `audit_log` table via the service role key.
 */
export async function logAudit(payload: AuditPayload): Promise<void> {
  try {
    await supabase.functions.invoke("audit-log", { body: payload });
  } catch (e) {
    console.warn("audit log failed", e);
  }
}
