-- Starter cold-drink products for the admin catalog.
-- These are intentionally inactive until the client reviews names, prices, stock and photos.

insert into public.products
  (slug, name, description, category, unit, price, image_url, featured, sort_order, available, active, in_stock)
values
  ('drink-refrigerante-lata', 'Refrigerante em Lata', 'Sugestão de bebida gelada para consumo no local.', 'Bebidas', 'unidade', null, null, false, 920, false, false, true),
  ('drink-refrigerante-600ml', 'Refrigerante 600ml', 'Sugestão de bebida gelada para consumo no local.', 'Bebidas', 'unidade', null, null, false, 921, false, false, true),
  ('drink-agua-mineral', 'Água Mineral', 'Sugestão de bebida gelada para consumo no local.', 'Bebidas', 'unidade', null, null, false, 922, false, false, true),
  ('drink-agua-com-gas', 'Água com Gás', 'Sugestão de bebida gelada para consumo no local.', 'Bebidas', 'unidade', null, null, false, 923, false, false, true),
  ('drink-suco-natural', 'Suco Natural', 'Sugestão de bebida gelada para consumo no local.', 'Bebidas', 'unidade', null, null, false, 924, false, false, true)
on conflict (slug) do nothing;
