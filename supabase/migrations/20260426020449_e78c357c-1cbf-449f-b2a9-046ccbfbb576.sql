-- Tighten contact_messages INSERT (no longer "WITH CHECK (true)")
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    length(trim(name)) > 0
    AND length(trim(email)) > 0
    AND length(trim(message)) > 0
    AND length(message) <= 5000
    AND status = 'new'
  );

-- Storage: replace broad SELECT (which lets clients enumerate all object names)
-- Public URLs still work because they go through the storage CDN, not the listing API.
DROP POLICY IF EXISTS "Public read site-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read documents" ON storage.objects;

CREATE POLICY "Staff list site-images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'site-images' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff list documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND public.is_staff(auth.uid()));
