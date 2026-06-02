import { GetExerciseStatsUseCase } from "../GetExerciseStatsUseCase";
import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { ExerciseStats } from "@/domain/progress/models/Progress";

describe("GetExerciseStatsUseCase", () => {
  const mockStats: ExerciseStats = {
    totalVolume: 500000,
    totalSets: 1200,
    uniqueExercises: 25,
    trainingDays: 90,
    muscleGroups: [{ name: "chest", volume: 120000, sets: 300, rank: 1 }],
  };

  function createMockPort(overrides: Partial<IProgressPort> = {}): IProgressPort {
    return {
      getOverview: jest.fn(),
      getBodyComposition: jest.fn(),
      getExerciseStats: jest.fn().mockResolvedValue(mockStats),
      getExerciseDetail: jest.fn(),
      getRecords: jest.fn(),
      getTimeline: jest.fn(),
      getWeeks: jest.fn(),
      getWeekDetail: jest.fn(),
      getMonths: jest.fn(),
      getMonthDetail: jest.fn(),
      getSessionReport: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.getExerciseStats", async () => {
    const port = createMockPort();
    const uc = new GetExerciseStatsUseCase(port);
    const result = await uc.execute();

    expect(port.getExerciseStats).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockStats);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new GetExerciseStatsUseCase(port);
    const result = await uc.execute();
    expect(result.muscleGroups).toHaveLength(1);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getExerciseStats: jest.fn().mockRejectedValue(new Error("Failed")),
    });
    const uc = new GetExerciseStatsUseCase(port);
    await expect(uc.execute()).rejects.toThrow("Failed");
  });
});
