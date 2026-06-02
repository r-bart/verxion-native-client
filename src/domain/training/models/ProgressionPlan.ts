export interface ProgressionPlan {
  workoutDayId: string;
  workoutDayName: string;
  routineId: string;
  computedAt: string;
  globalGate: {
    canProgress: boolean;
    reason: "ready" | "low_readiness" | "low_adherence" | "insufficient_data";
  };
  exercises: ProgressionExercise[];
}

export interface ProgressionExercise {
  exerciseId: string;
  exerciseName: string;
  setType: string;
  action: "increase_weight" | "increase_reps" | "increase_sets" | "hold" | "deload";
  nextPrescription: {
    weight: number | null;
    repRange: { minReps: number; maxReps: number };
    rir: number;
    sets: number;
  };
  lastPerformance: {
    weight: number | null;
    avgReps: number;
    avgRir: number | null;
    totalVolume: number;
    sets: number;
  };
  confidence: number;
  basis: string;
  reasoning: string[];
}
