/**
 * Raw `NutritionDashboard` fixture — the "Definición · 2.250 kcal" scenario from
 * the design handoff (`comidas-data.jsx`: VX_DIET / VX_MEAL_SPECS / VX_SUPPS),
 * tied to the API contract shape. Afternoon state: 3 of 5 meals done, the
 * pre-workout meal is "now". Test data only — the screen reads live HTTP.
 *
 * Meal targets sum to the day: 2.250 kcal · 180 g protein.
 */
import type { NutritionDashboard } from "@/domain/nutrition/models/NutritionDashboard";

export const dietDashboardFixture: NutritionDashboard = {
  state: "active",
  activeDiet: {
    id: "definicion-2250",
    name: "Definición · 2.250 kcal",
    goal: "Definición",
    mealCount: 5,
    week: 3,
    weeks: 6,
    weekFraction: 0.43,
    score: 78,
    adherence: 78,
    targets: { kcal: 2250, protein: 180, carbs: 240, fat: 70 },
    waterGoal: { value: 2.5, unit: "L" },
  },
  today: {
    consumed: { kcal: 1420, protein: 114, carbs: 158, fat: 37 },
    water: { value: 1.5, unit: "L" },
    mealsLogged: 3,
    mealsTotal: 5,
  },
  mealSpine: [
    {
      mealId: "desayuno",
      orderIndex: 0,
      name: "Desayuno",
      mealType: "breakfast",
      targets: { kcal: 520, protein: 38, carbs: 62, fat: 12 },
      status: "done",
    },
    {
      mealId: "snack-am",
      orderIndex: 1,
      name: "Media mañana",
      mealType: "morning_snack",
      targets: { kcal: 280, protein: 24, carbs: 28, fat: 9 },
      status: "done",
    },
    {
      mealId: "comida",
      orderIndex: 2,
      name: "Comida",
      mealType: "lunch",
      targets: { kcal: 620, protein: 52, carbs: 68, fat: 16 },
      status: "done",
    },
    {
      mealId: "pre",
      orderIndex: 3,
      name: "Pre-entreno",
      mealType: "pre_workout",
      targets: { kcal: 330, protein: 22, carbs: 48, fat: 6 },
      status: "now",
    },
    {
      mealId: "cena",
      orderIndex: 4,
      name: "Cena",
      mealType: "dinner",
      targets: { kcal: 500, protein: 44, carbs: 34, fat: 27 },
      status: "up",
    },
  ],
  supplements: [
    { id: "creatina", name: "Creatina", schedule: "AM · 08:00", taken: true },
    { id: "omega3", name: "Omega-3", schedule: "AM · 08:00", taken: true },
    { id: "vit-d", name: "Vitamina D", schedule: "PM · 22:00", taken: false },
  ],
  next: {
    mealId: "pre",
    name: "Pre-entreno",
    mealType: "pre_workout",
    targets: { kcal: 330, protein: 22, carbs: 48, fat: 6 },
  },
  agentNote:
    "Buen reparto hasta ahora. Te quedan el pre-entreno y la cena, y 1,0 L de agua para cerrar: deja la proteína fuerte para el salmón.",
};

/** Cold-start variant — no active diet. */
export const dietDashboardEmptyFixture: NutritionDashboard = {
  state: "empty",
  activeDiet: null,
  today: {
    consumed: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    water: { value: 0, unit: "L" },
    mealsLogged: 0,
    mealsTotal: 0,
  },
  mealSpine: [],
  supplements: [],
  next: null,
  agentNote: null,
};
