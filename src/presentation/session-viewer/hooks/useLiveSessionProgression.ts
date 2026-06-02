import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { sessionViewerKeys } from "../keys";
import type { ProgressionExercise } from "@/domain/training/models/ProgressionPlan";

export function useLiveSessionProgression(
  workoutDayId: string | undefined
): Map<string, ProgressionExercise> {
  const uc = useDI((c) => c.getProgressionPlan);

  const { data: plan } = useQuery({
    queryKey: sessionViewerKeys.progressionPlan(workoutDayId ?? ""),
    queryFn: () => uc.execute(workoutDayId!),
    enabled: !!workoutDayId,
    staleTime: 5 * 60 * 1000,
  });

  // React Compiler memoizes this return value; no manual useMemo needed.
  const map = new Map<string, ProgressionExercise>();
  if (!plan) return map;
  for (const ex of plan.exercises) {
    map.set(ex.exerciseId, ex);
  }
  return map;
}
