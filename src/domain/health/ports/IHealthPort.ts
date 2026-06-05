import type { HealthMetric, HealthStatus } from "../models/HealthStatus";

/**
 * Apple Health port. Implemented today by a stub repository (`available:false`)
 * so the settings UI and DI wiring are real now; the native HealthKit binding
 * swaps in behind this interface later without touching presentation.
 */
export interface IHealthPort {
  getStatus(): Promise<HealthStatus>;
  /** Prompt the system HealthKit authorization sheet; returns the new status. */
  requestAuthorization(): Promise<HealthStatus>;
  setMetricEnabled(metric: HealthMetric, enabled: boolean): Promise<HealthStatus>;
}
