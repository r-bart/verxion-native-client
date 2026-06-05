/**
 * SessionsSummary — the read aggregate behind the Entreno landing's "Sesiones"
 * segment: a three-stat recap of the active block plus the recent sessions list.
 * The full history lives on its own screen (ListSessions); this is the compact
 * landing slice.
 *
 * CONTRACT proposal for the platform. Proposed endpoint:
 * `GET /training/sessions-summary`. Read-only — the client only paints.
 */
import type { DayType } from "./RoutineDashboard";

export interface SessionsSummaryStats {
  /** Sessions completed in the active block. */
  sessions: number;
  /** Block tonnage, already formatted by locale (e.g. "32,1 t"). */
  blockVolume: string;
  /** Volume delta vs the previous week, in percent (e.g. 8 → "+8%"). */
  trendPct: number;
}

export interface SessionRecapRow {
  /** Session report id — target of the session-detail navigation. */
  id: string;
  /** Short localized date (e.g. "Sáb 31"). */
  dateLabel: string;
  type: DayType;
  name: string;
  hasPR: boolean;
  prCount: number;
  /** Session tonnage, already formatted (e.g. "9,2 t"). */
  volumeLabel: string;
  /** Volume relative to the block's heaviest session, 0..1 (drives the bar). */
  volumeFraction: number;
  /** Volume delta vs the same day last week, in percent. */
  deltaPct: number;
}

export interface SessionsSummary {
  stats: SessionsSummaryStats;
  recent: SessionRecapRow[];
}
