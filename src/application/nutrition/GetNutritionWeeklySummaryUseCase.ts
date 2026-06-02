import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { NutritionWeeklySummary } from "@/domain/nutrition/models/NutritionWeeklySummary";

export class GetNutritionWeeklySummaryUseCase {
  constructor(private readonly port: INutritionPort) {}

  async execute(weekDate?: string): Promise<NutritionWeeklySummary> {
    return this.port.getNutritionWeeklySummary(weekDate);
  }
}
