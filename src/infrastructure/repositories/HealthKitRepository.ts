import {
  isHealthDataAvailable,
  requestAuthorization,
  queryQuantitySamplesWithAnchor,
  queryWorkoutSamplesWithAnchor,
  queryStatisticsCollectionForQuantity,
  WorkoutActivityType,
  type ObjectTypeIdentifier,
} from "@kingstinct/react-native-healthkit";
import type {
  IHealthPort,
  HealthMetric,
  HealthStatus,
  HealthChangeSet,
  WeightSample,
  CardioSample,
  StepsDailyAggregate,
  CardioActivityType,
} from "@/domain/health";

// ── HealthKit type identifiers we read ───────────────────────────────────────
const BODY_MASS = "HKQuantityTypeIdentifierBodyMass" as const;
const STEP_COUNT = "HKQuantityTypeIdentifierStepCount" as const;

/** Types we request read access to (weight + steps + workouts). */
const READ_TYPES: readonly ObjectTypeIdentifier[] = [
  BODY_MASS,
  STEP_COUNT,
  "HKWorkoutTypeIdentifier",
] as ObjectTypeIdentifier[];

/** `Date` → device-local `YYYY-MM-DD`. */
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Map HealthKit's ~80 workout types down to the platform's 8 cardio kinds. */
function mapWorkoutType(t: WorkoutActivityType): CardioActivityType {
  switch (t) {
    case WorkoutActivityType.running:
      return "run";
    case WorkoutActivityType.cycling:
      return "bike";
    case WorkoutActivityType.swimming:
      return "swim";
    case WorkoutActivityType.rowing:
      return "row";
    case WorkoutActivityType.elliptical:
      return "elliptical";
    case WorkoutActivityType.walking:
      return "walk";
    case WorkoutActivityType.hiking:
      return "hike";
    default:
      return "other";
  }
}

/**
 * Real Apple HealthKit adapter (@kingstinct/react-native-healthkit v14, nitro).
 *
 * READ semantics are spec-clear and typed against the library: anchored deltas
 * for weight/cardio (with deletions), windowed `.cumulativeSum` statistics for
 * steps. Units are forced to the canonical HKUnit at the query (`kg`, `count`,
 * `m`, `kcal`), avoiding the preferred-unit footgun (spec §3).
 *
 * NOT yet validated on-device (HealthKit doesn't run in Jest/simulator):
 *  - connected/per-metric status is conservative — iOS does not expose read
 *    authorization, so we report `connected` from data availability + the
 *    request flow; refine against device behavior.
 *  - heart rate is left null (best-effort, spec §4) — wiring `statistics(for:)`
 *    per workout is a device-iteration follow-up.
 */
export class HealthKitRepository implements IHealthPort {
  async getStatus(): Promise<HealthStatus> {
    const available = isHealthDataAvailable();
    // iOS keeps read-authorization private; treat availability as the gate and
    // report metrics uniformly. Device iteration refines per-metric truth.
    return {
      available,
      connected: available,
      metrics: { weight: available, steps: available, cardio: available },
    };
  }

  async requestAuthorization(): Promise<HealthStatus> {
    await requestAuthorization({ toRead: READ_TYPES });
    return this.getStatus();
  }

  async setMetricEnabled(_metric: HealthMetric, _enabled: boolean): Promise<HealthStatus> {
    // On iOS there is no per-metric persisted toggle distinct from authorization;
    // re-prompting covers any not-yet-granted type. Returns the refreshed status.
    await requestAuthorization({ toRead: READ_TYPES });
    return this.getStatus();
  }

  async pullWeightChanges(anchor: string | null): Promise<HealthChangeSet<WeightSample>> {
    const res = await queryQuantitySamplesWithAnchor(BODY_MASS, {
      anchor: anchor ?? undefined,
      unit: "kg",
      limit: 0,
    });
    return {
      samples: res.samples.map((s) => ({
        externalId: s.uuid,
        weightKg: s.quantity,
        loggedAt: s.startDate.toISOString(),
      })),
      deletedExternalIds: res.deletedSamples.map((d) => d.uuid),
      newAnchor: res.newAnchor,
    };
  }

  async pullCardioChanges(anchor: string | null): Promise<HealthChangeSet<CardioSample>> {
    const res = await queryWorkoutSamplesWithAnchor({
      anchor: anchor ?? undefined,
      limit: 0,
    });
    return {
      samples: res.workouts.map((w) => ({
        externalId: w.uuid,
        activityType: mapWorkoutType(w.workoutActivityType),
        durationMinutes: Math.round(w.duration.quantity / 60),
        loggedDate: isoDate(w.startDate),
        distanceKm: w.totalDistance ? w.totalDistance.quantity / 1000 : null,
        caloriesBurned: w.totalEnergyBurned ? Math.round(w.totalEnergyBurned.quantity) : null,
        avgHeartRate: null, // best-effort; device-iteration follow-up
        maxHeartRate: null,
      })),
      deletedExternalIds: res.deletedSamples.map((d) => d.uuid),
      newAnchor: res.newAnchor,
    };
  }

  async recomputeDailySteps(fromDate: string): Promise<StepsDailyAggregate[]> {
    const responses = await queryStatisticsCollectionForQuantity(
      STEP_COUNT,
      ["cumulativeSum"],
      new Date(`${fromDate}T00:00:00`),
      { day: 1 },
      { unit: "count" },
    );
    return responses
      .filter((r) => r.startDate != null && r.sumQuantity != null)
      .map((r) => ({
        loggedDate: isoDate(r.startDate as Date),
        totalSteps: Math.round((r.sumQuantity as { quantity: number }).quantity),
      }));
  }
}
