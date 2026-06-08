/**
 * Apple Health (HealthKit) integration status. The native binding is a
 * follow-up; `available` reports whether the HealthKit module is present in
 * this build so the UI can show an "unavailable in this build" state instead of
 * failing. The three metrics are the ones HealthKit actually reads and syncs to
 * the platform: weight, steps, cardio. Water is NOT a HealthKit metric — it
 * stays a manual micro-write — so it is deliberately absent here.
 */
export type HealthMetric = "weight" | "steps" | "cardio";

export const HEALTH_METRICS: readonly HealthMetric[] = ["weight", "steps", "cardio"];

export interface HealthStatus {
  /** Whether the native HealthKit module is present in this build. */
  available: boolean;
  /** Whether the user has authorized at least one metric. */
  connected: boolean;
  /** Per-metric sync enablement. */
  metrics: Record<HealthMetric, boolean>;
}
