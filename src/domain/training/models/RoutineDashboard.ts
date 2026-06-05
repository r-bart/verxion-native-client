/**
 * RoutineDashboard — the read aggregate behind the Entreno landing's "Rutina"
 * segment (the active-routine day view). One read resolves everything the
 * segment paints: the active routine summary, the weekly rotation spine, the
 * next session, an optional live-session banner, and the agent's note.
 *
 * This is a CONTRACT proposal for the platform — the parallel of the `today`
 * aggregate → `GET /today`. The client reads it; all mutation lives on the
 * platform / the agent. Proposed endpoint: `GET /training/routine-dashboard`.
 */

export type DayType = "push" | "pull" | "legs" | "core" | "rest";

/** How the user is tracking against the block's plan. No number — a word. */
export type ScoreState = "ahead" | "on" | "behind";

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
  weeks: number;
  /**
   * Progress through the CURRENT week, 0..1 (e.g. Wed ≈ 3/7). Drives the
   * partial fill of the active week cell. Null when not partway (fresh week).
   */
  weekFraction: number | null;
  scoreState: ScoreState;
  sessionsDone: number;
  sessionsPlanned: number;
  /** Block tonnage, already formatted by locale (e.g. "32,1 t"). */
  volumeTotal: string;
  /** Volume delta vs the previous week, in percent (e.g. 8 → "+8%"). */
  volumeTrendPct: number;
}

export interface SpineDay {
  /** Localized weekday label (e.g. "Lun"). */
  dayOfWeek: string;
  name: string;
  focus: string;
  type: DayType;
  exercisesCount: number | null;
  setsCount: number | null;
  estimate: string | null;
  status: SpineStatus;
  /** Workout-day id for navigation (null for rest days). */
  dayId: string | null;
}

export interface NextWorkout {
  kind: "workout";
  type: DayType;
  title: string;
  focus: string;
  exercisesCount: number;
  setsCount: number;
  estimatedMin: number;
  /** Target of the "Empezar"/prescription navigation. */
  dayId: string;
}

export interface NextRest {
  kind: "rest";
  title: string;
  subtitle: string;
  tomorrow: string | null;
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
