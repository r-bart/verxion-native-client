/**
 * NutritionDashboard — raw, locale-neutral mirror of the API `NutritionDashboard`
 * read-model (`GET /api/v1/nutrition/diet-dashboard`). It backs the "Plan" segment
 * of the Nutrición landing: the active diet, today's intake, the meal spine, the
 * day's supplements, the next meal, and the agent's note.
 *
 * Numbers and enums only — NO display strings, NO formatting. Locale formatting
 * (es-ES thousands/decimals) lives in presentation (`nutrition/lib/format.ts`),
 * mirroring the Entreno convention.
 */

export type DietState = "active" | "fresh" | "empty";
export type MealStatus = "done" | "now" | "up";

/** kcal + the three macros (grams), shared by targets and consumed totals. */
export interface MacroSet {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** A water amount; the API always reports litres. */
export interface WaterAmount {
  value: number;
  unit: "L";
}

/** The active diet at the front of the Plan segment (null when state !== "active"). */
export interface ActiveDietSummary {
  id: string;
  name: string;
  goal: string | null;
  mealCount: number;
  week: number;
  weeks: number | null;
  weekFraction: number | null;
  score: number | null;
  adherence: number | null;
  targets: MacroSet;
  waterGoal: WaterAmount;
}

/** Today's running totals — the API computes these; the client never sums them. */
export interface DietToday {
  consumed: MacroSet;
  water: WaterAmount;
  mealsLogged: number;
  mealsTotal: number;
}

/** One meal in the day's chronological spine (ordered by `orderIndex`). */
export interface MealSpineItem {
  mealId: string;
  orderIndex: number;
  name: string;
  mealType: string;
  targets: MacroSet;
  status: MealStatus;
}

/** A supplement scheduled for the day. `schedule` is a free-form label, not a time. */
export interface SupplementItem {
  id: string;
  name: string;
  schedule: string | null;
  taken: boolean;
}

/** The next meal to eat, surfaced as the intake CTA (null when the day is closed). */
export interface NextMeal {
  mealId: string;
  name: string;
  mealType: string;
  targets: MacroSet;
}

export interface NutritionDashboard {
  state: DietState;
  activeDiet: ActiveDietSummary | null;
  today: DietToday;
  mealSpine: MealSpineItem[];
  supplements: SupplementItem[];
  next: NextMeal | null;
  agentNote: string | null;
}
