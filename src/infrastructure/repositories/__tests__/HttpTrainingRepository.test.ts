import { HttpTrainingRepository } from "../HttpTrainingRepository";
import { routineDashboardFixture } from "@/domain/training/__fixtures__/routineDashboardFixture";
import { sessionsSummaryFixture } from "@/domain/training/__fixtures__/sessionsSummaryFixture";

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

  describe("getSessionsSummary", () => {
    it("returns the sessions-summary aggregate (stub of the proposed endpoint)", async () => {
      const result = await repo.getSessionsSummary();
      expect(result).toBe(sessionsSummaryFixture);
      expect(result.recent).toHaveLength(6);
      expect(result.stats.sessions).toBe(14);
    });
  });
});
