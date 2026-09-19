-- Starter eat-in products for the admin catalog.

insert into public.products
  (slug, name, description, category, unit, price, image_url, featured, sort_order, available, active, in_stock)
values
  ('eat-in-espetinho-de-carne', 'Espetinho de Carne', 'Espetinho para consumo no local.', 'Para Comer Aqui', 'unidade', 12.00, null, false, 900, true, true, true),
  ('eat-in-espetinho-de-frango', 'Espetinho de Frango', 'Espetinho para consumo no local.', 'Para Comer Aqui', 'unidade', 10.00, null, false, 901, true, true, true),
  ('eat-in-linguica-na-chapa', 'Linguiça na Chapa', 'Linguiça preparada na chapa para consumo no local.', 'Para Comer Aqui', 'unidade', 14.00, null, false, 902, true, true, true),
  ('eat-in-pao-de-alho', 'Pão de Alho', 'Pão de alho para consumo no local.', 'Para Comer Aqui', 'unidade', 8.00, null, false, 903, true, true, true),
  ('eat-in-porcao-batata-frita', 'Porção de Batata Frita', 'Porção para consumo no local.', 'Para Comer Aqui', 'unidade', 18.00, null, false, 904, true, true, true),
  ('eat-in-sanduiche-presunto-queijo', 'Sanduíche de Presunto e Queijo', 'Sanduíche para consumo no local.', 'Para Comer Aqui', 'unidade', 15.00, null, false, 905, true, true, true)
on conflict (slug) do update set price = excluded.price, active = true, in_stock = true, available = true;