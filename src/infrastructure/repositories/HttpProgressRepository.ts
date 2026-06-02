import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type {
  ProgressOverview,
  BodyComposition,
  ExerciseStats,
  ExerciseDetail,
  PersonalRecord,
  TimelineEntry,
  WeekArchive,
  WeekDetail,
  MonthArchive,
  MonthDetail,
  SessionReport,
  TrendPoint,
} from "@/domain/progress/models/Progress";
import { apiClient } from "../api/apiClient";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export class HttpProgressRepository implements IProgressPort {
  async getOverview(): Promise<ProgressOverview> {
    const [aggregated, streaks, weekView] = await Promise.all([
      apiClient.get<any>("/analytics/aggregated"),
      apiClient.get<any>("/analytics/streaks"),
      apiClient.get<any>("/analytics/week-view", { weekDate: today() }),
    ]);

    return {
      totalSessions: aggregated.totalSessions ?? 0,
      totalVolume: aggregated.totalVolume ?? 0,
      totalDuration: aggregated.totalDuration ?? 0,
      currentStreak: streaks.current ?? 0,
      weekSummary: {
        sessions: weekView.sessions ?? 0,
        volume: weekView.volume ?? 0,
        adherence: weekView.adherence ?? 0,
      },
    };
  }

  async getBodyComposition(period: string): Promise<BodyComposition> {
    const [weightTrend, perimeterTrend, weightSummary, perimetersSummary] =
      await Promise.all([
        apiClient.get<TrendPoint[]>("/analytics/trends/weight", { period }),
        apiClient
          .get<Record<string, TrendPoint[]>>("/analytics/trends/perimeters", {
            period,
          })
          .catch(() => ({} as Record<string, TrendPoint[]>)),
        apiClient
          .get<any>("/analytics/trends/weight/summary", { period })
          .catch(() => null),
        apiClient
          .get<any>("/analytics/trends/perimeters/summary", { period })
          .catch(() => null),
      ]);

    return {
      weightTrend: weightTrend ?? [],
      perimeterTrend: perimeterTrend ?? {},
      currentWeight: weightSummary?.current ?? null,
      weightChange: weightSummary?.change ?? null,
      weightSummary: weightSummary ?? undefined,
      perimetersSummary: perimetersSummary ?? undefined,
    };
  }

  async getExerciseStats(): Promise<ExerciseStats> {
    const [lifetimeStats, summary] = await Promise.all([
      apiClient.get<any>("/analytics/exercises/lifetime-stats"),
      apiClient.get<any>("/analytics/exercises/summary"),
    ]);

    return {
      totalVolume: lifetimeStats.totalVolume ?? 0,
      totalSets: lifetimeStats.totalSets ?? 0,
      uniqueExercises: lifetimeStats.uniqueExercises ?? 0,
      trainingDays: lifetimeStats.trainingDays ?? 0,
      muscleGroups: (summary.muscleGroups ?? []).map(
        (mg: any, i: number) => ({
          name: mg.name,
          volume: mg.volume ?? 0,
          sets: mg.sets ?? 0,
          rank: i + 1,
        })
      ),
    };
  }

  async getExerciseDetail(exerciseId: string): Promise<ExerciseDetail> {
    const [stats, sessions] = await Promise.all([
      apiClient.get<any>(`/analytics/exercises/${exerciseId}/stats`),
      apiClient.get<any[]>(`/analytics/exercises/${exerciseId}/sessions`),
    ]);

    return {
      exerciseId,
      exerciseName: stats.exerciseName ?? "",
      totalVolume: stats.totalVolume ?? 0,
      totalSets: stats.totalSets ?? 0,
      totalReps: stats.totalReps ?? 0,
      maxWeight: stats.maxWeight ?? 0,
      sessionCount: stats.sessionCount ?? 0,
      sessions: (sessions ?? []).map((s: any) => ({
        sessionId: s.sessionId,
        date: s.date,
        volume: s.volume ?? 0,
        sets: s.sets ?? 0,
        reps: s.reps ?? 0,
        peakWeight: s.peakWeight ?? 0,
      })),
    };
  }

  async getRecords(): Promise<PersonalRecord[]> {
    return apiClient.get<PersonalRecord[]>("/analytics/exercises/records");
  }

  async getTimeline(months: number): Promise<TimelineEntry[]> {
    return apiClient.get<TimelineEntry[]>("/analytics/progress-timeline", {
      monthsBack: months.toString(),
    });
  }

  async getWeeks(): Promise<WeekArchive[]> {
    return apiClient.get<WeekArchive[]>("/analytics/aggregated/timeline", {
      groupBy: "week",
    });
  }

  async getWeekDetail(weekDate: string): Promise<WeekDetail> {
    return apiClient.get<WeekDetail>("/analytics/weekly-summary", {
      weekDate,
    });
  }

  async getMonths(): Promise<MonthArchive[]> {
    return apiClient.get<MonthArchive[]>("/analytics/aggregated/timeline", {
      groupBy: "month",
    });
  }

  async getMonthDetail(period: string): Promise<MonthDetail> {
    return apiClient.get<MonthDetail>("/analytics/monthly-snapshot", {
      month: period,
    });
  }

  async getSessionReport(sessionId: string): Promise<SessionReport> {
    const [session, summary] = await Promise.all([
      apiClient.get<any>(`/sessions/${sessionId}`),
      apiClient
        .get<any>(`/sessions/${sessionId}/summary`)
        .catch(() => null),
    ]);

    const distribution = summary?.muscleGroupDistribution ?? {};
    const muscleGroupDistribution = Object.entries(distribution).map(
      ([muscle, data]: [string, any]) => ({
        muscle,
        volume: data.volume ?? 0,
        percentage: data.percentage ?? 0,
        exercises: data.exercises ?? 0,
      })
    );

    return {
      id: session.id,
      name: session.name ?? "",
      date: session.startedAt ?? session.createdAt ?? "",
      duration: summary?.totalDurationSeconds ?? session.duration ?? 0,
      activeDuration: summary?.activeDurationSeconds ?? undefined,
      totalVolume: summary?.totalVolume ?? 0,
      totalSets: summary?.totalSets ?? 0,
      totalReps: summary?.totalReps ?? 0,
      peakWeight: summary?.peakWeight ?? 0,
      completionRate: summary?.completionRate ?? 0,
      exerciseCompletionRate: summary?.exerciseCompletionRate ?? 0,
      averageRir: summary?.averageRir ?? undefined,
      executionClassification: summary?.executionClassification ?? undefined,
      effortScore: summary?.effortScore ?? undefined,
      qualityScore: summary?.qualityScore ?? undefined,
      pump: summary?.pump ?? undefined,
      muscleGroupDistribution,
      exercises: (summary?.exerciseSummaries ?? []).map((e: any) => ({
        exerciseId: e.exerciseId ?? "",
        name: e.exerciseName ?? "",
        muscleGroup: e.targetMuscle ?? "",
        equipment: e.equipment ?? "",
        setType: e.setType ?? "",
        plannedSets: e.plannedSets ?? 0,
        completedSets: e.completedSets ?? 0,
        totalVolume: e.totalVolume ?? 0,
        peakWeight: e.peakWeight ?? 0,
        averageRir: e.averageRir ?? undefined,
        totalReps: e.totalReps ?? 0,
        sets: (e.setDetails ?? []).map((s: any) => ({
          setNumber: s.setNumber,
          weight: s.weight,
          reps: s.reps,
          rir: s.rir ?? undefined,
          volume: s.volume ?? 0,
          isWarmup: s.isWarmup ?? undefined,
        })),
        prBadge: e.prBadge ?? null,
      })),
    };
  }
}
