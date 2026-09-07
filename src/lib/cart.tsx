import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { catalogQueryOptions } from "./catalog";
import type { Product } from "./products";

export type OrderMode = "varejo" | "atacado";

export type CartLine = { id: string; qty: number };

type CartState = {
  lines: CartLine[];
  mode: OrderMode;
  drawerOpen: boolean;
};

export type DetailedLine = {
  product: Product;
  qty: number;
  unitPrice: number;
  subtotal: number;
  wholesaleApplied: boolean;
};

type CartContextValue = {
  lines: DetailedLine[];
  mode: OrderMode;
  setMode: (mode: OrderMode) => void;
  count: number;
  total: number;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

const STORAGE_KEY = "af-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

export function unitPriceFor(product: Product, qty: number, mode: OrderMode) {
  const wholesaleApplied = mode === "atacado" && qty >= product.wholesaleMin;
  return { price: wholesaleApplied ? product.wholesale : product.retail, wholesaleApplied };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({ lines: [], mode: "varejo", drawerOpen: false });
  const { data: categories } = useQuery(catalogQueryOptions);

  const productsById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const c of categories ?? []) for (const p of c.products) map.set(p.id, p);
    return map;
  }, [categories]);

  // Restaura o carrinho após a hidratação (evita mismatch entre SSR e cliente).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Partial<CartState>;
      setState((s) => ({
        ...s,
        lines: Array.isArray(parsed.lines)
          ? parsed.lines.filter((l) => l && typeof l.id === "string" && l.qty > 0)
          : [],
        mode: parsed.mode === "atacado" ? "atacado" : "varejo",
      }));
    } catch {
      /* carrinho inválido — ignora */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ lines: state.lines, mode: state.mode }),
      );
    } catch {
      /* storage indisponível */
    }
  }, [state.lines, state.mode]);

  const value = useMemo<CartContextValue>(() => {
    const detailed: DetailedLine[] = state.lines.flatMap((line) => {
      const product = productsById.get(line.id);
      if (!product) return [];
      const { price, wholesaleApplied } = unitPriceFor(product, line.qty, state.mode);
      return [
        {
          product,
          qty: line.qty,
          unitPrice: price,
          subtotal: price * line.qty,
          wholesaleApplied,
        },
      ];
    });

    return {
      lines: detailed,
      mode: state.mode,
      setMode: (mode) => setState((s) => ({ ...s, mode })),
      count: detailed.reduce((n, l) => n + l.qty, 0),
      total: detailed.reduce((n, l) => n + l.subtotal, 0),
      add: (id, qty = 1) =>
        setState((s) => {
          if (!productsById.has(id)) return s;
          const exists = s.lines.find((l) => l.id === id);
          const lines = exists
            ? s.lines.map((l) => (l.id === id ? { ...l, qty: Math.min(999, l.qty + qty) } : l))
            : [...s.lines, { id, qty: Math.min(999, Math.max(1, qty)) }];
          return { ...s, lines };
        }),
      setQty: (id, qty) =>
        setState((s) => ({
          ...s,
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.id !== id)
              : s.lines.map((l) => (l.id === id ? { ...l, qty: Math.min(999, qty) } : l)),
        })),
      remove: (id) => setState((s) => ({ ...s, lines: s.lines.filter((l) => l.id !== id) })),
      clear: () => setState((s) => ({ ...s, lines: [] })),
      drawerOpen: state.drawerOpen,
      setDrawerOpen: (open) => setState((s) => ({ ...s, drawerOpen: open })),
    };
  }, [state, productsById]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
