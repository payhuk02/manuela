
-- Editorial AI assistant settings (separate from chatbot ai_settings)
CREATE TABLE IF NOT EXISTS public.editorial_ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean NOT NULL DEFAULT true,
  provider text NOT NULL DEFAULT 'lovable',
  model text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  api_key text,
  firm_context text NOT NULL DEFAULT '',
  system_prompt_fr text NOT NULL DEFAULT '',
  system_prompt_en text NOT NULL DEFAULT '',
  tone text NOT NULL DEFAULT 'professionnel, précis, sobre, accessible',
  target_audience text NOT NULL DEFAULT 'décideurs, chefs d''entreprise, investisseurs',
  brand_keywords text[] NOT NULL DEFAULT ARRAY[]::text[],
  news_min_words integer NOT NULL DEFAULT 180,
  news_max_words integer NOT NULL DEFAULT 400,
  article_min_words integer NOT NULL DEFAULT 600,
  article_max_words integer NOT NULL DEFAULT 1200,
  seo_title_min integer NOT NULL DEFAULT 50,
  seo_title_max integer NOT NULL DEFAULT 60,
  seo_desc_min integer NOT NULL DEFAULT 140,
  seo_desc_max integer NOT NULL DEFAULT 160,
  temperature numeric NOT NULL DEFAULT 0.7,
  max_retries integer NOT NULL DEFAULT 2,
  request_timeout_ms integer NOT NULL DEFAULT 60000,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.editorial_ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage editorial_ai_settings"
ON public.editorial_ai_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff read editorial_ai_settings"
ON public.editorial_ai_settings
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE TRIGGER editorial_ai_settings_set_updated_at
BEFORE UPDATE ON public.editorial_ai_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with one row using the previous in-code defaults
INSERT INTO public.editorial_ai_settings (firm_context, system_prompt_fr, system_prompt_en, brand_keywords)
SELECT
  'Tu rédiges pour le Cabinet Manuela DIABATE, cabinet d''avocats international basé à Paris (3 avenue des Ternes, 75017). Domaines : droit des affaires, OHADA, droit bancaire et financier, droit immobilier, droit pénal des affaires, droit des étrangers, fiscalité, arbitrage international. Forte présence France ↔ Côte d''Ivoire / Afrique de l''Ouest.',
  'Reste factuel : pas de citation de jurisprudence inventée, pas de chiffres inventés. Privilégie un ton clair pour des décideurs et chefs d''entreprise.',
  'Stay factual: do not invent case law or figures. Keep a clear, precise tone for executives and decision makers.',
  ARRAY['Cabinet Manuela DIABATE','OHADA','droit des affaires','arbitrage international','Paris','Abidjan']
WHERE NOT EXISTS (SELECT 1 FROM public.editorial_ai_settings);
