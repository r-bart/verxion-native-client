import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { todayKeys } from "../keys";

export function useDayState() {
  const today = new Date().toISOString().slice(0, 10);
  const uc = useDI((c) => c.getDayState);
  return useQuery({
    queryKey: todayKeys.dayState(today),
    queryFn: () => uc.execute(today),
  });
}
