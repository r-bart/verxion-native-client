/**
 * routineDashboardFixture — the typed example payload for `RoutineDashboard`,
 * doubling as the contract proposal for `GET /training/routine-dashboard`.
 *
 * Layer-neutral (imports only the domain type) so both the infrastructure stub
 * and tests can read it. Values mirror the design handoff's `rutinas-data` /
 * `entreno-core` scenario (PPL Hipertrofia, week 3).
 *
 * TEMPORARY: the repository returns this as a stub until the platform serves the
 * endpoint. Remove (and switch the repo to `apiClient.get`) once it ships.
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
    scoreState: "ahead",
    sessionsDone: 14,
    sessionsPlanned: 36,
    volumeTotal: "32,1 t",
    volumeTrendPct: 8,
  },
  spine: [
    { dayOfWeek: "Lun", name: "Push A", focus: "Pecho y hombros", type: "push", exercisesCount: 7, setsCount: 24, estimate: "~62 min", status: "done", dayId: "push-a" },
    { dayOfWeek: "Mar", name: "Pull A", focus: "Espalda y bíceps", type: "pull", exercisesCount: 6, setsCount: 22, estimate: "~58 min", status: "done", dayId: "pull-a" },
    { dayOfWeek: "Mié", name: "Legs A", focus: "Cuádriceps y core", type: "legs", exercisesCount: 7, setsCount: 23, estimate: "~65 min", status: "now", dayId: "legs-a" },
    { dayOfWeek: "Jue", name: "Push B", focus: "Hombros y tríceps", type: "push", exercisesCount: 6, setsCount: 21, estimate: "~55 min", status: "up", dayId: "push-b" },
    { dayOfWeek: "Vie", name: "Pull B", focus: "Dorsal y trapecio", type: "pull", exercisesCount: 6, setsCount: 20, estimate: "~54 min", status: "up", dayId: "pull-b" },
    { dayOfWeek: "Sáb", name: "Legs B", focus: "Femoral y glúteo", type: "legs", exercisesCount: 7, setsCount: 24, estimate: "~66 min", status: "up", dayId: "legs-b" },
    { dayOfWeek: "Dom", name: "Descanso", focus: "Movilidad opcional · 10 min", type: "rest", exercisesCount: null, setsCount: null, estimate: null, status: "up", dayId: null },
  ],
  next: {
    kind: "workout",
    type: "legs",
    title: "Legs A",
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
