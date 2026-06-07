/**
 * ProgramAdherence — the unified adherence read-model behind the detail screen's
 * ring + sub-bars. Transcribed from the platform domain type
 * (`packages/domain/src/program/Types.ts`). The training/diet blocks are nullable
 * (a program may couple only one), and `programContext`/`overallInterpretation`
 * are optional — the platform computes them but may not expose them yet
 * (`docs/program-screen-spec.md` §7.3); the UI degrades when absent.
 */

export type AdherencePhase = "cold_start" | "baseline_building" | "active_tracking";
export type AdherenceConfidence = "none" | "low" | "medium" | "high";
export type AdherenceDomain = "training" | "nutrition";

/** Structural execution breakdown (units planned vs done). Server-computed. */
export interface ProgramExecutionBreakdown {
  plannedUnitsTotal: number;
  exactUnitsCompleted: number;
  substitutedUnitsCompleted: number;
  missedUnits: number;
  addedUnits: number;
  completionPct: number | null;
  strictAdherencePct: number | null;
  addedSharePct: number | null;
  executionScore: number | null;
}

/** Training half of the unified adherence. Null when no routine is coupled. */
export interface ProgramTrainingAdherence {
  available: boolean;
  sessionsCompleted: number;
  sessionsExpected: number;
  adherencePercent: number;
  executionScore: number | null;
  executionBreakdown: ProgramExecutionBreakdown | null;
}

/** Diet half of the unified adherence. Null when no diet is coupled. */
export interface ProgramDietAdherence {
  available: boolean;
  daysTracked: number;
  daysExpected: number;
  adherencePercent: number;
  avgCalorieAdherence: number;
  executionScore: number | null;
  executionBreakdown: ProgramExecutionBreakdown | null;
  executionClassificationDistribution: {
    PERFECT_PLAN: number;
    PLAN_WITH_SUBSTITUTIONS: number;
    PLAN_PLUS_EXTRAS: number;
    PARTIAL_PLAN: number;
    OFF_PLAN: number;
  } | null;
}

export interface ProgramAdherence {
  programId: string;
  programName: string;
  dateRange: { from: string | null; to: string | null };
  /** Tracking maturity context. Optional until the platform exposes it (§7.3). */
  programContext?: {
    programStartDate: string | null;
    programAgeDays: number | null;
    effectiveWindowStart: string;
    effectiveWindowEnd: string;
    phase: AdherencePhase;
  };
  training: ProgramTrainingAdherence | null;
  diet: ProgramDietAdherence | null;
  overallAdherencePercent: number;
  /** The ring value (e.g. 84). Null in cold-start. */
  unifiedExecutionScore: number | null;
  isPartial: boolean;
  availableDomains: AdherenceDomain[];
  confidence: AdherenceConfidence;
  /** Provisional one-liner. Optional until the platform exposes it (§7.3). */
  overallInterpretation?: {
    isProvisional: boolean;
    summary: string;
  };
}
