import { GetDiaryDayUseCase } from "../GetDiaryDayUseCase";
import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { DiaryDayDetail } from "@/domain/nutrition/models/DiaryDayDetail";

const day: DiaryDayDetail = {
  date: "2026-06-07",
  diet: { id: "d1", name: "Definición · 2.250 kcal" },
  consumed: { kcal: 2210, protein: 182, carbs: 230, fat: 66 },
  targets: { kcal: 2250, protein: 180, carbs: 240, fat: 70 },
  water: { value: 2.4, unit: "L" },
  waterGoal: { value: 2.5, unit: "L" },
  adherence: 96,
  dayClass: "clavado",
  mealsLogged: 5,
  meals: [],
  recap: null,
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
    getDiaryDay: jest.fn().mockResolvedValue(day),
    getDailyMealLogs: jest.fn(),
    getFoodLibrary: jest.fn(),
    getNutritionDayState: jest.fn(),
    getNutritionWeeklySummary: jest.fn(),
  };
}

describe("GetDiaryDayUseCase", () => {
  it("delegates to the port with date + tz offset and returns the day", async () => {
    const port = makePort();
    const uc = new GetDiaryDayUseCase(port);

    const result = await uc.execute("2026-06-07", 120);

    expect(port.getDiaryDay).toHaveBeenCalledWith("2026-06-07", 120);
    expect(result).toBe(day);
  });
});
