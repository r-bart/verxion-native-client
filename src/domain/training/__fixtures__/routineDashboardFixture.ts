/**
 * routineDashboardFixture — the typed example payload for `RoutineDashboard`,
 * doubling as the contract proposal for `GET /training/routine-dashboard`.
 *
 * Layer-neutral (imports only the domain type) so both the infrastructure stub
 * and tests can read it. Values mirror the design handoff's `rutinas-data` /
 * `entreno-core` scenario (PPL Hipertrofia, week 3).
 *
 * TEMPORARY: kept as the example payload for tests. The repository now reads the
 * live `GET /api/v1/training/routine-dashboard`; this mirrors the contract shape
 * (raw values, `DayKind` taxonomy) and can be deleted once tests stop importing it.
 */
import type { RoutineDashboard } from "../models/RoutineDashboard";

export const routineDashboardFixture: RoutineDashboard = {
  state: "active",
  activeRoutine: {
    id: "ppl-hipertrofia",
    name: "PPL Hipertrofia",
    goal: "Hipertrofia",
    split: "Push · Pull · Legs",
    week: 3,
    weeks: 6,
    weekFraction: 3 / 7,
    mesocycle: {
      id: "meso-acumulacion",
      name: "Acumulación",
      goal: "Volumen",
      orderIndex: 0,
      totalBlocks: 3,
      isLastWeek: false,
      isLastBlock: false,
    },
    sessionsDone: 14,
    sessionsPlanned: 36,
    volume: { value: 32.1, unit: "t" },
    volumeTrendPct: 8,
  },
  spine: [
    { orderIndex: 0, name: "Push A", focus: "Pecho y hombros", type: "workout", exercisesCount: 7, setsCount: 24, estimateMin: 62, status: "done", dayId: "push-a" },
    { orderIndex: 1, name: "Pull A", focus: "Espalda y bíceps", type: "workout", exercisesCount: 6, setsCount: 22, estimateMin: 58, status: "done", dayId: "pull-a" },
    { orderIndex: 2, name: "Legs A", focus: "Cuádriceps y core", type: "workout", exercisesCount: 7, setsCount: 23, estimateMin: 65, status: "now", dayId: "legs-a" },
    { orderIndex: 3, name: "Push B", focus: "Hombros y tríceps", type: "workout", exercisesCount: 6, setsCount: 21, estimateMin: 55, status: "up", dayId: "push-b" },
    { orderIndex: 4, name: "Pull B", focus: "Dorsal y trapecio", type: "workout", exercisesCount: 6, setsCount: 20, estimateMin: 54, status: "up", dayId: "pull-b" },
    { orderIndex: 5, name: "Legs B", focus: "Femoral y glúteo", type: "workout", exercisesCount: 7, setsCount: 24, estimateMin: 66, status: "up", dayId: "legs-b" },
    { orderIndex: 6, name: "Descanso", focus: "Movilidad opcional · 10 min", type: "rest", exercisesCount: 0, setsCount: 0, estimateMin: null, status: "up", dayId: "rest-dom" },
  ],
  next: {
    kind: "workout",
    type: "workout",
    name: "Legs A",
    focus: "Cuádriceps y core",
    exercisesCount: 7,
    setsCount: 23,
    estimatedMin: 65,
    dayId: "legs-a",
  },
  liveSession: null,
  agentNote:
    "Semana 3: tu volumen subió un 8 %. Hoy toca Legs A — mantén la sentadilla en 4×8 y busca PR el sábado.",
};
