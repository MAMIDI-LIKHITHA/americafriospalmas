-- Allow authenticated admins to permanently remove orders from the admin panel.
-- order_items are deleted first by the application, then the parent order.

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders"
on public.orders
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can delete order items" on public.order_items;
create policy "Admins can delete order items"
on public.order_items
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));
