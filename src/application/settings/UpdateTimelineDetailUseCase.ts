import type { ISettingsPort, TimelineDetailLevel } from "@/domain/settings";

export class UpdateTimelineDetailUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(level: TimelineDetailLevel): Promise<void> {
    return this.port.updateTimelineDetail(level);
  }
}
