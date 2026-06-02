import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { todayKeys } from "../keys";

export function useNutritionDayState() {
  const today = new Date().toISOString().slice(0, 10);
  const uc = useDI((c) => c.getNutritionDayState);
  return useQuery({
    queryKey: todayKeys.nutritionDayState(today),
    queryFn: () => uc.execute(today),
  });
}
