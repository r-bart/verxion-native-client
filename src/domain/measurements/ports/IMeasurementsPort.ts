import type { WeightLog } from "../models/Measurement";

export interface IMeasurementsPort {
  logWeight(weightKg: number, loggedAt: string): Promise<WeightLog>;
}
