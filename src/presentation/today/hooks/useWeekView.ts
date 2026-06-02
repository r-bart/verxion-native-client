import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { todayKeys } from "../keys";

export function useWeekView() {
  const uc = useDI((c) => c.getWeekView);
  return useQuery({
    queryKey: todayKeys.weekView(),
    queryFn: () => uc.execute(),
  });
}
