import { GetRoutineDetailViewUseCase } from "../GetRoutineDetailViewUseCase";
import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import { routineDetailFixtureFor } from "@/domain/training/__fixtures__/routineDetailFixture";

describe("GetRoutineDetailViewUseCase", () => {
  function createMockPort(
    overrides: Partial<ITrainingPort> = {}
  ): ITrainingPort {
    return {
      getRoutineDashboard: jest.fn(),
      getSessionFeed: jest.fn(),
      getExerciseLibrary: jest.fn(),
      getRoutineLibrary: jest.fn(),
      getRoutineDetailView: jest.fn((id: string) =>
        Promise.resolve(routineDetailFixtureFor(id))
      ),
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

  it("returns the detail view for the requested routine id", async () => {
    const port = createMockPort();
    const uc = new GetRoutineDetailViewUseCase(port);

    const result = await uc.execute("ppl-base");

    expect(result.header.id).toBe("ppl-base");
    expect(result.header.state).toBe("completed");
    expect(port.getRoutineDetailView).toHaveBeenCalledWith("ppl-base");
  });

  it("falls back to the active block for an unknown id (stub behavior)", async () => {
    const port = createMockPort();
    const uc = new GetRoutineDetailViewUseCase(port);

    const result = await uc.execute("does-not-exist");

    expect(result.header.id).toBe("ppl-hipertrofia");
  });
});
