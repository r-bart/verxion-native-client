import { GetExerciseDetailUseCase } from "../GetExerciseDetailUseCase";
import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { ExerciseDetail } from "@/domain/progress/models/Progress";

describe("GetExerciseDetailUseCase", () => {
  const mockDetail: ExerciseDetail = {
    exerciseId: "ex-1",
    exerciseName: "Bench Press",
    totalVolume: 80000,
    totalSets: 200,
    totalReps: 1600,
    maxWeight: 120,
    sessionCount: 40,
    sessions: [],
  };

  function createMockPort(overrides: Partial<IProgressPort> = {}): IProgressPort {
    return {
      getOverview: jest.fn(),
      getBodyComposition: jest.fn(),
      getExerciseStats: jest.fn(),
      getExerciseDetail: jest.fn().mockResolvedValue(mockDetail),
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

  it("calls port.getExerciseDetail with exerciseId", async () => {
    const port = createMockPort();
    const uc = new GetExerciseDetailUseCase(port);
    const result = await uc.execute("ex-1");

    expect(port.getExerciseDetail).toHaveBeenCalledWith("ex-1");
    expect(result).toBe(mockDetail);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new GetExerciseDetailUseCase(port);
    const result = await uc.execute("ex-1");
    expect(result.exerciseName).toBe("Bench Press");
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getExerciseDetail: jest.fn().mockRejectedValue(new Error("Not found")),
    });
    const uc = new GetExerciseDetailUseCase(port);
    await expect(uc.execute("unknown")).rejects.toThrow("Not found");
  });
});
