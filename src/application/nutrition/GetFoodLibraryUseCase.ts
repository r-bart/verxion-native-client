import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type {
  FoodLibraryPage,
  FoodLibraryParams,
} from "@/domain/nutrition/models/FoodLibrary";

/** Reads the food + recipe library (curated `GET /nutrition/food-library`). */
export class GetFoodLibraryUseCase {
  constructor(private readonly port: INutritionPort) {}

  async execute(params?: FoodLibraryParams): Promise<FoodLibraryPage> {
    return this.port.getFoodLibrary(params);
  }
}
