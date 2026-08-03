-- Ajout d'un type de contenu pour distinguer Actualités vs Articles
ALTER TABLE public.news_articles
ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'news';

-- Contrainte de validation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'news_articles_content_type_check'
  ) THEN
    ALTER TABLE public.news_articles
      ADD CONSTRAINT news_articles_content_type_check
      CHECK (content_type IN ('news', 'article'));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_news_articles_content_type
  ON public.news_articles(content_type);