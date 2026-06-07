import { GetDietDetailUseCase } from "../GetDietDetailUseCase";
import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { DietDetail } from "@/domain/nutrition/models/DietDetail";

const detail: DietDetail = {
  id: "d1",
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
  scoreState: "on",
  score: 78,
  adherence: 92,
  daysLogged: 21,
  endDate: null,
  meals: [],
  agentNote: null,
};

function makePort(): jest.Mocked<INutritionPort> {
  return {
    getDietDashboard: jest.fn(),
    getDietLibrary: jest.fn(),
    getDietDetail: jest.fn().mockResolvedValue(detail),
    getMealDetail: jest.fn(),
    getFoodDetail: jest.fn(),
    getDietDayPlan: jest.fn(),
    getDiaryFeed: jest.fn(),
    getDiaryDay: jest.fn(),
    getDailyMealLogs: jest.fn(),
    getFoodLibrary: jest.fn(),
    getNutritionDayState: jest.fn(),
    getNutritionWeeklySummary: jest.fn(),
  };
}

describe("GetDietDetailUseCase", () => {
  it("delegates to the port with the id and returns the detail", async () => {
    const port = makePort();
    const uc = new GetDietDetailUseCase(port);

    const result = await uc.execute("d1");

    expect(port.getDietDetail).toHaveBeenCalledWith("d1");
    expect(result).toBe(detail);
  });
});
