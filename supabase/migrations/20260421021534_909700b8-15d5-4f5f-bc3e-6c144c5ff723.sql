-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','editor'))
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Site content (key/lang/value)
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  lang TEXT NOT NULL CHECK (lang IN ('fr','en')),
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (key, lang)
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Staff write site_content" ON public.site_content FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_site_content_updated BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- News
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang TEXT NOT NULL CHECK (lang IN ('fr','en')),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published news" ON public.news_articles FOR SELECT USING (published = true);
CREATE POLICY "Staff read all news" ON public.news_articles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage news" ON public.news_articles FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_news_updated BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Team
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
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
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read team" ON public.team_members FOR SELECT USING (published = true);
CREATE POLICY "Staff read all team" ON public.team_members FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage team" ON public.team_members FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_team_updated BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Contact info (singleton row)
CREATE TABLE public.contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL DEFAULT '',
  hours_fr TEXT NOT NULL DEFAULT '',
  hours_en TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  whatsapp_number TEXT NOT NULL DEFAULT '',
  appointment_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read contact" ON public.contact_info FOR SELECT USING (true);
CREATE POLICY "Staff manage contact" ON public.contact_info FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_contact_updated BEFORE UPDATE ON public.contact_info FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.contact_info (address, hours_fr, hours_en, email, phone, whatsapp_number, appointment_url)
VALUES ('12 avenue Foch, 75116 Paris', 'Lun – Ven · 9h – 19h', 'Mon – Fri · 9am – 7pm', 'contact@maison-aurelius.fr', '+33 1 00 00 00 00', '33600000000', 'https://calendly.com/maison-aurelius');

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('site-images','site-images', true);

CREATE POLICY "Public read site-images" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');
CREATE POLICY "Staff upload site-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-images' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff update site-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-images' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff delete site-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-images' AND public.is_staff(auth.uid()));
