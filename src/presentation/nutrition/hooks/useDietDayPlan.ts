import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { nutritionKeys } from "../keys";

/**
 * Today's resolved meal plan. Reads via `GetDietDayPlanUseCase` against the curated
 * `GET /nutrition/diet-day-plan`. The device timezone offset resolves "today" on
 * the server (`getTimezoneOffset` is minutes behind UTC, so negate it to send the
 * conventional east-positive offset).
 */
export function useDietDayPlan() {
  const uc = useDI((c) => c.getDietDayPlan);
  const tzOffsetMinutes = -new Date().getTimezoneOffset();
  return useQuery({
    queryKey: nutritionKeys.dietDayPlan(),
    queryFn: () => uc.execute(tzOffsetMinutes),
    staleTime: 60_000,
  });
}
