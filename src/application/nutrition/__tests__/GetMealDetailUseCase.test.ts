import { GetMealDetailUseCase } from "../GetMealDetailUseCase";
import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { MealDetail } from "@/domain/nutrition/models/MealDetail";

const meal: MealDetail = {
  kind: "meal",
  name: "Comida",
  window: "14:00",
  calories: 680,
  protein: 52,
  items: [
    { name: "Arroz basmati", amount: "80 g (seco)", alternatives: ["Quinoa", "Patata"] },
  ],
  supplements: ["Creatina 5 g"],
};

function makePort(): jest.Mocked<INutritionPort> {
  return {
    getDietDashboard: jest.fn(),
    getDietLibrary: jest.fn(),
    getDietDetail: jest.fn(),
    getMealDetail: jest.fn().mockResolvedValue(meal),
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

describe("GetMealDetailUseCase", () => {
  it("delegates to the port with planId + mealId and returns the meal", async () => {
    const port = makePort();
    const uc = new GetMealDetailUseCase(port);

    const result = await uc.execute("plan-1", "comida");

    expect(port.getMealDetail).toHaveBeenCalledWith("plan-1", "comida");
    expect(result).toBe(meal);
  });
});
