/**
 * Typed fixtures for "Plan de comidas del día" — the shape of
 * `GET /nutrition/diet-day-plan`. Active (with a logged + a pending meal) and
 * empty (no active diet) variants. Back screen tests.
 */
import type { DietDayPlan } from "@/domain/nutrition/models/DietDayPlan";

export const dietDayPlanFixture: DietDayPlan = {
  state: "active",
  date: "2026-06-07",
  diet: {
    id: "definicion-2250",
    name: "Definición · 2.250 kcal",
    goal: "fat_loss",
    week: 3,
    weeks: 6,
    mealCount: 2,
    targets: { kcal: 2250, protein: 180, carbs: 240, fat: 70 },
    proteinGoal: 180,
    waterGoal: { value: 2.5, unit: "L" },
  },
  meals: [
    {
      id: "desayuno",
      orderIndex: 0,
      name: "Desayuno",
      mealType: "breakfast",
      loggedAt: "2026-06-07T08:10:00Z",
      macros: { kcal: 520, protein: 36, carbs: 58, fat: 14 },
      targets: { kcal: 520, protein: 36, carbs: 58, fat: 14 },
      items: [
        {
          id: "i1",
          kind: "food",
          refId: "avena",
          name: "Avena",
          quantity: 80,
          unit: "g",
          macros: { kcal: 300, protein: 11, carbs: 50, fat: 6 },
        },
      ],
    },
    {
      id: "comida",
      orderIndex: 1,
      name: "Comida",
      mealType: "lunch",
      loggedAt: null,
      macros: { kcal: 680, protein: 52, carbs: 70, fat: 18 },
      targets: { kcal: 680, protein: 52, carbs: 70, fat: 18 },
      items: [
        {
          id: "i2",
          kind: "food",
          refId: "pollo",
          name: "Pechuga de pollo",
          quantity: 180,
          unit: "g",
          macros: { kcal: 297, protein: 56, carbs: 0, fat: 6 },
        },
      ],
    },
  ],
  supplements: [{ id: "s1", name: "Creatina", schedule: "with_meal" }],
  total: { kcal: 1200, protein: 88, carbs: 128, fat: 32 },
  agentNote: "Vas bien de proteína; deja la comida cargada de carbos cerca del entreno.",
};

export const dietDayPlanEmptyFixture: DietDayPlan = {
  state: "empty",
  date: "2026-06-07",
  diet: null,
  meals: [],
  supplements: [],
  total: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  agentNote: null,
};
