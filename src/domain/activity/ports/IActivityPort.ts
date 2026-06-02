import type { StepLog, DailyWater, StepLogEntry } from "../models/Activity";

export interface IActivityPort {
  logSteps(steps: number, date: string): Promise<StepLog>;
  logWater(amountMl: number): Promise<void>;
  getDailyWater(date: string): Promise<DailyWater>;
  getDailySteps(date: string): Promise<number>;
  listStepLogs(from: string, to: string): Promise<StepLogEntry[]>;
}
