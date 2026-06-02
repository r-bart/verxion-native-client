import type { IMeasurementsPort } from "@/domain/measurements/ports/IMeasurementsPort";
import type { WeightLog } from "@/domain/measurements/models/Measurement";

export class LogWeightUseCase {
  constructor(private readonly port: IMeasurementsPort) {}

  async execute(weightKg: number): Promise<WeightLog> {
    return this.port.logWeight(weightKg, new Date().toISOString());
  }
}
