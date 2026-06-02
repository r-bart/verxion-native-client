import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { DietPlan } from "@/domain/nutrition/models/DietPlan";

export class GetDietPlansUseCase {
  constructor(private readonly port: INutritionPort) {}

  async execute(): Promise<DietPlan[]> {
    return this.port.getDietPlans();
  }
}
