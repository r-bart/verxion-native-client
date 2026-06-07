/**
 * DietDayPlan — the "Plan de comidas del día" read-model
 * (`GET /nutrition/diet-day-plan`): today's resolved plan — the diet header, the
 * ordered meals (each with its food items + logged state), the day's supplements,
 * and the day total. Raw, locale-neutral mirror of the API schema. Read-only.
 */
import type { MacroSet, WaterAmount } from "./NutritionDashboard";

export type DietDayState = "active" | "empty";

export interface DietDayPlanItem {
  id: string;
  kind: "food" | "recipe";
  refId: string;
  name: string;
  quantity: number;
  unit: string;
  macros: MacroSet;
}

export interface DietDayPlanMeal {
  id: string;
  orderIndex: number;
  name: string;
  mealType: string;
  /** When the meal was logged today, or null when still pending. */
  loggedAt: string | null;
  macros: MacroSet;
  targets: MacroSet | null;
  items: DietDayPlanItem[];
}

export interface DietDaySupplement {
  id: string;
  name: string;
  schedule: string | null;
}

export interface DietDayDiet {
  id: string;
  name: string;
  goal: string | null;
  week: number;
  weeks: number | null;
  mealCount: number;
  targets: MacroSet;
  proteinGoal: number;
  waterGoal: WaterAmount;
}

export interface DietDayPlan {
  state: DietDayState;
  date: string;
  diet: DietDayDiet | null;
  meals: DietDayPlanMeal[];
  supplements: DietDaySupplement[];
  total: MacroSet;
  agentNote: string | null;
}
