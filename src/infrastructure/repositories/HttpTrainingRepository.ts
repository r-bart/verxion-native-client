import type {
  Routine,
  RoutineDetail,
  WorkoutDay,
  WorkoutDayExercise,
} from "@/domain/training/models/Routine";
import type { ExerciseConfigurationData } from "@/domain/training/models/ExerciseConfiguration";
import type {
  ProgressionPlan,
  ProgressionExercise,
} from "@/domain/training/models/ProgressionPlan";
import type { RoutineDashboard } from "@/domain/training/models/RoutineDashboard";
import type {
  SessionFeedPage,
  SessionFeedParams,
} from "@/domain/training/models/SessionFeed";
import type { SessionDetailView } from "@/domain/training/models/SessionDetailView";
import { apiClient, ApiError } from "../api/apiClient";
import {
  mapSessionDetail,
  type WorkoutSessionDetailDTO,
} from "./mappers/sessionDetailMapper";

export class HttpTrainingRepository {
  /**
   * Entreno landing "Rutina" aggregate — live read-model
   * (`GET /api/v1/training/routine-dashboard`, shipped to staging). The
   * `RoutineDashboard` model mirrors the contract 1:1, so the response passes
   * through with no mapper. `tzOffsetMinutes` lets the server resolve
   * "today"/current-week in the caller's TZ (it falls back to UTC if omitted —
   * confirm the sign convention against `/analytics` when verifying on-device).
   * `routineDashboardFixture` is retained only as the test payload.
   */
  async getRoutineDashboard(): Promise<RoutineDashboard> {
    return apiClient.get<RoutineDashboard>("/training/routine-dashboard", {
      tzOffsetMinutes: String(new Date().getTimezoneOffset()),
    });
  }

  /**
   * Entreno landing "Sesiones" feed page — live read-model the repo calls.
   * `SessionFeedPage` mirrors the contract 1:1, so the response passes through
   * unmapped. `routineId` / `sort` / `cursor` are honoured by the route even
   * though the OpenAPI snapshot omits them (inline Zod query schema, not a named
   * `@verxion/shared` export — a documentation gap, not a missing capability).
   * Only defined params are sent so an unfiltered first page stays a clean GET.
   */
  async getSessionFeed(params: SessionFeedParams): Promise<SessionFeedPage> {
    const query: Record<string, string> = {};
    if (params.routineId) query.routineId = params.routineId;
    if (params.sort) query.sort = params.sort;
    if (params.cursor) query.cursor = params.cursor;
    // No params → pass undefined (not {}) so the URL has no trailing "?".
    const qs = Object.keys(query).length > 0 ? query : undefined;
    return apiClient.get<SessionFeedPage>("/training/sessions-feed", qs);
  }

  /**
   * "Detalle de sesión" aggregate — live `GET /api/v1/sessions/{id}/detail`
   * (`WorkoutSessionDetail`). The raw read-model carries logged sets per
   * exercise, the plan prescription, catalog joins, the close-out assessment/note
   * and the agent recap; `mapSessionDetail` formats it into the display-ready
   * `SessionDetailView`. PR flags are not exposed by the read-model yet
   * (`docs/training-session-detail-spec.md` §7) and are omitted.
   */
  async getSessionDetailView(id: string): Promise<SessionDetailView> {
    const raw = await apiClient.get<WorkoutSessionDetailDTO>(
      `/sessions/${id}/detail`
    );
    return mapSessionDetail(raw);
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

  async getWorkoutDayExercises(
    routineId: string,
    dayId: string
  ): Promise<WorkoutDayExercise[]> {
    return apiClient.get<WorkoutDayExercise[]>(
      `/routines/${routineId}/days/${dayId}/exercises`
    );
  }

  async getExerciseConfiguration(
    wdeId: string
  ): Promise<ExerciseConfigurationData> {
    return apiClient.get<ExerciseConfigurationData>(
      `/routines/day-exercises/${wdeId}/configuration`
    );
  }

  async getProgressionPlan(
    workoutDayId: string
  ): Promise<ProgressionPlan | null> {
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
          reason:
            (gate.reason as ProgressionPlan["globalGate"]["reason"]) ??
            "insufficient_data",
        },
        exercises: exercises.map((e): ProgressionExercise => {
          const next = (e.nextPrescription as Record<string, unknown>) ?? {};
          const last = (e.lastPerformance as Record<string, unknown>) ?? {};
          return {
            exerciseId: (e.exerciseId as string) ?? "",
            exerciseName: (e.exerciseName as string) ?? "",
            setType: (e.setType as string) ?? "regular",
            action: e.action as ProgressionExercise["action"],
            nextPrescription: {
              weight: next.weight as number | null,
              repRange: (next.repRange as {
                minReps: number;
                maxReps: number;
              }) ?? { minReps: 0, maxReps: 0 },
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
