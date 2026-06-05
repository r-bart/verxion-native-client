/**
 * routineLibraryFixture — the typed example payload for `RoutineLibrary`, doubling
 * as the contract proposal for `GET /training/routine-library`. Layer-neutral
 * (imports only the domain type) so both the infrastructure stub and tests can
 * read it. Mirrors the handoff's `rutinas-data` catalog: one active block plus a
 * two-routine archive.
 *
 * TEMPORARY: served by the repository stub until the endpoint ships.
 */
import type { RoutineLibrary } from "../models/RoutineLibrary";

export const routineLibraryFixture: RoutineLibrary = {
  routines: [
    {
      id: "ppl-hipertrofia",
      name: "PPL Hipertrofia",
      state: "active",
      goal: "Hipertrofia",
      split: "Push · Pull · Legs",
      perWeek: 6,
      type: "push",
      week: 3,
      weeks: 6,
      weekFraction: 3 / 7,
      scoreState: "ahead",
      sessionsDone: 14,
      sessionsPlanned: 36,
      volumeTrendPct: 8,
      finishedLabel: null,
    },
    {
      id: "ppl-base",
      name: "PPL base",
      state: "completed",
      goal: "Hipertrofia",
      split: "Push · Pull · Legs",
      perWeek: 6,
      type: "push",
      week: 8,
      weeks: 8,
      weekFraction: null,
      scoreState: "ahead",
      sessionsDone: 44,
      sessionsPlanned: 48,
      volumeTrendPct: 12,
      finishedLabel: "1 mar 2026",
    },
    {
      id: "iniciacion-fullbody",
      name: "Iniciación full-body",
      state: "completed",
      goal: "Adaptación",
      split: "Full body",
      perWeek: 3,
      type: "push",
      week: 4,
      weeks: 4,
      weekFraction: null,
      scoreState: "ahead",
      sessionsDone: 11,
      sessionsPlanned: 12,
      volumeTrendPct: 6,
      finishedLabel: "30 dic 2025",
    },
  ],
  facets: {
    states: ["active", "completed"],
    goals: ["Hipertrofia", "Adaptación"],
  },
};
