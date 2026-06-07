import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { DietLibrary } from "@/domain/nutrition/models/DietLibrary";
import type { DietDetail } from "@/domain/nutrition/models/DietDetail";
import type { MealDetail } from "@/domain/nutrition/models/MealDetail";
import type { FoodDetail, FoodKind } from "@/domain/nutrition/models/FoodDetail";
import type { DietDayPlan } from "@/domain/nutrition/models/DietDayPlan";
import type { DiaryFeedPage } from "@/domain/nutrition/models/DiaryFeed";
import type { DiaryDayDetail } from "@/domain/nutrition/models/DiaryDayDetail";
import type { DailyMealLog } from "@/domain/nutrition/models/MealLog";
import type {
  FoodLibraryPage,
  FoodLibraryParams,
} from "@/domain/nutrition/models/FoodLibrary";
import type { NutritionDayState } from "@/domain/nutrition/models/NutritionDayState";
import type { NutritionWeeklySummary } from "@/domain/nutrition/models/NutritionWeeklySummary";
import type { NutritionDashboard } from "@/domain/nutrition/models/NutritionDashboard";
import { apiClient } from "../api/apiClient";

export class HttpNutritionRepository implements INutritionPort {
  async getDietDashboard(): Promise<NutritionDashboard> {
    // GET /api/v1/nutrition/diet-dashboard → { data: NutritionDashboard }
    // (apiClient unwraps the `data` envelope). Live read-model, no params.
    return apiClient.get<NutritionDashboard>("/nutrition/diet-dashboard");
  }

  async getDietLibrary(): Promise<DietLibrary> {
    // GET /api/v1/nutrition/diet-library → { data: DietLibrary } (apiClient
    // unwraps the envelope). Curated native read-model; search/filter/sort is
    // client-side over this one read.
    return apiClient.get<DietLibrary>("/nutrition/diet-library");
  }

  async getDietDetail(id: string): Promise<DietDetail> {
    // GET /api/v1/nutrition/diet-detail/{planId} → { data: DietDetail }
    // (apiClient unwraps the envelope). Curated read-model: header + meal spine.
    return apiClient.get<DietDetail>(`/nutrition/diet-detail/${id}`);
  }

  async getMealDetail(planId: string, mealId: string): Promise<MealDetail> {
    // GET /api/v1/nutrition/meal-detail/{planId}/{mealId} → { data: MealDetail }.
    // Curated read-model: a planned meal's items + supplements.
    return apiClient.get<MealDetail>(
      `/nutrition/meal-detail/${planId}/${mealId}`
    );
  }

  async getFoodDetail(kind: FoodKind, id: string): Promise<FoodDetail> {
    // GET /api/v1/nutrition/food-detail/{kind}/{id} → { data: FoodDetail }.
    // Curated read-model: a single food or recipe.
    return apiClient.get<FoodDetail>(`/nutrition/food-detail/${kind}/${id}`);
  }

  async getDietDayPlan(tzOffsetMinutes?: number): Promise<DietDayPlan> {
    // GET /api/v1/nutrition/diet-day-plan → { data: DietDayPlan }. Curated
    // read-model: today's resolved meal plan. tzOffsetMinutes resolves "today".
    const params: Record<string, string> = {};
    if (tzOffsetMinutes != null) params.tzOffsetMinutes = String(tzOffsetMinutes);
    return apiClient.get<DietDayPlan>("/nutrition/diet-day-plan", params);
  }

  async getDiaryFeed(tzOffsetMinutes?: number): Promise<DiaryFeedPage> {
    // GET /api/v1/nutrition/diary-feed → { data: DiaryFeedPage }. Curated
    // read-model: logged days by phase + rolling summary. First page only for
    // now — pagination (nextCursor) is not yet consumed by the segment.
    const params: Record<string, string> = {};
    if (tzOffsetMinutes != null) params.tzOffsetMinutes = String(tzOffsetMinutes);
    return apiClient.get<DiaryFeedPage>("/nutrition/diary-feed", params);
  }

  async getDiaryDay(
    date: string,
    tzOffsetMinutes?: number
  ): Promise<DiaryDayDetail> {
    // GET /api/v1/nutrition/diary-day/{date} → { data: DiaryDay }. Curated
    // read-model: a closed day's consumed-vs-target report + logged meals.
    const params: Record<string, string> = {};
    if (tzOffsetMinutes != null) params.tzOffsetMinutes = String(tzOffsetMinutes);
    return apiClient.get<DiaryDayDetail>(`/nutrition/diary-day/${date}`, params);
  }

  async getDailyMealLogs(date: string): Promise<DailyMealLog> {
    return apiClient.get<DailyMealLog>(`/nutrition/logs/daily/${date}`);
  }

  async getFoodLibrary(params: FoodLibraryParams = {}): Promise<FoodLibraryPage> {
    // GET /api/v1/nutrition/food-library → { data: FoodLibraryPage }. Curated
    // read-model: server-side search / filter / sort / paging.
    const queryParams: Record<string, string> = {};
    if (params.q) queryParams.q = params.q;
    if (params.group) queryParams.group = params.group;
    if (params.source) queryParams.source = params.source;
    if (params.sort) queryParams.sort = params.sort;
    if (params.page != null) queryParams.page = String(params.page);
    if (params.pageSize != null) queryParams.pageSize = String(params.pageSize);
    return apiClient.get<FoodLibraryPage>("/nutrition/food-library", queryParams);
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
