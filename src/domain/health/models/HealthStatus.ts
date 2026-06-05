/**
 * Apple Health (HealthKit) integration status. The native binding is a
 * follow-up; `available` reports whether the HealthKit module is present in
 * this build so the UI can show an "unavailable in this build" state instead of
 * failing. The three metrics mirror the app's only writes: weight, steps, water.
 */
export type HealthMetric = "weight" | "steps" | "water";

export const HEALTH_METRICS: readonly HealthMetric[] = ["weight", "steps", "water"];

export interface HealthStatus {
  /** Whether the native HealthKit module is present in this build. */
  available: boolean;
  /** Whether the user has authorized at least one metric. */
  connected: boolean;
  /** Per-metric sync enablement. */
  metrics: Record<HealthMetric, boolean>;
}
