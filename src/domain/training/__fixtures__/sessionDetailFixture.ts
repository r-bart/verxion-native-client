/**
 * sessionDetailFixture — typed example payloads for `SessionDetailView`, keyed by
 * session id. Layer-neutral, RAW (locale-neutral) — matches the domain model the
 * mapper produces. The repository now reads the live
 * `GET /api/v1/sessions/{id}/detail` (mapped by `sessionDetailMapper`); these
 * fixtures remain only as realistic test data for the screen/component tests.
 *
 * Faithful to the handoff (`sesiones-data`): the per-set breakdown is SYNTHESIZED
 * from the day's plan (the day-detail fixture, keyed by the same day ids), so the
 * report squares with what the routine prescribed.
 */
import type { DayKind } from "../models/RoutineDashboard";
import type {
  SessionDetailView,
  SessionExerciseItem,
  SessionMuscleShare,
  SessionSet,
} from "../models/SessionDetailView";
import { dayDetailFixtures } from "./dayDetailFixture";

// ── load parsers (ported from the handoff's `sesiones-data`) ───────────────────
function round25(w: number): number {
  return Math.round(w / 2.5) * 2.5;
}
type Load =
  | { kind: "kg"; w: number }
  | { kind: "time"; label: string }
  | { kind: "other"; label: string };
function parseW(t: string): Load {
  const m = t.match(/([+]?)([\d.,]+)\s*kg/i);
  if (m) return { kind: "kg", w: parseFloat(m[2].replace(",", ".")) };
  if (/^\d+\s*s$/.test(t.trim())) return { kind: "time", label: t.trim() };
  return { kind: "other", label: t };
}
function parseReps(r: string): [number, number] {
  const range = r.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (range) return [+range[1], +range[2]];
  const single = r.match(/(\d+)/);
  return single ? [+single[1], +single[1]] : [8, 8];
}

// muscle (from the plan) → broad group (for the muscle split)
const MUSC_GROUP: Record<string, string> = {
  Pecho: "Pecho",
  "Pecho sup.": "Pecho",
  "Pecho inf.": "Pecho",
  Hombro: "Hombros",
  Deltoides: "Hombros",
  "Deltoides post.": "Hombros",
  Tríceps: "Tríceps",
  Bíceps: "Bíceps",
  Braquial: "Bíceps",
  Dorsal: "Espalda",
  Espalda: "Espalda",
  Cuádriceps: "Cuádriceps",
  Femoral: "Femoral",
  Glúteo: "Glúteo",
  Gemelo: "Gemelo",
  Core: "Core",
};

type SessionSpec = {
  id: string;
  name: string;
  completedAt: string; // ISO
  type: DayKind;
  plan: string; // day-detail fixture key
  durMin: number;
  rir: number;
  completion: number;
  scores: { effort: number; quality: number; pump: number };
  note: string;
  recap: string;
};

const ROUTINE_NAME = "PPL Hipertrofia";

