import { GetDayStateUseCase } from "../GetDayStateUseCase";
import type { IAnalyticsPort } from "@/domain/analytics/ports/IAnalyticsPort";
import type { DayTrainingState } from "@/domain/analytics/models/Analytics";

describe("GetDayStateUseCase", () => {
  const mockDayState: DayTrainingState = {
    state: "WORKOUT_PLANNED",
    plannedWorkoutDay: { id: "wd-1", name: "Push Day", dayType: "strength" },
    sessionsToday: 0,
    weekSessions: 2,
    weekTarget: 4,
  };

  function createMockPort(overrides: Partial<IAnalyticsPort> = {}): IAnalyticsPort {
    return {
      getStreaks: jest.fn(),
      getWeekView: jest.fn(),
      getContributionGrid: jest.fn(),
      getDayState: jest.fn().mockResolvedValue(mockDayState),
      getExecutionScore: jest.fn(),
      getSuggestedNextWorkout: jest.fn(),
      getWeeklyTrainingReview: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.getDayState with correct date", async () => {
    const port = createMockPort();
    const uc = new GetDayStateUseCase(port);
    const result = await uc.execute("2026-03-27");

    expect(port.getDayState).toHaveBeenCalledWith("2026-03-27");
    expect(result).toBe(mockDayState);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new GetDayStateUseCase(port);
    const result = await uc.execute("2026-03-27");
    expect(result.state).toBe("WORKOUT_PLANNED");
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getDayState: jest.fn().mockRejectedValue(new Error("Not found")),
    });
    const uc = new GetDayStateUseCase(port);
    await expect(uc.execute("2026-01-01")).rejects.toThrow("Not found");
  });
});
