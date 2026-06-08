import type { IHealthSyncPort } from "@/domain/health/ports/IHealthSyncPort";
import type {
  WeightSample,
  CardioSample,
  StepsDailyAggregate,
} from "@/domain/health/models/HealthSync";
import { apiClient } from "../api/apiClient";

/** The native client only ever syncs Apple Health data, so the source is constant. */
const SOURCE = "apple_health";

/**
 * Pushes Apple Health samples to the platform ingestion routes. Weight/cardio are
 * idempotent by `externalId` server-side; steps upserts by date. Deletions hit the
 * `by-external` routes.
 *
 * Field-naming wart (spec §2): weight & cardio bodies use `source`, the steps body
 * uses `dataSource` — mapped explicitly below.
 */
export class HttpHealthSyncRepository implements IHealthSyncPort {
  async pushWeight(sample: WeightSample): Promise<void> {
    await apiClient.post("/measurements/weight", {
      weightKg: sample.weightKg,
      loggedAt: sample.loggedAt,
      source: SOURCE,
      externalId: sample.externalId,
    });
  }

  async pushCardio(sample: CardioSample): Promise<void> {
    await apiClient.post("/activity/cardio", {
      activityType: sample.activityType,
      durationMinutes: sample.durationMinutes,
      loggedDate: sample.loggedDate,
      distanceKm: sample.distanceKm,
      caloriesBurned: sample.caloriesBurned,
      source: SOURCE,
      externalId: sample.externalId,
      avgHeartRate: sample.avgHeartRate,
      maxHeartRate: sample.maxHeartRate,
    });
  }

  async upsertSteps(day: StepsDailyAggregate): Promise<void> {
    await apiClient.post("/activity/steps/upsert", {
      totalSteps: day.totalSteps,
      loggedDate: day.loggedDate,
      dataSource: SOURCE, // steps body uses `dataSource`, not `source`
      confidenceScore: day.confidenceScore,
      distanceKm: day.distanceKm,
      caloriesBurned: day.caloriesBurned,
      activeMinutes: day.activeMinutes,
    });
  }

  async deleteWeightByExternal(externalId: string): Promise<void> {
    await apiClient.del(
      `/measurements/weight/by-external/${SOURCE}/${encodeURIComponent(externalId)}`,
    );
  }

  async deleteCardioByExternal(externalId: string): Promise<void> {
    await apiClient.del(
      `/activity/cardio/by-external/${SOURCE}/${encodeURIComponent(externalId)}`,
    );
  }
}
