-- Product photos are storefront assets and must be readable without a user session.
-- Keep uploads restricted to authenticated admins via the existing storage RLS policies.
update storage.buckets
set public = true
where id = 'product-images';

-- Allow public read access to objects in the product-images bucket.
-- This is intentionally limited to this single bucket; upload/update/delete
-- permissions remain governed by the existing policies.
drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');
