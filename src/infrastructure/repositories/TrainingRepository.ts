import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type {
  Routine,
  RoutineDetail,
  WorkoutDayExercise,
} from "@/domain/training/models/Routine";
import type { ExerciseConfigurationData } from "@/domain/training/models/ExerciseConfiguration";
import type { ProgressionPlan } from "@/domain/training/models/ProgressionPlan";
import type { RoutineDashboard } from "@/domain/training/models/RoutineDashboard";
import type {
  SessionFeedPage,
  SessionFeedParams,
} from "@/domain/training/models/SessionFeed";
import type { ExerciseLibrary } from "@/domain/training/models/ExerciseLibrary";
import type { RoutineLibrary } from "@/domain/training/models/RoutineLibrary";
import type { RoutineDetailView } from "@/domain/training/models/RoutineDetailView";
import type { DayDetailView } from "@/domain/training/models/DayDetailView";
import type { SessionDetailView } from "@/domain/training/models/SessionDetailView";
import type { HttpTrainingRepository } from "./HttpTrainingRepository";
import type { FixtureTrainingReadModelsRepository } from "./FixtureTrainingReadModelsRepository";

export class TrainingRepository implements ITrainingPort {
  constructor(
    private readonly http: HttpTrainingRepository,
    private readonly fixtures: FixtureTrainingReadModelsRepository
  ) {}

  getRoutineDashboard(): Promise<RoutineDashboard> {
    return this.http.getRoutineDashboard();
  }

  getSessionFeed(params: SessionFeedParams): Promise<SessionFeedPage> {
    return this.http.getSessionFeed(params);
  }

  getExerciseLibrary(): Promise<ExerciseLibrary> {
    return this.fixtures.getExerciseLibrary();
  }

  getRoutineLibrary(): Promise<RoutineLibrary> {
    return this.fixtures.getRoutineLibrary();
  }

  getRoutineDetailView(id: string): Promise<RoutineDetailView> {
    return this.fixtures.getRoutineDetailView(id);
  }

  getDayDetailView(dayId: string): Promise<DayDetailView> {
    return this.fixtures.getDayDetailView(dayId);
  }

  getSessionDetailView(id: string): Promise<SessionDetailView> {
    return this.http.getSessionDetailView(id);
  }

  getRoutines(): Promise<Routine[]> {
    return this.http.getRoutines();
  }

  getRoutineDetail(id: string): Promise<RoutineDetail> {
    return this.http.getRoutineDetail(id);
  }

  getWorkoutDayExercises(
    routineId: string,
    dayId: string
  ): Promise<WorkoutDayExercise[]> {
    return this.http.getWorkoutDayExercises(routineId, dayId);
  }

  getExerciseConfiguration(wdeId: string): Promise<ExerciseConfigurationData> {
    return this.http.getExerciseConfiguration(wdeId);
  }

  getProgressionPlan(workoutDayId: string): Promise<ProgressionPlan | null> {
    return this.http.getProgressionPlan(workoutDayId);
  }
}
