/**
 * FoodLibrary — the "Alimentos" segment read-model (`GET /nutrition/food-library`):
 * a searchable, filterable page of foods and recipes plus the filter facets and
 * pagination metadata. Search / filter / sort / paging are SERVER-side here (unlike
 * the diet library), so the query params flow to the API. Raw, locale-neutral
 * mirror of the API `FoodLibraryPage`. Read-only.
 */
import type { MacroSet } from "./NutritionDashboard";
import type { FoodKind, FoodServing } from "./FoodDetail";

export interface FoodLibraryItem {
  id: string;
  kind: FoodKind;
  name: string;
  brand: string | null;
  group: string;
  source: string;
  serving: FoodServing;
  macros: MacroSet;
  logCount: number;
  lastLoggedDays: number | null;
  isCustom: boolean;
}

export interface FoodLibraryFacets {
  groups: string[];
  sources: string[];
}

export interface FoodLibraryPage {
  items: FoodLibraryItem[];
  facets: FoodLibraryFacets;
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}

/** Query params for the food library (all optional; server applies defaults). */
export interface FoodLibraryParams {
  q?: string;
  group?: string;
  source?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}
