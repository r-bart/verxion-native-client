export const sessionViewerKeys = {
  liveProgress: (id: string) =>
    ["session-viewer", "live-progress", id] as const,
  progressionPlan: (workoutDayId: string) =>
    ["session-viewer", "progression-plan", workoutDayId] as const,
};
