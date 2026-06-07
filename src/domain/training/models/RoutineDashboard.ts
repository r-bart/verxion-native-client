/**
 * RoutineDashboard — the read aggregate behind the Entreno landing's "Rutina"
 * segment (the active-routine day view). One read resolves everything the
 * segment paints: the active routine summary, the weekly rotation spine, the
 * next session, an optional live-session banner, and the agent's note.
 *
 * This is the read aggregate for the platform — the parallel of the `today`
 * aggregate → `GET /today`. The client reads it; all mutation lives on the
 * platform / the agent. Live endpoint: `GET /api/v1/training/routine-dashboard`
 * (shipped to staging; this model mirrors the `RoutineDashboard` contract 1:1).
 */

/**
 * Legacy muscle-split taxonomy — still used by the sibling training models
 * (`SessionDetailView`, `RoutineDetailView`, `DayDetailView`, `SessionFeed`,
 * `RoutineLibrary`) and the shared `lib/dayType` chip vocabulary, none of which
 * are reconciled to the API yet. The landing adopts {@link DayKind} below.
 */
export type DayType = "push" | "pull" | "legs" | "core" | "rest";

/**
 * The platform's canonical day/session taxonomy (the `spine[].type` enum on the
 * live read-model). Replaces the muscle-split design liberty on the landing.
 * The full chip vocabulary (icon/color per kind) is a follow-up — `lib/dayType`
 * maps these to a temporary visual via `dayKindChip`.
 */
export type DayKind =
  | "workout"
  | "rest"
  | "cardio"
  | "deload"
  | "mobility"
  | "active_rest"
  | "conditioning"
  | "technique";

/** Landing state: a live block, a just-created block, or no routine at all. */
export type RoutineDashboardState = "active" | "fresh" | "empty";

/** Each node of the weekly rotation spine. */
export type SpineStatus = "done" | "now" | "live" | "up";

export interface ActiveRoutineSummary {
  id: string;
  name: string;
  goal: string | null;
  split: string | null;
  /** 1-based current week within the block. */
  week: number;
  /** Total weeks in the block; null for open-ended routines. */
  weeks: number | null;
  /**
   * Progress through the CURRENT week, 0..1 (e.g. Wed ≈ 3/7). Drives the
   * partial fill of the active week cell. Null when not partway (fresh week).
   */
  weekFraction: number | null;
  sessionsDone: number;
  /** Planned sessions for the block; null for open-ended routines. */
  sessionsPlanned: number | null;
  /** Block tonnage, raw — the client formats per locale (e.g. "32,1 t"). */
  volume: { value: number; unit: string };
  /** Volume delta vs the previous week, in percent; null with no baseline. */
  volumeTrendPct: number | null;
}

export interface SpineDay {
  /** 0-based position in the rotation. */
  orderIndex: number;
  name: string;
  focus: string | null;
  type: DayKind;
  exercisesCount: number;
  setsCount: number;
  /** Estimated minutes; null when not computable (e.g. rest). */
  estimateMin: number | null;
  status: SpineStatus;
  /** Workout-day id for navigation. */
  dayId: string;
}

export interface NextWorkout {
  kind: "workout";
  type: DayKind;
  name: string;
  focus: string | null;
  exercisesCount: number;
  setsCount: number;
  estimatedMin: number | null;
  /** Target of the "Empezar"/prescription navigation. */
  dayId: string;
}

export interface NextRest {
  kind: "rest";
  /** Server free text explaining the rest (e.g. "Descanso programado"). */
  reason: string;
}

export type NextSession = NextWorkout | NextRest;

export interface LiveSessionBanner {
  sessionId: string;
  name: string;
  /** Seconds elapsed at the time the aggregate was computed. */
  elapsedSeconds: number;
  exercisesDone: number;
  exercisesTotal: number;
  paused: boolean;
}

export interface RoutineDashboard {
  state: RoutineDashboardState;
  activeRoutine: ActiveRoutineSummary | null;
  spine: SpineDay[];
  next: NextSession | null;
  liveSession: LiveSessionBanner | null;
  agentNote: string | null;
}
