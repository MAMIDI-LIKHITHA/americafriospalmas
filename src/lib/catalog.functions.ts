import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import {
  CATEGORY_META,
  FALLBACK_CATEGORY_IMAGE,
  categorySlug,
  type Category,
  type Product,
} from "./products";

/** Cliente público (chave publicável) — só enxerga o que a RLS libera para visitantes:
 *  products com available = true. Nenhuma escrita é possível por aqui. */
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

export const getCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<Category[]> => {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug, name, description, category, unit, price, wholesale_price, wholesale_min, image_url, featured, sort_order")
      .eq("available", true)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw new Error("Não foi possível carregar o catálogo.");

    const rows = (data ?? []).filter((r) => r.slug && Number(r.price ?? 0) > 0);

    // Product images are public storefront assets. image_url stores the path
    // inside the product-images bucket, so use stable public URLs instead of
    // expiring signed URLs that depend on authenticated storage access.
    const imageUrl = (value: string | null) => {
      if (!value) return null;
      if (/^https?:\/\//i.test(value)) return value;
      return supabase.storage.from("product-images").getPublicUrl(value).data.publicUrl;
    };

    const byCategory = new Map<string, Product[]>();
    for (const r of rows) {
      const retail = Number(r.price ?? 0);
      const wholesale = Number(r.wholesale_price ?? retail) || retail;

      const product: Product = {
        id: r.slug!,
        name: r.name,
        unit: r.unit,
        retail,
        wholesale,
        wholesaleMin: Number(r.wholesale_min ?? 1) || 1,
        category: r.category,
        image: imageUrl(r.image_url),
        description: r.description,
        featured: r.featured,
      };
      const list = byCategory.get(r.category);
      if (list) list.push(product);
      else byCategory.set(r.category, [product]);
    }

    const categories: Category[] = [];
    const used = new Set<string>();

    for (const meta of CATEGORY_META) {
      const products = byCategory.get(meta.name);
      if (!products || products.length === 0) continue;
      used.add(meta.name);
      categories.push({ ...meta, items: products.map((p) => p.name), products });
    }

    for (const [name, products] of byCategory) {
      if (used.has(name)) continue;
      categories.push({
        slug: categorySlug(name),
        name,
        image: FALLBACK_CATEGORY_IMAGE,
        description: `Confira nossa seleção de ${name.toLowerCase()}.`,
        items: products.map((p) => p.name),
        products,
      });
    }

    return categories;
  },
);
