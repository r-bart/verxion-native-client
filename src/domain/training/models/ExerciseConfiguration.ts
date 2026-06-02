export interface ExerciseConfigSet {
  setNumber: number;
  reps?: number;
  minReps?: number;
  maxReps?: number;
  weight?: number;
  rir?: number;
  restTime?: number;
  notes?: string;
}

export interface ExerciseConfigurationData {
  exerciseId: string;
  exerciseType: string;
  configuration: Record<string, unknown>;
  sets: ExerciseConfigSet[];
  restBetweenExercises: number;
  metadata: {
    name: string;
    target: string;
    equipment: string;
    instructions?: string;
  };
}
