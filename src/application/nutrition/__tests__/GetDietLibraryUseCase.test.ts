import { GetDietLibraryUseCase } from "../GetDietLibraryUseCase";
import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { DietLibrary } from "@/domain/nutrition/models/DietLibrary";

const library: DietLibrary = {
  diets: [
    {
      id: "d1",
      name: "Definición · 2.250 kcal",
      state: "active",
      goal: "fat_loss",
      mealCount: 5,
      proteinGoal: 180,
      targets: { kcal: 2250, protein: 180, carbs: 240, fat: 70 },
      week: 3,
      weeks: 6,
      weekFraction: 0.5,
      score: 78,
      adherence: 92,
      endDate: null,
    },
  ],
  facets: { states: ["active"], goals: ["fat_loss"] },
};

function makePort(): jest.Mocked<INutritionPort> {
  return {
    getDietDashboard: jest.fn(),
    getDietLibrary: jest.fn().mockResolvedValue(library),
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

describe("GetDietLibraryUseCase", () => {
  it("delegates to the port and returns the library", async () => {
    const port = makePort();
    const uc = new GetDietLibraryUseCase(port);

    const result = await uc.execute();

    expect(port.getDietLibrary).toHaveBeenCalledTimes(1);
    expect(result).toBe(library);
  });
});
