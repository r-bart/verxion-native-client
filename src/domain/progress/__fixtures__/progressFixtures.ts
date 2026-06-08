/**
 * progressFixtures — typed example payloads for the 4 curated `/api/v1/progress`
 * read-models, doubling as the test payloads and UI-first dev data. Layer-neutral
 * (imports only domain types). Seeded from the design handoff's frozen calendar:
 * **hoy = Mar 2 jun 2026**, with the canonical anchors peso 82,4 · volumen 32,1 ·
 * adherencia 92 (see `docs/progreso/handoff_progreso/`). Numbers are illustrative;
 * the API owns the real shape. Mirrors the proto's `progreso-series.jsx` / `H_*`.
 */
import type {
  ProgressOverview,
  ProgressHistory,
  ProgressMeasureDetail,
  ProgressExerciseDetail,
  ProgressMetric,
  MetricKey,
} from "../models/Progress";

/** Smooth deterministic series of `n` points trending from `from` → `to`. */
function ramp(from: number, to: number, n: number, dec = 1): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 1 : i / (n - 1);
    // ease + small deterministic wobble so curves don't look synthetic
    const wobble = Math.sin(i * 1.3) * (Math.abs(to - from) * 0.04);
    const v = from + (to - from) * t + wobble;
    out.push(Number(v.toFixed(dec)));
  }
  return out;
}

function metric(
  key: MetricKey,
  series: number[],
  opts: { unit: string; dec: number; goodDown: boolean; goal: number | null },
): ProgressMetric {
  const now = series[series.length - 1] ?? null;
  const first = series[0] ?? null;
  return {
    key,
    now,
    first,
    delta: now != null && first != null ? Number((now - first).toFixed(opts.dec)) : null,
    min: Math.min(...series),
    max: Math.max(...series),
    unit: opts.unit,
    dec: opts.dec,
    goodDown: opts.goodDown,
    goal: opts.goal,
    spark: series,
  };
}

const pesoSpark = ramp(83.6, 82.4, 12);
const cinturaSpark = ramp(84.0, 81.5, 12);
const caderaSpark = ramp(99.7, 98.5, 12);
const brazoSpark = ramp(38.8, 39.2, 12);
const proteinaSpark = ramp(172, 181, 12, 0);
const pasosSpark = ramp(7600, 8214, 12, 0);
const cardioSpark = ramp(75, 95, 12, 0);

export const progressOverviewFixture: ProgressOverview = {
  period: "mes",
  metrics: [
    metric("peso", pesoSpark, { unit: "kg", dec: 1, goodDown: true, goal: 79 }),
    metric("cintura", cinturaSpark, { unit: "cm", dec: 1, goodDown: true, goal: null }),
    metric("cadera", caderaSpark, { unit: "cm", dec: 1, goodDown: true, goal: null }),
    metric("brazo", brazoSpark, { unit: "cm", dec: 1, goodDown: false, goal: null }),
    metric("proteina", proteinaSpark, { unit: "g", dec: 0, goodDown: false, goal: 180 }),
    metric("pasos", pasosSpark, { unit: "", dec: 0, goodDown: false, goal: 10000 }),
    metric("cardio", cardioSpark, { unit: "min", dec: 0, goodDown: false, goal: null }),
  ],
  strengthPr: {
    exerciseName: "Press banca",
    slug: "press-banca",
    bestWeightKg: 82.5,
    reps: 8,
    achievedAt: "2026-05-31",
    deltaKg: 2.5,
  },
  setup: { routine: "active", dietPlan: "active", program: "active" },
  dataState: "full",
};

const HISTORY_WEEKS = 30;

