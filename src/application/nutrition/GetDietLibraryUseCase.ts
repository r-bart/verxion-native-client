import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { DietLibrary } from "@/domain/nutrition/models/DietLibrary";

/** Reads the "Dietas" library (curated `GET /nutrition/diet-library` read-model). */
export class GetDietLibraryUseCase {
  constructor(private readonly port: INutritionPort) {}

  async execute(): Promise<DietLibrary> {
    return this.port.getDietLibrary();
  }
}
