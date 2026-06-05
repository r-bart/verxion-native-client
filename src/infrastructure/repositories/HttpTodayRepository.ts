import type { ITodayPort } from "@/domain/today/ports/ITodayPort";
import type {
  TodayDashboard,
  TimelineItemDetail,
  TimelineRef,
} from "@/domain/today/models/TodayDashboard";
import { apiClient } from "../api/apiClient";

/**
 * HttpTodayRepository — the "Hoy" aggregate over the platform read-model.
 *
 * Two access patterns (platform rule `native-readmodels` §3):
 * - eager: `GET /today?date=…` → the whole dashboard in one round-trip
 *   (operationId `getTodayDashboard`).
 * - lazy: `GET /today/timeline/:kind/:id` → one item's detail on card expand
 *   (operationId `getTodayTimelineItem`).
 *
 * The client only paints: every business number (ring, closed, adherence, state)
 * arrives server-computed. The response shapes mirror the `@verxion/shared` Zod
 * contract — regen + diff with `npm run codegen:api` when the contract changes.
 */
export class HttpTodayRepository implements ITodayPort {
  async getDashboard(date?: string): Promise<TodayDashboard> {
    return apiClient.get<TodayDashboard>("/today", date ? { date } : undefined);
  }

  async getTimelineItemDetail(ref: TimelineRef): Promise<TimelineItemDetail> {
    return apiClient.get<TimelineItemDetail>(
      `/today/timeline/${encodeURIComponent(ref.kind)}/${encodeURIComponent(ref.id)}`
    );
  }
}
