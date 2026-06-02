import { GetStreaksUseCase } from "../GetStreaksUseCase";
import type { IAnalyticsPort } from "@/domain/analytics/ports/IAnalyticsPort";
import type { Streak } from "@/domain/analytics/models/Analytics";

describe("GetStreaksUseCase", () => {
  const mockStreak: Streak = { current: 7, longest: 14, lastActiveDate: "2026-03-27" };

  function createMockPort(overrides: Partial<IAnalyticsPort> = {}): IAnalyticsPort {
    return {
      getStreaks: jest.fn().mockResolvedValue(mockStreak),
      getWeekView: jest.fn(),
      getContributionGrid: jest.fn(),
      getDayState: jest.fn(),
      getExecutionScore: jest.fn(),
      getSuggestedNextWorkout: jest.fn(),
      getWeeklyTrainingReview: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.getStreaks", async () => {
    const port = createMockPort();
    const uc = new GetStreaksUseCase(port);
    const result = await uc.execute();

    expect(port.getStreaks).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockStreak);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new GetStreaksUseCase(port);
    const result = await uc.execute();
    expect(result).toEqual({ current: 7, longest: 14, lastActiveDate: "2026-03-27" });
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getStreaks: jest.fn().mockRejectedValue(new Error("Server error")),
    });
    const uc = new GetStreaksUseCase(port);
    await expect(uc.execute()).rejects.toThrow("Server error");
  });
});
