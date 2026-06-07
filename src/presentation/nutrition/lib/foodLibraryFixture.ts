/**
 * Typed fixtures for the "Alimentos" segment — the shape of
 * `GET /nutrition/food-library`. Populated and empty variants. Back component tests.
 */
import type { FoodLibraryPage } from "@/domain/nutrition/models/FoodLibrary";

export const foodLibraryFixture: FoodLibraryPage = {
  items: [
    {
      id: "pollo",
      kind: "food",
      name: "Pechuga de pollo",
      brand: "Mercadona",
      group: "Proteínas",
      source: "Base verxion",
      serving: { size: "100", unit: "g", label: "100 g" },
      macros: { kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
      logCount: 42,
      lastLoggedDays: 1,
      isCustom: false,
    },
    {
      id: "pollo-arroz",
      kind: "recipe",
      name: "Pollo con arroz",
      brand: null,
      group: "Platos",
      source: "Receta de verxion",
      serving: { size: "1", unit: "ración", label: "1 ración" },
      macros: { kcal: 620, protein: 48, carbs: 70, fat: 14 },
      logCount: 8,
      lastLoggedDays: 3,
      isCustom: true,
    },
  ],
  facets: {
    groups: ["Proteínas", "Platos", "Carbohidratos"],
    sources: ["Base verxion", "Personalizados"],
  },
  page: 1,
  pageSize: 20,
  totalCount: 2,
  hasMore: false,
};

export const foodLibraryEmptyFixture: FoodLibraryPage = {
  items: [],
  facets: { groups: [], sources: [] },
  page: 1,
  pageSize: 20,
  totalCount: 0,
  hasMore: false,
};
