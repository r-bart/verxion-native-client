import type { IHealthPort, HealthStatus } from "@/domain/health";

export class RequestHealthAuthorizationUseCase {
  constructor(private readonly port: IHealthPort) {}

  async execute(): Promise<HealthStatus> {
    return this.port.requestAuthorization();
  }
}
