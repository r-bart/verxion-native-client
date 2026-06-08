/**
 * SessionDetailView — the "Detalle de sesión" aggregate (`sesiones/[id]`): the
 * persisted report of a completed workout, reopened from the Sesiones feed. The
 * read-only twin of the close-out report — hero, 6 KPI tiles, the agent recap,
 * the real per-set breakdown by exercise, the user's rating, the close-out note,
 * and the muscle-group split. Correcting a record is a request to the agent,
 * never a hand edit.
 *
 * **Raw / locale-neutral shape.** The infrastructure mapper (`sessionDetailMapper`)
 * builds it structurally from the live `GET /api/v1/sessions/{id}/detail`
 * (`WorkoutSessionDetail`); presentation formats the numbers/date per locale
 * (`presentation/training/lib/sessionFormat`). PR flags are not yet exposed by the
 * read-model (see `docs/training-session-detail-spec.md` §7) — dropped for now.
 */
import type { DayKind, MesocycleIdentity } from "./RoutineDashboard";

export interface SessionSet {
  weight: number; // kg, as logged
  reps: number;
}

/** What the plan prescribed for an exercise (e.g. 4 × "6-8" · RIR 2). */
export interface SessionPrescription {
  sets: number | null;
  reps: string | null; // free text, e.g. "6-8"
  rir: number | null;
}

export interface SessionExerciseItem {
  exerciseId: string; // slug → ejercicio/[id]
  name: string;
  muscle: string;
  equipment: string;
  prescription: SessionPrescription | null;
  sets: SessionSet[]; // the real sets logged
}

export interface SessionTiles {
  volumeKg: number; // total tonnage in kg (UI renders tonnes)
  durationSec: number; // session duration in seconds (UI renders minutes)
  series: number;
  reps: number;
  peakKg: number | null; // heaviest set, kg
  avgRir: number | null;
}

export interface SessionAssessment {
  effort: number; // 1–10
  quality: number;
  pump: number;
}

export interface SessionMuscleShare {
  name: string; // broad group, e.g. "Cuádriceps"
  volumeKg: number; // group tonnage in kg
  pct: number; // 0..100, drives the bar
}

/**
 * The periodization block the session was executed in — FROZEN at execution from
 * the session's `mesocycle_id` + `microcycle_week`, not the live resolver. null
 * when the session had no block (flat routine, or a non-`date_range` routine —
 * only `date_range` routines are periodized). Drives the "Acumulación · Sem 4/4"
 * chip. Extends {@link MesocycleIdentity} with the FROZEN week the session sat in.
 */
export interface SessionMesocycle extends MesocycleIdentity {
  week: number; // 1-based microcycle the session belonged to
  weeks: number; // block durationWeeks
}

export interface SessionDetailHeader {
  id: string;
  name: string; // "Legs B"
  completedAt: string | null; // raw ISO; the UI localizes the date
  type: DayKind | null; // platform day taxonomy; null when unclassified
  routineName: string; // "PPL Hipertrofia" (empty when the session has no routine)
  mesocycle: SessionMesocycle | null; // frozen block context; null when not periodized
  completionPct: number; // 0..100
  perfectPlan: boolean; // completionPct === 100 → "Plan perfecto"
}

export interface SessionDetailView {
  header: SessionDetailHeader;
  recap: string; // the agent's persisted report summary
  tiles: SessionTiles;
  exercises: SessionExerciseItem[];
  assessment: SessionAssessment | null; // the user's 1–10 rating at close-out
  note: string | null; // the user's close-out note
  muscles: SessionMuscleShare[]; // top muscle groups by volume
}
