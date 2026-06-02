import { GetSessionReportUseCase } from "../GetSessionReportUseCase";
import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { SessionReport } from "@/domain/progress/models/Progress";

describe("GetSessionReportUseCase", () => {
  const mockReport: SessionReport = {
    id: "sess-1",
    name: "Push Day A",
    date: "2026-03-27T08:00:00Z",
    duration: 3600,
    totalVolume: 15000,
    totalSets: 16,
    totalReps: 128,
    peakWeight: 100,
    completionRate: 0.95,
    exerciseCompletionRate: 1.0,
    averageRir: 2.5,
    muscleGroupDistribution: [
      { muscle: "chest", volume: 10000, percentage: 66.7, exercises: 2 },
      { muscle: "shoulders", volume: 5000, percentage: 33.3, exercises: 1 },
    ],
    exercises: [
      {
        exerciseId: "ex-bp",
        name: "Bench Press",
        muscleGroup: "chest",
        equipment: "barbell",
        setType: "working",
        plannedSets: 4,
        completedSets: 4,
        totalVolume: 3200,
        peakWeight: 80,
        totalReps: 40,
        sets: [{ setNumber: 1, weight: 80, reps: 10, rir: 3, volume: 800 }],
        prBadge: null,
      },
    ],
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
      getMonthDetail: jest.fn(),
      getSessionReport: jest.fn().mockResolvedValue(mockReport),
      ...overrides,
    };
  }

  it("calls port.getSessionReport with sessionId", async () => {
    const port = createMockPort();
    const uc = new GetSessionReportUseCase(port);
    const result = await uc.execute("sess-1");

    expect(port.getSessionReport).toHaveBeenCalledWith("sess-1");
    expect(result).toBe(mockReport);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new GetSessionReportUseCase(port);
    const result = await uc.execute("sess-1");
    expect(result.exercises).toHaveLength(1);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getSessionReport: jest.fn().mockRejectedValue(new Error("Session not found")),
    });
    const uc = new GetSessionReportUseCase(port);
    await expect(uc.execute("nonexistent")).rejects.toThrow("Session not found");
  });
});
