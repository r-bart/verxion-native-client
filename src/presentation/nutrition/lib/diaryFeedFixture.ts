/**
 * Typed fixtures for the "Diario" segment — the shape of
 * `GET /nutrition/diary-feed`. Populated (one phase with logged days + summary) and
 * empty variants. Back component tests.
 */
import type { DiaryFeedPage } from "@/domain/nutrition/models/DiaryFeed";

export const diaryFeedFixture: DiaryFeedPage = {
  phases: [
    {
      id: "definicion-2250",
      name: "Definición · 2.250 kcal",
      state: "active",
      dateRange: { start: "2026-05-13", end: "2026-06-07" },
      avgAdherence: 92,
      days: [
        { id: "d-0607", date: "2026-06-07", kcal: 2210, protein: 182, adherence: 96, star: true },
        { id: "d-0606", date: "2026-06-06", kcal: 2300, protein: 175, adherence: 88, star: false },
        { id: "d-0605", date: "2026-06-05", kcal: 2180, protein: 178, adherence: 93, star: false },
      ],
    },
  ],
  summary: {
    windowDays: 7,
    avgAdherence: 91,
    avgKcal: 2240,
    avgProtein: 178,
    series: {
      adherence: [88, 90, 93, 89, 96, 92, 91],
      kcal: [2300, 2180, 2210, 2260, 2210, 2250, 2240],
      protein: [175, 178, 182, 176, 182, 179, 178],
    },
  },
  nextCursor: null,
};

export const diaryFeedEmptyFixture: DiaryFeedPage = {
  phases: [],
  summary: null,
  nextCursor: null,
};
