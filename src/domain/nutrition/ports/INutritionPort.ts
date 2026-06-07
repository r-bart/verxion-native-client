import type { DietLibrary } from "../models/DietLibrary";
import type { DietDetail } from "../models/DietDetail";
import type { MealDetail } from "../models/MealDetail";
import type { FoodDetail, FoodKind } from "../models/FoodDetail";
import type { DietDayPlan } from "../models/DietDayPlan";
import type { DiaryFeedPage } from "../models/DiaryFeed";
import type { DiaryDayDetail } from "../models/DiaryDayDetail";
import type { DailyMealLog } from "../models/MealLog";
import type {
  FoodLibraryPage,
  FoodLibraryParams,
} from "../models/FoodLibrary";
import type { NutritionDayState } from "../models/NutritionDayState";
import type { NutritionWeeklySummary } from "../models/NutritionWeeklySummary";
import type { NutritionDashboard } from "../models/NutritionDashboard";

export interface INutritionPort {
  /** Plan-segment aggregate for the Nutrición landing. */
  getDietDashboard(): Promise<NutritionDashboard>;
  /** "Dietas" library — every diet the agent has built (curated read-model). */
  getDietLibrary(): Promise<DietLibrary>;
  /** "Detalle de dieta" — a single diet's header + day meal spine (curated read-model). */
  getDietDetail(id: string): Promise<DietDetail>;
  /** "Detalle de comida" — one planned meal's items + supplements (curated read-model). */
  getMealDetail(planId: string, mealId: string): Promise<MealDetail>;
  /** "Detalle de alimento" — a single food or recipe (curated read-model). */
  getFoodDetail(kind: FoodKind, id: string): Promise<FoodDetail>;
  /** "Plan de comidas del día" — today's resolved meal plan (curated read-model). */
  getDietDayPlan(tzOffsetMinutes?: number): Promise<DietDayPlan>;
  /** "Diario" — logged days grouped by phase + rolling summary (curated read-model). */
  getDiaryFeed(tzOffsetMinutes?: number): Promise<DiaryFeedPage>;
  /** "Detalle de día del diario" — a closed day's report (curated read-model). */
  getDiaryDay(date: string, tzOffsetMinutes?: number): Promise<DiaryDayDetail>;
  getDailyMealLogs(date: string): Promise<DailyMealLog>;
  /** "Alimentos" — searchable food + recipe library (curated read-model). */
  getFoodLibrary(params?: FoodLibraryParams): Promise<FoodLibraryPage>;
  getNutritionDayState(date: string): Promise<NutritionDayState>;
  getNutritionWeeklySummary(weekDate?: string): Promise<NutritionWeeklySummary>;
}
