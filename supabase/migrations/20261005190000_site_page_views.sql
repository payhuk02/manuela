-- First-party page-view tracking for the admin Statistiques dashboard.
CREATE TABLE IF NOT EXISTS public.site_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  visitor_key text NOT NULL,
  lang text NOT NULL DEFAULT 'fr',
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_page_views_path_len CHECK (char_length(path) BETWEEN 1 AND 500),
  CONSTRAINT site_page_views_visitor_key_len CHECK (char_length(visitor_key) BETWEEN 16 AND 128),
  CONSTRAINT site_page_views_lang_len CHECK (char_length(lang) BETWEEN 2 AND 8),
  CONSTRAINT site_page_views_referrer_len CHECK (referrer IS NULL OR char_length(referrer) <= 500)
);

ALTER TABLE public.site_page_views ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS site_page_views_created_at_idx
  ON public.site_page_views (created_at DESC);

CREATE INDEX IF NOT EXISTS site_page_views_path_idx
  ON public.site_page_views (path);

CREATE INDEX IF NOT EXISTS site_page_views_visitor_key_idx
  ON public.site_page_views (visitor_key);

-- Anyone can record a page view (anonymous analytics).
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.site_page_views;
CREATE POLICY "Anyone can insert page views"
  ON public.site_page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Staff can read aggregates for the admin dashboard.
DROP POLICY IF EXISTS "Staff read page views" ON public.site_page_views;
CREATE POLICY "Staff read page views"
  ON public.site_page_views
  FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

-- Compact stats payload for the admin UI (avoids shipping full rows).
CREATE OR REPLACE FUNCTION public.get_site_visit_stats(_days integer DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  IF _days IS NULL OR _days < 1 OR _days > 365 THEN
    _days := 30;
  END IF;

  WITH bounds AS (
    SELECT
      (CURRENT_DATE - (_days - 1))::timestamptz AS since,
      date_trunc('month', now()) AS month_start
  ),
  scoped AS (
    SELECT v.path, v.visitor_key, v.created_at
    FROM public.site_page_views v, bounds b
    WHERE v.created_at >= b.since
  ),
  totals AS (
    SELECT
      (SELECT count(*)::int FROM public.site_page_views) AS total_visits,
      (SELECT count(DISTINCT visitor_key)::int FROM public.site_page_views) AS total_visitors,
      (SELECT count(*)::int FROM public.site_page_views v, bounds b WHERE v.created_at >= b.month_start) AS visits_month,
      (SELECT count(DISTINCT visitor_key)::int FROM public.site_page_views v, bounds b WHERE v.created_at >= b.month_start) AS visitors_month,
      (SELECT count(*)::int FROM scoped) AS visits_window,
      (SELECT count(DISTINCT visitor_key)::int FROM scoped) AS visitors_window
  ),
  daily AS (
    SELECT
      to_char(d::date, 'YYYY-MM-DD') AS date,
      coalesce(c.cnt, 0)::int AS count
    FROM generate_series(
      (SELECT since::date FROM bounds),
      CURRENT_DATE,
      interval '1 day'
    ) AS d
    LEFT JOIN (
      SELECT created_at::date AS day, count(*)::int AS cnt
      FROM scoped
      GROUP BY 1
    ) c ON c.day = d::date
    ORDER BY 1
  ),
  top_paths AS (
    SELECT path, count(*)::int AS count
    FROM scoped
    GROUP BY path
    ORDER BY count DESC
    LIMIT 10
  )
  SELECT json_build_object(
    'total_visits', t.total_visits,
    'total_visitors', t.total_visitors,
    'visits_month', t.visits_month,
    'visitors_month', t.visitors_month,
    'visits_window', t.visits_window,
    'visitors_window', t.visitors_window,
    'daily', coalesce((SELECT json_agg(row_to_json(daily)) FROM daily), '[]'::json),
    'top_paths', coalesce((SELECT json_agg(row_to_json(top_paths)) FROM top_paths), '[]'::json)
  )
  INTO result
  FROM totals t;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_site_visit_stats(integer) FROM public;
GRANT EXECUTE ON FUNCTION public.get_site_visit_stats(integer) TO authenticated;
