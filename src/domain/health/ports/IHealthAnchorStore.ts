import type { SyncMetric } from "../models/HealthSync";

/**
 * Persists the per-type HealthKit sync anchor (an opaque cursor). The anchor
 * lives in the app, not in HealthKit — reinstalling or revoking+regranting
 * resets it, which triggers a full re-delivery (the platform no-ops duplicates
 * by `externalId`). Implemented by ephemeral SecureStore-backed storage.
 */
export interface IHealthAnchorStore {
  get(metric: SyncMetric): Promise<string | null>;
  set(metric: SyncMetric, anchor: string): Promise<void>;
}
