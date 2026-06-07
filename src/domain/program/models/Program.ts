/**
 * Program — the umbrella read surface. A program couples a routine + a diet plan
 * under one goal, with a weekly calendar, a time window, and a unified adherence
 * read-model. It sits above Entreno and Nutrición: where routines and diets live
 * apart, the program unites and scores them together.
 *
 * `ProgramOverview` is the composed read-model behind the library card AND the
 * detail hero (detail just fetches a single one). It is NOT the raw platform
 * entity — week/totalWeeks are derived (server `deriveProgramWeeks`) and the
 * coupled routine/diet are embedded summaries, so the screens render in one read.
 * See `docs/program-screen-spec.md`.
 */

/** Program objective — drives the goal bubble color + icon. */
export type ProgramGoal =
  | "muscle_gain"
  | "fat_loss"
  | "strength"
  | "endurance"
  | "maintenance"
  | "recomp"
  | "general_fitness"
  | "athletic_performance"
  | "rehabilitation"
  | "health";

/** Lifecycle state. `deleted` is soft-deleted (hidden from the library). */
export type ProgramStatus = "draft" | "active" | "paused" | "completed" | "deleted";

export type ProgramDurationType = "indefinite" | "date_range";

/** Per-day kind for the weekly calendar heatmap. */
export type ProgramDayKind = "training" | "rest" | "refeed" | "custom";

/** Pace classification (server `PaceClassifier`) → the "Vas adelantado" chip. */
export type PaceState = "ahead" | "on" | "behind";

/** Embedded summary of the coupled routine (enough for the coupling card). */
export interface ProgramCoupledRoutine {
  id: string;
  name: string;
  /** Structural type / split label, e.g. "split" → bubble. Null if unknown. */
  type: string | null;
  week: number;
  totalWeeks: number;
  /** Routine adherence (e.g. 86). Null in cold-start. */
  adherenceScore: number | null;
}

/** Embedded summary of the coupled diet plan. */
export interface ProgramCoupledDiet {
  id: string;
  name: string;
  /** Raw target kcal; client formats. Null if not set. */
  calories: number | null;
  /** Raw target protein grams. Null if not set. */
  protein: number | null;
  week: number | null;
  totalWeeks: number | null;
  /** Diet adherence (e.g. 92). Optional — the overview read-model may omit it
   *  (only the routine carries a headline score); the card meta degrades then. */
  adherenceScore?: number | null;
}

/**
 * The composed program read-model. Used by the library (one per card) and the
 * detail hero. Adherence numbers here are the *headline* (`unifiedExecutionScore`
 * + `adherenceState`); the full breakdown is the separate `ProgramAdherence` read.
 */
export interface ProgramOverview {
  id: string;
  name: string;
  description: string | null;
  goal: ProgramGoal | null;
  status: ProgramStatus;
  durationType: ProgramDurationType;
  /** ISO date; null when indefinite / draft. */
  startDate: string | null;
  endDate: string | null;
  /** ISO date when completed; null otherwise. */
  finishedDate: string | null;
  createdAt: string;
  updatedAt: string | null;
  /** 1-based current week (1 before start). Derived server-side. */
  week: number;
  /** Total weeks; 0 for indefinite → client renders "semana N" without a denominator. */
  totalWeeks: number;
  /** Fraction (0..1) of the in-progress week cell. Client-derived — the overview
   *  read-model omits it; absent ⇒ the current cell fills at half opacity. */
  weekFrac?: number | null;
  /** 7 entries Mon→Sun for the calendar heatmap; null for a draft without a schedule. */
  weeklySchedule: ProgramDayKind[] | null;
  /** Coupled routine summary, or null when none is attached. */
  routine: ProgramCoupledRoutine | null;
  /** Coupled diet summary, or null when none is attached. */
  dietPlan: ProgramCoupledDiet | null;
  /** Headline unified adherence (e.g. 84). Null for drafts / cold-start. */
  unifiedExecutionScore: number | null;
  /** Pace chip state. Null for drafts / cold-start (or if the platform omits it). */
  adherenceState: PaceState | null;
  /** Agent note ("sobre tu programa" / "por qué este programa"). Server free text. */
  agentNote: string | null;
}
