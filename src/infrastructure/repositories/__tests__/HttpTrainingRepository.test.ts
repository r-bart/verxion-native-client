import { HttpTrainingRepository } from "../HttpTrainingRepository";
import { routineDashboardFixture } from "@/domain/training/__fixtures__/routineDashboardFixture";
import { sessionFeedFixture } from "@/domain/training/__fixtures__/sessionFeedFixture";

jest.mock("../../api/apiClient", () => ({
  apiClient: { get: jest.fn() },
  ApiError: class ApiError extends Error {},
}));

describe("HttpTrainingRepository", () => {
  let repo: HttpTrainingRepository;

  beforeEach(() => {
    repo = new HttpTrainingRepository();
    jest.clearAllMocks();
  });

  describe("getRoutineDashboard", () => {
    // STUB phase: serves the contract fixture until the platform ships
    // GET /training/routine-dashboard. When the real call lands, this test
    // switches to mocking apiClient.get like the other repo tests.
    it("returns the routine-dashboard aggregate (stub of the proposed endpoint)", async () => {
      const result = await repo.getRoutineDashboard();
      expect(result).toBe(routineDashboardFixture);
      expect(result.state).toBe("active");
      expect(result.spine).toHaveLength(7);
    });
  });

  describe("getSessionFeed", () => {
    it("returns a sessions-feed page (stub of the proposed endpoint)", async () => {
      const result = await repo.getSessionFeed({ routineId: null, sort: "recent" });
      expect(result).toBe(sessionFeedFixture);
      expect(result.blocks.length).toBeGreaterThan(0);
      expect(result.blocks[0].state).toBe("active");
    });
  });
});
