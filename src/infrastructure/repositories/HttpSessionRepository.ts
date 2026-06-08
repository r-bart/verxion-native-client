import type { ISessionPort } from "@/domain/sessions/ports/ISessionPort";
import type {
  Session,
  SessionListItem,
  SessionListParams,
  LiveSessionProgress,
} from "@/domain/sessions/models/Session";
import { apiClient } from "../api/apiClient";

export class HttpSessionRepository implements ISessionPort {
  async getActiveSession(): Promise<Session | null> {
    const sessions = await apiClient.get<Session[]>("/sessions", {
      status: "in_progress",
      limit: "1",
    });
    return sessions.length > 0 ? sessions[0] : null;
  }

  async getLiveProgress(id: string): Promise<LiveSessionProgress> {
    const raw = await apiClient.get<Record<string, unknown>>(
      `/sessions/${id}/live-progress`
    );

    const session = raw.session as Record<string, unknown> | undefined;
    const progress = raw.progress as Record<string, unknown> | undefined;
    if (!session || !progress) {
      throw new Error("Unexpected live-progress response shape");
    }

    const rawExercises = (raw.exercises ?? []) as Record<string, unknown>[];
    const rawPrev = raw.previousSession as Record<string, unknown> | null;

    return {
      session: {
        id: session.id as string,
        name: session.name as string,
        status: session.status as "in_progress" | "paused",
        sessionType: (session.sessionType as string) ?? "unknown",
        startedAt: session.startedAt as string,
        elapsedSeconds: (session.elapsedSeconds as number) ?? 0,
        routineId: session.routineId as string | undefined,
        routineName: session.routineName as string | undefined,
        workoutDayId: session.workoutDayId as string | undefined,
        workoutDayName: session.workoutDayName as string | undefined,
      },
      progress: {
        totalExercises: (progress.totalExercises as number) ?? 0,
        completedExercises: (progress.completedExercises as number) ?? 0,
        skippedExercises: (progress.skippedExercises as number) ?? 0,
        remainingExercises: (progress.remainingExercises as number) ?? 0,
        completionRate: (progress.completionRate as number) ?? 0,
        totalVolume: (progress.totalVolume as number) ?? 0,
        totalSets: (progress.totalSets as number) ?? 0,
        totalReps: (progress.totalReps as number) ?? 0,
        executionClassification: progress.executionClassification as
          | string
          | undefined,
      },
      exercises: rawExercises.map((e) => ({
        sessionExerciseId: (e.sessionExerciseId as string) ?? "",
        exerciseId: (e.exerciseId as string) ?? "",
        exerciseName: (e.exerciseName as string) ?? "",
        bodyPart: (e.bodyPart as string) ?? "",
        target: (e.target as string) ?? (e.bodyPart as string) ?? "",
        orderIndex: (e.orderIndex as number) ?? 0,
        sourceType: (e.sourceType as string) ?? "planned",
        setType: (e.setType as string) ?? "regular",
        status:
          (e.status as LiveSessionProgress["exercises"][number]["status"]) ??
          "not_started",
        planned: e.planned
          ? {
              sets: ((e.planned as Record<string, unknown>).sets as number) ?? 0,
              repScheme: (e.planned as Record<string, unknown>).repScheme as
                | string
                | undefined,
              weight: (e.planned as Record<string, unknown>).weight as
                | number
                | undefined,
              rir: (e.planned as Record<string, unknown>).rir as
                | number
                | undefined,
            }
          : undefined,
        actual: {
          completedSets:
            ((e.actual as Record<string, unknown> | undefined)
              ?.completedSets as number) ?? 0,
          totalVolume:
            ((e.actual as Record<string, unknown> | undefined)
              ?.totalVolume as number) ?? 0,
          totalReps:
            ((e.actual as Record<string, unknown> | undefined)
              ?.totalReps as number) ?? 0,
          peakWeight:
            ((e.actual as Record<string, unknown> | undefined)
              ?.peakWeight as number) ?? 0,
          averageRir: (e.actual as Record<string, unknown> | undefined)
            ?.averageRir as number | undefined,
          sets: (
            ((e.actual as Record<string, unknown> | undefined)?.sets ??
              []) as Record<string, unknown>[]
          ).map((s) => ({
            setNumber: s.setNumber as number,
            weight: (s.weight as number) ?? 0,
            reps: (s.reps as number) ?? 0,
            rir: s.rir as number | undefined,
            volume: (s.volume as number) ?? 0,
          })),
        },
      })),
      previousSession: rawPrev
        ? {
            sessionId: rawPrev.sessionId as string,
            date: rawPrev.date as string,
            totalVolume: (rawPrev.totalVolume as number) ?? 0,
            totalSets: (rawPrev.totalSets as number) ?? 0,
            totalReps: (rawPrev.totalReps as number) ?? 0,
            durationSeconds: (rawPrev.durationSeconds as number) ?? 0,
            exercises: (
              (rawPrev.exercises ?? []) as Record<string, unknown>[]
            ).map((e) => ({
              exerciseId: (e.exerciseId as string) ?? "",
              exerciseName: (e.exerciseName as string) ?? "",
              completedSets: (e.completedSets as number) ?? 0,
              totalVolume: (e.totalVolume as number) ?? 0,
              totalReps: (e.totalReps as number) ?? 0,
              peakWeight: (e.peakWeight as number) ?? 0,
              averageRir: e.averageRir as number | undefined,
              sets: ((e.sets ?? []) as Record<string, unknown>[]).map((s) => ({
                setNumber: s.setNumber as number,
                weight: (s.weight as number) ?? 0,
                reps: (s.reps as number) ?? 0,
                rir: s.rir as number | undefined,
                volume: (s.volume as number) ?? 0,
              })),
            })),
          }
        : null,
    };
  }

  async listSessions(params?: SessionListParams): Promise<SessionListItem[]> {
    const queryParams: Record<string, string> = {};
    if (params?.routineId) queryParams.routineId = params.routineId;
    if (params?.workoutDayId) queryParams.workoutDayId = params.workoutDayId;
    if (params?.from) queryParams.from = params.from;
    if (params?.to) queryParams.to = params.to;
    if (params?.limit != null) queryParams.limit = String(params.limit);
    if (params?.offset != null) queryParams.offset = String(params.offset);

    const response = await apiClient.get<{
      reports: {
        id: string;
        workoutSessionId: string;
        sessionName: string;
        sessionDate: string | null;
        routineId: string | null;
        routineName: string | null;
        workoutDayId: string | null;
        workoutDayName: string | null;
        totalVolume: number;
        totalSets: number;
        totalReps: number;
        durationSeconds: number;
        completionRate: number;
        summaryGeneratedAt: string | null;
      }[];
      total: number;
      limit: number;
      offset: number;
    }>("/sessions/reports", queryParams);

    return response.reports.map((report) => ({
      id: report.workoutSessionId,
      reportId: report.id,
      name: report.sessionName,
      date: report.sessionDate,
      routineId: report.routineId,
      routineName: report.routineName,
      workoutDayId: report.workoutDayId,
      workoutDayName: report.workoutDayName,
      totalVolume: report.totalVolume,
      totalSets: report.totalSets,
      totalReps: report.totalReps,
      durationSeconds: report.durationSeconds,
      completionRate: report.completionRate,
      summaryGeneratedAt: report.summaryGeneratedAt,
    }));
  }
}
