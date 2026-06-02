import { GetLiveProgressUseCase } from "../GetLiveProgressUseCase";
import type { ISessionPort } from "@/domain/sessions/ports/ISessionPort";
import type { LiveSessionProgress } from "@/domain/sessions/models/Session";

describe("GetLiveProgressUseCase", () => {
  const mockProgress: LiveSessionProgress = {
    session: {
      id: "sess-1",
      name: "Push Day",
      status: "in_progress",
      sessionType: "routine",
      startedAt: "2026-03-27T08:00:00Z",
      elapsedSeconds: 1200,
    },
    progress: {
      totalExercises: 5,
      completedExercises: 2,
      skippedExercises: 0,
      remainingExercises: 3,
      completionRate: 0.4,
      totalVolume: 8000,
      totalSets: 8,
      totalReps: 64,
    },
    exercises: [],
    previousSession: null,
  };

  function createMockPort(overrides: Partial<ISessionPort> = {}): ISessionPort {
    return {
      getActiveSession: jest.fn(),
      getLiveProgress: jest.fn().mockResolvedValue(mockProgress),
      listSessions: jest.fn().mockResolvedValue([]),
      ...overrides,
    };
  }

  it("calls port.getLiveProgress with sessionId", async () => {
    const port = createMockPort();
    const uc = new GetLiveProgressUseCase(port);
    const result = await uc.execute("sess-1");

    expect(port.getLiveProgress).toHaveBeenCalledWith("sess-1");
    expect(result).toBe(mockProgress);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new GetLiveProgressUseCase(port);
    const result = await uc.execute("sess-1");
    expect(result.progress.completionRate).toBe(0.4);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getLiveProgress: jest.fn().mockRejectedValue(new Error("Session not found")),
    });
    const uc = new GetLiveProgressUseCase(port);
    await expect(uc.execute("nonexistent")).rejects.toThrow("Session not found");
  });
});
