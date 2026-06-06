import { GetSessionDetailViewUseCase } from "../GetSessionDetailViewUseCase";
import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import { sessionDetailFixtureFor } from "@/domain/training/__fixtures__/sessionDetailFixture";

describe("GetSessionDetailViewUseCase", () => {
  function createMockPort(
    overrides: Partial<ITrainingPort> = {}
  ): ITrainingPort {
    return {
      getRoutineDashboard: jest.fn(),
      getSessionFeed: jest.fn(),
      getExerciseLibrary: jest.fn(),
      getRoutineLibrary: jest.fn(),
      getRoutineDetailView: jest.fn(),
      getDayDetailView: jest.fn(),
      getSessionDetailView: jest.fn((id: string) =>
        Promise.resolve(sessionDetailFixtureFor(id))
      ),
      getRoutines: jest.fn(),
      getRoutineDetail: jest.fn(),
      getWorkoutDayExercises: jest.fn(),
      getExerciseConfiguration: jest.fn(),
      getProgressionPlan: jest.fn(),
      ...overrides,
    };
  }

  it("returns the report for the requested session id", async () => {
    const port = createMockPort();
    const uc = new GetSessionDetailViewUseCase(port);

    const result = await uc.execute("legs-b-31may");

    expect(result.header.id).toBe("legs-b-31may");
    expect(result.header.name).toBe("Legs B");
    expect(result.exercises.length).toBeGreaterThan(0);
    expect(port.getSessionDetailView).toHaveBeenCalledWith("legs-b-31may");
  });

  it("carries the per-set breakdown and prescription per exercise", async () => {
    const port = createMockPort();
    const uc = new GetSessionDetailViewUseCase(port);

    const result = await uc.execute("legs-b-31may");

    const key = result.exercises[0];
    expect(key.sets.length).toBeGreaterThan(0);
    expect(typeof key.sets[0].weight).toBe("number");
    expect(typeof key.sets[0].reps).toBe("number");
    expect(key.prescription?.rir).toBeDefined();
  });
});
