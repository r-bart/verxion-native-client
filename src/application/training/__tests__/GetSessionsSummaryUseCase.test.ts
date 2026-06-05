import { GetSessionsSummaryUseCase } from "../GetSessionsSummaryUseCase";
import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import { sessionsSummaryFixture } from "@/domain/training/__fixtures__/sessionsSummaryFixture";

describe("GetSessionsSummaryUseCase", () => {
  function createMockPort(overrides: Partial<ITrainingPort> = {}): ITrainingPort {
    return {
      getRoutineDashboard: jest.fn(),
      getSessionsSummary: jest.fn().mockResolvedValue(sessionsSummaryFixture),
      getRoutines: jest.fn(),
      getRoutineDetail: jest.fn(),
      getWorkoutDayExercises: jest.fn(),
      getExerciseConfiguration: jest.fn(),
      getProgressionPlan: jest.fn(),
      ...overrides,
    };
  }

  it("returns the sessions summary from the port", async () => {
    const port = createMockPort();
    const uc = new GetSessionsSummaryUseCase(port);

    const result = await uc.execute();

    expect(port.getSessionsSummary).toHaveBeenCalledTimes(1);
    expect(result).toBe(sessionsSummaryFixture);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({ getSessionsSummary: jest.fn().mockRejectedValue(new Error("API error")) });
    const uc = new GetSessionsSummaryUseCase(port);

    await expect(uc.execute()).rejects.toThrow("API error");
  });
});
