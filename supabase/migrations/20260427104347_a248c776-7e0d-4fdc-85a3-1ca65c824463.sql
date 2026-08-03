-- Remove the overly permissive public DELETE policy that allowed
-- any anonymous visitor to delete any like on a published article.
DROP POLICY IF EXISTS "Visitors can remove their own article likes" ON public.article_likes;

-- Public DELETE is now disallowed entirely. Visitors must go through the
-- existing SECURITY DEFINER RPC `set_article_like(_article_id, _visitor_key, false)`
-- which validates ownership via visitor_key before deleting.
-- Staff retains full management via the existing "Staff manage article likes" policy.