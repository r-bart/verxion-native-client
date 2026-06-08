/**
 * Query-key factory for the Progreso feature. One namespace, keyed by the read
 * it backs (overview, history, a single measure, a single exercise).
 */
import type {
  ProgressPeriod,
  MeasurePeriod,
  ExerciseMetric,
} from "@/domain/progress/models/Progress";

export const progressKeys = {
  all: ["progress"] as const,
  overview: (period?: ProgressPeriod) => ["progress", "overview", period ?? "default"] as const,
  history: () => ["progress", "history"] as const,
  measure: (metric: string, period?: MeasurePeriod) =>
    ["progress", "measure", metric, period ?? "default"] as const,
  exercise: (slug: string, metric?: ExerciseMetric) =>
    ["progress", "exercise", slug, metric ?? "default"] as const,
};
