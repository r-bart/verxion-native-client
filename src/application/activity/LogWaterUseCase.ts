import type { IActivityPort } from "@/domain/activity/ports/IActivityPort";

export class LogWaterUseCase {
  constructor(private readonly port: IActivityPort) {}

  async execute(amountMl: number): Promise<void> {
    return this.port.logWater(amountMl);
  }
}
