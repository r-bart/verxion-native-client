import type { IAnalyticsPort } from "@/domain/analytics/ports/IAnalyticsPort";
import type {
  Streak,
  WeekView,
  ContributionDay,
  DayTrainingState,
  ExecutionScore,
  SuggestedNextWorkout,
} from "@/domain/analytics/models/Analytics";
import type { WeeklyTrainingReview } from "@/domain/analytics/models/WeeklyTrainingReview";
import { apiClient } from "../api/apiClient";

export class HttpAnalyticsRepository implements IAnalyticsPort {
  async getStreaks(): Promise<Streak> {
    return apiClient.get<Streak>("/analytics/streaks");
  }

  async getWeekView(): Promise<WeekView> {
    const today = new Date().toISOString().slice(0, 10);
    return apiClient.get<WeekView>("/analytics/week-view", {
      weekDate: today,
    });
  }

  async getContributionGrid(): Promise<ContributionDay[]> {
    const year = new Date().getFullYear().toString();
    return apiClient.get<ContributionDay[]>("/analytics/contribution-grid", {
      year,
    });
  }

  async getDayState(date: string): Promise<DayTrainingState> {
    return apiClient.get<DayTrainingState>("/analytics/training/day-state", {
      date,
    });
  }

  async getExecutionScore(windowDays: number): Promise<ExecutionScore> {
    return apiClient.get<ExecutionScore>("/analytics/training/execution-score", {
      windowDays: String(windowDays),
    });
  }

  async getSuggestedNextWorkout(): Promise<SuggestedNextWorkout> {
    return apiClient.get<SuggestedNextWorkout>("/analytics/training/suggest-next");
  }

  async getWeeklyTrainingReview(weekOf?: string): Promise<WeeklyTrainingReview> {
    const params: Record<string, string> = {};
    if (weekOf) params.weekOf = weekOf;
    return apiClient.get<WeeklyTrainingReview>("/analytics/weekly-review/training", params);
  }
}
