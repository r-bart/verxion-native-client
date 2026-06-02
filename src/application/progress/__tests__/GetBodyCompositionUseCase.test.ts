import { GetBodyCompositionUseCase } from "../GetBodyCompositionUseCase";
import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { BodyComposition } from "@/domain/progress/models/Progress";

describe("GetBodyCompositionUseCase", () => {
  const mockBody: BodyComposition = {
    weightTrend: [{ date: "2026-03-01", value: 80 }],
    perimeterTrend: {},
    currentWeight: 80,
    weightChange: -1,
  };

  function createMockPort(overrides: Partial<IProgressPort> = {}): IProgressPort {
    return {
      getOverview: jest.fn(),
      getBodyComposition: jest.fn().mockResolvedValue(mockBody),
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

  it("calls port.getBodyComposition with period param", async () => {
    const port = createMockPort();
    const uc = new GetBodyCompositionUseCase(port);
    const result = await uc.execute("3m");

    expect(port.getBodyComposition).toHaveBeenCalledWith("3m");
    expect(result).toBe(mockBody);
  });

  it("passes different period values", async () => {
    const port = createMockPort();
    const uc = new GetBodyCompositionUseCase(port);
    await uc.execute("6m");
    expect(port.getBodyComposition).toHaveBeenCalledWith("6m");
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getBodyComposition: jest.fn().mockRejectedValue(new Error("Timeout")),
    });
    const uc = new GetBodyCompositionUseCase(port);
    await expect(uc.execute("3m")).rejects.toThrow("Timeout");
  });
});
