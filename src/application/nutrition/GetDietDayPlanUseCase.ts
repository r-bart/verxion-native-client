import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { DietDayPlan } from "@/domain/nutrition/models/DietDayPlan";

/** Reads today's resolved meal plan (curated `GET /nutrition/diet-day-plan`). */
export class GetDietDayPlanUseCase {
  constructor(private readonly port: INutritionPort) {}

  async execute(tzOffsetMinutes?: number): Promise<DietDayPlan> {
    return this.port.getDietDayPlan(tzOffsetMinutes);
  }
}
