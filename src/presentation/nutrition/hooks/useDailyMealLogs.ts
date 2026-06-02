import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { nutritionKeys } from "../keys";

export function useDailyMealLogs(date: string) {
  const uc = useDI((c) => c.getDailyMealLogs);
  return useQuery({
    queryKey: nutritionKeys.dailyMealLogs(date),
    queryFn: () => uc.execute(date),
    enabled: !!date,
  });
}
