import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import type { ProgressPeriod } from "@/domain/progress/models/Progress";
import { progressKeys } from "../keys";

/** "Progreso" madre (Resumen + Métricas). Omitting period uses the server default. */
export function useProgressOverview(period?: ProgressPeriod) {
  const uc = useDI((c) => c.getProgressOverview);
  return useQuery({
    queryKey: progressKeys.overview(period),
    queryFn: () => uc.execute(period),
    staleTime: 60_000,
  });
}
