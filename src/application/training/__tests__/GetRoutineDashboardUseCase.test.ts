import { GetRoutineDashboardUseCase } from "../GetRoutineDashboardUseCase";
import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type { RoutineDashboard } from "@/domain/training/models/RoutineDashboard";

const dashboard: RoutineDashboard = {
  state: "active",
  activeRoutine: {
    id: "ppl",
    name: "PPL Hipertrofia",
    goal: "Hipertrofia",
    split: "Push · Pull · Legs",
    week: 3,
    weeks: 6,
    weekFraction: 3 / 7,
    scoreState: "ahead",
    sessionsDone: 14,
    sessionsPlanned: 36,
    volumeTotal: "32,1 t",
    volumeTrendPct: 8,
  },
  spine: [],
  next: null,
  liveSession: null,
  agentNote: null,
};

describe("GetRoutineDashboardUseCase", () => {
  function createMockPort(overrides: Partial<ITrainingPort> = {}): ITrainingPort {
    return {
      getRoutineDashboard: jest.fn().mockResolvedValue(dashboard),
      getRoutines: jest.fn(),
      getRoutineDetail: jest.fn(),
      getWorkoutDayExercises: jest.fn(),
      getExerciseConfiguration: jest.fn(),
      getProgressionPlan: jest.fn(),
      ...overrides,
    };
  }

  it("returns the aggregate from the port", async () => {
    const port = createMockPort();
    const uc = new GetRoutineDashboardUseCase(port);

    const result = await uc.execute();

    expect(port.getRoutineDashboard).toHaveBeenCalledTimes(1);
    expect(result).toBe(dashboard);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getRoutineDashboard: jest.fn().mockRejectedValue(new Error("API error")),
    });
    const uc = new GetRoutineDashboardUseCase(port);

    await expect(uc.execute()).rejects.toThrow("API error");
  });
});
