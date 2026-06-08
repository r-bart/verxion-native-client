import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";

/**
 * "Cómo se hace" — the exercise library entry behind the guide tab. Cross-module
 * by design: ProgressExerciseDetail carries the library `id`, and the guide
 * content (instructions, body part, equipment, muscles) lives in the exercise
 * catalog. Reuses the existing `getExerciseCatalogDetail` UC via useDI. Lazy:
 * only fetches once an `id` is known and `enabled` (the guide tab is open).
 */
export function useExerciseGuide(id: string | undefined, enabled: boolean) {
  const uc = useDI((c) => c.getExerciseCatalogDetail);
  return useQuery({
    queryKey: ["progress", "exercise-guide", id ?? "none"],
    queryFn: () => uc.execute(id as string),
    enabled: enabled && !!id,
    staleTime: 5 * 60_000,
  });
}
