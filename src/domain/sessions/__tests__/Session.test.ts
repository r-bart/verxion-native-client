import type {
  Session,
  LiveSessionProgress,
  LiveExerciseProgress,
} from "../models/Session";

describe("Session Domain Models", () => {
  describe("Session", () => {
    const statuses = ["pending", "in_progress", "completed", "cancelled"] as const;

    it.each(statuses)("supports status: %s", (status) => {
      const session: Session = {
        id: "sess-1",
        name: "Morning Workout",
        status,
        startedAt: status === "pending" ? null : "2026-03-27T08:00:00Z",
        completedAt: status === "completed" ? "2026-03-27T09:00:00Z" : null,
      };
      expect(session.status).toBe(status);
      expect(session.id).toBe("sess-1");
    });

    it("pending session has null timestamps", () => {
      const session: Session = {
        id: "sess-2",
        name: "Planned Session",
        status: "pending",
        startedAt: null,
        completedAt: null,
      };
      expect(session.startedAt).toBeNull();
      expect(session.completedAt).toBeNull();
    });

    it("completed session has both timestamps", () => {
      const session: Session = {
        id: "sess-3",
        name: "Done Session",
        status: "completed",
        startedAt: "2026-03-27T08:00:00Z",
        completedAt: "2026-03-27T09:30:00Z",
      };
      expect(session.startedAt).toBeTruthy();
      expect(session.completedAt).toBeTruthy();
    });
  });

  describe("LiveExerciseProgress", () => {
    const exerciseStatuses = [
      "not_started",
      "in_progress",
      "completed",
      "skipped",
    ] as const;

    it.each(exerciseStatuses)("supports status: %s", (status) => {
      const exercise: LiveExerciseProgress = {
        sessionExerciseId: "se-1",
        exerciseId: "ex-1",
        exerciseName: "Bench Press",
        bodyPart: "chest",
        target: "pectorals",
        orderIndex: 0,
        sourceType: "planned",
        setType: "regular",
        status,
        actual: {
          completedSets: status === "completed" ? 3 : 0,
          totalVolume: 0,
          totalReps: 0,
          peakWeight: 0,
          sets: [],
        },
      };
      expect(exercise.status).toBe(status);
    });

    it("includes planned data", () => {
      const exercise: LiveExerciseProgress = {
        sessionExerciseId: "se-2",
        exerciseId: "ex-2",
        exerciseName: "Squat",
        bodyPart: "legs",
        target: "quadriceps",
        orderIndex: 1,
        sourceType: "planned",
        setType: "regular",
        status: "in_progress",
        planned: { sets: 4, repScheme: "8-10", weight: 100 },
        actual: {
          completedSets: 2,
          totalVolume: 1600,
          totalReps: 18,
          peakWeight: 100,
          sets: [
            { setNumber: 1, weight: 100, reps: 10, volume: 1000 },
            { setNumber: 2, weight: 100, reps: 8, rir: 2, volume: 800 },
          ],
        },
      };
      expect(exercise.planned?.sets).toBe(4);
      expect(exercise.planned?.repScheme).toBe("8-10");
      expect(exercise.actual.sets).toHaveLength(2);
      expect(exercise.actual.sets[1].rir).toBe(2);
    });

    it("works without planned data", () => {
      const exercise: LiveExerciseProgress = {
        sessionExerciseId: "se-3",
        exerciseId: "ex-3",
        exerciseName: "Curls",
        bodyPart: "arms",
        target: "biceps",
        orderIndex: 2,
        sourceType: "added",
        setType: "regular",
        status: "not_started",
        actual: {
          completedSets: 0,
          totalVolume: 0,
          totalReps: 0,
          peakWeight: 0,
          sets: [],
        },
      };
      expect(exercise.planned).toBeUndefined();
    });
  });

  describe("LiveSessionProgress", () => {
    it("combines session info, progress, and exercises", () => {
      const liveProgress: LiveSessionProgress = {
        session: {
          id: "sess-1",
          name: "Push Day",
          status: "in_progress",
          sessionType: "routine",
          startedAt: "2026-03-27T08:00:00Z",
          elapsedSeconds: 1800,
          routineName: "PPL",
          workoutDayName: "Push A",
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
        exercises: [
          {
            sessionExerciseId: "se-1",
            exerciseId: "ex-1",
            exerciseName: "Bench Press",
            bodyPart: "chest",
            target: "pectorals",
            orderIndex: 0,
            sourceType: "planned",
            setType: "regular",
            status: "completed",
            actual: {
              completedSets: 4,
              totalVolume: 4000,
              totalReps: 40,
              peakWeight: 100,
              sets: [
                { setNumber: 1, weight: 100, reps: 10, volume: 1000 },
                { setNumber: 2, weight: 100, reps: 10, volume: 1000 },
                { setNumber: 3, weight: 100, reps: 10, volume: 1000 },
                { setNumber: 4, weight: 100, reps: 10, volume: 1000 },
              ],
            },
          },
        ],
        previousSession: null,
      };
      expect(liveProgress.session.elapsedSeconds).toBe(1800);
      expect(liveProgress.progress.completionRate).toBe(0.4);
      expect(liveProgress.exercises).toHaveLength(1);
      expect(liveProgress.session.routineName).toBe("PPL");
      expect(liveProgress.session.workoutDayName).toBe("Push A");
    });

    it("supports paused session status", () => {
      const liveProgress: LiveSessionProgress = {
        session: {
          id: "sess-2",
          name: "Leg Day",
          status: "paused",
          sessionType: "routine",
          startedAt: "2026-03-27T10:00:00Z",
          elapsedSeconds: 600,
        },
        progress: {
          totalExercises: 4,
          completedExercises: 0,
          skippedExercises: 0,
          remainingExercises: 4,
          completionRate: 0,
          totalVolume: 0,
          totalSets: 0,
          totalReps: 0,
        },
        exercises: [],
        previousSession: null,
      };
      expect(liveProgress.session.status).toBe("paused");
      expect(liveProgress.session.routineName).toBeUndefined();
    });
  });
});
