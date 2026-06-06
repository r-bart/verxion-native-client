import { GetSessionFeedUseCase } from "../GetSessionFeedUseCase";
import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import { sessionFeedFixture } from "@/domain/training/__fixtures__/sessionFeedFixture";

describe("GetSessionFeedUseCase", () => {
  function createMockPort(overrides: Partial<ITrainingPort> = {}): ITrainingPort {
    return {
      getRoutineDashboard: jest.fn(),
      getSessionFeed: jest.fn().mockResolvedValue(sessionFeedFixture),
      getExerciseLibrary: jest.fn(),
      getRoutineLibrary: jest.fn(),
      getRoutineDetailView: jest.fn(),
      getDayDetailView: jest.fn(),
      getSessionDetailView: jest.fn(),
      getRoutines: jest.fn(),
      getRoutineDetail: jest.fn(),
      getWorkoutDayExercises: jest.fn(),
      getExerciseConfiguration: jest.fn(),
      getProgressionPlan: jest.fn(),
      ...overrides,
    };
  }

  it("passes the filter params to the port and returns the page", async () => {
    const port = createMockPort();
    const uc = new GetSessionFeedUseCase(port);

    const result = await uc.execute({ routineId: "ppl-base", sort: "volume", cursor: null });

    expect(port.getSessionFeed).toHaveBeenCalledWith({ routineId: "ppl-base", sort: "volume", cursor: null });
    expect(result).toBe(sessionFeedFixture);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({ getSessionFeed: jest.fn().mockRejectedValue(new Error("API error")) });
    const uc = new GetSessionFeedUseCase(port);
    await expect(uc.execute({})).rejects.toThrow("API error");
  });
});
