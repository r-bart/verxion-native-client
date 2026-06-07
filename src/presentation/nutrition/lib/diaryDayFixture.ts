/**
 * Typed fixture for "Detalle de día del diario" — the shape of
 * `GET /nutrition/diary-day/{date}`. Backs the screen test.
 */
import type { DiaryDayDetail } from "@/domain/nutrition/models/DiaryDayDetail";

export const diaryDayFixture: DiaryDayDetail = {
  date: "2026-06-07",
  diet: { id: "definicion-2250", name: "Definición · 2.250 kcal" },
  consumed: { kcal: 2210, protein: 182, carbs: 230, fat: 66 },
  targets: { kcal: 2250, protein: 180, carbs: 240, fat: 70 },
  water: { value: 2.4, unit: "L" },
  waterGoal: { value: 2.5, unit: "L" },
  adherence: 96,
  dayClass: "clavado",
  mealsLogged: 4,
  meals: [
    {
      id: "desayuno",
      name: "Desayuno",
      mealType: "breakfast",
      loggedAt: "2026-06-07T08:10:00Z",
      isKey: false,
      macros: { kcal: 520, protein: 36, carbs: 58, fat: 14 },
    },
    {
      id: "comida",
      name: "Comida",
      mealType: "lunch",
      loggedAt: "2026-06-07T14:05:00Z",
      isKey: true,
      macros: { kcal: 690, protein: 54, carbs: 68, fat: 18 },
    },
  ],
  recap: "Día clavado: 96 % de adherencia y proteína por encima del objetivo. Así se construye.",
};
