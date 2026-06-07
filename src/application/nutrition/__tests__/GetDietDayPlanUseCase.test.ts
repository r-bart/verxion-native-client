import { GetDietDayPlanUseCase } from "../GetDietDayPlanUseCase";
import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { DietDayPlan } from "@/domain/nutrition/models/DietDayPlan";

const plan: DietDayPlan = {
  state: "active",
  date: "2026-06-07",
  diet: null,
  meals: [],
  supplements: [],
  total: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  agentNote: null,
};

function makePort(): jest.Mocked<INutritionPort> {
  return {
    getDietDashboard: jest.fn(),
    getDietLibrary: jest.fn(),
    getDietDetail: jest.fn(),
    getMealDetail: jest.fn(),
    getFoodDetail: jest.fn(),
    getDietDayPlan: jest.fn().mockResolvedValue(plan),
    getDiaryFeed: jest.fn(),
    getDiaryDay: jest.fn(),
    getDailyMealLogs: jest.fn(),
    getFoodLibrary: jest.fn(),
    getNutritionDayState: jest.fn(),
    getNutritionWeeklySummary: jest.fn(),
  };
}

describe("GetDietDayPlanUseCase", () => {
  it("delegates to the port (forwarding tz offset) and returns the plan", async () => {
    const port = makePort();
    const uc = new GetDietDayPlanUseCase(port);

    const result = await uc.execute(120);

    expect(port.getDietDayPlan).toHaveBeenCalledWith(120);
    expect(result).toBe(plan);
  });
});
