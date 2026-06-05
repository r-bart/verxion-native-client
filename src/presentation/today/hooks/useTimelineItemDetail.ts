import { useQuery } from "@tanstack/react-query";
import type { TimelineRef } from "@/domain/today/models/TodayDashboard";
import { useDI } from "@/infrastructure/di/DIContext";
import { todayKeys } from "../keys";

/**
 * Lazy detail for a timeline item — only fetched when its card is expanded
 * (`enabled`). Cached per item, so re-opening is instant.
 */
export function useTimelineItemDetail(ref: TimelineRef | null, enabled: boolean) {
  const uc = useDI((c) => c.getTimelineItemDetail);
  return useQuery({
    queryKey: ref ? todayKeys.itemDetail(ref.kind, ref.id) : ["today", "item", "none"],
    queryFn: () => uc.execute(ref as TimelineRef),
    enabled: enabled && ref != null,
    staleTime: 60_000,
  });
}
