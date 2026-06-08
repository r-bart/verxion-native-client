/**
 * RoutineDetailView — the "Detalle de rutina" aggregate (`rutinas/[id]`): the
 * block's metadata (hero) + its day rotation, each day tappable into its own
 * detail. Read-only: adjusting a routine is a request to the agent, never an edit.
 * Doubles as the contract proposal for `GET /training/routines/{id}/detail`.
 */
import type { ActiveMesocycle, DayType } from "./RoutineDashboard";
import type { RoutineLibraryState } from "./RoutineLibrary";

export type RoutineDayStatus = "done" | "now" | "up" | "rest";

export interface RoutineDetailHeader {
  id: string;
  name: string;
  state: RoutineLibraryState;
  goal: string;
  split: string;
  type: DayType; // representative (first training day) — bubble color
  /** Context line under the eyebrow ("Última: Sáb 31 may", "Finalizada · 1 mar 2026"). Display-ready. */
  contextLabel: string;
  perWeek: number;
  weeks: number;
  adherencePct: number; // shown on non-draft blocks
  volumeTotal: string; // "32,1 t" — display-ready
  /**
   * Active periodization block (proposal field — this screen is a contract
   * proposal, not yet a live read-model). null for a flat routine OR a finished
   * one (no current block). The full proportional phase bar (all blocks) needs
   * the mesocycle LIST, not exposed yet (◐) — for now only the current block.
   */
  mesocycle: ActiveMesocycle | null;
  week: number;
  weekFraction: number | null;
  sessionsDone: number;
  sessionsPlanned: number;
  volumeTrendPct: number;
}

export interface RoutineDetailDay {
  dayId: string | null; // null on a rest day
  dayOfWeek: string; // "Lun" — display-ready
  name: string; // "Push A"
  type: DayType;
  focus: string; // "Pecho · hombros · tríceps" — localized free text
  exercisesCount: number | null; // null on rest
  setsCount: number | null;
  estimate: string | null; // "~62 min" — display-ready; null on rest
  status: RoutineDayStatus;
  isToday: boolean;
}

export interface RoutineDetailView {
  header: RoutineDetailHeader;
  agentNote: string | null; // carried for the contract; insights surface is parked
  days: RoutineDetailDay[];
  trainingDaysCount: number;
  restDaysCount: number;
  sessionsBlockCount: number; // completed sessions in this block (the sessions link tally)
}
