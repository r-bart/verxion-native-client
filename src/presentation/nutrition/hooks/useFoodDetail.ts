import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { nutritionKeys } from "../keys";
import type { FoodKind } from "@/domain/nutrition/models/FoodDetail";

/**
 * A single food or recipe's detail. Reads via `GetFoodDetailUseCase` against the
 * curated `GET /nutrition/food-detail/{kind}/{id}`.
 */
export function useFoodDetail(kind: FoodKind, id: string) {
  const uc = useDI((c) => c.getFoodDetail);
  return useQuery({
    queryKey: nutritionKeys.foodDetail(kind, id),
    queryFn: () => uc.execute(kind, id),
    enabled: id !== "",
    staleTime: 60_000,
  });
}
