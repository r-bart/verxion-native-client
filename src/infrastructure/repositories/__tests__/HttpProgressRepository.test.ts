import { HttpProgressRepository } from "../HttpProgressRepository";
import { apiClient } from "../../api/apiClient";

jest.mock("../../api/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;

describe("HttpProgressRepository", () => {
  let repo: HttpProgressRepository;

  beforeEach(() => {
    repo = new HttpProgressRepository();
    jest.clearAllMocks();
  });

  describe("getOverview", () => {
    it("composes 3 parallel API calls", async () => {
      mockGet
        .mockResolvedValueOnce({ totalSessions: 42, totalVolume: 250000, totalDuration: 72000 })
        .mockResolvedValueOnce({ current: 5 })
        .mockResolvedValueOnce({ sessions: 3, volume: 15000, adherence: 0.75 });

      const result = await repo.getOverview();

      expect(mockGet).toHaveBeenCalledTimes(3);
      expect(mockGet).toHaveBeenCalledWith("/analytics/aggregated");
      expect(mockGet).toHaveBeenCalledWith("/analytics/streaks");
      expect(mockGet).toHaveBeenCalledWith(
        "/analytics/week-view",
        expect.objectContaining({ weekDate: expect.any(String) })
      );
      expect(result).toEqual({
        totalSessions: 42,
        totalVolume: 250000,
        totalDuration: 72000,
        currentStreak: 5,
        weekSummary: { sessions: 3, volume: 15000, adherence: 0.75 },
      });
    });

    it("defaults to 0 for missing fields", async () => {
      mockGet
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      const result = await repo.getOverview();

      expect(result.totalSessions).toBe(0);
      expect(result.totalVolume).toBe(0);
      expect(result.totalDuration).toBe(0);
      expect(result.currentStreak).toBe(0);
      expect(result.weekSummary.sessions).toBe(0);
    });
  });

  describe("getBodyComposition", () => {
    it("passes period param to all endpoints", async () => {
      mockGet
        .mockResolvedValueOnce([{ date: "2026-03-01", value: 80 }])
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ current: 80, change: -1 })
        .mockResolvedValueOnce(null);

      const result = await repo.getBodyComposition("3m");

      expect(mockGet).toHaveBeenCalledWith("/analytics/trends/weight", { period: "3m" });
      expect(mockGet).toHaveBeenCalledWith("/analytics/trends/perimeters", { period: "3m" });
      expect(mockGet).toHaveBeenCalledWith("/analytics/trends/weight/summary", { period: "3m" });
      expect(mockGet).toHaveBeenCalledWith("/analytics/trends/perimeters/summary", { period: "3m" });
      expect(result.weightTrend).toHaveLength(1);
      expect(result.currentWeight).toBe(80);
    });

    it("handles perimeter fetch failure gracefully", async () => {
      mockGet
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error("Not found"))
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await repo.getBodyComposition("6m");

      // Should not throw, perimeterTrend falls back to empty object
      expect(result.perimeterTrend).toEqual({});
    });
  });

  describe("getExerciseStats", () => {
    it("composes 2 parallel API calls", async () => {
      mockGet
        .mockResolvedValueOnce({
          totalVolume: 500000,
          totalSets: 1200,
          uniqueExercises: 25,
          trainingDays: 90,
        })
        .mockResolvedValueOnce({
          muscleGroups: [
            { name: "chest", volume: 120000, sets: 300 },
            { name: "back", volume: 110000, sets: 280 },
          ],
        });

      const result = await repo.getExerciseStats();

      expect(mockGet).toHaveBeenCalledWith("/analytics/exercises/lifetime-stats");
      expect(mockGet).toHaveBeenCalledWith("/analytics/exercises/summary");
      expect(result.muscleGroups).toHaveLength(2);
      expect(result.muscleGroups[0].rank).toBe(1);
      expect(result.muscleGroups[1].rank).toBe(2);
    });
  });

  describe("getExerciseDetail", () => {
    it("calls correct endpoints with exerciseId", async () => {
      mockGet
        .mockResolvedValueOnce({
          exerciseName: "Bench Press",
          totalVolume: 80000,
          totalSets: 200,
          totalReps: 1600,
          maxWeight: 120,
          sessionCount: 40,
        })
        .mockResolvedValueOnce([
          { sessionId: "s1", date: "2026-03-25", volume: 4000, sets: 4, reps: 32, peakWeight: 120 },
        ]);

      const result = await repo.getExerciseDetail("ex-1");

      expect(mockGet).toHaveBeenCalledWith("/analytics/exercises/ex-1/stats");
      expect(mockGet).toHaveBeenCalledWith("/analytics/exercises/ex-1/sessions");
      expect(result.exerciseId).toBe("ex-1");
      expect(result.sessions).toHaveLength(1);
    });
  });

  describe("getRecords", () => {
    it("returns array from API", async () => {
      const records = [
        { exerciseName: "Deadlift", weight: 200, reps: 1, date: "2026-03-20", exerciseId: "ex-dl" },
      ];
      mockGet.mockResolvedValue(records);

      const result = await repo.getRecords();

      expect(mockGet).toHaveBeenCalledWith("/analytics/exercises/records");
      expect(result).toEqual(records);
    });
  });

  describe("getTimeline", () => {
    it("passes monthsBack param", async () => {
      mockGet.mockResolvedValue([]);

      await repo.getTimeline(6);

      expect(mockGet).toHaveBeenCalledWith("/analytics/progress-timeline", { monthsBack: "6" });
    });
  });

  describe("getWeeks", () => {
    it("calls aggregated timeline with groupBy=week", async () => {
      mockGet.mockResolvedValue([]);

      await repo.getWeeks();

      expect(mockGet).toHaveBeenCalledWith("/analytics/aggregated/timeline", { groupBy: "week" });
    });
  });

  describe("getWeekDetail", () => {
    it("passes weekDate param", async () => {
      mockGet.mockResolvedValue({ weekStart: "2026-03-23" });

      await repo.getWeekDetail("2026-03-23");

      expect(mockGet).toHaveBeenCalledWith("/analytics/weekly-summary", { weekDate: "2026-03-23" });
    });
  });

  describe("getMonths", () => {
    it("calls aggregated timeline with groupBy=month", async () => {
      mockGet.mockResolvedValue([]);

      await repo.getMonths();

      expect(mockGet).toHaveBeenCalledWith("/analytics/aggregated/timeline", { groupBy: "month" });
    });
  });

  describe("getMonthDetail", () => {
    it("passes month param", async () => {
      mockGet.mockResolvedValue({ month: "2026-03" });

      await repo.getMonthDetail("2026-03");

      expect(mockGet).toHaveBeenCalledWith("/analytics/monthly-snapshot", { month: "2026-03" });
    });
  });

  describe("getSessionReport", () => {
    it("composes session and summary data", async () => {
      mockGet
        .mockResolvedValueOnce({
          id: "sess-1",
          name: "Push Day",
          startedAt: "2026-03-27T08:00:00Z",
        })
        .mockResolvedValueOnce({
          totalDurationSeconds: 3600,
          totalVolume: 15000,
          totalSets: 16,
          totalReps: 128,
          peakWeight: 100,
          avgRestTime: 120,
          avgRpe: 7.5,
          exerciseSummaries: [
            {
              exerciseName: "Bench Press",
              targetMuscle: "chest",
              setDetails: [{ setNumber: 1, weight: 80, reps: 10, rir: 3 }],
              prBadge: "Weight PR",
            },
          ],
        });

      const result = await repo.getSessionReport("sess-1");

      expect(mockGet).toHaveBeenCalledWith("/sessions/sess-1");
      expect(mockGet).toHaveBeenCalledWith("/sessions/sess-1/summary");
      expect(result.id).toBe("sess-1");
      expect(result.name).toBe("Push Day");
      expect(result.duration).toBe(3600);
      expect(result.exercises).toHaveLength(1);
      expect(result.exercises[0].name).toBe("Bench Press");
      expect(result.exercises[0].muscleGroup).toBe("chest");
    });

    it("handles summary 404 gracefully", async () => {
      mockGet
        .mockResolvedValueOnce({
          id: "sess-2",
          name: "Quick Session",
          startedAt: "2026-03-27T10:00:00Z",
          duration: 1800,
        })
        .mockRejectedValueOnce(new Error("Not found"));

      const result = await repo.getSessionReport("sess-2");

      // Should not throw; summary falls back to null
      expect(result.id).toBe("sess-2");
      expect(result.totalVolume).toBe(0);
      expect(result.exercises).toEqual([]);
      expect(result.duration).toBe(1800);
    });

    it("uses session.createdAt when startedAt is missing", async () => {
      mockGet
        .mockResolvedValueOnce({
          id: "sess-3",
          name: "Pending",
          createdAt: "2026-03-27T09:00:00Z",
        })
        .mockResolvedValueOnce(null);

      const result = await repo.getSessionReport("sess-3");

      expect(result.date).toBe("2026-03-27T09:00:00Z");
    });
  });
});
