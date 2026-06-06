/**
 * Query-key factory for the Entreno (training) feature. One namespace, keyed by
 * the read it backs — routines library, a routine/day/session/exercise detail,
 * the live session, today's prescription, and the session history. IDs (not the
 * mockup's display slugs) key the detail reads, matching the domain models.
 */
export const trainingKeys = {
  all: ["training"] as const,

  routineDashboard: () => ["training", "routineDashboard"] as const,
  sessionFeed: (routineId?: string | null, sort?: string) =>
    ["training", "sessionFeed", routineId ?? "all", sort ?? "recent"] as const,
  exerciseLibrary: () => ["training", "exerciseLibrary"] as const,
  routineLibrary: () => ["training", "routineLibrary"] as const,
  routineDetailView: (id: string) => ["training", "routineDetailView", id] as const,
  dayDetailView: (dayId: string) => ["training", "dayDetailView", dayId] as const,
  sessionDetailView: (id: string) => ["training", "sessionDetailView", id] as const,
  routines: () => ["training", "routines"] as const,
  routineDetail: (id: string) => ["training", "routine", id] as const,
  dayExercises: (routineId: string, dayId: string) =>
    ["training", "routine", routineId, "day", dayId] as const,
  exerciseConfig: (wdeId: string) => ["training", "exerciseConfig", wdeId] as const,

  prescription: (dayId?: string) => ["training", "prescription", dayId ?? "today"] as const,
  progressionPlan: (workoutDayId: string) => ["training", "progressionPlan", workoutDayId] as const,

  liveSession: () => ["training", "session", "live"] as const,
  sessions: (routineId?: string, sort?: string) =>
    ["training", "sessions", routineId ?? "all", sort ?? "recent"] as const,
  sessionReport: (id: string) => ["training", "session", "report", id] as const,

  exercises: (params?: Record<string, unknown>) => ["training", "exercises", params ?? {}] as const,
  exerciseDetail: (id: string) => ["training", "exercise", id] as const,
  exerciseFilters: () => ["training", "exercises", "filters"] as const,
};
