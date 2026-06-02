import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { TimelineEntry } from "@/domain/progress/models/Progress";

export class GetTimelineUseCase {
  constructor(private readonly port: IProgressPort) {}

  async execute(months: number): Promise<TimelineEntry[]> {
    return this.port.getTimeline(months);
  }
}
