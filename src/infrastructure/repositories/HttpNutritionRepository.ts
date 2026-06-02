import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { DietPlan, DietPlanDetail, DietPlanDay } from "@/domain/nutrition/models/DietPlan";
import type { DailyMealLog } from "@/domain/nutrition/models/MealLog";
import type { Food, FoodSearchParams } from "@/domain/nutrition/models/Food";
import type { NutritionDayState } from "@/domain/nutrition/models/NutritionDayState";
import type { NutritionWeeklySummary } from "@/domain/nutrition/models/NutritionWeeklySummary";
import { apiClient } from "../api/apiClient";

export class HttpNutritionRepository implements INutritionPort {
  async getDietPlans(): Promise<DietPlan[]> {
    return apiClient.get<DietPlan[]>("/diet-plans");
  }

  async getDietPlanDetail(id: string): Promise<DietPlanDetail> {
    const [plan, days] = await Promise.all([
      apiClient.get<DietPlan>(`/diet-plans/${id}`),
      apiClient.get<DietPlanDay[]>(`/diet-plans/${id}/days`),
    ]);
    return { plan, days };
  }

  async getDailyMealLogs(date: string): Promise<DailyMealLog> {
    return apiClient.get<DailyMealLog>(`/nutrition/logs/daily/${date}`);
  }

  async searchFoods(params: FoodSearchParams): Promise<Food[]> {
    const queryParams: Record<string, string> = {};
    if (params.q) queryParams.q = params.q;
    if (params.limit) queryParams.limit = String(params.limit);
    if (params.offset) queryParams.offset = String(params.offset);
    return apiClient.get<Food[]>("/foods", queryParams);
  }

  async getNutritionDayState(date: string): Promise<NutritionDayState> {
    const raw = await apiClient.get<{
      state: NutritionDayState["state"];
      actual: { calories: number; protein: number; carbs: number; fat: number } | null;
      target: {
        calories: number | null;
        protein: number | null;
        carbs: number | null;
        fat: number | null;
      } | null;
      adherencePct: number | null;
      mealCount: number;
    }>("/nutrition/analytics/day-state", { date });

    const actual = raw.actual ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const target = raw.target ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };

    return {
      state: raw.state,
      calories: { target: target.calories ?? 0, actual: actual.calories, unit: "kcal" },
      protein: { target: target.protein ?? 0, actual: actual.protein, unit: "g" },
      carbs: { target: target.carbs ?? 0, actual: actual.carbs, unit: "g" },
      fat: { target: target.fat ?? 0, actual: actual.fat, unit: "g" },
      compliance: raw.adherencePct ?? 0,
      mealsLogged: raw.mealCount,
    };
  }

  async getNutritionWeeklySummary(weekDate?: string): Promise<NutritionWeeklySummary> {
    const params: Record<string, string> = {};
    if (weekDate) params.weekDate = weekDate;
    return apiClient.get<NutritionWeeklySummary>("/nutrition/analytics/weekly-summary", params);
  }
}
