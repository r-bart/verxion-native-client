export const nutritionKeys = {
  all: () => ["nutrition"] as const,
  dietPlans: () => ["nutrition", "diet-plans"] as const,
  dietPlanDetail: (id: string) => ["nutrition", "diet-plan", id] as const,
  dailyMealLogs: (date: string) => ["nutrition", "meal-logs", date] as const,
  foods: (params?: Record<string, string>) => ["nutrition", "foods", params] as const,
};
