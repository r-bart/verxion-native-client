/**
 * TodayDashboard — the aggregate behind the "Hoy" landing screen.
 *
 * Design thesis (handoff `01-Hoy`): "la línea del día como espina — el anillo
 * resume, el timeline guía". The screen is a read-only command centre for the
 * day: a completion ring over the five daily *fronts*, the active routine's
 * week + adherence, an agent note, and a unified timeline of the day's events.
 *
 * This is a deliberate *aggregate*: the ring count, the per-front "closed"
 * thresholds, the adherence score, the agent note and the merged timeline are
 * all derived data with business rules. In Clean Architecture that derivation
 * belongs on the platform (it owns the rules); the app just renders. So this
 * maps to a single read — `GET /today` (or equivalent) — not a client-side
 * composition of six endpoints. The companion app stays read-only.
 */

/** The five daily "fronts" the completion ring summarises. */
export type DayFrontKey = "training" | "nutrition" | "water" | "steps" | "supplements";

/** Discrete state for fronts that aren't a simple numeric goal (training). */
export type DayFrontStatus =
  | "completed"
  | "in_progress"
  | "planned"
  | "rest"
  | "missed";

/**
 * One front of the day. Numeric fronts (nutrition/water/steps/supplements)
 * carry `current` + `target` + `unit`; the boolean-ish front (training) carries
 * a `status` instead. `closed` is the server-computed business rule deciding
 * whether the front counts toward the ring — the app never recomputes it.
 */
export interface DayFront {
  key: DayFrontKey;
  /** Whether this front counts as closed toward the completion ring. */
  closed: boolean;
  /** Progress value (e.g. 2250 kcal, 2.5 L, 11260 steps, 3 supps). Null when N/A. */
  current: number | null;
  /** Goal for the day. Null when the front has no numeric goal (e.g. training). */
  target: number | null;
  /** Unit of `current`/`target`. Null for non-numeric fronts. */
  unit: "kcal" | "L" | "steps" | "count" | null;
  /** Discrete state for non-numeric fronts (training). Null otherwise. */
  status: DayFrontStatus | null;
}

/** The completion ring: closed fronts over the total (typically 5). */
export interface DayRing {
  completed: number;
  total: number;
}

/** The active routine's position + adherence, for the "RUTINA · SEMANA x/y" row. */
export interface RoutineProgress {
  name: string;
  week: number;
  totalWeeks: number;
  /**
   * Adherence score for the routine (e.g. 86) — the platform's `executionScore`.
   * **Null in cold-start** (baseline phases, no score yet); the chip hides then.
   */
  adherenceScore: number | null;
  /** Scale of the adherence score (e.g. 100). */
  adherenceMax: number;
}

/**
 * The agent's note for the day. `message` is free text already localised by the
 * platform for the user's language — it is content, not UI chrome, so the app
 * renders it verbatim.
 */
export interface AgentNote {
  author: string;
  message: string;
}

/** Kinds of events that can appear on the day's timeline ("Tu día"). */
export type TimelineEventKind =
  | "weight"
  | "water"
  | "steps"
  | "cardio"
  | "perimeter"
  | "supplement"
  | "meal"
  | "workout"
  | "session"
  | "note";

/**
 * Lifecycle state of a timeline item — the day is built from the plan, so items
 * can be past/logged, happening now, or still ahead. Drives the node style and
 * the past/future split ("now" marker).
 */
export type TimelineItemState = "done" | "in_progress" | "upcoming" | "overdue" | "rest";

/** Reference the expand card uses to lazy-load an item's detail. */
export interface TimelineRef {
  kind: TimelineEventKind;
  id: string;
}

/**
 * A single event on the day's timeline. `title`/`subtitle` are server-provided,
 * localised content. `time` is an ISO timestamp (app renders local `HH:mm`), or
 * **null** for an untimed pending item — planned but not scheduled to an hour
 * (e.g. dinner/supplements we only timestamp when logged). Untimed items are
 * grouped under a "pending" divider at the end of the timeline. `ref` is null
 * when the item has no expandable detail.
 */
export interface TimelineEvent {
  id: string;
  time: string | null;
  kind: TimelineEventKind;
  state: TimelineItemState;
  title: string;
  subtitle: string | null;
  ref: TimelineRef | null;
}

// ── Expandable item detail (lazy-loaded on expand) ──────────────────────────

export interface MealItemLine {
  name: string;
  amount: string;
  /** Swap options for this item, if any. */
  alternatives: string[];
}

export interface MealDetail {
  kind: "meal";
  name: string;
  /** Time window, e.g. "08:00–10:00". Null if none. */
  window: string | null;
  calories: number | null;
  protein: number | null;
  items: MealItemLine[];
  /** Supplement names attached to this meal. */
  supplements: string[];
}

export interface ExerciseLine {
  name: string;
  /** e.g. "4 × 8–10". */
  detail: string;
}

export interface WorkoutDetail {
  kind: "workout";
  name: string;
  focus: string | null;
  durationMin: number | null;
  exercises: ExerciseLine[];
}

export interface SessionDetail {
  kind: "session";
  name: string;
  durationMin: number | null;
  volumeKg: number | null;
  sets: number | null;
  completionPct: number | null;
}

export interface SupplementLine {
  name: string;
  dose: string;
  timing: string | null;
  taken: boolean;
}

export interface SupplementDetail {
  kind: "supplement";
  items: SupplementLine[];
}

/** Free-text note detail (kind `note`) — server content, painted verbatim. */
export interface NoteDetail {
  kind: "note";
  title: string;
  body: string;
}

/** Compact detail for the simple numeric kinds (weight/water/steps/cardio/perimeter). */
export interface MetricDetail {
  kind: "weight" | "water" | "steps" | "cardio" | "perimeter";
  /** Display-ready hero value. Server may send a formatted string, a raw number, or null. */
  value: string | number | null;
  caption: string | null;
  rows: { label: string; value: string }[];
}

export type TimelineItemDetail =
  | MealDetail
  | WorkoutDetail
  | SessionDetail
  | SupplementDetail
  | NoteDetail
  | MetricDetail;

/** The full "Hoy" aggregate for a single calendar day. */
export interface TodayDashboard {
  /** Calendar date this dashboard summarises (ISO `yyyy-mm-dd`). */
  date: string;
  ring: DayRing;
  fronts: DayFront[];
  routine: RoutineProgress | null;
  agentNote: AgentNote | null;
  timeline: TimelineEvent[];
}
