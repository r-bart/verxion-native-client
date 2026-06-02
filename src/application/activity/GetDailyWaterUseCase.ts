import type { IActivityPort } from "@/domain/activity/ports/IActivityPort";
import type { DailyWater } from "@/domain/activity/models/Activity";

export class GetDailyWaterUseCase {
  constructor(private readonly port: IActivityPort) {}

  async execute(date: string): Promise<DailyWater> {
    return this.port.getDailyWater(date);
  }
}
