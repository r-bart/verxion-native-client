import type { ITodayPort } from "@/domain/today/ports/ITodayPort";
import type { TimelineItemDetail, TimelineRef } from "@/domain/today/models/TodayDashboard";

export class GetTimelineItemDetailUseCase {
  constructor(private readonly port: ITodayPort) {}

  async execute(ref: TimelineRef): Promise<TimelineItemDetail> {
    return this.port.getTimelineItemDetail(ref);
  }
}
