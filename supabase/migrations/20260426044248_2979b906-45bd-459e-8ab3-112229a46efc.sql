-- 1. Sécuriser team_members : créer une vue publique sans PII sensible
-- (email, phone, office_address restent visibles uniquement au staff via la table de base)

CREATE OR REPLACE VIEW public.team_members_public
WITH (security_invoker = on) AS
SELECT
  id,
  name,
  role_fr,
  role_en,
  bio_fr,
  bio_en,
  presentation_fr,
  presentation_en,
  photo_url,
  cv_url,
  linkedin_url,
  is_founder,
  published,
  sort_order,
  created_at,
  updated_at
FROM public.team_members;

-- Bloquer la lecture publique des champs sensibles sur la table de base.
-- On remplace l'ancienne policy publique par une policy staff-only pour SELECT.
DROP POLICY IF EXISTS "Published team members readable by everyone" ON public.team_members;

CREATE POLICY "Staff read team_members full"
ON public.team_members
FOR SELECT
USING (is_staff(auth.uid()));

-- (la policy "Staff manage team" existante couvre INSERT/UPDATE/DELETE)

-- 2. Restreindre la table profiles : plus de SELECT public.
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Staff read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_staff(auth.uid()));