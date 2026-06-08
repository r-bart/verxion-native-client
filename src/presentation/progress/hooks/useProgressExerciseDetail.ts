import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import type { ExerciseMetric } from "@/domain/progress/models/Progress";
import { progressKeys } from "../keys";

/** "Detalle de ejercicio" (tab Progreso). Omitting metric uses the server default (e1rm). */
export function useProgressExerciseDetail(slug: string, metric?: ExerciseMetric) {
  const uc = useDI((c) => c.getProgressExerciseDetail);
  return useQuery({
    queryKey: progressKeys.exercise(slug, metric),
    queryFn: () => uc.execute(slug, metric),
    staleTime: 60_000,
  });
}
