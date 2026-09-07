import { queryOptions } from "@tanstack/react-query";

import { getCatalog } from "./catalog.functions";
import type { Category, Product } from "./products";

export const catalogQueryOptions = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
  staleTime: 60_000,
});

export function flattenProducts(categories: Category[]): Product[] {
  return categories.flatMap((c) => c.products);
}
