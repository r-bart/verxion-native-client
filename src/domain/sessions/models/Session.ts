export interface Session {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  startedAt: string | null;
  completedAt: string | null;
}

export interface LiveSessionProgress {
  session: {
    id: string;
    name: string;
    status: "in_progress" | "paused";
    sessionType: string;
    startedAt: string;
    elapsedSeconds: number;
    routineId?: string;
    routineName?: string;
    workoutDayId?: string;
    workoutDayName?: string;
  };
  progress: {
    totalExercises: number;
    completedExercises: number;
    skippedExercises: number;
    remainingExercises: number;
    completionRate: number;
    totalVolume: number;
    totalSets: number;
    totalReps: number;
    executionClassification?: string;
  };
  exercises: LiveExerciseProgress[];
  previousSession: PreviousSessionComparison | null;
}

export interface PreviousSessionComparison {
  sessionId: string;
  date: string;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  durationSeconds: number;
  exercises: PreviousExerciseComparison[];
}

export interface PreviousExerciseComparison {
  exerciseId: string;
  exerciseName: string;
  completedSets: number;
  totalVolume: number;
  totalReps: number;
  peakWeight: number;
  averageRir?: number;
  sets: { setNumber: number; weight: number; reps: number; rir?: number; volume: number }[];
}

export interface SessionListItem {
  id: string;
  reportId: string;
  name: string;
  date: string | null;
  routineId: string | null;
  routineName: string | null;
  workoutDayId: string | null;
  workoutDayName: string | null;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  durationSeconds: number;
  completionRate: number;
  summaryGeneratedAt: string | null;
}

export interface SessionListParams {
  routineId?: string;
  workoutDayId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface LiveExerciseProgress {
  sessionExerciseId: string;
  exerciseId: string;
  exerciseName: string;
  bodyPart: string;
  target: string;
  orderIndex: number;
  sourceType: string;
  setType: string;
  status: "not_started" | "in_progress" | "completed" | "skipped";
  planned?: { sets: number; repScheme?: string; weight?: number; rir?: number };
  actual: {
    completedSets: number;
    totalVolume: number;
    totalReps: number;
    peakWeight: number;
    averageRir?: number;
    sets: { setNumber: number; weight: number; reps: number; rir?: number; volume: number }[];
  };
}
