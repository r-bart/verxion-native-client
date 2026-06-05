import type { IHealthPort, HealthMetric, HealthStatus } from "@/domain/health";

export class SetHealthMetricUseCase {
  constructor(private readonly port: IHealthPort) {}

  async execute(metric: HealthMetric, enabled: boolean): Promise<HealthStatus> {
    return this.port.setMetricEnabled(metric, enabled);
  }
}
