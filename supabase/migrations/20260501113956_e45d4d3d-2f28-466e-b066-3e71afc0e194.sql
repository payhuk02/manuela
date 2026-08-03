CREATE TABLE public.founder_profile_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title_fr TEXT NOT NULL DEFAULT '',
  title_en TEXT NOT NULL DEFAULT '',
  subtitle_fr TEXT NOT NULL DEFAULT '',
  subtitle_en TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Circle',
  meta TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_profile_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published founder items readable by everyone"
ON public.founder_profile_items
FOR SELECT
USING ((published = true) OR is_staff(auth.uid()));

CREATE POLICY "Staff manage founder items"
ON public.founder_profile_items
FOR ALL
TO authenticated
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER update_founder_profile_items_updated_at
BEFORE UPDATE ON public.founder_profile_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_founder_profile_items_cat_sort ON public.founder_profile_items(category, sort_order);