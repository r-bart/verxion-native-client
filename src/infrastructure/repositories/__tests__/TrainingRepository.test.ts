import { TrainingRepository } from "../TrainingRepository";

describe("TrainingRepository", () => {
  it("delegates live read/write-through methods to the HTTP repository", async () => {
    const http = {
      getRoutineDashboard: jest.fn().mockResolvedValue("dashboard"),
      getSessionFeed: jest.fn().mockResolvedValue("feed"),
      getSessionDetailView: jest.fn().mockResolvedValue("session-detail"),
      getRoutines: jest.fn().mockResolvedValue("routines"),
      getRoutineDetail: jest.fn().mockResolvedValue("routine-detail"),
      getWorkoutDayExercises: jest.fn().mockResolvedValue("day-exercises"),
      getExerciseConfiguration: jest.fn().mockResolvedValue("config"),
      getProgressionPlan: jest.fn().mockResolvedValue("progression"),
    };
    const fixtures = {
      getExerciseLibrary: jest.fn(),
      getRoutineLibrary: jest.fn(),
      getRoutineDetailView: jest.fn(),
      getDayDetailView: jest.fn(),
    };
    const repo = new TrainingRepository(http as never, fixtures as never);

    await expect(repo.getRoutineDashboard()).resolves.toBe("dashboard");
    await expect(repo.getSessionFeed({ sort: "recent" })).resolves.toBe("feed");
    await expect(repo.getSessionDetailView("s1")).resolves.toBe("session-detail");
    await expect(repo.getRoutines()).resolves.toBe("routines");
    await expect(repo.getRoutineDetail("r1")).resolves.toBe("routine-detail");
    await expect(repo.getWorkoutDayExercises("r1", "d1")).resolves.toBe("day-exercises");
    await expect(repo.getExerciseConfiguration("wde1")).resolves.toBe("config");
    await expect(repo.getProgressionPlan("d1")).resolves.toBe("progression");

    expect(http.getSessionFeed).toHaveBeenCalledWith({ sort: "recent" });
    expect(http.getRoutineDetail).toHaveBeenCalledWith("r1");
    expect(http.getWorkoutDayExercises).toHaveBeenCalledWith("r1", "d1");
    expect(http.getExerciseConfiguration).toHaveBeenCalledWith("wde1");
    expect(http.getProgressionPlan).toHaveBeenCalledWith("d1");
    expect(fixtures.getExerciseLibrary).not.toHaveBeenCalled();
  });

  it("delegates pending read models to the fixture repository", async () => {
    const http = {
      getRoutineDashboard: jest.fn(),
      getSessionFeed: jest.fn(),
      getSessionDetailView: jest.fn(),
      getRoutines: jest.fn(),
      getRoutineDetail: jest.fn(),
      getWorkoutDayExercises: jest.fn(),
      getExerciseConfiguration: jest.fn(),
      getProgressionPlan: jest.fn(),
    };
    const fixtures = {
      getExerciseLibrary: jest.fn().mockResolvedValue("exercise-library"),
      getRoutineLibrary: jest.fn().mockResolvedValue("routine-library"),
      getRoutineDetailView: jest.fn().mockResolvedValue("routine-detail-view"),
      getDayDetailView: jest.fn().mockResolvedValue("day-detail-view"),
    };
    const repo = new TrainingRepository(http as never, fixtures as never);

    await expect(repo.getExerciseLibrary()).resolves.toBe("exercise-library");
    await expect(repo.getRoutineLibrary()).resolves.toBe("routine-library");
    await expect(repo.getRoutineDetailView("r1")).resolves.toBe("routine-detail-view");
    await expect(repo.getDayDetailView("d1")).resolves.toBe("day-detail-view");

    expect(fixtures.getRoutineDetailView).toHaveBeenCalledWith("r1");
    expect(fixtures.getDayDetailView).toHaveBeenCalledWith("d1");
    expect(http.getRoutineDashboard).not.toHaveBeenCalled();
  });
});
