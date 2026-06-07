import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { DietDetail } from "@/domain/nutrition/models/DietDetail";

/** Reads a single diet's detail (curated `GET /nutrition/diet-detail/{planId}`). */
export class GetDietDetailUseCase {
  constructor(private readonly port: INutritionPort) {}

  async execute(id: string): Promise<DietDetail> {
    return this.port.getDietDetail(id);
  }
}
