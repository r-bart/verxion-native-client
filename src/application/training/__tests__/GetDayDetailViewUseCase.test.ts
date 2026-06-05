import { GetDayDetailViewUseCase } from "../GetDayDetailViewUseCase";
import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import { dayDetailFixtureFor } from "@/domain/training/__fixtures__/dayDetailFixture";

describe("GetDayDetailViewUseCase", () => {
  function createMockPort(
    overrides: Partial<ITrainingPort> = {}
  ): ITrainingPort {
    return {
      getRoutineDashboard: jest.fn(),
      getSessionFeed: jest.fn(),
      getExerciseLibrary: jest.fn(),
      getRoutineLibrary: jest.fn(),
      getRoutineDetailView: jest.fn(),
      getDayDetailView: jest.fn((dayId: string) =>
        Promise.resolve(dayDetailFixtureFor(dayId))
      ),
      getRoutines: jest.fn(),
      getRoutineDetail: jest.fn(),
      getWorkoutDayExercises: jest.fn(),
      getExerciseConfiguration: jest.fn(),
      getProgressionPlan: jest.fn(),
      ...overrides,
    };
  }

  it("returns the day detail for the requested dayId", async () => {
    const port = createMockPort();
    const uc = new GetDayDetailViewUseCase(port);

    const result = await uc.execute("legs-a");

    expect(result.header.dayId).toBe("legs-a");
    expect(result.header.name).toBe("Legs A");
    expect(result.exercises[0].name).toBe("Sentadilla");
    expect(result.exercises[0].isKey).toBe(true);
    expect(port.getDayDetailView).toHaveBeenCalledWith("legs-a");
  });

  it("derives exercise + set counts from the plan", async () => {
    const port = createMockPort();
    const uc = new GetDayDetailViewUseCase(port);

    const result = await uc.execute("push-a");

    expect(result.header.exercisesCount).toBe(result.exercises.length);
    expect(result.header.setsCount).toBe(
      result.exercises.reduce((a, e) => a + e.sets, 0)
    );
  });
});
