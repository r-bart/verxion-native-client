/**
 * DietDetail — the "Detalle de dieta" read-model (`GET /nutrition/diet-detail/{planId}`):
 * the plan's header (goal, targets, week progress, adherence) plus the day's meal
 * spine, each meal tapping through to its detail. Raw, locale-neutral mirror of the
 * API schema. Read-only: adjusting a diet is the agent's job. Nutrition analogue of
 * Entreno's routine detail.
 */
import type { MacroSet, WaterAmount } from "./NutritionDashboard";
import type { DietLibraryState } from "./DietLibrary";

/** One meal in the diet's day spine. `targets` is null when the plan sets none. */
export interface DietDetailMeal {
  id: string;
  name: string;
  mealType: string;
  orderIndex: number;
  isKey: boolean;
  macros: MacroSet;
  targets: MacroSet | null;
}

export interface DietDetail {
  id: string;
  name: string;
  goal: string | null;
  state: DietLibraryState;
  targets: MacroSet;
  proteinGoal: number;
  mealCount: number;
  waterGoal: WaterAmount;
  week: number | null;
  weeks: number | null;
  weekFraction: number | null;
  score: number | null;
  adherence: number | null;
  daysLogged: number;
  endDate: string | null;
  meals: DietDetailMeal[];
  agentNote: string | null;
}
