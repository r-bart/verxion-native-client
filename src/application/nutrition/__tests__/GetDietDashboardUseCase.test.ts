import { GetDietDashboardUseCase } from "../GetDietDashboardUseCase";
import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { NutritionDashboard } from "@/domain/nutrition/models/NutritionDashboard";

const dashboard: NutritionDashboard = {
  state: "active",
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

function makePort(): jest.Mocked<INutritionPort> {
  return {
    getDietDashboard: jest.fn().mockResolvedValue(dashboard),
    getDietLibrary: jest.fn(),
    getDietDetail: jest.fn(),
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

describe("GetDietDashboardUseCase", () => {
  it("delegates to the port and returns the dashboard", async () => {
    const port = makePort();
    const uc = new GetDietDashboardUseCase(port);

    const result = await uc.execute();

    expect(port.getDietDashboard).toHaveBeenCalledTimes(1);
    expect(result).toBe(dashboard);
  });
});
