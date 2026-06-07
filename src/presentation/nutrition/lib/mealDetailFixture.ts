/**
 * Typed fixture for "Detalle de comida" — the shape of
 * `GET /nutrition/meal-detail/{planId}/{mealId}`. Backs screen tests.
 */
import type { MealDetail } from "@/domain/nutrition/models/MealDetail";

export const mealDetailFixture: MealDetail = {
  kind: "meal",
  name: "Comida",
  window: "14:00",
  calories: 680,
  protein: 52,
  items: [
    {
      name: "Pechuga de pollo",
      amount: "180 g",
      alternatives: ["Lomo de pavo", "Tofu firme"],
    },
    { name: "Arroz basmati", amount: "80 g (seco)", alternatives: ["Quinoa", "Patata"] },
    { name: "Aceite de oliva", amount: "10 ml", alternatives: [] },
  ],
  supplements: ["Creatina 5 g"],
};
