import { HttpActivityRepository } from "../HttpActivityRepository";
import { apiClient } from "../../api/apiClient";
import type { StepLog, DailyWater } from "@/domain/activity/models/Activity";

jest.mock("../../api/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;
const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;

describe("HttpActivityRepository", () => {
  let repo: HttpActivityRepository;

  beforeEach(() => {
    repo = new HttpActivityRepository();
    jest.clearAllMocks();
  });

  describe("getDailySteps", () => {
    it("sums totalSteps from step log entries", async () => {
      mockGet.mockResolvedValue([
        { totalSteps: 3000 },
        { totalSteps: 2500 },
        { totalSteps: 3000 },
      ]);

      const result = await repo.getDailySteps("2026-03-27");

      expect(mockGet).toHaveBeenCalledWith("/activity/steps", {
        from: "2026-03-27",
        to: "2026-03-27",
      });
      expect(result).toBe(8500);
    });

    it("returns 0 for empty logs", async () => {
      mockGet.mockResolvedValue([]);

      const result = await repo.getDailySteps("2026-03-27");
      expect(result).toBe(0);
    });
  });

  describe("getDailyWater", () => {
    it("calls correct endpoint with date in path", async () => {
      const mockWater: DailyWater = {
        totalMl: 2000,
        date: "2026-03-27",
        logs: [{ id: "w-1", amountMl: 500, loggedAt: "2026-03-27T08:00:00Z" }],
      };
      mockGet.mockResolvedValue(mockWater);

      const result = await repo.getDailyWater("2026-03-27");

      expect(mockGet).toHaveBeenCalledWith("/nutrition/water/daily/2026-03-27");
      expect(result).toEqual(mockWater);
    });
  });

  describe("logSteps", () => {
    it("sends correct body to POST /activity/steps", async () => {
      const mockStepLog: StepLog = { id: "step-1", steps: 10000, date: "2026-03-27" };
      mockPost.mockResolvedValue(mockStepLog);

      const result = await repo.logSteps(10000, "2026-03-27");

      expect(mockPost).toHaveBeenCalledWith("/activity/steps", {
        totalSteps: 10000,
        loggedDate: "2026-03-27",
      });
      expect(result).toEqual(mockStepLog);
    });
  });

  describe("logWater", () => {
    it("sends correct body with logDate to POST /nutrition/water/", async () => {
      mockPost.mockResolvedValue(undefined);

      await repo.logWater(500);
      const today = new Date().toISOString().slice(0, 10);

      expect(mockPost).toHaveBeenCalledWith("/nutrition/water/", {
        logDate: today,
        amountMl: 500,
      });
    });
  });
});
