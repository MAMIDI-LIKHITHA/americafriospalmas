-- Dedicated dine-in catalog: persistent categories/items for the admin panel and /menu.
create extension if not exists pgcrypto;

create table if not exists public.dinein_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.dinein_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.dinein_categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  image_url text,
  available boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists dinein_items_category_id_idx on public.dinein_items(category_id);
create index if not exists dinein_items_sort_order_idx on public.dinein_items(sort_order);

alter table public.dinein_categories enable row level security;
alter table public.dinein_items enable row level security;

drop policy if exists "Public can read active dine-in categories" on public.dinein_categories;
create policy "Public can read active dine-in categories"
on public.dinein_categories
for select
to anon, authenticated
using (active = true);

drop policy if exists "Admins manage dine-in categories" on public.dinein_categories;
create policy "Admins manage dine-in categories"
on public.dinein_categories
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Public can read available dine-in items" on public.dinein_items;
create policy "Public can read available dine-in items"
on public.dinein_items
for select
to anon, authenticated
using (
  available = true
  and exists (
    select 1 from public.dinein_categories c
    where c.id = category_id and c.active = true
  )
);

drop policy if exists "Admins manage dine-in items" on public.dinein_items;
create policy "Admins manage dine-in items"
on public.dinein_items
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

insert into public.dinein_categories (name, slug, description, sort_order, active)
values ('Para Comer Aqui', 'para-comer-aqui', 'Opções para consumo no local.', 0, true)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    active = true;

with cat as (
  select id from public.dinein_categories where slug = 'para-comer-aqui' limit 1
)
insert into public.dinein_items
  (category_id, name, description, price, available, featured, sort_order)
select
  cat.id,
  v.name,
  v.description,
  v.price,
  true,
  false,
  v.sort_order
from cat
cross join (
  values
    ('Espetinho de Carne', 'Espetinho para consumo no local.', 12::numeric, 1),
    ('Espetinho de Frango', 'Espetinho para consumo no local.', 10::numeric, 2),
    ('Linguiça na Chapa', 'Linguiça preparada na chapa para consumo no local.', 14::numeric, 3),
    ('Pão de Alho', 'Pão de alho para consumo no local.', 8::numeric, 4),
    ('Porção de Batata Frita', 'Porção para consumo no local.', 18::numeric, 5),
    ('Sanduíche de Presunto e Queijo', 'Sanduíche para consumo no local.', 15::numeric, 6),
    ('Refrigerante em Lata', 'Bebida gelada para consumo no local.', 9::numeric, 7),
    ('Refrigerante 600ml', 'Bebida gelada para consumo no local.', 12::numeric, 8),
    ('Água Mineral', 'Bebida gelada para consumo no local.', 6::numeric, 9),
    ('Água com Gás', 'Bebida gelada para consumo no local.', 7::numeric, 10),
    ('Suco Natural', 'Bebida gelada para consumo no local.', 15::numeric, 11)
) as v(name, description, price, sort_order)
where not exists (
  select 1
  from public.dinein_items existing
  where existing.category_id = cat.id and lower(existing.name) = lower(v.name)
);
