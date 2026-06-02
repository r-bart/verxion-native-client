import type { IActivityPort } from "@/domain/activity/ports/IActivityPort";

export class GetDailyStepsUseCase {
  constructor(private readonly port: IActivityPort) {}

  async execute(date: string): Promise<number> {
    return this.port.getDailySteps(date);
  }
}
