ALTER TABLE public.ai_settings
ADD COLUMN IF NOT EXISTS button_color text NOT NULL DEFAULT '#C8A35B',
ADD COLUMN IF NOT EXISTS button_icon_color text NOT NULL DEFAULT '#FFFFFF';

DROP FUNCTION IF EXISTS public.get_chatbot_public_settings();

CREATE OR REPLACE FUNCTION public.get_chatbot_public_settings()
 RETURNS TABLE(enabled boolean, welcome_message_fr text, welcome_message_en text, button_color text, button_icon_color text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT enabled, welcome_message_fr, welcome_message_en, button_color, button_icon_color
  FROM public.ai_settings
  LIMIT 1;
$function$;