import { GetFoodDetailUseCase } from "../GetFoodDetailUseCase";
import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { FoodDetail } from "@/domain/nutrition/models/FoodDetail";

const food: FoodDetail = {
  id: "f1",
  kind: "food",
  name: "Pechuga de pollo",
  brand: null,
  group: "Proteínas",
  source: "Base verxion",
  isCustom: false,
  serving: { size: "100", unit: "g", label: "100 g" },
  per100: { kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  perServing: { kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  fiber: 0,
  recipe: null,
  agentNote: null,
};

function makePort(): jest.Mocked<INutritionPort> {
  return {
    getDietDashboard: jest.fn(),
    getDietLibrary: jest.fn(),
    getDietDetail: jest.fn(),
    getMealDetail: jest.fn(),
    getFoodDetail: jest.fn().mockResolvedValue(food),
    getDietDayPlan: jest.fn(),
    getDiaryFeed: jest.fn(),
    getDiaryDay: jest.fn(),
    getDailyMealLogs: jest.fn(),
    getFoodLibrary: jest.fn(),
    getNutritionDayState: jest.fn(),
    getNutritionWeeklySummary: jest.fn(),
  };
}

describe("GetFoodDetailUseCase", () => {
  it("delegates to the port with kind + id and returns the food", async () => {
    const port = makePort();
    const uc = new GetFoodDetailUseCase(port);

    const result = await uc.execute("food", "f1");

    expect(port.getFoodDetail).toHaveBeenCalledWith("food", "f1");
    expect(result).toBe(food);
  });
});
