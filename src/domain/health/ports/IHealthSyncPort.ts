import type {
  WeightSample,
  CardioSample,
  StepsDailyAggregate,
} from "../models/HealthSync";

/**
 * Push-to-platform side of Apple Health sync (implemented by an HTTP repository).
 * The `apple_health` source is baked into the implementation. Weight and cardio
 * are idempotent by `externalId` server-side; steps upserts by date. Deletions
 * propagate HealthKit `HKDeletedObject` UUIDs.
 */
export interface IHealthSyncPort {
  pushWeight(sample: WeightSample): Promise<void>;
  pushCardio(sample: CardioSample): Promise<void>;
  upsertSteps(day: StepsDailyAggregate): Promise<void>;
  deleteWeightByExternal(externalId: string): Promise<void>;
  deleteCardioByExternal(externalId: string): Promise<void>;
}
