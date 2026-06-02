import type { DietPlan, DietPlanDetail } from "../models/DietPlan";
import type { DailyMealLog } from "../models/MealLog";
import type { Food, FoodSearchParams } from "../models/Food";
import type { NutritionDayState } from "../models/NutritionDayState";
import type { NutritionWeeklySummary } from "../models/NutritionWeeklySummary";

export interface INutritionPort {
  getDietPlans(): Promise<DietPlan[]>;
  getDietPlanDetail(id: string): Promise<DietPlanDetail>;
  getDailyMealLogs(date: string): Promise<DailyMealLog>;
  searchFoods(params: FoodSearchParams): Promise<Food[]>;
  getNutritionDayState(date: string): Promise<NutritionDayState>;
  getNutritionWeeklySummary(weekDate?: string): Promise<NutritionWeeklySummary>;
}
