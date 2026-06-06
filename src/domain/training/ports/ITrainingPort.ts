import type { Routine, RoutineDetail, WorkoutDayExercise } from "../models/Routine";
import type { ExerciseConfigurationData } from "../models/ExerciseConfiguration";
import type { ProgressionPlan } from "../models/ProgressionPlan";
import type { RoutineDashboard } from "../models/RoutineDashboard";
import type { SessionFeedPage, SessionFeedParams } from "../models/SessionFeed";
import type { ExerciseLibrary } from "../models/ExerciseLibrary";
import type { RoutineLibrary } from "../models/RoutineLibrary";
import type { RoutineDetailView } from "../models/RoutineDetailView";
import type { DayDetailView } from "../models/DayDetailView";
import type { SessionDetailView } from "../models/SessionDetailView";

export interface ITrainingPort {
  getRoutineDashboard(): Promise<RoutineDashboard>;
  getSessionFeed(params: SessionFeedParams): Promise<SessionFeedPage>;
  getExerciseLibrary(): Promise<ExerciseLibrary>;
  getRoutineLibrary(): Promise<RoutineLibrary>;
  getRoutineDetailView(id: string): Promise<RoutineDetailView>;
  getDayDetailView(dayId: string): Promise<DayDetailView>;
  getSessionDetailView(id: string): Promise<SessionDetailView>;
  getRoutines(): Promise<Routine[]>;
  getRoutineDetail(id: string): Promise<RoutineDetail>;
  getWorkoutDayExercises(routineId: string, dayId: string): Promise<WorkoutDayExercise[]>;
  getExerciseConfiguration(wdeId: string): Promise<ExerciseConfigurationData>;
  getProgressionPlan(workoutDayId: string): Promise<ProgressionPlan | null>;
}
