export const trainingKeys = {
  all: () => ["training"] as const,
  routines: () => ["training", "routines"] as const,
  routineDetail: (id: string) => ["training", "routine", id] as const,
  sessions: (params?: Record<string, string>) => ["training", "sessions", params] as const,
  exercises: (params?: Record<string, string>) => ["training", "exercises", params] as const,
  workoutDayExercises: (routineId: string, dayId: string) => ["training", "routine", routineId, "day", dayId, "exercises"] as const,
  exerciseConfiguration: (wdeId: string) => ["training", "exercise-configuration", wdeId] as const,
  exerciseSearch: (params?: Record<string, string | undefined>) => ["training", "exercise-search", params] as const,
  exerciseDetail: (id: string) => ["training", "exercise-detail", id] as const,
  exerciseFilters: () => ["training", "exercise-filters"] as const,
  sessionHistory: (workoutDayId: string) =>
    [...trainingKeys.all(), "sessionHistory", workoutDayId] as const,
  progressionPlan: (workoutDayId: string) =>
    [...trainingKeys.all(), "progressionPlan", workoutDayId] as const,
};
