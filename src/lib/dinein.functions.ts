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

    if (catError || itemError) throw new Error("Não foi possível carregar os produtos para consumo no local.");

    const rows = items ?? [];
    const paths = rows
      .map((r) => r.image_url)
      .filter((u): u is string => !!u && !/^https?:\/\//i.test(u));

    const signed = new Map<string, string>();
    if (paths.length > 0) {
      const { data: urls } = await supabase.storage
        .from("product-images")
        .createSignedUrls(paths, 3600);
      for (const u of urls ?? []) {
        if (u.path && u.signedUrl) signed.set(u.path, u.signedUrl);
      }
    }

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
              : (signed.get(i.image_url) ?? null)
            : null,
          available: i.available,
          featured: i.featured,
        })),
    }));
  },
);
