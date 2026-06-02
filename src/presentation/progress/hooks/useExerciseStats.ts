import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { progressKeys } from "../keys";

export function useExerciseStats() {
  const uc = useDI((c) => c.getExerciseStats);
  return useQuery({
    queryKey: progressKeys.exercises(),
    queryFn: () => uc.execute(),
  });
}
