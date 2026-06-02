import { HttpAnalyticsRepository } from "../HttpAnalyticsRepository";
import { apiClient } from "../../api/apiClient";
import type { Streak, WeekView, ContributionDay, DayTrainingState } from "@/domain/analytics/models/Analytics";

jest.mock("../../api/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;

describe("HttpAnalyticsRepository", () => {
  let repo: HttpAnalyticsRepository;

  beforeEach(() => {
    repo = new HttpAnalyticsRepository();
    jest.clearAllMocks();
  });

  describe("getStreaks", () => {
    it("calls apiClient.get with correct path", async () => {
      const mockStreak: Streak = { current: 5, longest: 10, lastActiveDate: "2026-03-27" };
      mockGet.mockResolvedValue(mockStreak);

      const result = await repo.getStreaks();

      expect(mockGet).toHaveBeenCalledWith("/analytics/streaks");
      expect(result).toEqual(mockStreak);
    });
  });

  describe("getWeekView", () => {
    it("calls apiClient.get with today's date", async () => {
      const mockWeekView: WeekView = { days: [] };
      mockGet.mockResolvedValue(mockWeekView);

      const result = await repo.getWeekView();
      const today = new Date().toISOString().slice(0, 10);

      expect(mockGet).toHaveBeenCalledWith("/analytics/week-view", { weekDate: today });
      expect(result).toEqual(mockWeekView);
    });
  });

  describe("getContributionGrid", () => {
    it("calls apiClient.get with current year", async () => {
      const mockGrid: ContributionDay[] = [{ date: "2026-03-27", count: 1, level: 1 }];
      mockGet.mockResolvedValue(mockGrid);

      const result = await repo.getContributionGrid();
      const year = new Date().getFullYear().toString();

      expect(mockGet).toHaveBeenCalledWith("/analytics/contribution-grid", { year });
      expect(result).toEqual(mockGrid);
    });
  });

  describe("getDayState", () => {
    it("calls apiClient.get with correct path and date param", async () => {
      const mockState: DayTrainingState = {
        state: "REST_DAY",
        sessionsToday: 0,
        weekSessions: 3,
        weekTarget: 4,
      };
      mockGet.mockResolvedValue(mockState);

      const result = await repo.getDayState("2026-03-27");

      expect(mockGet).toHaveBeenCalledWith("/analytics/training/day-state", { date: "2026-03-27" });
      expect(result).toEqual(mockState);
    });
  });
});
