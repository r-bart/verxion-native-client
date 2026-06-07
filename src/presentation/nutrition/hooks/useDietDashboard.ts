import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { nutritionKeys } from "../keys";

/**
 * The Nutrición landing "Plan" aggregate (active diet + today's intake + meal
 * spine + supplements + next meal + agent note). Reads via
 * `GetDietDashboardUseCase` against the live `GET /nutrition/diet-dashboard`.
 */
export function useDietDashboard() {
  const uc = useDI((c) => c.getDietDashboard);
  return useQuery({
    queryKey: nutritionKeys.dietDashboard(),
    queryFn: () => uc.execute(),
    staleTime: 60_000,
  });
}
