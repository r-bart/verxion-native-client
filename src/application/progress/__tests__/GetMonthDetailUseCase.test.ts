import { GetMonthDetailUseCase } from "../GetMonthDetailUseCase";
import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { MonthDetail } from "@/domain/progress/models/Progress";

describe("GetMonthDetailUseCase", () => {
  const mockDetail: MonthDetail = {
    month: "2026-03",
    weeks: [{ weekStart: "2026-03-02", sessions: 4, volume: 20000 }],
    totals: { sessions: 15, volume: 75000, adherence: 0.9, cardioMinutes: 180 },
    narrative: "Excellent month.",
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
      getWeekDetail: jest.fn(),
      getMonths: jest.fn(),
      getMonthDetail: jest.fn().mockResolvedValue(mockDetail),
      getSessionReport: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.getMonthDetail with period param", async () => {
    const port = createMockPort();
    const uc = new GetMonthDetailUseCase(port);
    const result = await uc.execute("2026-03");

    expect(port.getMonthDetail).toHaveBeenCalledWith("2026-03");
    expect(result).toBe(mockDetail);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new GetMonthDetailUseCase(port);
    const result = await uc.execute("2026-03");
    expect(result.month).toBe("2026-03");
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getMonthDetail: jest.fn().mockRejectedValue(new Error("Not found")),
    });
    const uc = new GetMonthDetailUseCase(port);
    await expect(uc.execute("1999-01")).rejects.toThrow("Not found");
  });
});