export const progressHistoryFixture: ProgressHistory = {
  weeks: HISTORY_WEEKS,
  series: [
    {
      key: "peso",
      unit: "kg",
      goodDown: true,
      points: ramp(80.2, 82.4, HISTORY_WEEKS).map((value, week) => ({ week, value })),
    },
    {
      key: "volumen",
      unit: "t",
      goodDown: false,
      points: ramp(22.0, 32.1, HISTORY_WEEKS).map((value, week) => ({ week, value })),
    },
    {
      key: "adherencia",
      unit: "%",
      goodDown: false,
      points: ramp(84, 92, HISTORY_WEEKS, 0).map((value, week) => ({ week, value })),
    },
  ],
  bands: [
    {
      label: "Volumen",
      name: "Fuerza de invierno",
      why: "Construir base de músculo y fuerza antes de definir.",
      kind: "program",
      fromWeek: 0,
      toWeek: 18,
      isMajor: false,
    },
    {
      label: "Definición",
      name: "Verano ligero y fuerte",
      why: "Bajar grasa sin ceder la fuerza ganada.",
      kind: "program",
      fromWeek: 18,
      toWeek: 29,
      isMajor: true,
    },
  ],
  prMarks: [
    { week: 8, exerciseName: "Sentadilla", slug: "sentadilla", bestWeightKg: 130, reps: 5 },
    { week: 22, exerciseName: "Dominadas lastradas", slug: "dominadas-lastradas", bestWeightKg: 20, reps: 7 },
    { week: 28, exerciseName: "Sentadilla", slug: "sentadilla", bestWeightKg: 140, reps: 6 },
    { week: 29, exerciseName: "Press banca", slug: "press-banca", bestWeightKg: 82.5, reps: 8 },
  ],
  dataState: "full",
};

const pesoChart = ramp(83.6, 82.4, 30);
const pesoRecords = ramp(83.6, 82.4, 8).reverse();

export const progressMeasureDetailFixture: ProgressMeasureDetail = {
  metric: "peso",
  unit: "kg",
  dec: 1,
  goodDown: true,
  goal: 79,
  period: "mes",
  window: metric("peso", pesoChart, { unit: "kg", dec: 1, goodDown: true, goal: 79 }),
  chart: pesoChart.map((value, i) => ({
    date: `2026-05-${String((i % 28) + 1).padStart(2, "0")}`,
    value,
  })),
  records: pesoRecords.map((value, i) => ({
    date: i === 0 ? "2026-06-02" : `2026-05-${String(28 - i * 7).padStart(2, "0")}`,
    value,
    deltaPrev: i === pesoRecords.length - 1 ? null : Number((value - pesoRecords[i + 1]).toFixed(1)),
  })),
};

const e1rmCurve = ramp(96, 104, 8, 0);

export const progressExerciseDetailFixture: ProgressExerciseDetail = {
  id: "ex_press_banca",
  slug: "press-banca",
  name: "Press banca",
  part: "push",
  category: "Compuesto · Pecho",
  metric: "e1rm",
  kpis: { prWeightKg: 82.5, e1rmKg: 104, bestVolumeT: 3.6, logs: 18 },
  curve: e1rmCurve.map((value, i) => ({
    session: i + 1,
    value,
    date: `2026-0${i < 4 ? 4 : 5}-${String(((i * 6) % 28) + 1).padStart(2, "0")}`,
  })),
  e1rmDelta: 8,
  volDelta: 0.6,
  history: [
    { date: "2026-05-31", topSetWeightKg: 82.5, topSetReps: 8, isPr: true, meta: "RIR 2 · vol 3,6", value: 104, deltaPct: 2.0 },
    { date: "2026-05-24", topSetWeightKg: 80, topSetReps: 7, isPr: false, meta: "RIR 2 · vol 3,5", value: 102, deltaPct: 3.0 },
    { date: "2026-05-17", topSetWeightKg: 77.5, topSetReps: 8, isPr: false, meta: "RIR 1 · vol 3,3", value: 99, deltaPct: null },
  ],
  muscles: [
    { name: "Pecho", role: "Principal", pct: 60 },
    { name: "Tríceps", role: "Secundario", pct: 25 },
    { name: "Hombro anterior", role: "Estabilizador", pct: 15 },
  ],
  empty: false,
};
