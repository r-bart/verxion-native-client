/**
 * DietLibrary — the "Dietas" aggregate: every diet the agent has built, in catalog
 * order, plus the filter facets. The screen groups by state (browse mode) or
 * filters + sorts client-side (results mode) over this one read, so
 * search / filter / sort never hit the network. Raw, locale-neutral mirror of the
 * API `DietLibrary` read-model (`GET /api/v1/nutrition/diet-library`).
 *
 * Read-only: creating, activating or editing a diet is the agent's job; the UI
 * frames it as a request ("pídeselo a verxion"), never as a write. Nutrition
 * mirror of Entreno's `RoutineLibrary`.
 */
import type { MacroSet } from "./NutritionDashboard";

export type DietLibraryState = "active" | "draft" | "paused" | "completed";

export interface DietLibraryItem {
  id: string;
  name: string;
  state: DietLibraryState;
  /** Raw goal token (`fat_loss`, `muscle_gain`, …) or null; mapped in presentation. */
  goal: string | null;
  mealCount: number;
  /** Daily protein target in grams (the diet's headline macro). */
  proteinGoal: number;
  targets: MacroSet;
  week: number | null;
  weeks: number | null;
  /** Fill of the current week's cell (0–1); null when the block isn't active. */
  weekFraction: number | null;
  score: number | null;
  adherence: number | null;
  /** Raw end date for the archive row; null when ongoing. Formatted in presentation. */
  endDate: string | null;
}

export interface DietLibraryFacets {
  states: DietLibraryState[];
  goals: string[];
}

export interface DietLibrary {
  diets: DietLibraryItem[];
  facets: DietLibraryFacets;
}
