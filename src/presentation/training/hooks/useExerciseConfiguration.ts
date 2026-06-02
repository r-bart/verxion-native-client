import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

export function useExerciseConfiguration(wdeId: string) {
  const uc = useDI((c) => c.getExerciseConfiguration);
  return useQuery({
    queryKey: trainingKeys.exerciseConfiguration(wdeId),
    queryFn: () => uc.execute(wdeId),
    enabled: !!wdeId,
  });
}
