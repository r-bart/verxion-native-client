import type { PreviousSessionComparison, PreviousExerciseComparison } from "@/domain/sessions/models/Session";

// React Compiler memoizes this return value; no manual useMemo needed.
export function usePreviousExerciseMap(
  previousSession: PreviousSessionComparison | null | undefined
): Map<string, PreviousExerciseComparison> {
  const map = new Map<string, PreviousExerciseComparison>();
  if (!previousSession) return map;
  for (const ex of previousSession.exercises) {
    map.set(ex.exerciseId, ex);
  }
  return map;
}
