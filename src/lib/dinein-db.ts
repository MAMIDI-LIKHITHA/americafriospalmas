import { supabase } from "@/integrations/supabase/client";

import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, slugify } from "./products-db";

/** Catálogo do salão (Dine-In) — totalmente independente da loja online.
 *  Nenhuma função aqui toca a tabela `products`. */

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
  id?: string | undefined;
  name: string;
  description: string | null;
  active: boolean;
}) {
  if (input.id) {
    const { error } = await supabase
      .from("dinein_categories")
      .update({ name: input.name, description: input.description, active: input.active })
      .eq("id", input.id);
    if (error) throw error;
    return;
  }

  const base = slugify(input.name) || "categoria";
  const { error } = await supabase.from("dinein_categories").insert({
    name: input.name,
    description: input.description,
    active: input.active,
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
    category_id: input.category_id,
    name: input.name,
    description: input.description,
    price: input.price,
    image_url: input.image_url,
    available: input.available,
    featured: input.featured,
  };

  if (input.id) {
    const { error } = await supabase.from("dinein_items").update(payload).eq("id", input.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("dinein_items")
    .insert({ ...payload, sort_order: Date.now() % 100000 });
  if (error) throw error;
}

export async function deleteDineInItem(id: string) {
  const { error } = await supabase.from("dinein_items").delete().eq("id", id);
  if (error) throw error;
}

export async function setDineInItemSortOrder(id: string, sortOrder: number) {
  const { error } = await supabase
    .from("dinein_items")
    .update({ sort_order: sortOrder })
    .eq("id", id);
  if (error) throw error;
}

export async function setDineInCategorySortOrder(id: string, sortOrder: number) {
  const { error } = await supabase
    .from("dinein_categories")
    .update({ sort_order: sortOrder })
    .eq("id", id);
  if (error) throw error;
}

/** Envia a imagem do item para o bucket privado (prefixo próprio do cardápio). */
export async function uploadDineInImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error("Formato inválido. Use JPG, PNG ou WEBP.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Imagem muito grande. Tamanho máximo: 5 MB.");
  }
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `dine-in/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("Não foi possível enviar a imagem.");
  return path;
}
