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

    // GitHub fallback keeps the dedicated /menu page usable when the optional
    // dine-in tables have not yet been created/populated in Supabase.
    if (catError || itemError || !(cats ?? []).length) {
      return [{
        id: "github-dine-in",
        name: "Para Comer Aqui",
        slug: "para-comer-aqui",
        description: "Opções para consumo no local.",
        items: [
          { id: "eat-in-espetinho-de-carne", name: "Espetinho de Carne", description: "Espetinho para consumo no local.", price: 12, image: null, available: true, featured: false },
          { id: "eat-in-espetinho-de-frango", name: "Espetinho de Frango", description: "Espetinho para consumo no local.", price: 10, image: null, available: true, featured: false },
          { id: "eat-in-linguica-na-chapa", name: "Linguiça na Chapa", description: "Linguiça preparada na chapa para consumo no local.", price: 14, image: null, available: true, featured: false },
          { id: "eat-in-pao-de-alho", name: "Pão de Alho", description: "Pão de alho para consumo no local.", price: 8, image: null, available: true, featured: false },
          { id: "eat-in-porcao-batata-frita", name: "Porção de Batata Frita", description: "Porção para consumo no local.", price: 18, image: null, available: true, featured: false },
          { id: "eat-in-sanduiche-presunto-queijo", name: "Sanduíche de Presunto e Queijo", description: "Sanduíche para consumo no local.", price: 15, image: null, available: true, featured: false },
          { id: "drink-refrigerante-lata", name: "Refrigerante em Lata", description: "Bebida gelada para consumo no local.", price: 9, image: null, available: true, featured: false },
          { id: "drink-refrigerante-600ml", name: "Refrigerante 600ml", description: "Bebida gelada para consumo no local.", price: 12, image: null, available: true, featured: false },
          { id: "drink-agua-mineral", name: "Água Mineral", description: "Bebida gelada para consumo no local.", price: 6, image: null, available: true, featured: false },
          { id: "drink-agua-com-gas", name: "Água com Gás", description: "Bebida gelada para consumo no local.", price: 7, image: null, available: true, featured: false },
          { id: "drink-suco-natural", name: "Suco Natural", description: "Bebida gelada para consumo no local.", price: 15, image: null, available: true, featured: false },
        ],
      }];
    }

    const rows = items ?? [];
    const paths = rows
      .map((r) => r.image_url)
      .filter((u): u is string => !!u && !/^https?:\/\//i.test(u));

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
