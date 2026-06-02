import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { DietPlanDetail } from "@/domain/nutrition/models/DietPlan";

export class GetDietPlanDetailUseCase {
  constructor(private readonly port: INutritionPort) {}

  async execute(id: string): Promise<DietPlanDetail> {
    return this.port.getDietPlanDetail(id);
  }
}
