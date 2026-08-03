insert into storage.buckets (id, name, public)
values ('editor-media', 'editor-media', true)
on conflict (id) do update set public = true;

create policy "Editor media is publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'editor-media');

create policy "Staff can upload editor media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'editor-media' and public.is_staff(auth.uid()));

create policy "Staff can update editor media"
on storage.objects
for update
to authenticated
using (bucket_id = 'editor-media' and public.is_staff(auth.uid()))
with check (bucket_id = 'editor-media' and public.is_staff(auth.uid()));

create policy "Staff can delete editor media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'editor-media' and public.is_staff(auth.uid()));