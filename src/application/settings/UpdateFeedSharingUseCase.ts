import type { ISettingsPort, FeedSharingSettings } from "@/domain/settings";

export class UpdateFeedSharingUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(settings: FeedSharingSettings): Promise<void> {
    return this.port.updateFeedSharing(settings);
  }
}
