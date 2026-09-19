-- Starter cold-drink products for the admin catalog.
-- These are intentionally inactive until the client reviews names, prices, stock and photos.

insert into public.products
  (slug, name, description, category, unit, price, image_url, featured, sort_order, available, active, in_stock)
values
  ('drink-refrigerante-lata', 'Refrigerante em Lata', 'Bebida gelada para consumo no local.', 'Bebidas', 'unidade', 9.00, null, false, 920, true, true, true),
  ('drink-refrigerante-600ml', 'Refrigerante 600ml', 'Bebida gelada para consumo no local.', 'Bebidas', 'unidade', 12.00, null, false, 921, true, true, true),
  ('drink-agua-mineral', 'Água Mineral', 'Bebida gelada para consumo no local.', 'Bebidas', 'unidade', 6.00, null, false, 922, true, true, true),
  ('drink-agua-com-gas', 'Água com Gás', 'Bebida gelada para consumo no local.', 'Bebidas', 'unidade', 7.00, null, false, 923, true, true, true),
  ('drink-suco-natural', 'Suco Natural', 'Bebida gelada para consumo no local.', 'Bebidas', 'unidade', 15.00, null, false, 924, true, true, true)
on conflict (slug) do update set price = excluded.price, active = true, in_stock = true, available = true;
