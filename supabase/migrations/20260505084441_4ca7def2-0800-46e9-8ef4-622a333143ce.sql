-- Restrict anonymous insertion into chat_messages.
-- All client message inserts go through the legal-chat edge function (service role),
-- so the public INSERT policy can be dropped to prevent conversation hijacking.
DROP POLICY IF EXISTS "Anyone can append messages to an open conversation" ON public.chat_messages;