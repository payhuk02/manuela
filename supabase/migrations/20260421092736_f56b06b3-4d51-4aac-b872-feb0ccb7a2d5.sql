ALTER TABLE public.news_articles
ADD COLUMN IF NOT EXISTS body text NOT NULL DEFAULT '';