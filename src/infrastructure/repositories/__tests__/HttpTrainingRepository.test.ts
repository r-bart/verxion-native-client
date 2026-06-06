import { HttpTrainingRepository } from "../HttpTrainingRepository";
import { apiClient } from "../../api/apiClient";
import { routineDashboardFixture } from "@/domain/training/__fixtures__/routineDashboardFixture";
import { sessionFeedFixture } from "@/domain/training/__fixtures__/sessionFeedFixture";
import { exerciseLibraryFixture } from "@/domain/training/__fixtures__/exerciseLibraryFixture";

jest.mock("../../api/apiClient", () => ({
  apiClient: { get: jest.fn() },
  ApiError: class ApiError extends Error {},
}));

const mockGet = apiClient.get as jest.Mock;

describe("HttpTrainingRepository", () => {
  let repo: HttpTrainingRepository;

  beforeEach(() => {
    repo = new HttpTrainingRepository();
    jest.clearAllMocks();
  });

  describe("getRoutineDashboard", () => {
    // Live read-model: GET /api/v1/training/routine-dashboard. The model mirrors
    // the contract 1:1, so the repo passes the response through unmapped.
    it("reads the routine-dashboard aggregate from the live endpoint", async () => {
      mockGet.mockResolvedValueOnce(routineDashboardFixture);

      const result = await repo.getRoutineDashboard();

      expect(mockGet).toHaveBeenCalledWith(
        "/training/routine-dashboard",
        expect.objectContaining({ tzOffsetMinutes: expect.any(String) })
      );
      expect(result).toBe(routineDashboardFixture);
      expect(result.state).toBe("active");
      expect(result.spine).toHaveLength(7);
    });
  });

  describe("getSessionDetailView", () => {
    it("reads /sessions/{id}/detail and maps it to the display-ready view", async () => {
      mockGet.mockResolvedValueOnce({
        session: {
          id: "s1",
          name: "Legs B",
          status: "completed",
          sessionType: "strength",
          dayType: "workout",
          startedAt: null,
          completedAt: "2026-05-31T12:00:00.000Z",
          durationSeconds: 3960,
          notes: null,
          routine: { id: "r1", name: "PPL" },
        },
        assessment: {
          pre: {},
          post: {
            overallFeeling: null,
            effortScore: 9,
            pump: 8,
            qualityScore: 8,
            standardizationScore: null,
            commitmentLevel: null,
            notes: "ok",
          },
        },
        summary: null,
      });

      const result = await repo.getSessionDetailView("s1");

      expect(mockGet).toHaveBeenCalledWith("/sessions/s1/detail");
      expect(result.header.name).toBe("Legs B");
      expect(result.header.routineName).toBe("PPL");
      expect(result.assessment).toEqual({ effort: 9, quality: 8, pump: 8 });
    });
  });

  describe("getSessionFeed", () => {
    // Live read-model: GET /api/v1/training/sessions-feed. The page mirrors the
    // contract 1:1, so the repo passes the response through unmapped.
    it("reads the sessions-feed page from the live endpoint", async () => {
      mockGet.mockResolvedValueOnce(sessionFeedFixture);

      const result = await repo.getSessionFeed({
        routineId: null,
        sort: "recent",
      });

      expect(mockGet).toHaveBeenCalledWith("/training/sessions-feed", {
        sort: "recent",
      });
      expect(result).toBe(sessionFeedFixture);
      expect(result.blocks[0].state).toBe("active");
    });

    it("sends only the defined filter/cursor params", async () => {
      mockGet.mockResolvedValueOnce(sessionFeedFixture);

      await repo.getSessionFeed({
        routineId: "ppl-base",
        sort: "volume",
        cursor: "c2",
      });

      expect(mockGet).toHaveBeenCalledWith("/training/sessions-feed", {
        routineId: "ppl-base",
        sort: "volume",
        cursor: "c2",
      });
    });

    it("passes undefined (clean GET, no trailing '?') for an unfiltered first page", async () => {
      mockGet.mockResolvedValueOnce(sessionFeedFixture);

      await repo.getSessionFeed({});

      expect(mockGet).toHaveBeenCalledWith(
        "/training/sessions-feed",
        undefined
      );
    });
  });

  describe("getExerciseLibrary", () => {
    it("returns the exercise library (stub of the proposed endpoint)", async () => {
      const result = await repo.getExerciseLibrary();
      expect(result).toBe(exerciseLibraryFixture);
      expect(result.exercises.length).toBeGreaterThan(0);
      expect(result.facets.groups.length).toBeGreaterThan(0);
    });
  });
});
