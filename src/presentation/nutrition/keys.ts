/**
 * Query-key factory for the Nutrición feature. One namespace, keyed by the read
 * it backs. Grows as the module gains its diary/library/detail reads.
 */
export const nutritionKeys = {
  all: ["nutrition"] as const,

  dietDashboard: () => ["nutrition", "dietDashboard"] as const,
  dietLibrary: () => ["nutrition", "dietLibrary"] as const,
  dietDetail: (id: string) => ["nutrition", "dietDetail", id] as const,
  mealDetail: (planId: string, mealId: string) =>
    ["nutrition", "mealDetail", planId, mealId] as const,
  foodDetail: (kind: string, id: string) =>
    ["nutrition", "foodDetail", kind, id] as const,
  dietDayPlan: () => ["nutrition", "dietDayPlan"] as const,
  diaryFeed: () => ["nutrition", "diaryFeed"] as const,
  diaryDay: (date: string) => ["nutrition", "diaryDay", date] as const,
  foodLibrary: (q: string, group: string) =>
    ["nutrition", "foodLibrary", q, group] as const,
};
