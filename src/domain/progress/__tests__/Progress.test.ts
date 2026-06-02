import type {
  ProgressOverview,
  WeekSummary,
  BodyComposition,
  TrendPoint,
  TrendSummary,
  ExerciseStats,
  MuscleGroupStat,
  ExerciseDetail,
  ExerciseSessionEntry,
  PersonalRecord,
  TimelineEntry,
  WeekArchive,
  WeekDetail,
  MonthArchive,
  MonthDetail,
  SessionReport,
  SessionExerciseReport,
} from "../models/Progress";

describe("Progress Domain Models", () => {
  describe("ProgressOverview", () => {
    it("has all summary fields", () => {
      const overview: ProgressOverview = {
        totalSessions: 42,
        totalVolume: 250000,
        totalDuration: 72000,
        currentStreak: 5,
        weekSummary: {
          sessions: 3,
          volume: 15000,
          adherence: 0.75,
        },
      };
      expect(overview.totalSessions).toBe(42);
      expect(overview.totalVolume).toBe(250000);
      expect(overview.currentStreak).toBe(5);
      expect(overview.weekSummary.sessions).toBe(3);
      expect(overview.weekSummary.adherence).toBe(0.75);
    });
  });

  describe("WeekSummary", () => {
    it("tracks sessions, volume, and adherence", () => {
      const summary: WeekSummary = {
        sessions: 4,
        volume: 20000,
        adherence: 1.0,
      };
      expect(summary.adherence).toBe(1.0);
    });
  });

  describe("BodyComposition", () => {
    it("includes weight trend and perimeter data", () => {
      const composition: BodyComposition = {
        weightTrend: [
          { date: "2026-03-01", value: 80.5 },
          { date: "2026-03-15", value: 79.8 },
        ],
        perimeterTrend: {
          chest: [
            { date: "2026-03-01", value: 100 },
            { date: "2026-03-15", value: 101 },
          ],
          waist: [{ date: "2026-03-01", value: 82 }],
        },
        currentWeight: 79.8,
        weightChange: -0.7,
        weightSummary: {
          current: 79.8,
          previous: 80.5,
          change: -0.7,
          changePercent: -0.87,
        },
      };
      expect(composition.weightTrend).toHaveLength(2);
      expect(composition.currentWeight).toBe(79.8);
      expect(composition.weightChange).toBe(-0.7);
      expect(composition.perimeterTrend.chest).toHaveLength(2);
      expect(composition.weightSummary?.change).toBe(-0.7);
    });

    it("handles null weight data", () => {
      const composition: BodyComposition = {
        weightTrend: [],
        perimeterTrend: {},
        currentWeight: null,
        weightChange: null,
      };
      expect(composition.currentWeight).toBeNull();
      expect(composition.weightChange).toBeNull();
      expect(composition.weightSummary).toBeUndefined();
      expect(composition.perimetersSummary).toBeUndefined();
    });
  });

  describe("TrendPoint", () => {
    it("has date and value", () => {
      const point: TrendPoint = { date: "2026-03-27", value: 80.0 };
      expect(point.date).toBe("2026-03-27");
      expect(point.value).toBe(80.0);
    });
  });

  describe("TrendSummary", () => {
    it("supports all nullable fields", () => {
      const summary: TrendSummary = {
        current: null,
        previous: null,
        change: null,
        changePercent: null,
      };
      expect(summary.current).toBeNull();
    });
  });

  describe("ExerciseStats", () => {
    it("has aggregate stats and muscle groups", () => {
      const stats: ExerciseStats = {
        totalVolume: 500000,
        totalSets: 1200,
        uniqueExercises: 25,
        trainingDays: 90,
        muscleGroups: [
          { name: "chest", volume: 120000, sets: 300, rank: 1 },
          { name: "back", volume: 110000, sets: 280, rank: 2 },
          { name: "legs", volume: 100000, sets: 250, rank: 3 },
        ],
      };
      expect(stats.muscleGroups).toHaveLength(3);
      expect(stats.muscleGroups[0].rank).toBe(1);
      expect(stats.uniqueExercises).toBe(25);
    });
  });

  describe("MuscleGroupStat", () => {
    it("has name, volume, sets, rank", () => {
      const mg: MuscleGroupStat = {
        name: "shoulders",
        volume: 45000,
        sets: 120,
        rank: 4,
      };
      expect(mg.name).toBe("shoulders");
      expect(mg.rank).toBe(4);
    });
  });

  describe("ExerciseDetail", () => {
    it("has exercise info and session history", () => {
      const detail: ExerciseDetail = {
        exerciseId: "ex-1",
        exerciseName: "Bench Press",
        totalVolume: 80000,
        totalSets: 200,
        totalReps: 1600,
        maxWeight: 120,
        sessionCount: 40,
        sessions: [
          {
            sessionId: "sess-1",
            date: "2026-03-25",
            volume: 4000,
            sets: 4,
            reps: 32,
            peakWeight: 120,
          },
        ],
      };
      expect(detail.exerciseId).toBe("ex-1");
      expect(detail.sessions).toHaveLength(1);
      expect(detail.sessions[0].peakWeight).toBe(120);
    });
  });

  describe("PersonalRecord", () => {
    it("has all fields", () => {
      const record: PersonalRecord = {
        exerciseName: "Deadlift",
        weight: 200,
        reps: 1,
        date: "2026-03-20",
        exerciseId: "ex-dl",
      };
      expect(record.exerciseName).toBe("Deadlift");
      expect(record.weight).toBe(200);
      expect(record.reps).toBe(1);
      expect(record.exerciseId).toBe("ex-dl");
    });
  });

  describe("TimelineEntry", () => {
    it("has monthly aggregates with nullable delta", () => {
      const entry: TimelineEntry = {
        month: "2026-03",
        sessions: 12,
        volume: 60000,
        adherence: 0.85,
        cardioMinutes: 120,
        deltaPercent: 5.2,
      };
      expect(entry.month).toBe("2026-03");
      expect(entry.deltaPercent).toBe(5.2);
    });

    it("supports null deltaPercent for first month", () => {
      const entry: TimelineEntry = {
        month: "2025-01",
        sessions: 8,
        volume: 40000,
        adherence: 0.6,
        cardioMinutes: 60,
        deltaPercent: null,
      };
      expect(entry.deltaPercent).toBeNull();
    });
  });

  describe("WeekArchive", () => {
    it("has week range and stats", () => {
      const week: WeekArchive = {
        weekStart: "2026-03-23",
        weekEnd: "2026-03-29",
        sessions: 4,
        targetSessions: 5,
        volume: 20000,
        cardioMinutes: 45,
      };
      expect(week.weekStart).toBe("2026-03-23");
      expect(week.sessions).toBe(4);
      expect(week.targetSessions).toBe(5);
    });
  });

  describe("WeekDetail", () => {
    it("has daily breakdown and totals", () => {
      const detail: WeekDetail = {
        weekStart: "2026-03-23",
        weekEnd: "2026-03-29",
        days: [
          { date: "2026-03-23", sessions: 1, volume: 5000 },
          { date: "2026-03-24", sessions: 0, volume: 0 },
        ],
        totals: { sessions: 4, volume: 20000, cardioMinutes: 30 },
      };
      expect(detail.days).toHaveLength(2);
      expect(detail.totals.sessions).toBe(4);
    });
  });

  describe("MonthArchive", () => {
    it("has monthly stats with nullable comparison", () => {
      const month: MonthArchive = {
        month: "2026-03",
        sessions: 15,
        volume: 75000,
        adherence: 0.9,
        cardioMinutes: 180,
        vsPrevious: 12.5,
      };
      expect(month.vsPrevious).toBe(12.5);
    });

    it("supports null vsPrevious", () => {
      const month: MonthArchive = {
        month: "2025-01",
        sessions: 10,
        volume: 50000,
        adherence: 0.7,
        cardioMinutes: 90,
        vsPrevious: null,
      };
      expect(month.vsPrevious).toBeNull();
    });
  });

  describe("MonthDetail", () => {
    it("has weekly breakdown, totals, and optional narrative", () => {
      const detail: MonthDetail = {
        month: "2026-03",
        weeks: [
          { weekStart: "2026-03-02", sessions: 4, volume: 20000 },
          { weekStart: "2026-03-09", sessions: 3, volume: 15000 },
        ],
        totals: {
          sessions: 15,
          volume: 75000,
          adherence: 0.9,
          cardioMinutes: 180,
        },
        narrative: "Strong month with consistent training.",
      };
      expect(detail.weeks).toHaveLength(2);
      expect(detail.narrative).toBeTruthy();
    });

    it("works without narrative", () => {
      const detail: MonthDetail = {
        month: "2026-02",
        weeks: [],
        totals: { sessions: 0, volume: 0, adherence: 0, cardioMinutes: 0 },
      };
      expect(detail.narrative).toBeUndefined();
    });
  });

  describe("SessionReport", () => {
    it("has full session data with exercises", () => {
      const report: SessionReport = {
        id: "sess-1",
        name: "Push Day A",
        date: "2026-03-27T08:00:00Z",
        duration: 3600,
        totalVolume: 15000,
        totalSets: 16,
        totalReps: 128,
        peakWeight: 100,
        completionRate: 0.95,
        exerciseCompletionRate: 1.0,
        averageRir: 2.5,
        muscleGroupDistribution: [
          { muscle: "chest", volume: 10000, percentage: 66.7, exercises: 2 },
          { muscle: "shoulders", volume: 5000, percentage: 33.3, exercises: 1 },
        ],
        exercises: [
          {
            exerciseId: "ex-bp",
            name: "Bench Press",
            muscleGroup: "chest",
            equipment: "barbell",
            setType: "working",
            plannedSets: 4,
            completedSets: 4,
            totalVolume: 6600,
            peakWeight: 85,
            totalReps: 18,
            sets: [
              { setNumber: 1, weight: 80, reps: 10, rir: 3, volume: 800 },
              { setNumber: 2, weight: 85, reps: 8, rir: 2, volume: 680 },
            ],
            prBadge: "Weight PR",
          },
          {
            exerciseId: "ex-ohp",
            name: "Overhead Press",
            muscleGroup: "shoulders",
            equipment: "barbell",
            setType: "working",
            plannedSets: 3,
            completedSets: 3,
            totalVolume: 1500,
            peakWeight: 50,
            totalReps: 10,
            sets: [{ setNumber: 1, weight: 50, reps: 10, volume: 500 }],
            prBadge: null,
          },
        ],
      };
      expect(report.exercises).toHaveLength(2);
      expect(report.exercises[0].prBadge).toBe("Weight PR");
      expect(report.exercises[1].prBadge).toBeNull();
      expect(report.averageRir).toBe(2.5);
      expect(report.exercises[0].sets[1].rir).toBe(2);
      expect(report.exercises[1].sets[0].rir).toBeUndefined();
    });

    it("supports undefined averageRir", () => {
      const report: SessionReport = {
        id: "sess-2",
        name: "Quick Session",
        date: "2026-03-27T10:00:00Z",
        duration: 1800,
        totalVolume: 5000,
        totalSets: 6,
        totalReps: 48,
        peakWeight: 60,
        completionRate: 1.0,
        exerciseCompletionRate: 1.0,
        muscleGroupDistribution: [],
        exercises: [],
      };
      expect(report.averageRir).toBeUndefined();
    });
  });
});
