import type { IAnalyticsPort } from "@/domain/analytics/ports/IAnalyticsPort";
import type { WeekView } from "@/domain/analytics/models/Analytics";

export class GetWeekViewUseCase {
  constructor(private readonly port: IAnalyticsPort) {}

  async execute(): Promise<WeekView> {
    return this.port.getWeekView();
  }
}
