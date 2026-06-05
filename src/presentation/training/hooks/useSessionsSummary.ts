import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

/**
 * The Entreno landing "Sesiones" recap (3 block stats + recent sessions). Reads
 * via `GetSessionsSummaryUseCase`; the repository stubs it until the platform
 * ships `GET /training/sessions-summary`.
 */
export function useSessionsSummary() {
  const uc = useDI((c) => c.getSessionsSummary);
  return useQuery({
    queryKey: trainingKeys.sessionsSummary(),
    queryFn: () => uc.execute(),
    staleTime: 60_000,
  });
}
