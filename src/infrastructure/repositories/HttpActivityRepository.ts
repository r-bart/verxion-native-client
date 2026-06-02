import type { IActivityPort } from "@/domain/activity/ports/IActivityPort";
import type { StepLog, DailyWater, StepLogEntry } from "@/domain/activity/models/Activity";
import { apiClient } from "../api/apiClient";

export class HttpActivityRepository implements IActivityPort {
  async getDailySteps(date: string): Promise<number> {
    const logs = await apiClient.get<{ totalSteps: number }[]>(
      "/activity/steps",
      { from: date, to: date }
    );
    return logs.reduce((sum, log) => sum + log.totalSteps, 0);
  }

  async getDailyWater(date: string): Promise<DailyWater> {
    return apiClient.get<DailyWater>(`/nutrition/water/daily/${date}`);
  }

  async logSteps(steps: number, date: string): Promise<StepLog> {
    return apiClient.post<StepLog>("/activity/steps", {
      totalSteps: steps,
      loggedDate: date,
    });
  }

  async logWater(amountMl: number): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    await apiClient.post("/nutrition/water/", {
      logDate: today,
      amountMl,
    });
  }

  async listStepLogs(from: string, to: string): Promise<StepLogEntry[]> {
    return apiClient.get<StepLogEntry[]>("/activity/steps", { from, to });
  }
}