// The six newest sessions of the active block (week 3, may). Loads are at plan
// scale (1×) — these are the current week, so no historical scaling.
const SPECS: SessionSpec[] = [
  {
    id: "legs-b-31may",
    name: "Legs B",
    completedAt: "2026-05-31T18:30:00.000Z",
    type: "workout",
    plan: "legs-b",
    durMin: 66,
    rir: 2.0,
    completion: 100,
    scores: { effort: 9, quality: 8, pump: 9 },
    note: "Femoral con buena conexión. La última de RDL se fue un poco de RIR pero limpia.",
    recap:
      "Sesión sólida: +4 % de volumen y PR de carga en RDL a 125 kg. El femoral aguantó bien el doble estímulo del día. Mantenemos cargas y subimos reps la semana que viene.",
  },
  {
    id: "pull-b-30may",
    name: "Pull B",
    completedAt: "2026-05-30T18:30:00.000Z",
    type: "workout",
    plan: "pull-b",
    durMin: 54,
    rir: 1.8,
    completion: 100,
    scores: { effort: 8, quality: 7, pump: 8 },
    note: "Algo cansado del día de pierna. El remo costó más de lo normal.",
    recap:
      "Bajó un 2 % el volumen — esperable tras Legs B del día anterior. Técnica de remo correcta; nada que ajustar. Descansa bien antes del sábado.",
  },
  {
    id: "push-b-29may",
    name: "Push B",
    completedAt: "2026-05-29T18:30:00.000Z",
    type: "workout",
    plan: "push-b",
    durMin: 55,
    rir: 2.1,
    completion: 100,
    scores: { effort: 8, quality: 9, pump: 8 },
    note: "Press militar muy fino hoy, subió fácil.",
    recap:
      "Gran día de empuje vertical: PR en press militar a 57,5 kg y +6 % de volumen. La técnica de hombro fue de las mejores del bloque. Vamos por buen camino.",
  },
  {
    id: "legs-a-28may",
    name: "Legs A",
    completedAt: "2026-05-28T18:30:00.000Z",
    type: "workout",
    plan: "legs-a",
    durMin: 64,
    rir: 2.0,
    completion: 100,
    scores: { effort: 9, quality: 8, pump: 7 },
    note: "Sentadilla pesada, rodillas bien. Hip thrust con buena activación.",
    recap:
      "Día clave cumplido: sentadilla a 140 kg estable y +3 % de volumen general. RIR controlado en los básicos. El glúteo respondió bien al hip thrust.",
  },
  {
    id: "pull-a-27may",
    name: "Pull A",
    completedAt: "2026-05-27T18:30:00.000Z",
    type: "workout",
    plan: "pull-a",
    durMin: 57,
    rir: 2.0,
    completion: 100,
    scores: { effort: 7, quality: 8, pump: 8 },
    note: "Dominadas con lastre cómodas. Buen bombeo de dorsal.",
    recap:
      "Tirón consistente, +1 % de volumen. La dominada lastrada se ve madura: pronto subimos lastre. Espalda con buen control escapular.",
  },
  {
    id: "push-a-26may",
    name: "Push A",
    completedAt: "2026-05-26T18:30:00.000Z",
    type: "workout",
    plan: "push-a",
    durMin: 58,
    rir: 2.2,
    completion: 100,
    scores: { effort: 8, quality: 9, pump: 9 },
    note: "El mejor press banca en semanas. Hombro sin molestias.",
    recap:
      "Arranque de semana inmejorable: 2 PRs (press banca 82,5 kg y press militar) y +8 % de volumen. La calidad técnica fue altísima. Así se empieza un bloque.",
  },
];

function build(spec: SessionSpec): SessionDetailView {
  const plan = dayDetailFixtures[spec.plan];
  const exercises: SessionExerciseItem[] = [];
  let volKg = 0;
  let series = 0;
  let reps = 0;
  let peak = 0;
  const muscleVol: Record<string, number> = {};

  plan.exercises.forEach((ex) => {
    const load = parseW(ex.target);
    const [lo, hi] = parseReps(ex.repRange);
    const sets: SessionSet[] = [];
    let exVol = 0;

    for (let s = 0; s < ex.sets; s++) {
      const rp = Math.max(lo, hi - s); // reps drift down a touch per set
      series += 1;
      reps += rp;
      if (load.kind === "kg") {
        const w = round25(load.w);
        volKg += w * rp;
        exVol += w * rp;
        if (w > peak) peak = w;
        sets.push({ weight: w, reps: rp });
      } else {
        // time/other loads (planks, carries): no kg — recorded as bodyweight.
        sets.push({ weight: 0, reps: rp });
      }
    }

    const group = MUSC_GROUP[ex.muscle] ?? ex.muscle;
    muscleVol[group] = (muscleVol[group] ?? 0) + exVol;
    exercises.push({
      exerciseId: ex.exerciseId,
      name: ex.name,
      muscle: ex.muscle,
      equipment: ex.equipment,
      prescription: { sets: ex.sets, reps: ex.repRange, rir: ex.rir },
      sets,
    });
  });

  const total = Object.values(muscleVol).reduce((a, b) => a + b, 0) || 1;
  const muscles: SessionMuscleShare[] = Object.entries(muscleVol)
    .map(([name, v]) => ({ name, volumeKg: v, pct: Math.round((v / total) * 100) }))
    .sort((a, b) => b.volumeKg - a.volumeKg)
    .slice(0, 4);

  return {
    header: {
      id: spec.id,
      name: spec.name,
      completedAt: spec.completedAt,
      type: spec.type,
      routineName: ROUTINE_NAME,
      completionPct: spec.completion,
      perfectPlan: spec.completion === 100,
    },
    recap: spec.recap,
    tiles: {
      volumeKg: volKg,
      durationSec: spec.durMin * 60,
      series,
      reps,
      peakKg: peak,
      avgRir: spec.rir,
    },
    exercises,
    assessment: spec.scores,
    note: spec.note || null,
    muscles,
  };
}

export const sessionDetailFixtures: Record<string, SessionDetailView> =
  Object.fromEntries(SPECS.map((s) => [s.id, build(s)]));

/** Stub resolver: the report for `id`, falling back to the newest session. */
export function sessionDetailFixtureFor(id: string): SessionDetailView {
  return sessionDetailFixtures[id] ?? sessionDetailFixtures["legs-b-31may"];
}
