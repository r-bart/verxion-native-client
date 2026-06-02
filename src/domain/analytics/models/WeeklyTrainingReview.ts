export interface ReviewDay {
  date: string;
  dayOfWeek: string;
  status: "completed" | "missed" | "rest" | "upcoming";
  planned: {
    workoutDayName: string;
    dayType: string;
  } | null;
  completed: {
    sessionId: string;
    durationSeconds: number | null;
  } | null;
}

export interface WeeklyTrainingReview {
  weekOf: string;
  through: string;
  isPartialWeek: boolean;
  hasActiveRoutine: boolean;
  summary: {
    daysPlanned: number;
    daysCompleted: number;
    completionRate: number;
  };
  days: ReviewDay[];
}
