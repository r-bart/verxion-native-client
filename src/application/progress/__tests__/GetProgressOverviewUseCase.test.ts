import { GetProgressOverviewUseCase } from "../GetProgressOverviewUseCase";
import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { ProgressOverview } from "@/domain/progress/models/Progress";

describe("GetProgressOverviewUseCase", () => {
  const mockOverview: ProgressOverview = {
    totalSessions: 42,
    totalVolume: 250000,
    totalDuration: 72000,
    currentStreak: 5,
    weekSummary: { sessions: 3, volume: 15000, adherence: 0.75 },
  };

  function createMockPort(overrides: Partial<IProgressPort> = {}): IProgressPort {
    return {
      getOverview: jest.fn().mockResolvedValue(mockOverview),
      getBodyComposition: jest.fn(),
      getExerciseStats: jest.fn(),
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

  it("calls port.getOverview", async () => {
    const port = createMockPort();
    const uc = new GetProgressOverviewUseCase(port);
    const result = await uc.execute();

    expect(port.getOverview).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockOverview);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new GetProgressOverviewUseCase(port);
    const result = await uc.execute();
    expect(result.totalSessions).toBe(42);
    expect(result.weekSummary.adherence).toBe(0.75);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getOverview: jest.fn().mockRejectedValue(new Error("Server error")),
    });
    const uc = new GetProgressOverviewUseCase(port);
    await expect(uc.execute()).rejects.toThrow("Server error");
  });
});
