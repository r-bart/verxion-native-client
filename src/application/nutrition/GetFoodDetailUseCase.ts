import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { FoodDetail, FoodKind } from "@/domain/nutrition/models/FoodDetail";

/** Reads a single food or recipe (curated `GET /nutrition/food-detail/{kind}/{id}`). */
export class GetFoodDetailUseCase {
  constructor(private readonly port: INutritionPort) {}

  async execute(kind: FoodKind, id: string): Promise<FoodDetail> {
    return this.port.getFoodDetail(kind, id);
  }
}
