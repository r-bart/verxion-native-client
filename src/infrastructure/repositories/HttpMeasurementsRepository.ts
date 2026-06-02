import type { IMeasurementsPort } from "@/domain/measurements/ports/IMeasurementsPort";
import type { WeightLog } from "@/domain/measurements/models/Measurement";
import { apiClient } from "../api/apiClient";

export class HttpMeasurementsRepository implements IMeasurementsPort {
  async logWeight(weightKg: number, loggedAt: string): Promise<WeightLog> {
    return apiClient.post<WeightLog>("/measurements/weight", {
      weightKg,
      loggedAt,
    });
  }
}
