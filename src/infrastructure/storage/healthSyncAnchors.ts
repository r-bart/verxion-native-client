/**
 * Per-type HealthKit sync anchors, in `expo-secure-store`. Each anchored metric
 * (weight, cardio) keeps an opaque cursor so the next read is a delta. Best-effort,
 * mirroring `languagePreference` — a failed read just yields `null` (a full
 * re-read, which the platform de-dupes by `externalId`).
 *
 * The shape satisfies the domain `IHealthAnchorStore` port; it is injected into
 * `SyncHealthToPlatformUseCase` via the DI container, not imported by presentation.
 */
import * as SecureStore from "expo-secure-store";
import type { SyncMetric } from "@/domain/health";

const KEY_PREFIX = "healthAnchor:";

export async function get(metric: SyncMetric): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(`${KEY_PREFIX}${metric}`);
  } catch {
    return null;
  }
}

export async function set(metric: SyncMetric, anchor: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(`${KEY_PREFIX}${metric}`, anchor);
  } catch {
    // Best-effort — a failed write just means the next read is a full re-sync.
  }
}
