CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE public.news_articles
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS og_image_url text;

CREATE OR REPLACE FUNCTION public.slugify(_input text)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower(public.unaccent(coalesce(_input, ''))),
        '[^a-z0-9]+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  )
$$;

UPDATE public.news_articles
SET slug = public.slugify(title) || '-' || substr(replace(id::text, '-', ''), 1, 6)
WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS news_articles_slug_unique
  ON public.news_articles (slug)
  WHERE slug IS NOT NULL;

ALTER TABLE public.expertises
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS og_image_url text;