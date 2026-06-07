import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { MealDetail } from "@/domain/nutrition/models/MealDetail";

/** Reads one planned meal's detail (curated `GET /nutrition/meal-detail/{planId}/{mealId}`). */
export class GetMealDetailUseCase {
  constructor(private readonly port: INutritionPort) {}

  async execute(planId: string, mealId: string): Promise<MealDetail> {
    return this.port.getMealDetail(planId, mealId);
  }
}
