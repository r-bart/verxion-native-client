import type { Routine, RoutineDetail, WorkoutDayExercise } from "../models/Routine";
import type { ExerciseConfigurationData } from "../models/ExerciseConfiguration";
import type { ProgressionPlan } from "../models/ProgressionPlan";
import type { RoutineDashboard } from "../models/RoutineDashboard";
import type { SessionsSummary } from "../models/SessionsSummary";

export interface ITrainingPort {
  getRoutineDashboard(): Promise<RoutineDashboard>;
  getSessionsSummary(): Promise<SessionsSummary>;
  getRoutines(): Promise<Routine[]>;
  getRoutineDetail(id: string): Promise<RoutineDetail>;
  getWorkoutDayExercises(routineId: string, dayId: string): Promise<WorkoutDayExercise[]>;
  getExerciseConfiguration(wdeId: string): Promise<ExerciseConfigurationData>;
  getProgressionPlan(workoutDayId: string): Promise<ProgressionPlan | null>;
}
