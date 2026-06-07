import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { nutritionKeys } from "../keys";

/**
 * The food + recipe library. Reads via `GetFoodLibraryUseCase` against the curated
 * `GET /nutrition/food-library`. Search (`q`) and the group filter run SERVER-side,
 * so they flow into the query key + request. Keeps the previous page on screen
 * while a new query resolves (no flash to skeleton on keystroke).
 */
export function useFoodLibrary({ q, group }: { q: string; group: string }) {
  const uc = useDI((c) => c.getFoodLibrary);
  return useQuery({
    queryKey: nutritionKeys.foodLibrary(q, group),
    queryFn: () =>
      uc.execute({
        q: q || undefined,
        group: group || undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
