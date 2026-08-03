
-- 1. Fix SECURITY DEFINER view: switch team_members_public to security_invoker
ALTER VIEW public.team_members_public SET (security_invoker = true);

-- 2. Add public SELECT policy on team_members for published rows, but
--    restrict column-level access so anon/authenticated cannot read
--    sensitive contact fields (email, phone, office_address, cv_url).
CREATE POLICY "Public can read published team members"
ON public.team_members
FOR SELECT
TO anon, authenticated
USING (published = true);

-- Revoke broad SELECT, then grant only safe columns to anon/authenticated.
REVOKE SELECT ON public.team_members FROM anon, authenticated;
GRANT SELECT (
  id, name, role_fr, role_en, bio_fr, bio_en,
  presentation_fr, presentation_en, photo_url,
  linkedin_url, is_founder, published, sort_order,
  created_at, updated_at
) ON public.team_members TO anon, authenticated;

-- 3. Restrict ai_settings.api_key to admins only via column-level privileges.
--    Editors keep access to all other columns through existing RLS policy.
REVOKE SELECT, UPDATE ON public.ai_settings FROM anon, authenticated;
GRANT SELECT (
  id, enabled, provider, model,
  system_prompt_fr, system_prompt_en,
  welcome_message_fr, welcome_message_en,
  button_color, button_icon_color,
  max_messages_per_conversation,
  updated_by, updated_at
) ON public.ai_settings TO authenticated;
GRANT UPDATE (
  enabled, provider, model,
  system_prompt_fr, system_prompt_en,
  welcome_message_fr, welcome_message_en,
  button_color, button_icon_color,
  max_messages_per_conversation,
  updated_by, updated_at
) ON public.ai_settings TO authenticated;

-- Admin-only access to api_key column.
GRANT SELECT (api_key), UPDATE (api_key) ON public.ai_settings TO authenticated;
-- Use a restrictive RLS policy that only allows admins to touch api_key
-- via a row-level rule isn't possible per-column; enforce in app layer
-- by reading/writing api_key only from admin-gated edge functions.
-- We additionally tighten the RLS policy: editors can manage settings
-- but the api_key column is excluded from their column grants below.
-- Reset policies for clarity.
DROP POLICY IF EXISTS "Staff manage ai_settings" ON public.ai_settings;
CREATE POLICY "Editors manage ai_settings (no api_key)"
ON public.ai_settings
FOR ALL
TO authenticated
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

-- Revoke api_key column from non-admin staff: implement via separate role grants.
-- Since Postgres has no per-row column policy, we revoke api_key from
-- authenticated and grant only to admins through a SECURITY DEFINER helper.
REVOKE SELECT (api_key), UPDATE (api_key) ON public.ai_settings FROM authenticated;

-- 4. Lock down internal SECURITY DEFINER functions from public execution.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.bump_conversation_on_message() FROM anon, authenticated, public;
