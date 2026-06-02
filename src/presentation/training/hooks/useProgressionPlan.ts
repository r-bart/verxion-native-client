import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

export function useProgressionPlan(workoutDayId: string | undefined) {
  const uc = useDI((c) => c.getProgressionPlan);
  return useQuery({
    queryKey: trainingKeys.progressionPlan(workoutDayId ?? ""),
    queryFn: () => uc.execute(workoutDayId!),
    enabled: !!workoutDayId,
  });
}
