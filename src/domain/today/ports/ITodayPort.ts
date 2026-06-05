import type { TodayDashboard, TimelineItemDetail, TimelineRef } from "../models/TodayDashboard";

/**
 * Port for the "Hoy" aggregate. The dashboard is one read; timeline item detail
 * is loaded lazily on expand (the aggregate stays lightweight — see the spec).
 */
export interface ITodayPort {
  /**
   * The day dashboard. `date` (ISO `yyyy-mm-dd`) is optional — omitted means
   * "today" in the user's timezone (server-resolved).
   */
  getDashboard(date?: string): Promise<TodayDashboard>;

  /** Detail for a single timeline item, fetched when its card is expanded. */
  getTimelineItemDetail(ref: TimelineRef): Promise<TimelineItemDetail>;
}
