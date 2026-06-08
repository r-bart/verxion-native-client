import type { SyncResult } from "@/domain/health";

/** Device-local `YYYY-MM-DD` — the day HealthKit steps are recomputed up to. */
export function deviceToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Flatten the nested SyncResult into flat telemetry props. */
export function flattenSyncResult(r: SyncResult): Record<string, number | boolean> {
  return {
    weight_pushed: r.weight.pushed,
    weight_deleted: r.weight.deleted,
    weight_failed: r.weight.failed,
    weight_anchor_advanced: r.weight.anchorAdvanced,
    cardio_pushed: r.cardio.pushed,
    cardio_deleted: r.cardio.deleted,
    cardio_failed: r.cardio.failed,
    cardio_anchor_advanced: r.cardio.anchorAdvanced,
    steps_upserted: r.steps.upserted,
    steps_failed: r.steps.failed,
  };
}
