import type { IAnalyticsPort } from "@/domain/analytics/ports/IAnalyticsPort";
import type { Streak } from "@/domain/analytics/models/Analytics";

export class GetStreaksUseCase {
  constructor(private readonly port: IAnalyticsPort) {}

  async execute(): Promise<Streak> {
    return this.port.getStreaks();
  }
}
