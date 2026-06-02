export const progressKeys = {
  all: () => ["progress"] as const,
  overview: () => [...progressKeys.all(), "overview"] as const,
  bodyComp: (period: string) => [...progressKeys.all(), "body-comp", period] as const,
  exercises: () => [...progressKeys.all(), "exercises"] as const,
  exerciseDetail: (id: string) => [...progressKeys.all(), "exercise-detail", id] as const,
  records: () => [...progressKeys.all(), "records"] as const,
  timeline: (months: number) => [...progressKeys.all(), "timeline", months] as const,
  weeks: () => [...progressKeys.all(), "weeks"] as const,
  weekDetail: (date: string) => [...progressKeys.all(), "week-detail", date] as const,
  months: () => [...progressKeys.all(), "months"] as const,
  monthDetail: (period: string) => [...progressKeys.all(), "month-detail", period] as const,
  sessionReport: (id: string) => [...progressKeys.all(), "session-report", id] as const,
};
