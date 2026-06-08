/**
 * sessionDetailMapper — maps the platform's raw `WorkoutSessionDetail` read-model
 * (`GET /api/v1/sessions/{id}/detail`) into the domain `SessionDetailView`. This
 * is a STRUCTURAL map only (reshape, pick, sort, top-N); it carries raw numbers
 * and the ISO date straight through. Locale/display formatting is the
 * presentation layer's job (`presentation/training/lib/sessionFormat`).
 *
 * The DTO below is hand-written to mirror the staging contract (the native
 * `api-types` codegen hasn't been regenerated against the enriched schema yet —
 * swap to the generated type once it is). PR flags are intentionally absent: the
 * read-model does not expose them yet (`docs/training-session-detail-spec.md` §7).
 */
import type {
  SessionAssessment,
  SessionDetailView,
  SessionExerciseItem,
  SessionMesocycle,
  SessionMuscleShare,
} from "@/domain/training/models/SessionDetailView";
import type { DayKind } from "@/domain/training/models/RoutineDashboard";

// ── raw contract DTO (subset the screen consumes) ──────────────────────────────
export interface WorkoutSessionDetailDTO {
  session: {
    id: string;
    name: string;
    status: string;
    sessionType: string;
    dayType: DayKind | null;
    startedAt: string | null;
    completedAt: string | null;
    durationSeconds: number | null;
    notes: string | null;
    routine: { id: string; name: string } | null;
    // Frozen periodization block (`workoutSessionDetailSchema.session.mesocycle`);
    // null when the session had no block. 1-based `week`.
    mesocycle: {
      id: string;
      name: string;
      goal: string | null;
      orderIndex: number;
      totalBlocks: number;
      week: number;
      weeks: number;
    } | null;
  };
  assessment: {
    pre: Record<string, number | string | null>;
    post: {
      overallFeeling: number | null;
      effortScore: number | null;
      pump: number | null;
      qualityScore: number | null;
      standardizationScore: number | null;
      commitmentLevel: number | null;
      notes: string | null;
    };
  };
  summary: WorkoutSessionSummaryDTO | null;
}

interface WorkoutSessionSummaryDTO {
  totalVolume: number; // kg
  totalSets: number;
  totalReps: number;
  totalDurationSeconds: number;
  averageRir: number | null;
  peakWeight: number | null; // kg
  completionRate: number; // 0..1
  exerciseCompletionRate: number; // 0..1
  summaryGeneratedAt: string;
  recap: string | null;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    muscle: string;
    equipment: string;
    prescription: { sets: number | null; reps: string | null; rir: number | null } | null;
    sets: { setNumber: number; weight: number; reps: number; rir: number | null; volume: number; isWarmup: boolean }[];
  }[];
  muscleGroupDistribution: Record<string, { volume: number; percentage: number; exercises: number }>;
}

export function mapSessionDetail(dto: WorkoutSessionDetailDTO): SessionDetailView {
  const { session, assessment, summary } = dto;
  const post = assessment.post;

  // `exerciseCompletionRate` is a 0..1 rate (per the contract field name); the UI
  // shows a 0..100 percent. `muscleGroupDistribution.percentage` is already 0..100.
  const completionPct = summary ? Math.round(summary.exerciseCompletionRate * 100) : 0;

  const exercises: SessionExerciseItem[] = (summary?.exercises ?? []).map((ex) => ({
    exerciseId: ex.exerciseId,
    name: ex.exerciseName,
    muscle: ex.muscle,
    equipment: ex.equipment,
    prescription: ex.prescription,
    // Show every logged set, warm-ups included (faithful to what was recorded).
    sets: ex.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
  }));

  const muscles: SessionMuscleShare[] = Object.entries(summary?.muscleGroupDistribution ?? {})
    .map(([name, m]) => ({ name, volumeKg: m.volume, pct: Math.round(m.percentage) }))
    .sort((a, b) => b.volumeKg - a.volumeKg)
    .slice(0, 4);

  // Build the frozen block explicitly (don't pass the raw DTO sub-object through):
  // the inline DTO type and the domain `SessionMesocycle` are separate decls, so an
  // explicit field-by-field map is what keeps them honest if either shape drifts.
  const m = session.mesocycle;
  const mesocycle: SessionMesocycle | null = m
    ? {
        id: m.id,
        name: m.name,
        goal: m.goal,
        orderIndex: m.orderIndex,
        totalBlocks: m.totalBlocks,
        week: m.week,
        weeks: m.weeks,
      }
    : null;

  const hasAssessment = post.effortScore != null || post.qualityScore != null || post.pump != null;
  const assessmentView: SessionAssessment | null = hasAssessment
    ? { effort: post.effortScore ?? 0, quality: post.qualityScore ?? 0, pump: post.pump ?? 0 }
    : null;

  return {
    header: {
      id: session.id,
      name: session.name,
      completedAt: session.completedAt,
      type: session.dayType,
      routineName: session.routine?.name ?? "",
      mesocycle,
      completionPct,
      perfectPlan: completionPct === 100,
    },
    recap: summary?.recap ?? "",
    tiles: {
      volumeKg: summary?.totalVolume ?? 0,
      durationSec: summary?.totalDurationSeconds ?? 0,
      series: summary?.totalSets ?? 0,
      reps: summary?.totalReps ?? 0,
      peakKg: summary?.peakWeight ?? null,
      avgRir: summary?.averageRir ?? null,
    },
    exercises,
    assessment: assessmentView,
    note: post.notes ?? session.notes ?? null,
    muscles,
  };
}
