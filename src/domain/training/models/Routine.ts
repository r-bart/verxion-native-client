export interface Routine {
  id: string;
  name: string;
  description: string | null;
  status: "ready" | "active" | "paused" | "completed" | "deleted";
  goal: string | null;
  isActive: boolean;
  isArchived: boolean;
  startDate: string | null;
  endDate: string | null;
  maxSessions: number | null;
  sessionsCompleted: number;
  trackSteps: boolean;
  dailyStepsTargetTraining: number | null;
  dailyStepsTargetRest: number | null;
  totalPausedDays: number;
  pausedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutDay {
  id: string;
  routineId: string;
  name: string;
  description?: string;
  orderIndex: number;
  dayType: string;
  restBetweenExercises: number;
  createdAt: string;
  updatedAt: string;
}

// --- Exercise configuration types (read-only display) ---

export interface RepScheme {
  minReps: number;
  maxReps: number;
}

export interface CadenceConfig {
  eccentric: number;
  bottomPause: number;
  concentric: number;
  topPause: number;
}

export interface RegularSetConfig {
  sets: number;
  rir: number;
  weight?: number;
  cadence?: CadenceConfig;
  restBetweenSets: number;
  repSchemes: RepScheme[];
}

export interface DropSetConfig {
  drops: number;
  restBetweenDrops: number;
  totalSets: number;
  initialWeight?: number;
  weightReductionPercentage?: number;
  rir: number;
  repSchemes: RepScheme[];
  cadence?: CadenceConfig;
}

export interface AmrapConfig {
  sets: number;
  timeLimit: number;
  weight?: number;
  rir: number;
  cadence?: CadenceConfig;
  restBetweenSets: number;
  targetReps?: number;
  minimumReps?: number;
}

export interface PyramidStage {
  weight?: number;
  repScheme: RepScheme;
  rir?: number;
}

export interface PyramidConfig {
  type: "ascending" | "descending" | "full";
  stages: PyramidStage[];
  restBetweenSets: number;
  cadence?: CadenceConfig;
  rir: number;
}

export interface RestPauseConfig {
  totalSets: number;
  rir: number;
  restPauseSeconds: number;
  restBetweenSets: number;
  mainSetRepScheme: RepScheme;
  miniSetRepSchemes: RepScheme[];
  cadence?: CadenceConfig;
}

export type SingleExerciseConfig =
  | RegularSetConfig
  | DropSetConfig
  | AmrapConfig
  | PyramidConfig
  | RestPauseConfig;

export interface MultiExerciseEntry {
  exerciseId: string;
  order: number;
  configuration: {
    repSchemes: RepScheme[];
    weight?: number;
    rir: number;
    cadence?: CadenceConfig;
  };
}

export interface MultiExerciseConfig {
  type: "superset" | "giant_set";
  exercises: MultiExerciseEntry[];
  rounds: number;
  restBetweenExercises: number;
  restBetweenRounds: number;
}

export type SetType =
  | "regular"
  | "drop_set"
  | "superset"
  | "amrap"
  | "pyramid"
  | "rest_pause"
  | "giant_set";

export interface WorkoutDayExercise {
  id: string;
  workoutDayId: string;
  exerciseId: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
  orderIndex: number;
  sets?: number;
  single_exercise_config?: SingleExerciseConfig;
  multi_exercise?: MultiExerciseConfig;
  setType?: SetType;
  notes?: string;
  restBetweenExercises?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineDetail {
  routine: Routine;
  workoutDays: WorkoutDay[];
}
