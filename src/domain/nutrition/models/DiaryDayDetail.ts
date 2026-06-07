/**
 * DiaryDayDetail — the "Detalle de día del diario" read-model
 * (`GET /nutrition/diary-day/{date}`): a closed day's report — consumed vs target
 * macros, water, the day classification, the logged meals, and the agent recap.
 * Raw, locale-neutral mirror of the API `DiaryDay` schema (named *Detail here to
 * avoid colliding with the diary-feed list item). Read-only.
 */
import type { MacroSet, WaterAmount } from "./NutritionDashboard";

/** How the day landed against target. */
export type DayClass = "clavado" | "objetivo" | "correcto" | "bajo";

export interface DiaryDayMeal {
  id: string;
  name: string;
  mealType: string;
  loggedAt: string | null;
  isKey: boolean;
  macros: MacroSet;
}

export interface DiaryDayDetail {
  date: string;
  diet: { id: string; name: string } | null;
  consumed: MacroSet;
  targets: MacroSet;
  water: WaterAmount;
  waterGoal: WaterAmount;
  adherence: number | null;
  dayClass: DayClass | null;
  mealsLogged: number;
  meals: DiaryDayMeal[];
  recap: string | null;
}
