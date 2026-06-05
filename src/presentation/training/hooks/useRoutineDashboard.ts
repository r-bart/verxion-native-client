import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

/**
 * The Entreno landing "Rutina" aggregate (active routine + spine + next session
 * + agent note). Reads via `GetRoutineDashboardUseCase`. The repository serves a
 * stub until the platform ships `GET /training/routine-dashboard`; the hook
 * itself is endpoint-agnostic and won't change when the real route lands.
 */
export function useRoutineDashboard() {
  const uc = useDI((c) => c.getRoutineDashboard);
  return useQuery({
    queryKey: trainingKeys.routineDashboard(),
    queryFn: () => uc.execute(),
    staleTime: 60_000,
  });
}
