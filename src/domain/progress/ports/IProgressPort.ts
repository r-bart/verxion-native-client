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
} from "../models/Progress";

export interface IProgressPort {
  getOverview(): Promise<ProgressOverview>;
  getBodyComposition(period: string): Promise<BodyComposition>;
  getExerciseStats(): Promise<ExerciseStats>;
  getExerciseDetail(exerciseId: string): Promise<ExerciseDetail>;
  getRecords(): Promise<PersonalRecord[]>;
  getTimeline(months: number): Promise<TimelineEntry[]>;
  getWeeks(): Promise<WeekArchive[]>;
  getWeekDetail(weekDate: string): Promise<WeekDetail>;
  getMonths(): Promise<MonthArchive[]>;
  getMonthDetail(period: string): Promise<MonthDetail>;
  getSessionReport(sessionId: string): Promise<SessionReport>;
}
