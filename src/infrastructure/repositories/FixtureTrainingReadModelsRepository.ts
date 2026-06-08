import type { ExerciseLibrary } from "@/domain/training/models/ExerciseLibrary";
import type { RoutineLibrary } from "@/domain/training/models/RoutineLibrary";
import type { RoutineDetailView } from "@/domain/training/models/RoutineDetailView";
import type { DayDetailView } from "@/domain/training/models/DayDetailView";
import { exerciseLibraryFixture } from "@/domain/training/__fixtures__/exerciseLibraryFixture";
import { routineLibraryFixture } from "@/domain/training/__fixtures__/routineLibraryFixture";
import { routineDetailFixtureFor } from "@/domain/training/__fixtures__/routineDetailFixture";
import { dayDetailFixtureFor } from "@/domain/training/__fixtures__/dayDetailFixture";

/**
 * Temporary fixture-backed training read-models. Keep this explicit so the live
 * HTTP repository does not silently serve mock data while these platform
 * read-models are still pending.
 */
export class FixtureTrainingReadModelsRepository {
  async getExerciseLibrary(): Promise<ExerciseLibrary> {
    return exerciseLibraryFixture;
  }

  async getRoutineLibrary(): Promise<RoutineLibrary> {
    return routineLibraryFixture;
  }

  async getRoutineDetailView(id: string): Promise<RoutineDetailView> {
    return routineDetailFixtureFor(id);
  }

  async getDayDetailView(dayId: string): Promise<DayDetailView> {
    return dayDetailFixtureFor(dayId);
  }
}
