export interface StepLog {
  id: string;
  steps: number;
  date: string;
}

export interface StepLogEntry {
  loggedDate: string;
  totalSteps: number;
  stepGoal: number | null;
}

export interface DailyWater {
  totalMl: number;
  date: string;
  logs: { id: string; amountMl: number; loggedAt: string }[];
}
