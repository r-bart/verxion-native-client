import { GetWeekViewUseCase } from "../GetWeekViewUseCase";
import type { IAnalyticsPort } from "@/domain/analytics/ports/IAnalyticsPort";
import type { WeekView } from "@/domain/analytics/models/Analytics";

describe("GetWeekViewUseCase", () => {
  const mockWeekView: WeekView = {
    days: [
      { date: "2026-03-23", sessions: 1, volume: 5000 },
      { date: "2026-03-24", sessions: 0, volume: 0 },
      { date: "2026-03-25", sessions: 1, volume: 6000 },
      { date: "2026-03-26", sessions: 0, volume: 0 },
      { date: "2026-03-27", sessions: 1, volume: 5500 },
      { date: "2026-03-28", sessions: 0, volume: 0 },
      { date: "2026-03-29", sessions: 0, volume: 0 },
    ],
  };

  function createMockPort(overrides: Partial<IAnalyticsPort> = {}): IAnalyticsPort {
    return {
      getStreaks: jest.fn(),
      getWeekView: jest.fn().mockResolvedValue(mockWeekView),
      getContributionGrid: jest.fn(),
      getDayState: jest.fn(),
      getExecutionScore: jest.fn(),
      getSuggestedNextWorkout: jest.fn(),
      getWeeklyTrainingReview: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.getWeekView", async () => {
    const port = createMockPort();
    const uc = new GetWeekViewUseCase(port);
    const result = await uc.execute();

    expect(port.getWeekView).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockWeekView);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new GetWeekViewUseCase(port);
    const result = await uc.execute();
    expect(result.days).toHaveLength(7);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getWeekView: jest.fn().mockRejectedValue(new Error("Timeout")),
    });
    const uc = new GetWeekViewUseCase(port);
    await expect(uc.execute()).rejects.toThrow("Timeout");
  });
});
