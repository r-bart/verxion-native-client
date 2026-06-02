import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { NutritionDayState } from "@/domain/nutrition/models/NutritionDayState";

export class GetNutritionDayStateUseCase {
  constructor(private readonly port: INutritionPort) {}

  async execute(date: string): Promise<NutritionDayState> {
    return this.port.getNutritionDayState(date);
  }
}
