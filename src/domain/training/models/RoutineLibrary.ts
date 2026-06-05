/**
 * RoutineLibrary — the "Todas las rutinas" aggregate: every routine the agent has
 * built, in catalog order, plus the filter facets. The screen groups by state
 * (browse mode) or filters + sorts client-side (results mode) over this one read,
 * so search / filter / sort never hit the network. Doubles as the contract
 * proposal for `GET /training/routine-library`.
 *
 * Read-only: creating, activating or editing a routine is the agent's job; the UI
 * frames it as a request ("pídeselo a verxion"), never as a write.
 */
import type { DayType, ScoreState } from "./RoutineDashboard";

export type RoutineLibraryState = "active" | "draft" | "paused" | "completed";

export interface RoutineLibraryItem {
  id: string;
  name: string;
  state: RoutineLibraryState;
  goal: string;
  split: string;
  perWeek: number;
  /** Representative day type (the routine's first training day) — drives the bubble color. */
  type: DayType;
  week: number;
  weeks: number;
  /** Fill of the current week's cell (0–1); null when the block isn't active. */
  weekFraction: number | null;
  scoreState: ScoreState;
  sessionsDone: number;
  sessionsPlanned: number;
  volumeTrendPct: number;
  /** Pre-formatted end date for the archive row ("1 mar 2026"); null when ongoing. */
  finishedLabel: string | null;
}

export interface RoutineLibraryFacets {
  states: RoutineLibraryState[];
  goals: string[];
}

export interface RoutineLibrary {
  routines: RoutineLibraryItem[];
  facets: RoutineLibraryFacets;
}
