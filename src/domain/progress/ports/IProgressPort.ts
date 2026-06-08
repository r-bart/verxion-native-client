import type {
  ProgressOverview,
  ProgressHistory,
  ProgressMeasureDetail,
  ProgressExerciseDetail,
  ProgressPeriod,
  MeasurePeriod,
  ExerciseMetric,
} from "../models/Progress";

/**
 * IProgressPort — the Progreso read surface. All read-only: there is no progress
 * write (logging weight/water/steps lives in the activity/measurements modules;
 * everything else is the agent via MCP). Maps 1:1 to the curated `/api/v1/progress`
 * read-models — no client fan-out. See `docs/progreso/progress-screen-spec.md`.
 */
export interface IProgressPort {
  /** "Progreso" madre (Resumen + Métricas). Omit period → server default. */
  getOverview(period?: ProgressPeriod): Promise<ProgressOverview>;
  /**
   * Lente Historial (Cinta / Carrete) — 30-week series + phase bands + PR marks.
   * `today` (YYYY-MM-DD) pins the calendar anchor; omit → server uses the real today.
   */
  getHistory(today?: string): Promise<ProgressHistory>;
  /** "Detalle de medida" for one of the 6 body/activity metrics. */
  getMeasure(metric: string, period?: MeasurePeriod): Promise<ProgressMeasureDetail>;
  /** "Detalle de ejercicio" (tab Progreso) — e1RM/volume curve + history + muscles. */
  getExerciseDetail(slug: string, metric?: ExerciseMetric): Promise<ProgressExerciseDetail>;
}
