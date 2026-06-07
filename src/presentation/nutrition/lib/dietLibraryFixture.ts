/**
 * Typed fixtures for the "Dietas" library — the shape of `GET /nutrition/diet-library`.
 * Backs component/screen tests and Storybook-style previews; the real screen reads
 * the live read-model via `useDietLibrary`. Mirrors `dietDashboardFixture`.
 */
import type { DietLibrary } from "@/domain/nutrition/models/DietLibrary";

export const dietLibraryFixture: DietLibrary = {
  diets: [
    {
      id: "definicion-2250",
      name: "Definición · 2.250 kcal",
      state: "active",
      goal: "fat_loss",
      mealCount: 5,
      proteinGoal: 180,
      targets: { kcal: 2250, protein: 180, carbs: 240, fat: 70 },
      week: 3,
      weeks: 6,
      weekFraction: 0.45,
      score: 78,
      adherence: 92,
      endDate: null,
    },
    {
      id: "volumen-2900",
      name: "Volumen limpio · 2.900 kcal",
      state: "completed",
      goal: "muscle_gain",
      mealCount: 5,
      proteinGoal: 190,
      targets: { kcal: 2900, protein: 190, carbs: 330, fat: 80 },
      week: 8,
      weeks: 8,
      weekFraction: null,
      score: 90,
      adherence: 90,
      endDate: "2026-05-05",
    },
    {
      id: "mantenimiento-2500",
      name: "Mantenimiento · 2.500 kcal",
      state: "completed",
      goal: "maintenance",
      mealCount: 5,
      proteinGoal: 175,
      targets: { kcal: 2500, protein: 175, carbs: 270, fat: 75 },
      week: 4,
      weeks: 4,
      weekFraction: null,
      score: 86,
      adherence: 86,
      endDate: "2026-03-09",
    },
  ],
  facets: {
    states: ["active", "completed"],
    goals: ["fat_loss", "muscle_gain", "maintenance"],
  },
};

export const dietLibraryEmptyFixture: DietLibrary = {
  diets: [],
  facets: { states: [], goals: [] },
};
