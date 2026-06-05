import type { ISettingsPort, FeedSharingSettings } from "@/domain/settings";

export class GetFeedSharingUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(): Promise<FeedSharingSettings> {
    return this.port.getFeedSharing();
  }
}
