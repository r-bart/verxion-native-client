import { GetRoutineLibraryUseCase } from "../GetRoutineLibraryUseCase";
import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import { routineLibraryFixture } from "@/domain/training/__fixtures__/routineLibraryFixture";

describe("GetRoutineLibraryUseCase", () => {
  function createMockPort(
    overrides: Partial<ITrainingPort> = {}
  ): ITrainingPort {
    return {
      getRoutineDashboard: jest.fn(),
      getSessionFeed: jest.fn(),
      getExerciseLibrary: jest.fn(),
      getRoutineLibrary: jest.fn().mockResolvedValue(routineLibraryFixture),
      getRoutineDetailView: jest.fn(),
      getDayDetailView: jest.fn(),
      getRoutines: jest.fn(),
      getRoutineDetail: jest.fn(),
      getWorkoutDayExercises: jest.fn(),
      getExerciseConfiguration: jest.fn(),
      getProgressionPlan: jest.fn(),
      ...overrides,
    };
  }

  it("returns the routine library from the port", async () => {
    const port = createMockPort();
    const uc = new GetRoutineLibraryUseCase(port);

    const result = await uc.execute();

    expect(result).toBe(routineLibraryFixture);
    expect(port.getRoutineLibrary).toHaveBeenCalledTimes(1);
  });
});
