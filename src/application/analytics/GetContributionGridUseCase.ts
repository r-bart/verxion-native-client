import type { IAnalyticsPort } from "@/domain/analytics/ports/IAnalyticsPort";
import type { ContributionDay } from "@/domain/analytics/models/Analytics";

export class GetContributionGridUseCase {
  constructor(private readonly port: IAnalyticsPort) {}

  async execute(): Promise<ContributionDay[]> {
    return this.port.getContributionGrid();
  }
}
