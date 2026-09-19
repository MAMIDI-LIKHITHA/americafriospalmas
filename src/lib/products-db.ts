import { supabase } from "@/integrations/supabase/client";

export type AdminProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number | null;
  unit: string;
  image_url: string | null;
  active: boolean;
  in_stock: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export const PRODUCT_CATEGORIES = [
  "Frios",
  "Queijos",
  "Presuntos",
  "Salames",
  "Embutidos",
  "Carnes",
  "Frango",
  "Linguiças",
  "Congelados",
  "Para Comer Aqui",
  "Bebidas",
  "Outros",
] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type ProductInput = {
  id?: string | undefined;
  name: string;
  category: string;
  description: string | null;
  price: number | null;
  unit: "kg" | "unidade";
  image_url: string | null;
  active: boolean;
  in_stock: boolean;
  featured: boolean;
  sort_order: number;
};

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Uploads an image to the public product-images bucket. Only admins can upload via RLS. */
export async function uploadProductImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error("Formato inválido. Use JPG, PNG ou WEBP.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Imagem muito grande. Tamanho máximo: 5 MB.");
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("Não foi possível enviar a imagem.");
  return path;
}

/** Creates or updates a product. Enforced admin-only by RLS on public.products. */
export async function saveProduct(input: ProductInput) {
  const payload = {
    name: input.name,
    category: input.category,
    description: input.description,
    price: input.price,
    unit: input.unit,
    image_url: input.image_url,
    active: input.active,
    in_stock: input.in_stock,
    featured: input.featured,
    sort_order: input.sort_order,
    available: input.active && input.in_stock,
  };

  if (input.id) {
    const { error } = await supabase.from("products").update(payload).eq("id", input.id);
    if (error) throw error;
    return;
  }

  const base = slugify(input.name) || "produto";
  const { error } = await supabase
    .from("products")
    .insert({ ...payload, slug: `${base}-${Math.random().toString(36).slice(2, 6)}` });
  if (error) throw error;
}

export async function deactivateProduct(id: string) {
  const { error } = await supabase
    .from("products")
    .update({ active: false, available: false })
    .eq("id", id);
  if (error) throw error;
}

export async function fetchAdminProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, category, price, unit, image_url, active, in_stock, featured, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AdminProduct[];
}

/** Returns a stable public image URL for storefront/admin previews. */
export async function resolveProductImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  return supabase.storage.from("product-images").getPublicUrl(imageUrl).data.publicUrl;
}
