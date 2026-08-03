REVOKE SELECT, INSERT, UPDATE, DELETE ON public.article_likes FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.article_shares FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.article_comments FROM anon;
REVOKE SELECT ON public.article_interaction_counts FROM anon;

CREATE OR REPLACE FUNCTION public.get_article_interactions(_article_id uuid, _visitor_key text DEFAULT NULL)
RETURNS TABLE (
  likes_count integer,
  shares_count integer,
  comments_count integer,
  liked boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*)::integer FROM public.article_likes l WHERE l.article_id = _article_id) AS likes_count,
    (SELECT count(*)::integer FROM public.article_shares s WHERE s.article_id = _article_id) AS shares_count,
    (SELECT count(*)::integer FROM public.article_comments c WHERE c.article_id = _article_id AND c.status = 'approved') AS comments_count,
    CASE
      WHEN _visitor_key IS NULL THEN false
      ELSE EXISTS (
        SELECT 1 FROM public.article_likes l
        WHERE l.article_id = _article_id AND l.visitor_key = _visitor_key
      )
    END AS liked
  WHERE EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = _article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  );
$$;

CREATE OR REPLACE FUNCTION public.get_article_comments(_article_id uuid)
RETURNS TABLE (
  id uuid,
  author_name text,
  body text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.author_name, c.body, c.created_at
  FROM public.article_comments c
  WHERE c.article_id = _article_id
    AND c.status = 'approved'
    AND EXISTS (
      SELECT 1 FROM public.news_articles n
      WHERE n.id = _article_id
        AND n.published = true
        AND n.published_date <= CURRENT_DATE
    )
  ORDER BY c.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.set_article_like(_article_id uuid, _visitor_key text, _liked boolean)
RETURNS TABLE (likes_count integer, liked boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _visitor_key IS NULL OR char_length(_visitor_key) < 16 OR char_length(_visitor_key) > 128 THEN
    RAISE EXCEPTION 'Invalid visitor key';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = _article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  ) THEN
    RAISE EXCEPTION 'Article not available';
  END IF;

  IF _liked THEN
    INSERT INTO public.article_likes(article_id, visitor_key)
    VALUES (_article_id, _visitor_key)
    ON CONFLICT (article_id, visitor_key) DO NOTHING;
  ELSE
    DELETE FROM public.article_likes
    WHERE article_id = _article_id AND visitor_key = _visitor_key;
  END IF;

  RETURN QUERY
  SELECT count(*)::integer, EXISTS (
    SELECT 1 FROM public.article_likes l
    WHERE l.article_id = _article_id AND l.visitor_key = _visitor_key
  )
  FROM public.article_likes l
  WHERE l.article_id = _article_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_article_share(_article_id uuid, _platform text DEFAULT 'native', _visitor_key text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  safe_platform text := lower(trim(coalesce(_platform, 'native')));
  total integer;
BEGIN
  IF char_length(safe_platform) < 2 OR char_length(safe_platform) > 40 THEN
    safe_platform := 'native';
  END IF;

  IF _visitor_key IS NOT NULL AND (char_length(_visitor_key) < 16 OR char_length(_visitor_key) > 128) THEN
    _visitor_key := NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = _article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  ) THEN
    RAISE EXCEPTION 'Article not available';
  END IF;

  INSERT INTO public.article_shares(article_id, platform, visitor_key)
  VALUES (_article_id, safe_platform, _visitor_key);

  SELECT count(*)::integer INTO total
  FROM public.article_shares
  WHERE article_id = _article_id;

  RETURN total;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_article_comment(_article_id uuid, _author_name text, _author_email text, _body text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  safe_name text := trim(coalesce(_author_name, ''));
  safe_email text := lower(trim(coalesce(_author_email, '')));
  safe_body text := trim(coalesce(_body, ''));
BEGIN
  IF char_length(safe_name) < 2 OR char_length(safe_name) > 100 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;

  IF char_length(safe_email) < 5 OR char_length(safe_email) > 255 OR safe_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;

  IF char_length(safe_body) < 3 OR char_length(safe_body) > 2000 THEN
    RAISE EXCEPTION 'Invalid comment';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = _article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  ) THEN
    RAISE EXCEPTION 'Article not available';
  END IF;

  INSERT INTO public.article_comments(article_id, author_name, author_email, body, status)
  VALUES (_article_id, safe_name, safe_email, safe_body, 'pending')
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_article_interactions(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_article_comments(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_article_like(uuid, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_article_share(uuid, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_article_comment(uuid, text, text, text) TO anon, authenticated;