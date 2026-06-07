/**
 * Typed fixture for "Detalle de dieta" — the shape of
 * `GET /nutrition/diet-detail/{planId}`. Backs component/screen tests.
 */
import type { DietDetail } from "@/domain/nutrition/models/DietDetail";

export const dietDetailFixture: DietDetail = {
  id: "definicion-2250",
  name: "Definición · 2.250 kcal",
  goal: "fat_loss",
  state: "active",
  targets: { kcal: 2250, protein: 180, carbs: 240, fat: 70 },
  proteinGoal: 180,
  mealCount: 5,
  waterGoal: { value: 2.5, unit: "L" },
  week: 3,
  weeks: 6,
  weekFraction: 0.45,
  score: 78,
  adherence: 92,
  daysLogged: 21,
  endDate: null,
  agentNote:
    "Semana 3 y vas en objetivo, con 92 % de media. Mantenemos el déficit dos semanas más y reevaluamos.",
  meals: [
    {
      id: "desayuno",
      name: "Desayuno",
      mealType: "breakfast",
      orderIndex: 0,
      isKey: false,
      macros: { kcal: 520, protein: 36, carbs: 58, fat: 14 },
      targets: { kcal: 520, protein: 36, carbs: 58, fat: 14 },
    },
    {
      id: "comida",
      name: "Comida",
      mealType: "lunch",
      orderIndex: 1,
      isKey: true,
      macros: { kcal: 680, protein: 52, carbs: 70, fat: 18 },
      targets: { kcal: 680, protein: 52, carbs: 70, fat: 18 },
    },
    {
      id: "pre",
      name: "Pre-entreno",
      mealType: "pre_workout",
      orderIndex: 2,
      isKey: false,
      macros: { kcal: 330, protein: 24, carbs: 44, fat: 6 },
      targets: null,
    },
    {
      id: "cena",
      name: "Cena",
      mealType: "dinner",
      orderIndex: 3,
      isKey: false,
      macros: { kcal: 720, protein: 48, carbs: 60, fat: 24 },
      targets: { kcal: 720, protein: 48, carbs: 60, fat: 24 },
    },
  ],
};
