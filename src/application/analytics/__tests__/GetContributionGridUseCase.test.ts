import { GetContributionGridUseCase } from "../GetContributionGridUseCase";
import type { IAnalyticsPort } from "@/domain/analytics/ports/IAnalyticsPort";
import type { ContributionDay } from "@/domain/analytics/models/Analytics";

describe("GetContributionGridUseCase", () => {
  const mockGrid: ContributionDay[] = [
    { date: "2026-03-25", count: 2, level: 2 },
    { date: "2026-03-26", count: 1, level: 1 },
    { date: "2026-03-27", count: 0, level: 0 },
  ];

  function createMockPort(overrides: Partial<IAnalyticsPort> = {}): IAnalyticsPort {
    return {
      getStreaks: jest.fn(),
      getWeekView: jest.fn(),
      getContributionGrid: jest.fn().mockResolvedValue(mockGrid),
      getDayState: jest.fn(),
      getExecutionScore: jest.fn(),
      getSuggestedNextWorkout: jest.fn(),
      getWeeklyTrainingReview: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.getContributionGrid", async () => {
    const port = createMockPort();
    const uc = new GetContributionGridUseCase(port);
    const result = await uc.execute();

    expect(port.getContributionGrid).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockGrid);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new GetContributionGridUseCase(port);
    const result = await uc.execute();
    expect(result).toHaveLength(3);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getContributionGrid: jest.fn().mockRejectedValue(new Error("Fetch failed")),
    });
    const uc = new GetContributionGridUseCase(port);
    await expect(uc.execute()).rejects.toThrow("Fetch failed");
  });
});
