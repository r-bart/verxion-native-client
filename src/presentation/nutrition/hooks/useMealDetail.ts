import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { nutritionKeys } from "../keys";

/**
 * One planned meal's detail (items + supplements). Reads via `GetMealDetailUseCase`
 * against the curated `GET /nutrition/meal-detail/{planId}/{mealId}`.
 */
export function useMealDetail(planId: string, mealId: string) {
  const uc = useDI((c) => c.getMealDetail);
  return useQuery({
    queryKey: nutritionKeys.mealDetail(planId, mealId),
    queryFn: () => uc.execute(planId, mealId),
    enabled: planId !== "" && mealId !== "",
    staleTime: 60_000,
  });
}
