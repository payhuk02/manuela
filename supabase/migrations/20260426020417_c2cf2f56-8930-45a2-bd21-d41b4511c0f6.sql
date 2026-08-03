-- =========================================================
-- 1) ROLES SYSTEM
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','editor')
  )
$$;

CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 2) AUDIT LOG
-- =========================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  target_email TEXT,
  details JSONB
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 3) SITE CONTENT (i18n key/value)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  lang TEXT NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (key, lang)
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_content readable by everyone"
  ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Staff manage site_content"
  ON public.site_content FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- =========================================================
-- 4) CONTACT INFO (single row, cabinet coordinates)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT DEFAULT '',
  hours_fr TEXT DEFAULT '',
  hours_en TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp_number TEXT DEFAULT '',
  appointment_url TEXT DEFAULT '',
  cabinet_name_fr TEXT DEFAULT '',
  cabinet_name_en TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_info readable by everyone"
  ON public.contact_info FOR SELECT USING (true);
CREATE POLICY "Staff manage contact_info"
  ON public.contact_info FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- Seed one row so the admin has something to edit
INSERT INTO public.contact_info DEFAULT VALUES;

-- =========================================================
-- 5) NEWS ARTICLES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang TEXT NOT NULL DEFAULT 'fr',
  title TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles readable by everyone"
  ON public.news_articles FOR SELECT
  USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage news"
  ON public.news_articles FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- =========================================================
-- 6) TEAM MEMBERS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  role_fr TEXT NOT NULL DEFAULT '',
  role_en TEXT NOT NULL DEFAULT '',
  bio_fr TEXT NOT NULL DEFAULT '',
  bio_en TEXT NOT NULL DEFAULT '',
  presentation_fr TEXT NOT NULL DEFAULT '',
  presentation_en TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  cv_url TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  office_address TEXT,
  is_founder BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published team members readable by everyone"
  ON public.team_members FOR SELECT
  USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage team"
  ON public.team_members FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- =========================================================
-- 7) EXPERTISES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.expertises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Briefcase',
  tagline TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  approach TEXT NOT NULL DEFAULT '',
  conclusion TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  methodology JSONB NOT NULL DEFAULT '[]'::jsonb,
  faq JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expertises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published expertises readable by everyone"
  ON public.expertises FOR SELECT
  USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage expertises"
  ON public.expertises FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- =========================================================
-- 8) CONTACT MESSAGES (form submissions)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'fr',
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins read contact messages"
  ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete contact messages"
  ON public.contact_messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 9) Re-attach updated_at triggers
-- =========================================================
DO $$ BEGIN
  CREATE TRIGGER trg_site_content_updated_at BEFORE UPDATE ON public.site_content
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_contact_info_updated_at BEFORE UPDATE ON public.contact_info
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_news_articles_updated_at BEFORE UPDATE ON public.news_articles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_team_members_updated_at BEFORE UPDATE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_expertises_updated_at BEFORE UPDATE ON public.expertises
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- 10) STORAGE BUCKETS
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read site-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-images');
CREATE POLICY "Staff write site-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff update site-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-images' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff delete site-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-images' AND public.is_staff(auth.uid()));

CREATE POLICY "Public read documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');
CREATE POLICY "Staff write documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff update documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff delete documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND public.is_staff(auth.uid()));
