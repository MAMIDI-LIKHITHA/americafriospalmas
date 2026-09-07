// Imagens de categoria (placeholder IA) — substituir pelas fotos reais do cliente.
import frios from "@/assets/frios.jpg";
import embutidos from "@/assets/embutidos.jpg";
import suinos from "@/assets/suinos.jpg";
import frangos from "@/assets/frangos.jpg";
import espetinhos from "@/assets/espetinhos.jpg";

export type Product = {
  /** slug do produto no banco — usado como identificador no carrinho e no checkout */
  id: string;
  name: string;
  unit: string;
  retail: number;
  wholesale: number;
  wholesaleMin: number;
  category: string;
  image: string | null;
};

export type Category = {
  slug: string;
  name: string;
  image: string;
  description: string;
  items: string[];
  products: Product[];
};

/** Ordem, imagem e texto de cada categoria do catálogo público.
 *  Nome, preço, unidade e disponibilidade vêm sempre da tabela products. */
export const CATEGORY_META: {
  slug: string;
  name: string;
  image: string;
  description: string;
}[] = [
  {
    slug: "espetinhos",
    name: "Espetinhos",
    image: espetinhos,
    description: "Espetinhos temperados de carne, frango, linguiça e queijo coalho.",
  },
  {
    slug: "frios",
    name: "Frios",
    image: frios,
    description: "Queijos, mussarela fatiada, presunto e apresuntado, peito de peru.",
  },
  {
    slug: "embutidos",
    name: "Embutidos",
    image: embutidos,
    description: "Linguiças, salsichas, salames e mortadelas para o dia a dia e para revenda.",
  },
  {
    slug: "suinos",
    name: "Suínos",
    image: suinos,
    description: "Cortes suínos frescos: costelinha, pernil, lombo, bisteca e panceta.",
  },
  {
    slug: "frangos",
    name: "Frangos",
    image: frangos,
    description: "Frango inteiro e cortes: coxa, sobrecoxa, filé de peito e asinha.",
  },
];

export const FALLBACK_CATEGORY_IMAGE = frios;

export function categorySlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
