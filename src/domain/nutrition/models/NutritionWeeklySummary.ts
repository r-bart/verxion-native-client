export interface DailyMacroEntry {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  targetCalories: number | null;
  targetProtein: number | null;
  targetCarbs: number | null;
  targetFat: number | null;
  mealCount: number;
}

export interface NutritionWeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalMealsLogged: number;
  avgDailyCalories: number;
  avgDailyProtein: number;
  avgDailyCarbs: number;
  avgDailyFat: number;
  dayByDay: DailyMacroEntry[];
}
