-- Remove the public SELECT policy that exposed author_email
DROP POLICY IF EXISTS "Approved comments readable by everyone" ON public.article_comments;

-- Keep only staff SELECT (the existing "Staff manage article comments" ALL policy already covers staff)
-- Public reads must now go through the SECURITY DEFINER RPC public.get_article_comments(uuid)
-- which returns only id, author_name, body, created_at (no email).