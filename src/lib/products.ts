// Imagens de categoria editáveis no código; produtos e dados comerciais vêm do banco.
import frios from "@/assets/frios.jpg";
import embutidos from "@/assets/embutidos.jpg";
import suinos from "@/assets/suinos.jpg";
import frangos from "@/assets/frangos.jpg";
import espetinhos from "@/assets/espetinhos.jpg";
import atacado from "@/assets/atacado.jpg";

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
  description: string | null;
  featured: boolean;
};

export type Category = {
  slug: string;
  name: string;
  image: string | null;
  description: string;
  items: string[];
  products: Product[];
};

/** Ordem, imagem e texto de cada categoria do catálogo público.
 *  Nome, preço, unidade e disponibilidade vêm sempre da tabela products. */
export const CATEGORY_META: {
  slug: string;
  name: string;
  image: string | null;
  description: string;
}[] = [
  {
    slug: "frios",
    name: "Frios",
    image: frios,
    description: "Queijos, mussarela fatiada, presunto e apresuntado, peito de peru.",
  },
  {
    slug: "queijos",
    name: "Queijos",
    image: frios,
    description: "Uma seleção de queijos para diferentes momentos e receitas.",
  },
  {
    slug: "presuntos",
    name: "Presuntos",
    image: frios,
    description: "Presuntos e opções fatiadas para sua casa ou negócio.",
  },
  {
    slug: "salames",
    name: "Salames",
    image: embutidos,
    description: "Salames e frios selecionados para servir e compartilhar.",
  },
  {
    slug: "embutidos",
    name: "Embutidos",
    image: embutidos,
    description: "Linguiças, salsichas, salames e mortadelas para o dia a dia e para revenda.",
  },
  {
    slug: "carnes",
    name: "Carnes",
    image: suinos,
    description: "Carnes e cortes selecionados para o dia a dia.",
  },
  {
    slug: "frango",
    name: "Frango",
    image: frangos,
    description: "Frango e cortes variados para diferentes preparos.",
  },
  {
    slug: "linguicas",
    name: "Linguiças",
    image: embutidos,
    description: "Linguiças para refeições, churrascos e revenda.",
  },
  {
    slug: "congelados",
    name: "Congelados",
    image: atacado,
    description: "Produtos congelados práticos para sua rotina.",
  },
  {
    slug: "outros",
    name: "Outros",
    image: espetinhos,
    description: "Outros produtos alimentícios disponíveis na América Frios.",
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
