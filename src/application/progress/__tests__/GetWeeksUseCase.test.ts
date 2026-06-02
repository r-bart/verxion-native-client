import { GetWeeksUseCase } from "../GetWeeksUseCase";
import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { WeekArchive } from "@/domain/progress/models/Progress";

describe("GetWeeksUseCase", () => {
  const mockWeeks: WeekArchive[] = [
    { weekStart: "2026-03-23", weekEnd: "2026-03-29", sessions: 4, targetSessions: 5, volume: 20000, cardioMinutes: 45 },
  ];

  function createMockPort(overrides: Partial<IProgressPort> = {}): IProgressPort {
    return {
      getOverview: jest.fn(),
      getBodyComposition: jest.fn(),
      getExerciseStats: jest.fn(),
      getExerciseDetail: jest.fn(),
      getRecords: jest.fn(),
      getTimeline: jest.fn(),
      getWeeks: jest.fn().mockResolvedValue(mockWeeks),
      getWeekDetail: jest.fn(),
      getMonths: jest.fn(),
      getMonthDetail: jest.fn(),
      getSessionReport: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.getWeeks", async () => {
    const port = createMockPort();
    const uc = new GetWeeksUseCase(port);
    const result = await uc.execute();

    expect(port.getWeeks).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockWeeks);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new GetWeeksUseCase(port);
    const result = await uc.execute();
    expect(result).toHaveLength(1);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getWeeks: jest.fn().mockRejectedValue(new Error("Failed")),
    });
    const uc = new GetWeeksUseCase(port);
    await expect(uc.execute()).rejects.toThrow("Failed");
  });
});
