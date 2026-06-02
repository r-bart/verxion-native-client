import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { nutritionKeys } from "../keys";
import type { FoodSearchParams } from "@/domain/nutrition/models/Food";

export function useFoodSearch(params: FoodSearchParams) {
  const uc = useDI((c) => c.searchFoods);
  const queryParams: Record<string, string> = {};
  if (params.q) queryParams.q = params.q;

  return useQuery({
    queryKey: nutritionKeys.foods(queryParams),
    queryFn: () => uc.execute({ ...params, limit: params.limit ?? 50 }),
    enabled: !!params.q,
  });
}
