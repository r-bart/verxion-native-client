import type { IAnalyticsPort } from "@/domain/analytics/ports/IAnalyticsPort";
import type { ExecutionScore } from "@/domain/analytics/models/Analytics";

export class GetExecutionScoreUseCase {
  constructor(private readonly port: IAnalyticsPort) {}

  async execute(windowDays: number): Promise<ExecutionScore> {
    return this.port.getExecutionScore(windowDays);
  }
}
