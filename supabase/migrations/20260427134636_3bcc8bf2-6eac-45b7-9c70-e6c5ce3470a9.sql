-- Revoke EXECUTE from anon/authenticated on internal-only SECURITY DEFINER functions.
-- These functions are only called by triggers or the auth flow, never directly by clients.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;