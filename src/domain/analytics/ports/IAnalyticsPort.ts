import type {
  Streak,
  WeekView,
  ContributionDay,
  DayTrainingState,
  ExecutionScore,
  SuggestedNextWorkout,
} from "../models/Analytics";
import type { WeeklyTrainingReview } from "../models/WeeklyTrainingReview";

export interface IAnalyticsPort {
  getStreaks(): Promise<Streak>;
  getWeekView(): Promise<WeekView>;
  getContributionGrid(): Promise<ContributionDay[]>;
  getDayState(date: string): Promise<DayTrainingState>;
  getExecutionScore(windowDays: number): Promise<ExecutionScore>;
  getSuggestedNextWorkout(): Promise<SuggestedNextWorkout>;
  getWeeklyTrainingReview(weekOf?: string): Promise<WeeklyTrainingReview>;
}
