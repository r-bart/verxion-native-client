import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { todayKeys } from "../keys";

/** The "Hoy" aggregate (ring + fronts + routine + agent note + timeline). */
export function useTodayDashboard(date?: string) {
  const uc = useDI((c) => c.getTodayDashboard);
  return useQuery({
    queryKey: todayKeys.dashboard(date),
    queryFn: () => uc.execute(date),
    staleTime: 60_000,
  });
}
