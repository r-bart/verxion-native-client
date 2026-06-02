import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { DailyMealLog } from "@/domain/nutrition/models/MealLog";

export class GetDailyMealLogsUseCase {
  constructor(private readonly port: INutritionPort) {}

  async execute(date: string): Promise<DailyMealLog> {
    return this.port.getDailyMealLogs(date);
  }
}
