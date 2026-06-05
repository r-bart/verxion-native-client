import { GetExerciseLibraryUseCase } from "../GetExerciseLibraryUseCase";
import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import { exerciseLibraryFixture } from "@/domain/training/__fixtures__/exerciseLibraryFixture";

describe("GetExerciseLibraryUseCase", () => {
  function createMockPort(overrides: Partial<ITrainingPort> = {}): ITrainingPort {
    return {
      getRoutineDashboard: jest.fn(),
      getSessionFeed: jest.fn(),
      getExerciseLibrary: jest.fn().mockResolvedValue(exerciseLibraryFixture),
      getRoutineLibrary: jest.fn(),
      getRoutineDetailView: jest.fn(),
      getRoutines: jest.fn(),
      getRoutineDetail: jest.fn(),
      getWorkoutDayExercises: jest.fn(),
      getExerciseConfiguration: jest.fn(),
      getProgressionPlan: jest.fn(),
      ...overrides,
    };
  }

  it("returns the library from the port", async () => {
    const port = createMockPort();
    const uc = new GetExerciseLibraryUseCase(port);

    const result = await uc.execute();

    expect(port.getExerciseLibrary).toHaveBeenCalledTimes(1);
    expect(result).toBe(exerciseLibraryFixture);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({ getExerciseLibrary: jest.fn().mockRejectedValue(new Error("API error")) });
    const uc = new GetExerciseLibraryUseCase(port);
    await expect(uc.execute()).rejects.toThrow("API error");
  });
});
