ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

UPDATE public.products
SET sort_order = ordered.position
FROM (
  SELECT id, row_number() OVER (ORDER BY created_at ASC, name ASC)::integer AS position
  FROM public.products
) AS ordered
WHERE public.products.id = ordered.id
  AND public.products.sort_order = 0;