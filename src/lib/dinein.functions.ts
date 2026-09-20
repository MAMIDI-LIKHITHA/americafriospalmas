import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export type PublicMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  available: boolean;
  featured: boolean;
};

export type PublicMenuCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  items: PublicMenuItem[];
};

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getDineInMenu = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicMenuCategory[]> => {
    const supabase = publicClient();

    const [{ data: cats, error: catError }, { data: items, error: itemError }] =
      await Promise.all([
        supabase
          .from("dinein_categories")
          .select("id, name, slug, description, sort_order")
          .eq("active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("dinein_items")
          .select("id, category_id, name, description, price, image_url, available, featured, sort_order")
          .order("sort_order", { ascending: true }),
      ]);

    // Never substitute invented or stale products/prices when the database is unavailable.
    // Let the route error boundary show a controlled temporary-unavailable state instead.
    if (catError || itemError) {
      throw new Error("Dine-in menu is temporarily unavailable");
    }

    const rows = items ?? [];

    const publicImageUrl = (value: string | null) => {
      if (!value) return null;
      if (/^https?:\/\//i.test(value)) return value;
      return supabase.storage.from("product-images").getPublicUrl(value).data.publicUrl;
    };

    return (cats ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      items: rows
        .filter((i) => i.category_id === c.id)
        .map((i) => ({
          id: i.id,
          name: i.name,
          description: i.description,
          price: Number(i.price ?? 0),
          image: i.image_url
            ? /^https?:\/\//i.test(i.image_url)
              ? i.image_url
              : publicImageUrl(i.image_url)
            : null,
          available: i.available,
          featured: i.featured,
        })),
    }));
  },
);
