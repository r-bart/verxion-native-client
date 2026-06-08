import { HttpSessionRepository } from "../HttpSessionRepository";
import { apiClient } from "../../api/apiClient";
import type { Session } from "@/domain/sessions/models/Session";

jest.mock("../../api/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;

describe("HttpSessionRepository", () => {
  let repo: HttpSessionRepository;

  beforeEach(() => {
    repo = new HttpSessionRepository();
    jest.clearAllMocks();
  });

  describe("getActiveSession", () => {
    it("returns first session when sessions exist", async () => {
      const mockSession: Session = {
        id: "sess-1",
        name: "Push Day",
        status: "in_progress",
        startedAt: "2026-03-27T08:00:00Z",
        completedAt: null,
      };
      mockGet.mockResolvedValue([mockSession]);

      const result = await repo.getActiveSession();

      expect(mockGet).toHaveBeenCalledWith("/sessions", { status: "in_progress", limit: "1" });
      expect(result).toEqual(mockSession);
    });

    it("returns null when no sessions", async () => {
      mockGet.mockResolvedValue([]);

      const result = await repo.getActiveSession();

      expect(result).toBeNull();
    });
  });

  describe("getLiveProgress", () => {
    it("calls correct endpoint and maps response", async () => {
      const rawApiResponse = {
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
      mockGet.mockResolvedValue(rawApiResponse);

      const result = await repo.getLiveProgress("sess-1");

      expect(mockGet).toHaveBeenCalledWith("/sessions/sess-1/live-progress");
      expect(result.session.id).toBe("sess-1");
      expect(result.session.sessionType).toBe("routine");
      expect(result.progress.skippedExercises).toBe(0);
      expect(result.progress.remainingExercises).toBe(3);
      expect(result.previousSession).toBeNull();
    });
  });
});
