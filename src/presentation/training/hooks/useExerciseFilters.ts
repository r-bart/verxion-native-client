import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

export function useExerciseFilters() {
  const uc = useDI((c) => c.getExerciseFilters);
  return useQuery({
    queryKey: trainingKeys.exerciseFilters(),
    queryFn: () => uc.execute(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
