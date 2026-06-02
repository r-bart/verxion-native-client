import type {
  LiveExerciseProgress,
  PreviousExerciseComparison,
} from "@/domain/sessions/models/Session";

export type OverloadStatus = "progressed" | "maintained" | "below" | "no_data";

/**
 * Determines overload status for a single exercise.
 * Priority: volume > reps > RIR (intensity compensation).
 */
export function computeOverloadStatus(
  actual: {
    totalVolume: number;
    totalReps: number;
    averageRir?: number;
    completedSets: number;
  },
  prev: PreviousExerciseComparison | undefined
): OverloadStatus {
  if (!prev || prev.completedSets === 0 || actual.completedSets === 0) {
    return "no_data";
  }
  if (actual.totalVolume > prev.totalVolume) return "progressed";
  if (actual.totalVolume < prev.totalVolume) {
    // Intensity compensation: lower RIR with equal/less volume still counts
    if (
      actual.averageRir != null &&
      prev.averageRir != null &&
      actual.averageRir < prev.averageRir
    ) {
      return "progressed";
    }
    return "below";
  }
  // Volume equal — check reps
  if (actual.totalReps > prev.totalReps) return "progressed";
  if (actual.totalReps < prev.totalReps) return "below";
  return "maintained";
}

/**
 * Counts how many completed exercises beat their previous session.
 * Only counts exercises that have both actual data and a prior comparison.
 */
export function computeSessionProgressionScore(
  exercises: LiveExerciseProgress[],
  previousMap: Map<string, PreviousExerciseComparison>
): { progressed: number; total: number } {
  const eligible = exercises.filter(
    (ex) =>
      ex.status === "completed" &&
      ex.actual.completedSets > 0 &&
      previousMap.has(ex.exerciseId)
  );
  const progressed = eligible.filter((ex) => {
    const prev = previousMap.get(ex.exerciseId)!;
    return computeOverloadStatus(ex.actual, prev) === "progressed";
  });
  return { progressed: progressed.length, total: eligible.length };
}

/**
 * Computes weight delta for a single set vs the same set number in the previous session.
 * Returns null if no matching previous set or either weight is null (bodyweight).
 */
export function computeSetWeightDelta(
  actualWeight: number | null,
  prevSets: PreviousExerciseComparison["sets"] | undefined,
  setNumber: number
): number | null {
  if (actualWeight == null || !prevSets) return null;
  const prevSet = prevSets.find((s) => s.setNumber === setNumber);
  if (!prevSet || prevSet.weight == null) return null;
  return actualWeight - prevSet.weight;
}
