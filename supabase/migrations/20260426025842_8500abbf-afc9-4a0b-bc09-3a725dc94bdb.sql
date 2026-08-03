-- Add optional expertise_slug to contact_messages so we can route requests by domain
ALTER TABLE public.contact_messages
ADD COLUMN IF NOT EXISTS expertise_slug text;

CREATE INDEX IF NOT EXISTS idx_contact_messages_expertise_slug
ON public.contact_messages (expertise_slug);

-- Replace insert policy to allow optional expertise_slug while keeping validation
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;

CREATE POLICY "Anyone can submit a contact message"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (
  length(TRIM(BOTH FROM name)) > 0
  AND length(TRIM(BOTH FROM email)) > 0
  AND length(TRIM(BOTH FROM message)) > 0
  AND length(message) <= 5000
  AND status = 'new'
  AND (expertise_slug IS NULL OR length(expertise_slug) <= 100)
);