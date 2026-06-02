import type { IActivityPort } from "@/domain/activity/ports/IActivityPort";
import type { StepLogEntry } from "@/domain/activity/models/Activity";

export class ListStepLogsUseCase {
  constructor(private readonly port: IActivityPort) {}

  async execute(from: string, to: string): Promise<StepLogEntry[]> {
    return this.port.listStepLogs(from, to);
  }
}
