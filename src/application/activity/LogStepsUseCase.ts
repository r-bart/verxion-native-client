import type { IActivityPort } from "@/domain/activity/ports/IActivityPort";
import type { StepLog } from "@/domain/activity/models/Activity";

export class LogStepsUseCase {
  constructor(private readonly port: IActivityPort) {}

  async execute(totalSteps: number): Promise<StepLog> {
    const today = new Date().toISOString().slice(0, 10);
    return this.port.logSteps(totalSteps, today);
  }
}
