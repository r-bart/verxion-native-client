/**
 * SessionFeed — the read model behind the Entreno landing's "Sesiones" segment,
 * now an infinite feed (no dedicated history screen). One page = some blocks of
 * sessions grouped by routine, plus a cursor for the next page. The rutina and
 * sort filters are server params.
 *
 * CONTRACT proposal for the platform. Proposed endpoint:
 * `GET /training/sessions-feed?routineId=&sort=&cursor=` (cursor-paginated).
 */
import type { DayType } from "./RoutineDashboard";

export type BlockState = "active" | "completed" | "paused";
export type SessionSort = "recent" | "oldest" | "volume" | "duration";

export interface SessionFeedRow {
  /** Session report id — target of the session-detail navigation. */
  id: string;
  /** Short localized day+date (e.g. "Sáb 31"). */
  dateLabel: string;
  /** Localized month (e.g. "may"). */
  monthLabel: string;
  type: DayType;
  name: string;
  hasPR: boolean;
  prCount: number;
  /** Session tonnage, already formatted (e.g. "16,3 t"). */
  volumeLabel: string;
  /** Volume relative to the block's heaviest session, 0..1 (drives the bar). */
  volumeFraction: number;
  /** Duration, already formatted (e.g. "66m"). */
  durationLabel: string;
}

export interface SessionFeedBlock {
  /** Routine id — used to dedupe blocks across pages and to filter. */
  id: string;
  name: string;
  state: BlockState;
  /** Localized date range (e.g. "12-31 may"). */
  dateRange: string;
  /** Block tonnage, already formatted (e.g. "174,6 t"). */
  totalVolume: string;
  sessions: SessionFeedRow[];
}

export interface SessionFeedPage {
  /** Total sessions matching the current filter (for the "N sesiones" lead). */
  totalCount: number;
  blocks: SessionFeedBlock[];
  /** Opaque cursor for the next page, or null when the feed is exhausted. */
  nextCursor: string | null;
}

export interface SessionFeedParams {
  routineId?: string | null;
  sort?: SessionSort;
  cursor?: string | null;
}

/** A routine option for the feed's rutina filter. */
export interface SessionFeedRoutineOption {
  id: string;
  name: string;
  state: BlockState;
}
