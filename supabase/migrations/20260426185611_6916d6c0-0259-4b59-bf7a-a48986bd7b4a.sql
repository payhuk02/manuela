CREATE TABLE public.article_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL,
  visitor_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT article_likes_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.news_articles(id) ON DELETE CASCADE,
  CONSTRAINT article_likes_visitor_key_length CHECK (char_length(visitor_key) BETWEEN 16 AND 128),
  CONSTRAINT article_likes_unique_visitor UNIQUE (article_id, visitor_key)
);

CREATE TABLE public.article_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL,
  platform text NOT NULL DEFAULT 'native',
  visitor_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT article_shares_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.news_articles(id) ON DELETE CASCADE,
  CONSTRAINT article_shares_platform_length CHECK (char_length(platform) BETWEEN 2 AND 40),
  CONSTRAINT article_shares_visitor_key_length CHECK (visitor_key IS NULL OR char_length(visitor_key) BETWEEN 16 AND 128)
);

CREATE TABLE public.article_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL,
  author_name text NOT NULL,
  author_email text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT article_comments_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.news_articles(id) ON DELETE CASCADE,
  CONSTRAINT article_comments_status_valid CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT article_comments_author_name_length CHECK (char_length(trim(author_name)) BETWEEN 2 AND 100),
  CONSTRAINT article_comments_author_email_length CHECK (char_length(trim(author_email)) BETWEEN 5 AND 255),
  CONSTRAINT article_comments_body_length CHECK (char_length(trim(body)) BETWEEN 3 AND 2000)
);

ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_article_likes_article_id ON public.article_likes(article_id);
CREATE INDEX idx_article_shares_article_id ON public.article_shares(article_id);
CREATE INDEX idx_article_comments_article_status_created ON public.article_comments(article_id, status, created_at DESC);

CREATE POLICY "Published article likes readable by everyone"
ON public.article_likes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = article_likes.article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  ) OR public.is_staff(auth.uid())
);

CREATE POLICY "Anyone can like published articles"
ON public.article_likes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = article_likes.article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  )
);

CREATE POLICY "Visitors can remove their own article likes"
ON public.article_likes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = article_likes.article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  )
);

CREATE POLICY "Staff manage article likes"
ON public.article_likes
FOR ALL
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Published article shares readable by everyone"
ON public.article_shares
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = article_shares.article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  ) OR public.is_staff(auth.uid())
);

CREATE POLICY "Anyone can share published articles"
ON public.article_shares
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = article_shares.article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  )
);

CREATE POLICY "Staff manage article shares"
ON public.article_shares
FOR ALL
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Approved comments readable by everyone"
ON public.article_comments
FOR SELECT
USING (
  status = 'approved'
  AND EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = article_comments.article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  )
  OR public.is_staff(auth.uid())
);

CREATE POLICY "Anyone can submit comments on published articles"
ON public.article_comments
FOR INSERT
WITH CHECK (
  status = 'pending'
  AND EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = article_comments.article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  )
);

CREATE POLICY "Staff manage article comments"
ON public.article_comments
FOR ALL
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER update_article_comments_updated_at
BEFORE UPDATE ON public.article_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE VIEW public.article_interaction_counts
WITH (security_invoker = true) AS
SELECT
  n.id AS article_id,
  COALESCE(l.likes_count, 0)::integer AS likes_count,
  COALESCE(s.shares_count, 0)::integer AS shares_count,
  COALESCE(c.comments_count, 0)::integer AS comments_count
FROM public.news_articles n
LEFT JOIN (
  SELECT article_id, count(*) AS likes_count
  FROM public.article_likes
  GROUP BY article_id
) l ON l.article_id = n.id
LEFT JOIN (
  SELECT article_id, count(*) AS shares_count
  FROM public.article_shares
  GROUP BY article_id
) s ON s.article_id = n.id
LEFT JOIN (
  SELECT article_id, count(*) AS comments_count
  FROM public.article_comments
  WHERE status = 'approved'
  GROUP BY article_id
) c ON c.article_id = n.id
WHERE n.published = true AND n.published_date <= CURRENT_DATE;