import { GetMonthsUseCase } from "../GetMonthsUseCase";
import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { MonthArchive } from "@/domain/progress/models/Progress";

describe("GetMonthsUseCase", () => {
  const mockMonths: MonthArchive[] = [
    { month: "2026-03", sessions: 15, volume: 75000, adherence: 0.9, cardioMinutes: 180, vsPrevious: 12.5 },
    { month: "2026-02", sessions: 12, volume: 60000, adherence: 0.8, cardioMinutes: 150, vsPrevious: null },
  ];

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
      getMonths: jest.fn().mockResolvedValue(mockMonths),
      getMonthDetail: jest.fn(),
      getSessionReport: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.getMonths", async () => {
    const port = createMockPort();
    const uc = new GetMonthsUseCase(port);
    const result = await uc.execute();

    expect(port.getMonths).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockMonths);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new GetMonthsUseCase(port);
    const result = await uc.execute();
    expect(result).toHaveLength(2);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getMonths: jest.fn().mockRejectedValue(new Error("Failed")),
    });
    const uc = new GetMonthsUseCase(port);
    await expect(uc.execute()).rejects.toThrow("Failed");
  });
});
