import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import type { MeasurePeriod } from "@/domain/progress/models/Progress";
import { progressKeys } from "../keys";

/** "Detalle de medida" for one body/activity metric. Omitting period uses the server default. */
export function useProgressMeasure(metric: string, period?: MeasurePeriod) {
  const uc = useDI((c) => c.getProgressMeasure);
  return useQuery({
    queryKey: progressKeys.measure(metric, period),
    queryFn: () => uc.execute(metric, period),
    staleTime: 60_000,
  });
}
