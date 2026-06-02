export interface DietPlan {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "ready" | "active" | "paused" | "completed";
  goal: string | null;
  daysCount: number;
  dailyCalories: number | null;
  dailyProtein: number | null;
  dailyCarbs: number | null;
  dailyFat: number | null;
  createdAt: string;
}

export interface DietPlanDay {
  id: string;
  name: string;
  dayType: "training" | "rest" | "refeed" | "custom";
  order: number;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  mealCount: number;
}

export interface DietPlanDetail {
  plan: DietPlan;
  days: DietPlanDay[];
}
