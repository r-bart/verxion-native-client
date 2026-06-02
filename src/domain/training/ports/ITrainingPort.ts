import type { Routine, RoutineDetail, WorkoutDayExercise } from "../models/Routine";
import type { ExerciseConfigurationData } from "../models/ExerciseConfiguration";
import type { ProgressionPlan } from "../models/ProgressionPlan";

export interface ITrainingPort {
  getRoutines(): Promise<Routine[]>;
  getRoutineDetail(id: string): Promise<RoutineDetail>;
  getWorkoutDayExercises(routineId: string, dayId: string): Promise<WorkoutDayExercise[]>;
  getExerciseConfiguration(wdeId: string): Promise<ExerciseConfigurationData>;
  getProgressionPlan(workoutDayId: string): Promise<ProgressionPlan | null>;
}
