import { queryOptions } from "@tanstack/react-query";

import { getDineInMenu } from "./dinein.functions";

export const dineInMenuQueryOptions = queryOptions({
  queryKey: ["dinein-menu"],
  queryFn: () => getDineInMenu(),
  staleTime: 60_000,
});
