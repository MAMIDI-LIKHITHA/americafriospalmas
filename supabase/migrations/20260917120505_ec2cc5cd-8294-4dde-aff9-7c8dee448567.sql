CREATE TABLE public.dinein_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.dinein_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dinein_categories TO authenticated;
GRANT ALL ON public.dinein_categories TO service_role;

ALTER TABLE public.dinein_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active dine-in categories are public"
  ON public.dinein_categories FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins can view all dine-in categories"
  ON public.dinein_categories FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert dine-in categories"
  ON public.dinein_categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update dine-in categories"
  ON public.dinein_categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete dine-in categories"
  ON public.dinein_categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.dinein_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.dinein_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  image_url text,
  available boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX dinein_items_category_idx ON public.dinein_items (category_id, sort_order);

GRANT SELECT ON public.dinein_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dinein_items TO authenticated;
GRANT ALL ON public.dinein_items TO service_role;

ALTER TABLE public.dinein_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dine-in items are public"
  ON public.dinein_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert dine-in items"
  ON public.dinein_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update dine-in items"
  ON public.dinein_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete dine-in items"
  ON public.dinein_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_dinein_categories_updated_at BEFORE UPDATE ON public.dinein_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dinein_items_updated_at BEFORE UPDATE ON public.dinein_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();