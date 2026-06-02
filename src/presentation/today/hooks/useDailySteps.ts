import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { todayKeys } from "../keys";

export function useDailySteps() {
  const today = new Date().toISOString().slice(0, 10);
  const uc = useDI((c) => c.getDailySteps);
  return useQuery({
    queryKey: todayKeys.dailySteps(today),
    queryFn: () => uc.execute(today),
  });
}
