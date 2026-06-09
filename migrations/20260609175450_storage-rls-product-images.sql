alter table storage.objects enable row level security;

-- Public read for product-images (feeds, detail pages, OG cards must load images for everyone)
create policy product_images_public_read on storage.objects
  for select to authenticated, anon
  using (bucket = 'product-images');

-- Any authenticated user may upload their own object into product-images
create policy product_images_owner_insert on storage.objects
  for insert to authenticated
  with check (bucket = 'product-images' and uploaded_by = (select auth.jwt() ->> 'sub'));

-- Owner may update/delete their own objects (hygiene; not used by MVP but correct)
create policy product_images_owner_update on storage.objects
  for update to authenticated
  using      (bucket = 'product-images' and uploaded_by = (select auth.jwt() ->> 'sub'))
  with check (bucket = 'product-images' and uploaded_by = (select auth.jwt() ->> 'sub'));

create policy product_images_owner_delete on storage.objects
  for delete to authenticated
  using (bucket = 'product-images' and uploaded_by = (select auth.jwt() ->> 'sub'));

grant usage on schema storage to authenticated, anon;
grant select on storage.objects to authenticated, anon;
grant insert, update, delete on storage.objects to authenticated;
