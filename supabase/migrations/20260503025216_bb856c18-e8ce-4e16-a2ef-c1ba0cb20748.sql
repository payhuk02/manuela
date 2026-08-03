-- Remove the overly permissive update policy
DROP POLICY IF EXISTS "Visitors update own conversation by key" ON public.chat_conversations;

-- Secure RPC to let a visitor attach their contact info to THEIR conversation
CREATE OR REPLACE FUNCTION public.attach_visitor_info(
  _conversation_id uuid,
  _visitor_key text,
  _name text DEFAULT NULL,
  _email text DEFAULT NULL,
  _phone text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  safe_name text := NULLIF(trim(coalesce(_name, '')), '');
  safe_email text := NULLIF(lower(trim(coalesce(_email, ''))), '');
  safe_phone text := NULLIF(trim(coalesce(_phone, '')), '');
BEGIN
  IF _visitor_key IS NULL OR char_length(_visitor_key) < 16 OR char_length(_visitor_key) > 128 THEN
    RAISE EXCEPTION 'Invalid visitor key';
  END IF;

  IF safe_email IS NOT NULL AND (char_length(safe_email) > 255 OR safe_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$') THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;

  IF safe_name IS NOT NULL AND char_length(safe_name) > 100 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;

  IF safe_phone IS NOT NULL AND char_length(safe_phone) > 40 THEN
    RAISE EXCEPTION 'Invalid phone';
  END IF;

  UPDATE public.chat_conversations
  SET visitor_name = COALESCE(safe_name, visitor_name),
      visitor_email = COALESCE(safe_email, visitor_email),
      visitor_phone = COALESCE(safe_phone, visitor_phone),
      status = CASE WHEN safe_email IS NOT NULL THEN 'lead' ELSE status END,
      updated_at = now()
  WHERE id = _conversation_id
    AND visitor_key = _visitor_key
    AND status IN ('open','lead');
END;
$$;

REVOKE ALL ON FUNCTION public.attach_visitor_info(uuid, text, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.attach_visitor_info(uuid, text, text, text, text) TO anon, authenticated;

-- Lock down the internal trigger function — it should never be callable from the API
REVOKE ALL ON FUNCTION public.bump_conversation_on_message() FROM public, anon, authenticated;
