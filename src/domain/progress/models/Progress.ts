/**
 * Progreso — the 4 curated read-models served by `/api/v1/progress` (tag
 * `Progress`). One read-model per screen, presentation-ready: all derivation
 * (e1RM, deltas, windows, phase bands) is server-side. The native app is a
 * read-only viewer — layout + icons/colors + es-ES formatting only.
 *
 * Contract + handoff mapping: `docs/progreso/progress-screen-spec.md`.
 * Source: `verxion-platform/contracts/{develop,staging}.openapi.json`.
 */

/** Period selector for the Overview / History lenses. */
export type ProgressPeriod = "semana" | "mes" | "trim" | "sem6" | "ano";

/** Period selector for a single measure detail (Mes / 3m / Año). */
export type MeasurePeriod = "mes" | "trim" | "ano";

/** Strength-curve metric toggle on the exercise detail. */
export type ExerciseMetric = "e1rm" | "volumen";

/**
 * The closed catalog of metric keys the API emits for `metrics[]`, `measure.metric`
 * and `window.key` (contract enum, identical across the three). Body (`peso` + the
 * 13 perimeter sites) + activity (`pasos`/`cardio`) deep-link to a measure detail;
 * nutrition (`kcal`…`nutricion`) deep-links to Nutrición. Strength has no key here
 * — it rides on `strengthPr`. The 13 perimeter keys are `MeasurementType.rawValue`
 * (English, each side independent); they replaced the prior `cintura/cadera/brazo`.
 */
export type MetricKey =
  | "peso"
  | "waist"
  | "hips"
  | "chest"
  | "shoulders"
  | "neck"
  | "bicep_right"
  | "bicep_left"
  | "forearm_right"
  | "forearm_left"
  | "thigh_right"
  | "thigh_left"
  | "calf_right"
  | "calf_left"
  | "pasos"
  | "cardio"
  | "kcal"
  | "proteina"
  | "carbos"
  | "grasa"
  | "nutricion";

/** full = todo · fresh = arranque (<~2 semanas) · empty = sin datos. */
export type ProgressDataState = "full" | "fresh" | "empty";

/** Whether each domain has an active / only-inactive / no plan. Gates states. */
export type SetupState = "active" | "inactive_only" | "none";

/**
 * A single continuous metric window — the unit fed to both the Resumen sections
 * and the Métricas inventory. `goodDown` flips delta coloring; `goal` null means
 * the 4th KPI is "media" `(max+min)/2`, not "objetivo".
 */
export interface ProgressMetric {
  key: MetricKey;
  now: number | null;
  first: number | null;
  delta: number | null;
  min: number | null;
  max: number | null;
  unit: string;
  dec: number;
  goodDown: boolean;
  goal: number | null;
  /** Mini-sparkline points. */
  spark: number[];
}

/** The "Fuerza" card hero — the latest strength PR (no global index in v1). */
export interface StrengthPr {
  exerciseName: string;
  slug: string;
  bestWeightKg: number;
  reps: number | null;
  achievedAt: string;
  deltaKg: number | null;
}

/** GET /api/v1/progress?period= → ProgressOverview. */
export interface ProgressOverview {
  period: ProgressPeriod;
  metrics: ProgressMetric[];
  strengthPr: StrengthPr | null;
  setup: {
    routine: SetupState;
    dietPlan: SetupState;
    program: SetupState;
  };
  dataState: ProgressDataState;
}

/** One of the 3 history lanes (peso / volumen / adherencia). */
export interface HistorySeries {
  key: "peso" | "volumen" | "adherencia";
  unit: string;
  goodDown: boolean;
  points: { week: number; value: number | null }[];
}

/**
 * A phase band ("etapa") — the "versiones de ti" chapters of the Historial.
 * `name` is the chapter title (plan name), `why` its intention (plan
 * description, free text, nullable when the plan has none).
 */
export interface HistoryBand {
  label: string;
  name: string;
  why: string | null;
  kind: "routine" | "diet" | "program";
  fromWeek: number;
  toWeek: number;
  isMajor: boolean;
}

/** A pinned PR milestone on the timeline (non-PR milestones derive client-side). */
export interface HistoryPrMark {
  week: number;
  exerciseName: string;
  slug: string;
  bestWeightKg: number;
  reps: number | null;
}

/** GET /api/v1/progress/history?today= → ProgressHistory. */
export interface ProgressHistory {
  weeks: number;
  series: HistorySeries[];
  bands: HistoryBand[];
  prMarks: HistoryPrMark[];
  dataState: ProgressDataState;
}

/** GET /api/v1/progress/measure/{metric}?period= → ProgressMeasureDetail. */
export interface ProgressMeasureDetail {
  metric: MetricKey;
  unit: string;
  dec: number;
  goodDown: boolean;
  goal: number | null;
  period: MeasurePeriod;
  /** Hero KPI window — same shape as a ProgressMetric. */
  window: ProgressMetric;
  chart: { date: string; value: number }[];
  records: { date: string; value: number; deltaPrev: number | null }[];
}

/** GET /api/v1/progress/exercise/{slug}?metric= → ProgressExerciseDetail. */
export interface ProgressExerciseDetail {
  /** Library exercise id — bridges to GET /api/v1/exercises/{id} for the guide tab. */
  id: string;
  slug: string;
  name: string;
  part: string | null;
  category: string | null;
  metric: ExerciseMetric;
  kpis: {
    prWeightKg: number | null;
    e1rmKg: number | null;
    bestVolumeT: number | null;
    logs: number;
  };
  curve: { session: number; value: number; date: string }[];
  e1rmDelta: number | null;
  volDelta: number | null;
  history: {
    date: string;
    topSetWeightKg: number;
    topSetReps: number;
    isPr: boolean;
    /** Server-localized free text, e.g. "RIR 2 · vol 3,6". */
    meta: string | null;
    value: number;
    deltaPct: number | null;
  }[];
  muscles: { name: string; role: string; pct: number }[];
  /** true when logs === 0 → empty-progress state. */
  empty: boolean;
}
