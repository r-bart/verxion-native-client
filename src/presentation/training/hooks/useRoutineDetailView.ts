import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

/**
 * The "Detalle de rutina" aggregate for one routine (metadata + day rotation).
 * Read via `GetRoutineDetailViewUseCase`; the repository stubs it until the
 * platform ships `GET /training/routines/{id}/detail`.
 */
export function useRoutineDetailView(id: string) {
  const uc = useDI((c) => c.getRoutineDetailView);
  return useQuery({
    queryKey: trainingKeys.routineDetailView(id),
    queryFn: () => uc.execute(id),
    staleTime: 5 * 60_000,
  });
}
