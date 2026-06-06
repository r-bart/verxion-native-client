import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

/**
 * The "Detalle de sesión" aggregate for one completed session (the persisted
 * report: tiles, per-set breakdown, rating, muscle split). Read via
 * `GetSessionDetailViewUseCase` → live `GET /api/v1/sessions/{id}/detail`.
 */
export function useSessionDetailView(id: string) {
  const uc = useDI((c) => c.getSessionDetailView);
  return useQuery({
    queryKey: trainingKeys.sessionDetailView(id),
    queryFn: () => uc.execute(id),
    staleTime: 5 * 60_000,
  });
}
