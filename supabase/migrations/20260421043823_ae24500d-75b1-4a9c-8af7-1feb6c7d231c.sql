-- Create expertises table
CREATE TABLE public.expertises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Briefcase',
  tagline TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  conclusion TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  approach TEXT NOT NULL DEFAULT '',
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  methodology JSONB NOT NULL DEFAULT '[]'::jsonb,
  faq JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expertises ENABLE ROW LEVEL SECURITY;

-- Public can read published expertises
CREATE POLICY "Public read published expertises"
  ON public.expertises FOR SELECT
  USING (published = true);

-- Staff can read all expertises (drafts included)
CREATE POLICY "Staff read all expertises"
  ON public.expertises FOR SELECT
  TO authenticated
  USING (is_staff(auth.uid()));

-- Staff can manage expertises
CREATE POLICY "Staff manage expertises"
  ON public.expertises FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

-- Auto-update updated_at
CREATE TRIGGER set_expertises_updated_at
  BEFORE UPDATE ON public.expertises
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_set_updated_at();

-- Index on slug for fast lookups
CREATE INDEX idx_expertises_slug ON public.expertises(slug);
CREATE INDEX idx_expertises_sort_order ON public.expertises(sort_order);
