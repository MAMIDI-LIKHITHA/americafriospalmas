-- Starter eat-in products for the admin catalog.
-- These are intentionally inactive until the client reviews names, prices, stock and photos.

insert into public.products
  (slug, name, description, category, unit, price, image_url, featured, sort_order, available, active, in_stock)
values
  ('eat-in-espetinho-de-carne', 'Espetinho de Carne', 'Sugestão de item para consumo no local.', 'Para Comer Aqui', 'unidade', null, null, false, 900, false, false, true),
  ('eat-in-espetinho-de-frango', 'Espetinho de Frango', 'Sugestão de item para consumo no local.', 'Para Comer Aqui', 'unidade', null, null, false, 901, false, false, true),
  ('eat-in-linguica-na-chapa', 'Linguiça na Chapa', 'Sugestão de item para consumo no local.', 'Para Comer Aqui', 'unidade', null, null, false, 902, false, false, true),
  ('eat-in-pao-de-alho', 'Pão de Alho', 'Sugestão de item para consumo no local.', 'Para Comer Aqui', 'unidade', null, null, false, 903, false, false, true),
  ('eat-in-porcao-batata-frita', 'Porção de Batata Frita', 'Sugestão de item para consumo no local.', 'Para Comer Aqui', 'unidade', null, null, false, 904, false, false, true),
  ('eat-in-sanduiche-presunto-queijo', 'Sanduíche de Presunto e Queijo', 'Sugestão de item para consumo no local.', 'Para Comer Aqui', 'unidade', null, null, false, 905, false, false, true)
on conflict (slug) do nothing;
