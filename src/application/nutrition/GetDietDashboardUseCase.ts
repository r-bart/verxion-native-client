import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { NutritionDashboard } from "@/domain/nutrition/models/NutritionDashboard";

/**
 * Reads the Plan-segment aggregate (active diet + today's intake + meal spine +
 * supplements + next meal + agent note) for the Nutrición landing.
 */
export class GetDietDashboardUseCase {
  constructor(private readonly port: INutritionPort) {}

  async execute(): Promise<NutritionDashboard> {
    return this.port.getDietDashboard();
  }
}
