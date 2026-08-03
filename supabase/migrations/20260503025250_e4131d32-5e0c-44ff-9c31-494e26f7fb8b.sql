DROP VIEW IF EXISTS public.ai_settings_public;

CREATE OR REPLACE FUNCTION public.get_chatbot_public_settings()
RETURNS TABLE (
  enabled boolean,
  welcome_message_fr text,
  welcome_message_en text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT enabled, welcome_message_fr, welcome_message_en
  FROM public.ai_settings
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_chatbot_public_settings() TO anon, authenticated;
