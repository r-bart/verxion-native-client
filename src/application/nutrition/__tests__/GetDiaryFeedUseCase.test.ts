import { GetDiaryFeedUseCase } from "../GetDiaryFeedUseCase";
import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { DiaryFeedPage } from "@/domain/nutrition/models/DiaryFeed";

const feed: DiaryFeedPage = {
  phases: [],
  summary: null,
  nextCursor: null,
};

function makePort(): jest.Mocked<INutritionPort> {
  return {
    getDietDashboard: jest.fn(),
    getDietLibrary: jest.fn(),
    getDietDetail: jest.fn(),
    getMealDetail: jest.fn(),
    getFoodDetail: jest.fn(),
    getDietDayPlan: jest.fn(),
    getDiaryFeed: jest.fn().mockResolvedValue(feed),
    getDiaryDay: jest.fn(),
    getDailyMealLogs: jest.fn(),
    getFoodLibrary: jest.fn(),
    getNutritionDayState: jest.fn(),
    getNutritionWeeklySummary: jest.fn(),
  };
}

describe("GetDiaryFeedUseCase", () => {
  it("delegates to the port (forwarding tz offset) and returns the feed", async () => {
    const port = makePort();
    const uc = new GetDiaryFeedUseCase(port);

    const result = await uc.execute(120);

    expect(port.getDiaryFeed).toHaveBeenCalledWith(120);
    expect(result).toBe(feed);
  });
});
