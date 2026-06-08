import type { HealthMetric, HealthStatus } from "../models/HealthStatus";
import type {
  HealthChangeSet,
  WeightSample,
  CardioSample,
  StepsDailyAggregate,
} from "../models/HealthSync";

/**
 * Apple Health port. Implemented today by a stub repository (`available:false`)
 * so the settings UI and DI wiring are real now; the native HealthKit binding
 * swaps in behind this interface later without touching presentation.
 *
 * Two reading shapes (spec §0.5): weight/cardio are anchored deltas (with
 * deletions); steps is a windowed daily recompute (no anchor, no deletions).
 */
export interface IHealthPort {
  getStatus(): Promise<HealthStatus>;
  /** Prompt the system HealthKit authorization sheet; returns the new status. */
  requestAuthorization(): Promise<HealthStatus>;
  setMetricEnabled(metric: HealthMetric, enabled: boolean): Promise<HealthStatus>;

  // ── Sync reads (native HealthKit; stubbed until the binding lands) ──────────
  /** Anchored weight delta via HKAnchoredObjectQuery. `null` anchor = full read. */
  pullWeightChanges(anchor: string | null): Promise<HealthChangeSet<WeightSample>>;
  /** Anchored cardio delta via HKAnchoredObjectQuery. */
  pullCardioChanges(anchor: string | null): Promise<HealthChangeSet<CardioSample>>;
  /** De-duplicated daily steps from `fromDate` via HKStatisticsCollectionQuery. */
  recomputeDailySteps(fromDate: string): Promise<StepsDailyAggregate[]>;
}
