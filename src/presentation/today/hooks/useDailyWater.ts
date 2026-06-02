import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { todayKeys } from "../keys";

export function useDailyWater() {
  const today = new Date().toISOString().slice(0, 10);
  const uc = useDI((c) => c.getDailyWater);
  return useQuery({
    queryKey: todayKeys.dailyWater(today),
    queryFn: () => uc.execute(today),
  });
}
