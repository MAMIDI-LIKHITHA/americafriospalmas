import { supabase } from "@/integrations/supabase/client";

import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, slugify } from "./products-db";

export type DineInCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  active: boolean;
};

export type DineInItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
  featured: boolean;
  sort_order: number;
};

export type DineInItemInput = {
  id?: string | undefined;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
  featured: boolean;
};

const STARTER_ITEMS = [
  ["Espetinho de Carne", "Espetinho para consumo no local.", 12],
  ["Espetinho de Frango", "Espetinho para consumo no local.", 10],
  ["Linguiça na Chapa", "Linguiça preparada na chapa para consumo no local.", 14],
  ["Pão de Alho", "Pão de alho para consumo no local.", 8],
  ["Porção de Batata Frita", "Porção para consumo no local.", 18],
  ["Sanduíche de Presunto e Queijo", "Sanduíche para consumo no local.", 15],
  ["Refrigerante em Lata", "Bebida gelada para consumo no local.", 9],
  ["Refrigerante 600ml", "Bebida gelada para consumo no local.", 12],
  ["Água Mineral", "Bebida gelada para consumo no local.", 6],
  ["Água com Gás", "Bebida gelada para consumo no local.", 7],
  ["Suco Natural", "Bebida gelada para consumo no local.", 15],
] as const;

export async function ensureDineInStarterCatalog() {
  const { data: category, error: categoryError } = await supabase
    .from("dinein_categories")
    .select("id")
    .eq("slug", "para-comer-aqui")
    .maybeSingle();

  if (categoryError) throw categoryError;

  let categoryId = category?.id;
  if (!categoryId) {
    const { data, error } = await supabase
      .from("dinein_categories")
      .insert({
        name: "Para Comer Aqui",
        slug: "para-comer-aqui",
        description: "Opções para consumo no local.",
        sort_order: 0,
        active: true,
      })
      .select("id")
      .single();
    if (error) throw error;
    categoryId = data.id;
  }

  const { data: existing, error: existingError } = await supabase
    .from("dinein_items")
    .select("name")
    .eq("category_id", categoryId);
  if (existingError) throw existingError;

  const existingNames = new Set((existing ?? []).map((x) => x.name.toLowerCase()));
  const missing = STARTER_ITEMS.filter(([name]) => !existingNames.has(name.toLowerCase()));

  if (missing.length) {
    const { error } = await supabase.from("dinein_items").insert(
      missing.map(([name, description, price], index) => ({
        category_id: categoryId,
        name,
        description,
        price,
        available: true,
        featured: false,
        sort_order: (existing?.length ?? 0) + index,
      })),
    );
    if (error) throw error;
  }
}

export async function fetchDineInCategories() {
  const { data, error } = await supabase
    .from("dinein_categories")
    .select("id, name, slug, description, sort_order, active")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DineInCategory[];
}

export async function fetchDineInItems() {
  const { data, error } = await supabase
    .from("dinein_items")
    .select("id, category_id, name, description, price, image_url, available, featured, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DineInItem[];
}

export async function saveDineInCategory(input: {
  id?: string;
  name: string;
  description: string | null;
  active: boolean;
}) {
  if (input.id) {
    const { error } = await supabase.from("dinein_categories").update({
      name: input.name, description: input.description, active: input.active,
    }).eq("id", input.id);
    if (error) throw error;
    return;
  }
  const base = slugify(input.name) || "categoria";
  const { error } = await supabase.from("dinein_categories").insert({
    name: input.name, description: input.description, active: input.active,
    slug: `${base}-${Math.random().toString(36).slice(2, 6)}`,
    sort_order: Date.now() % 100000,
  });
  if (error) throw error;
}

export async function deleteDineInCategory(id: string) {
  const { error } = await supabase.from("dinein_categories").delete().eq("id", id);
  if (error) throw error;
}

export async function saveDineInItem(input: DineInItemInput) {
  const payload = {
    category_id: input.category_id, name: input.name, description: input.description,
    price: input.price, image_url: input.image_url, available: input.available, featured: input.featured,
  };
  if (input.id) {
    const { error } = await supabase.from("dinein_items").update(payload).eq("id", input.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("dinein_items").insert({ ...payload, sort_order: Date.now() % 100000 });
  if (error) throw error;
}

export async function deleteDineInItem(id: string) {
  const { error } = await supabase.from("dinein_items").delete().eq("id", id);
  if (error) throw error;
}

export async function setDineInItemSortOrder(id: string, sortOrder: number) {
  const { error } = await supabase.from("dinein_items").update({ sort_order: sortOrder }).eq("id", id);
  if (error) throw error;
}

export async function setDineInCategorySortOrder(id: string, sortOrder: number) {
  const { error } = await supabase.from("dinein_categories").update({ sort_order: sortOrder }).eq("id", id);
  if (error) throw error;
}

export async function uploadDineInImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error("Formato inválido. Use JPG, PNG ou WEBP.");
  }
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Imagem muito grande. Tamanho máximo: 5 MB.");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `dine-in/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("Não foi possível enviar a imagem.");
  return path;
}
