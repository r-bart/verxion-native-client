import { GetTimelineUseCase } from "../GetTimelineUseCase";
import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { TimelineEntry } from "@/domain/progress/models/Progress";

describe("GetTimelineUseCase", () => {
  const mockTimeline: TimelineEntry[] = [
    { month: "2026-03", sessions: 12, volume: 60000, adherence: 0.85, cardioMinutes: 120, deltaPercent: 5 },
    { month: "2026-02", sessions: 10, volume: 55000, adherence: 0.75, cardioMinutes: 100, deltaPercent: null },
  ];

  function createMockPort(overrides: Partial<IProgressPort> = {}): IProgressPort {
    return {
      getOverview: jest.fn(),
      getBodyComposition: jest.fn(),
      getExerciseStats: jest.fn(),
      getExerciseDetail: jest.fn(),
      getRecords: jest.fn(),
      getTimeline: jest.fn().mockResolvedValue(mockTimeline),
      getWeeks: jest.fn(),
      getWeekDetail: jest.fn(),
      getMonths: jest.fn(),
      getMonthDetail: jest.fn(),
      getSessionReport: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.getTimeline with months param", async () => {
    const port = createMockPort();
    const uc = new GetTimelineUseCase(port);
    const result = await uc.execute(6);

    expect(port.getTimeline).toHaveBeenCalledWith(6);
    expect(result).toBe(mockTimeline);
  });

  it("passes different month values", async () => {
    const port = createMockPort();
    const uc = new GetTimelineUseCase(port);
    await uc.execute(12);
    expect(port.getTimeline).toHaveBeenCalledWith(12);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getTimeline: jest.fn().mockRejectedValue(new Error("Timeout")),
    });
    const uc = new GetTimelineUseCase(port);
    await expect(uc.execute(6)).rejects.toThrow("Timeout");
  });
});
