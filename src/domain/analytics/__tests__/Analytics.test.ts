import type {
  Streak,
  WeekView,
  ContributionDay,
  DayTrainingState,
} from "../models/Analytics";

describe("Analytics Domain Models", () => {
  describe("Streak", () => {
    it("has current, longest, and lastActiveDate", () => {
      const streak: Streak = {
        current: 5,
        longest: 12,
        lastActiveDate: "2026-03-26",
      };
      expect(streak.current).toBe(5);
      expect(streak.longest).toBe(12);
      expect(streak.lastActiveDate).toBe("2026-03-26");
    });

    it("supports zero streaks", () => {
      const streak: Streak = {
        current: 0,
        longest: 0,
        lastActiveDate: "",
      };
      expect(streak.current).toBe(0);
      expect(streak.longest).toBe(0);
    });
  });

  describe("WeekView", () => {
    it("contains 7 days", () => {
      const weekView: WeekView = {
        days: Array.from({ length: 7 }, (_, i) => ({
          date: `2026-03-${(21 + i).toString().padStart(2, "0")}`,
          sessions: i % 2 === 0 ? 1 : 0,
          volume: i % 2 === 0 ? 5000 : 0,
        })),
      };
      expect(weekView.days).toHaveLength(7);
      expect(weekView.days[0].date).toBe("2026-03-21");
      expect(weekView.days[0].sessions).toBe(1);
      expect(weekView.days[1].sessions).toBe(0);
    });

    it("supports empty week", () => {
      const weekView: WeekView = {
        days: Array.from({ length: 7 }, (_, i) => ({
          date: `2026-03-${(21 + i).toString().padStart(2, "0")}`,
          sessions: 0,
          volume: 0,
        })),
      };
      expect(weekView.days.every((d) => d.sessions === 0)).toBe(true);
    });
  });

  describe("ContributionDay", () => {
    it.each([0, 1, 2, 3, 4] as const)(
      "accepts level %i",
      (level) => {
        const day: ContributionDay = {
          date: "2026-03-27",
          count: level * 2,
          level,
        };
        expect(day.level).toBe(level);
        expect(day.date).toBe("2026-03-27");
      }
    );

    it("has date and count fields", () => {
      const day: ContributionDay = {
        date: "2026-01-15",
        count: 3,
        level: 2,
      };
      expect(day.count).toBe(3);
    });
  });

  describe("DayTrainingState", () => {
    const states = [
      "NO_ENGAGEMENT_ACTIVE",
      "REST_DAY",
      "WORKOUT_PLANNED",
      "SESSION_IN_PROGRESS",
      "SESSION_COMPLETED",
      "MISSED_WORKOUT",
    ] as const;

    it.each(states)("supports state: %s", (state) => {
      const dayState: DayTrainingState = {
        state,
        sessionsToday: 0,
        weekSessions: 2,
        weekTarget: 4,
      };
      expect(dayState.state).toBe(state);
    });

    it("includes optional plannedWorkoutDay", () => {
      const dayState: DayTrainingState = {
        state: "WORKOUT_PLANNED",
        plannedWorkoutDay: {
          id: "wd-1",
          name: "Push Day",
          dayType: "strength",
        },
        sessionsToday: 0,
        weekSessions: 1,
        weekTarget: 4,
      };
      expect(dayState.plannedWorkoutDay?.id).toBe("wd-1");
      expect(dayState.plannedWorkoutDay?.name).toBe("Push Day");
      expect(dayState.plannedWorkoutDay?.dayType).toBe("strength");
    });

    it("works without plannedWorkoutDay", () => {
      const dayState: DayTrainingState = {
        state: "REST_DAY",
        sessionsToday: 0,
        weekSessions: 3,
        weekTarget: 4,
      };
      expect(dayState.plannedWorkoutDay).toBeUndefined();
    });
  });
});
