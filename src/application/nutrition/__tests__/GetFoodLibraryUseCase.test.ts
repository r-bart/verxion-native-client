import { GetFoodLibraryUseCase } from "../GetFoodLibraryUseCase";
import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { FoodLibraryPage } from "@/domain/nutrition/models/FoodLibrary";

const page: FoodLibraryPage = {
  items: [],
  facets: { groups: [], sources: [] },
  page: 1,
  pageSize: 20,
  totalCount: 0,
  hasMore: false,
};

function makePort(): jest.Mocked<INutritionPort> {
  return {
    getDietDashboard: jest.fn(),
    getDietLibrary: jest.fn(),
    getDietDetail: jest.fn(),
    getMealDetail: jest.fn(),
    getFoodDetail: jest.fn(),
    getDietDayPlan: jest.fn(),
    getDiaryFeed: jest.fn(),
    getDiaryDay: jest.fn(),
    getDailyMealLogs: jest.fn(),
    getFoodLibrary: jest.fn().mockResolvedValue(page),
    getNutritionDayState: jest.fn(),
    getNutritionWeeklySummary: jest.fn(),
  };
}

describe("GetFoodLibraryUseCase", () => {
  it("delegates to the port with the query params and returns the page", async () => {
    const port = makePort();
    const uc = new GetFoodLibraryUseCase(port);

    const result = await uc.execute({ q: "pollo", group: "Proteínas" });

    expect(port.getFoodLibrary).toHaveBeenCalledWith({
      q: "pollo",
      group: "Proteínas",
    });
    expect(result).toBe(page);
  });
});
