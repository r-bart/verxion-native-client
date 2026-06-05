import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type { Routine, RoutineDetail, WorkoutDay, WorkoutDayExercise } from "@/domain/training/models/Routine";
import type { ExerciseConfigurationData } from "@/domain/training/models/ExerciseConfiguration";
import type { ProgressionPlan, ProgressionExercise } from "@/domain/training/models/ProgressionPlan";
import type { RoutineDashboard } from "@/domain/training/models/RoutineDashboard";
import type { SessionsSummary } from "@/domain/training/models/SessionsSummary";
import { routineDashboardFixture } from "@/domain/training/__fixtures__/routineDashboardFixture";
import { sessionsSummaryFixture } from "@/domain/training/__fixtures__/sessionsSummaryFixture";
import { apiClient, ApiError } from "../api/apiClient";

export class HttpTrainingRepository implements ITrainingPort {
  /**
   * Entreno landing "Rutina" aggregate — proposed platform read-model.
   *
   * STUB: the platform endpoint isn't built yet, so this returns the typed
   * contract fixture (same justified pattern as `HealthKitRepository`). When
   * `GET /training/routine-dashboard` ships, swap the body for:
   *   `return apiClient.get<RoutineDashboard>("/training/routine-dashboard");`
   * and register the endpoint in the contract drift guard.
   */
  async getRoutineDashboard(): Promise<RoutineDashboard> {
    return routineDashboardFixture;
  }

  /**
   * Entreno landing "Sesiones" recap — proposed platform read-model.
   * STUB until `GET /training/sessions-summary` ships; then swap for:
   *   `return apiClient.get<SessionsSummary>("/training/sessions-summary");`
   */
  async getSessionsSummary(): Promise<SessionsSummary> {
    return sessionsSummaryFixture;
  }

  async getRoutines(): Promise<Routine[]> {
    return apiClient.get<Routine[]>("/routines");
  }

  async getRoutineDetail(id: string): Promise<RoutineDetail> {
    const [routine, workoutDays] = await Promise.all([
      apiClient.get<Routine>(`/routines/${id}`),
      apiClient.get<WorkoutDay[]>(`/routines/${id}/days`),
    ]);
    return { routine, workoutDays };
  }

  async getWorkoutDayExercises(routineId: string, dayId: string): Promise<WorkoutDayExercise[]> {
    return apiClient.get<WorkoutDayExercise[]>(`/routines/${routineId}/days/${dayId}/exercises`);
  }

  async getExerciseConfiguration(wdeId: string): Promise<ExerciseConfigurationData> {
    return apiClient.get<ExerciseConfigurationData>(`/routines/day-exercises/${wdeId}/configuration`);
  }

  async getProgressionPlan(workoutDayId: string): Promise<ProgressionPlan | null> {
    try {
      const raw = await apiClient.get<Record<string, unknown>>(
        "/sessions/progression-plan",
        { workoutDayId }
      );

      const gate = (raw.globalGate ?? {}) as Record<string, unknown>;
      const exercises = (raw.exercises ?? []) as Record<string, unknown>[];

      return {
        workoutDayId: raw.workoutDayId as string,
        workoutDayName: raw.workoutDayName as string,
        routineId: raw.routineId as string,
        computedAt: raw.computedAt as string,
        globalGate: {
          canProgress: (gate.canProgress as boolean) ?? false,
          reason: (gate.reason as ProgressionPlan["globalGate"]["reason"]) ?? "insufficient_data",
        },
        exercises: exercises.map((e): ProgressionExercise => {
          const next = ((e.nextPrescription as Record<string, unknown>) ?? {});
          const last = ((e.lastPerformance as Record<string, unknown>) ?? {});
          return {
            exerciseId: (e.exerciseId as string) ?? "",
            exerciseName: (e.exerciseName as string) ?? "",
            setType: (e.setType as string) ?? "regular",
            action: e.action as ProgressionExercise["action"],
            nextPrescription: {
              weight: next.weight as number | null,
              repRange: (next.repRange as { minReps: number; maxReps: number }) ?? { minReps: 0, maxReps: 0 },
              rir: (next.rir as number) ?? 2,
              sets: (next.sets as number) ?? 0,
            },
            lastPerformance: {
              weight: last.weight as number | null,
              avgReps: (last.avgReps as number) ?? 0,
              avgRir: last.avgRir as number | null,
              totalVolume: (last.totalVolume as number) ?? 0,
              sets: (last.sets as number) ?? 0,
            },
            confidence: (e.confidence as number) ?? 0,
            basis: (e.basis as string) ?? "single_session",
            reasoning: (e.reasoning as string[]) ?? [],
          };
        }),
      };
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
