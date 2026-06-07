/**
 * MealDetail — the "Detalle de comida" read-model
 * (`GET /nutrition/meal-detail/{planId}/{mealId}`): one planned meal's header
 * (window, calories, protein) plus its food items (each with the agent's
 * alternatives) and supplements. Raw, locale-neutral mirror of the API schema.
 *
 * The read-model is intentionally lean — it carries calories + protein only (no
 * carbs/fat split), so the screen paints exactly that. Read-only: swapping a food
 * is the agent's job; `alternatives` are what the agent already offered.
 */
export interface MealDetailItem {
  name: string;
  /** Free-form portion label, e.g. "120 g" or "1 cazo". */
  amount: string;
  /** Agent-offered swaps for this item (display-only). */
  alternatives: string[];
}

export interface MealDetail {
  kind: "meal";
  name: string;
  /** Time-of-day window label (e.g. "08:00") or null when the plan sets none. */
  window: string | null;
  calories: number | null;
  protein: number | null;
  items: MealDetailItem[];
  supplements: string[];
}
