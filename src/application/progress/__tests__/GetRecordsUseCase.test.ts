import { GetRecordsUseCase } from "../GetRecordsUseCase";
import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { PersonalRecord } from "@/domain/progress/models/Progress";

describe("GetRecordsUseCase", () => {
  const mockRecords: PersonalRecord[] = [
    { exerciseName: "Deadlift", weight: 200, reps: 1, date: "2026-03-20", exerciseId: "ex-dl" },
    { exerciseName: "Squat", weight: 160, reps: 3, date: "2026-03-18", exerciseId: "ex-sq" },
  ];

  function createMockPort(overrides: Partial<IProgressPort> = {}): IProgressPort {
    return {
      getOverview: jest.fn(),
      getBodyComposition: jest.fn(),
      getExerciseStats: jest.fn(),
      getExerciseDetail: jest.fn(),
      getRecords: jest.fn().mockResolvedValue(mockRecords),
      getTimeline: jest.fn(),
      getWeeks: jest.fn(),
      getWeekDetail: jest.fn(),
      getMonths: jest.fn(),
      getMonthDetail: jest.fn(),
      getSessionReport: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.getRecords", async () => {
    const port = createMockPort();
    const uc = new GetRecordsUseCase(port);
    const result = await uc.execute();

    expect(port.getRecords).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockRecords);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new GetRecordsUseCase(port);
    const result = await uc.execute();
    expect(result).toHaveLength(2);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getRecords: jest.fn().mockRejectedValue(new Error("Server error")),
    });
    const uc = new GetRecordsUseCase(port);
    await expect(uc.execute()).rejects.toThrow("Server error");
  });
});
