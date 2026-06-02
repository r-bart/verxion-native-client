import { GetWeekDetailUseCase } from "../GetWeekDetailUseCase";
import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { WeekDetail } from "@/domain/progress/models/Progress";

describe("GetWeekDetailUseCase", () => {
  const mockDetail: WeekDetail = {
    weekStart: "2026-03-23",
    weekEnd: "2026-03-29",
    days: [{ date: "2026-03-23", sessions: 1, volume: 5000 }],
    totals: { sessions: 4, volume: 20000, cardioMinutes: 30 },
  };

  function createMockPort(overrides: Partial<IProgressPort> = {}): IProgressPort {
    return {
      getOverview: jest.fn(),
      getBodyComposition: jest.fn(),
      getExerciseStats: jest.fn(),
      getExerciseDetail: jest.fn(),
      getRecords: jest.fn(),
      getTimeline: jest.fn(),
      getWeeks: jest.fn(),
      getWeekDetail: jest.fn().mockResolvedValue(mockDetail),
      getMonths: jest.fn(),
      getMonthDetail: jest.fn(),
      getSessionReport: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.getWeekDetail with weekDate param", async () => {
    const port = createMockPort();
    const uc = new GetWeekDetailUseCase(port);
    const result = await uc.execute("2026-03-23");

    expect(port.getWeekDetail).toHaveBeenCalledWith("2026-03-23");
    expect(result).toBe(mockDetail);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new GetWeekDetailUseCase(port);
    const result = await uc.execute("2026-03-23");
    expect(result.weekStart).toBe("2026-03-23");
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getWeekDetail: jest.fn().mockRejectedValue(new Error("Not found")),
    });
    const uc = new GetWeekDetailUseCase(port);
    await expect(uc.execute("2020-01-01")).rejects.toThrow("Not found");
  });
});
