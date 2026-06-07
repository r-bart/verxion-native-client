/**
 * FoodDetail — the "Detalle de alimento" read-model
 * (`GET /nutrition/food-detail/{kind}/{id}`): a single food OR recipe (the `kind`
 * discriminates). Foods carry per-100 / per-serving macros + fiber; recipes carry a
 * recipe block (servings, prep time, ingredients, totals). Raw, locale-neutral
 * mirror of the API schema. Read-only.
 */
import type { MacroSet } from "./NutritionDashboard";

export type FoodKind = "food" | "recipe";

export interface FoodServing {
  size: string | null;
  unit: string | null;
  label: string | null;
}

export interface RecipeIngredient {
  id: string;
  kind: FoodKind;
  refId: string;
  name: string;
  quantity: number;
  unit: string;
  macros: MacroSet;
}

export interface FoodRecipe {
  servings: number;
  prepTimeMinutes: number | null;
  totals: MacroSet;
  ingredients: RecipeIngredient[];
}

export interface FoodDetail {
  id: string;
  kind: FoodKind;
  name: string;
  brand: string | null;
  group: string;
  source: string;
  isCustom: boolean;
  serving: FoodServing;
  per100: MacroSet | null;
  perServing: MacroSet | null;
  fiber: number | null;
  recipe: FoodRecipe | null;
  agentNote: string | null;
}
