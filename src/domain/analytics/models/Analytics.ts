export interface Streak {
  current: number;
  longest: number;
  lastActiveDate: string;
}

export interface WeekView {
  days: { date: string; sessions: number; volume: number }[];
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface DayTrainingState {
  state:
    | "NO_ENGAGEMENT_ACTIVE"
    | "REST_DAY"
    | "WORKOUT_PLANNED"
    | "SESSION_IN_PROGRESS"
    | "SESSION_COMPLETED"
    | "MISSED_WORKOUT";
  plannedWorkoutDay?: {
    id: string;
    name: string;
    dayType: string;
  };
  sessionsToday: number;
  weekSessions: number;
  weekTarget: number;
}

export interface ExecutionScore {
  executionScore: number | null;
  window: {
    windowDays: number;
    from: string;
    to: string;
  };
  structuralMetrics: {
    completionPct: number | null;
    strictAdherencePct: number | null;
  };
}

export interface SuggestedNextWorkout {
  workoutDay: {
    id: string;
    name: string;
    dayType: string;
    orderIndex: number;
  } | null;
  reason:
    | "next_in_rotation"
    | "overdue"
    | "rest_day_recommended"
    | "week_complete"
    | "no_active_engagement"
    | "empty_routine";
  lastSessionDate: string | null;
  daysSinceLastSession: number | null;
  weekProgress: {
    completed: number;
    target: number;
  };
}
