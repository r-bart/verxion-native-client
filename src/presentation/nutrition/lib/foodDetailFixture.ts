/**
 * Typed fixtures for "Detalle de alimento" — the shape of
 * `GET /nutrition/food-detail/{kind}/{id}`. A plain food and a recipe variant
 * (the recipe exercises the ingredients block). Back screen tests.
 */
import type { FoodDetail } from "@/domain/nutrition/models/FoodDetail";

export const foodDetailFixture: FoodDetail = {
  id: "pollo",
  kind: "food",
  name: "Pechuga de pollo",
  brand: "Mercadona",
  group: "Proteínas",
  source: "Base verxion",
  isCustom: false,
  serving: { size: "100", unit: "g", label: "100 g" },
  per100: { kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  perServing: { kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  fiber: 0,
  recipe: null,
  agentNote: null,
};

export const recipeDetailFixture: FoodDetail = {
  id: "pollo-arroz",
  kind: "recipe",
  name: "Pollo con arroz y verduras",
  brand: null,
  group: "Platos",
  source: "Receta de verxion",
  isCustom: true,
  serving: { size: "1", unit: "ración", label: "1 ración" },
  per100: null,
  perServing: { kcal: 620, protein: 48, carbs: 70, fat: 14 },
  fiber: 6,
  recipe: {
    servings: 2,
    prepTimeMinutes: 25,
    totals: { kcal: 1240, protein: 96, carbs: 140, fat: 28 },
    ingredients: [
      {
        id: "i1",
        kind: "food",
        refId: "pollo",
        name: "Pechuga de pollo",
        quantity: 300,
        unit: "g",
        macros: { kcal: 495, protein: 93, carbs: 0, fat: 11 },
      },
      {
        id: "i2",
        kind: "food",
        refId: "arroz",
        name: "Arroz basmati",
        quantity: 160,
        unit: "g",
        macros: { kcal: 568, protein: 12, carbs: 124, fat: 2 },
      },
    ],
  },
  agentNote: "Receta base de tu plan; escala las raciones según tus macros del día.",
};
