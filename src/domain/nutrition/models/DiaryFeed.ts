/**
 * DiaryFeed — the "Diario" segment read-model (`GET /nutrition/diary-feed`): the
 * user's logged days grouped by diet phase, plus a rolling summary (averages +
 * sparkline series) and a pagination cursor. Raw, locale-neutral mirror of the API
 * `DiaryFeedPage`. Read-only.
 */
export interface DiaryDay {
  id: string;
  date: string;
  kcal: number;
  protein: number;
  adherence: number | null;
  star: boolean;
}

export interface DiaryPhase {
  id: string;
  name: string;
  state: "active" | "completed" | "paused";
  dateRange: { start: string; end: string };
  avgAdherence: number | null;
  days: DiaryDay[];
}

export interface DiarySeries {
  adherence: number[];
  kcal: number[];
  protein: number[];
}

export interface DiarySummary {
  windowDays: number;
  avgAdherence: number | null;
  avgKcal: number | null;
  avgProtein: number | null;
  series: DiarySeries;
}

export interface DiaryFeedPage {
  phases: DiaryPhase[];
  summary: DiarySummary | null;
  nextCursor: string | null;
}
