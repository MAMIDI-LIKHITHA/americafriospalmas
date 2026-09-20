-- 1) dinein_items: replace tautological public SELECT with a real predicate.
--    Anon visitors only see available items in active categories;
--    admins keep full visibility through a dedicated authenticated policy.
DROP POLICY IF EXISTS "Dine-in items are public" ON public.dinein_items;

CREATE POLICY "Available dine-in items are public"
ON public.dinein_items
FOR SELECT
TO anon
USING (
  available = true
  AND EXISTS (
    SELECT 1 FROM public.dinein_categories c
    WHERE c.id = dinein_items.category_id AND c.active = true
  )
);

CREATE POLICY "Admins can view all dine-in items"
ON public.dinein_items
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2) storage.objects: the 'product-images' bucket holds public storefront
--    images, so the bucket itself is now public (set via storage API) and
--    the unbound SELECT policy is no longer needed. Admin write policies remain.
DROP POLICY IF EXISTS "Product images are publicly readable" ON storage.objects;