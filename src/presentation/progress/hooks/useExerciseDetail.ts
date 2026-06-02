import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { progressKeys } from "../keys";

export function useExerciseDetail(exerciseId: string) {
  const uc = useDI((c) => c.getExerciseDetail);
  return useQuery({
    queryKey: progressKeys.exerciseDetail(exerciseId),
    queryFn: () => uc.execute(exerciseId),
    enabled: !!exerciseId,
  });
}
