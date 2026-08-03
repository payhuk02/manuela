-- 1) Restrict ai_settings (which contains api_key) to admins only.
-- Editors no longer have direct table access; the public chatbot settings
-- remain available via the existing get_chatbot_public_settings() RPC.
DROP POLICY IF EXISTS "Editors manage ai_settings (no api_key)" ON public.ai_settings;

CREATE POLICY "Admins manage ai_settings"
ON public.ai_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


-- 2) Stop exposing team_members PII (email, phone, office_address, linkedin)
-- to anonymous visitors. The public site already reads from the
-- team_members_public view, which excludes these columns.
DROP POLICY IF EXISTS "Public can read published team members" ON public.team_members;

-- Recreate the public view without security_invoker so it runs with the
-- view owner's privileges and can serve published team members to anon
-- users without re-exposing the underlying table.
DROP VIEW IF EXISTS public.team_members_public;

CREATE VIEW public.team_members_public
WITH (security_invoker = off) AS
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
FROM public.team_members
WHERE published = true;

GRANT SELECT ON public.team_members_public TO anon, authenticated;