-- Restore public read for storefront images. The bucket must stay private
-- (workspace policy blocks public buckets), and product/dine-in images are
-- intentionally public marketing assets, so anonymous read is required for
-- the catalog and menu pages to render images.
CREATE POLICY "Product images are publicly readable"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images'::text);