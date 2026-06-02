import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

export function useExerciseDetail(id: string) {
  const uc = useDI((c) => c.getExerciseCatalogDetail);
  return useQuery({
    queryKey: trainingKeys.exerciseDetail(id),
    queryFn: () => uc.execute(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
  });
}
