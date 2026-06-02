import type { IAnalyticsPort } from "@/domain/analytics/ports/IAnalyticsPort";
import type { DayTrainingState } from "@/domain/analytics/models/Analytics";

export class GetDayStateUseCase {
  constructor(private readonly port: IAnalyticsPort) {}

  async execute(date: string): Promise<DayTrainingState> {
    return this.port.getDayState(date);
  }
}
