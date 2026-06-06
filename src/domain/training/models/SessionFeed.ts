/**
 * SessionFeed — the read model behind the Entreno landing's "Sesiones" segment,
 * an infinite feed (no dedicated history screen). One page = some blocks of
 * sessions grouped by routine, plus a cursor for the next page.
 *
 * RAW / locale-neutral: mirrors `GET /api/v1/training/sessions-feed`
 * (`SessionFeedPage`) 1:1 — numbers + units + ISO instants, no formatted
 * strings. Presentation formats via `lib/sessionFormat.ts` (the layer that owns
 * locale). The rutina + sort + cursor filters are server query params: the route
 * honours `routineId` / `sort` / `cursor` even though the OpenAPI snapshot does
 * not document them (the Zod schema is inline, not a named `@verxion/shared`
 * export — same documentation gap as `routine-dashboard`'s `tzOffsetMinutes`).
 */
import type { DayKind } from "./RoutineDashboard";

export type BlockState = "active" | "completed" | "paused";
export type SessionSort = "recent" | "oldest" | "volume" | "duration";

/** A tonnage measure as the contract returns it (kg); presentation → tonnes. */
export interface SessionVolume {
  value: number;
  unit: "kg";
}

export interface SessionFeedRow {
  /** Session report id — target of the session-detail navigation. */
  id: string;
  type: DayKind;
  name: string;
  /** Completion instant, ISO-8601 → presentation renders day · month. */
  completedAt: string;
  hasPR: boolean;
  prCount: number;
  /** Session tonnage in kg. */
  volume: SessionVolume;
  /** Volume relative to the block's heaviest session, 0..1 (drives the bar). */
  volumeFraction: number;
  /** Elapsed seconds, or null when not tracked. */
  durationSeconds: number | null;
}

export interface SessionFeedBlock {
  /** Routine id — used to dedupe blocks across pages and to filter. */
  id: string;
  name: string;
  state: BlockState;
  /** First→last session instants of the block, ISO-8601. */
  dateRange: { start: string; end: string };
  /** Block tonnage in kg. */
  totalVolume: SessionVolume;
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
