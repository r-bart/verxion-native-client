/**
 * Apple Health sync contracts. HealthKit feeds three metrics into the platform,
 * in TWO structurally distinct shapes (see docs/health-sync-endpoints-spec.md §0.5):
 *   - weight & cardio: UUID-keyed events (dedup by `externalId`, with deletions)
 *   - steps: a date-keyed daily aggregate (dedup by date, no explicit deletions)
 *
 * The native client always syncs as the `apple_health` source; the value is
 * baked into the HTTP repository, so it is not part of these models.
 */

/** HealthKit `HKWorkoutActivityType` mapped down to the platform's 8 cardio kinds. */
export type CardioActivityType =
  | "run"
  | "bike"
  | "swim"
  | "row"
  | "elliptical"
  | "walk"
  | "hike"
  | "other";

/** Anchored metrics — read via a per-type HealthKit anchor cursor. Steps is NOT here (it is windowed/recomputed). */
export type SyncMetric = "weight" | "cardio";

/** UUID-keyed weight sample. `externalId` = `HKQuantitySample.uuid`. */
export interface WeightSample {
  externalId: string;
  /** Normalized to kg with a FIXED HKUnit on the client (spec §3 footgun). */
  weightKg: number;
  loggedAt: string; // ISO-8601
}

/** UUID-keyed cardio workout. `externalId` = `HKWorkout.uuid`. */
export interface CardioSample {
  externalId: string;
  activityType: CardioActivityType;
  durationMinutes: number;
  loggedDate: string; // YYYY-MM-DD (device-local)
  distanceKm?: number | null;
  caloriesBurned?: number | null;
  /** Nullable best-effort — not a workout property; resolved via statistics(for:) (spec §4). */
  avgHeartRate?: number | null;
  maxHeartRate?: number | null;
}

/** Date-keyed daily steps aggregate. No UUID — identity is (profile, loggedDate). */
export interface StepsDailyAggregate {
  loggedDate: string; // YYYY-MM-DD (device-local)
  /** De-duplicated total via HKStatisticsCollectionQuery `.cumulativeSum` — NOT a sum of samples. */
  totalSteps: number;
  distanceKm?: number;
  caloriesBurned?: number;
  activeMinutes?: number;
  confidenceScore?: number; // 0..1
}

/** Delta returned by an anchored device read (weight/cardio). */
export interface HealthChangeSet<TSample> {
  samples: TSample[];
  /** UUIDs from `HKDeletedObject` — propagated to the platform via DELETE by-external. */
  deletedExternalIds: string[];
  /** Opaque cursor to persist and pass back on the next read. */
  newAnchor: string;
}
