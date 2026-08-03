CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- The lint flags broad SELECT on storage.objects for public bucket. 
-- Files are still accessible by direct URL via the public CDN endpoint regardless of RLS.
-- We keep SELECT restricted to staff to prevent enumeration; public access uses /object/public/ URLs.
DROP POLICY IF EXISTS "Public read site-images" ON storage.objects;
CREATE POLICY "Staff list site-images" ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'site-images' AND public.is_staff(auth.uid()));
