export interface ProgressOverview {
  totalSessions: number;
  totalVolume: number;
  totalDuration: number;
  currentStreak: number;
  weekSummary: WeekSummary;
}

export interface WeekSummary {
  sessions: number;
  volume: number;
  adherence: number;
}

export interface BodyComposition {
  weightTrend: TrendPoint[];
  perimeterTrend: Record<string, TrendPoint[]>;
  currentWeight: number | null;
  weightChange: number | null;
  weightSummary?: TrendSummary;
  perimetersSummary?: Record<string, TrendSummary>;
}

export interface TrendPoint {
  date: string;
  value: number;
}

export interface TrendSummary {
  current: number | null;
  previous: number | null;
  change: number | null;
  changePercent: number | null;
}

export interface ExerciseStats {
  totalVolume: number;
  totalSets: number;
  uniqueExercises: number;
  trainingDays: number;
  muscleGroups: MuscleGroupStat[];
}

export interface MuscleGroupStat {
  name: string;
  volume: number;
  sets: number;
  rank: number;
}

export interface ExerciseDetail {
  exerciseId: string;
  exerciseName: string;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  maxWeight: number;
  sessionCount: number;
  sessions: ExerciseSessionEntry[];
}

export interface ExerciseSessionEntry {
  sessionId: string;
  date: string;
  volume: number;
  sets: number;
  reps: number;
  peakWeight: number;
}

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  exerciseId: string;
}

export interface TimelineEntry {
  month: string;
  sessions: number;
  volume: number;
  adherence: number;
  cardioMinutes: number;
  deltaPercent: number | null;
}

export interface WeekArchive {
  weekStart: string;
  weekEnd: string;
  sessions: number;
  targetSessions: number;
  volume: number;
  cardioMinutes: number;
}

export interface WeekDetail {
  weekStart: string;
  weekEnd: string;
  days: { date: string; sessions: number; volume: number }[];
  totals: { sessions: number; volume: number; cardioMinutes: number };
}

export interface MonthArchive {
  month: string;
  sessions: number;
  volume: number;
  adherence: number;
  cardioMinutes: number;
  vsPrevious: number | null;
}

export interface MonthDetail {
  month: string;
  weeks: { weekStart: string; sessions: number; volume: number }[];
  totals: { sessions: number; volume: number; adherence: number; cardioMinutes: number };
  narrative?: string;
}

export interface MuscleDistributionEntry {
  muscle: string;
  volume: number;
  percentage: number;
  exercises: number;
}

export interface SessionReport {
  id: string;
  name: string;
  date: string;
  duration: number;
  activeDuration?: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  peakWeight: number;
  completionRate: number;
  exerciseCompletionRate: number;
  averageRir?: number;
  executionClassification?: string;
  effortScore?: number;
  qualityScore?: number;
  pump?: number;
  muscleGroupDistribution: MuscleDistributionEntry[];
  exercises: SessionExerciseReport[];
}

export interface SessionExerciseReport {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  setType: string;
  plannedSets: number;
  completedSets: number;
  totalVolume: number;
  peakWeight: number;
  averageRir?: number;
  totalReps: number;
  sets: { setNumber: number; weight: number; reps: number; rir?: number; volume: number; isWarmup?: boolean }[];
  prBadge: string | null;
}
