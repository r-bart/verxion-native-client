import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { Food, FoodSearchParams } from "@/domain/nutrition/models/Food";

export class SearchFoodsUseCase {
  constructor(private readonly port: INutritionPort) {}

  async execute(params: FoodSearchParams): Promise<Food[]> {
    return this.port.searchFoods(params);
  }
}
