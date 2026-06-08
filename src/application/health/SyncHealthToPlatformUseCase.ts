import type { IHealthPort } from "@/domain/health/ports/IHealthPort";
import type { IHealthSyncPort } from "@/domain/health/ports/IHealthSyncPort";
import type { IHealthAnchorStore } from "@/domain/health/ports/IHealthAnchorStore";

/** Days re-walked for steps each cycle, to catch late-arriving Watch samples (spec §0.5). */
const STEPS_DRAG_DAYS = 7;

/** `YYYY-MM-DD` minus N days, in UTC. Input is the device-local `today` date. */
function isoMinusDays(today: string, days: number): string {
  const d = new Date(`${today}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Reads Apple Health changes on-device and pushes them to the platform.
 *   - weight & cardio: anchored delta → push each sample, propagate deletions,
 *     then persist the new anchor.
 *   - steps: recompute a trailing window → upsert by day (no anchor, no deletes).
 *
 * Idempotency lives server-side (no-op by `externalId`; upsert by date), so a
 * re-delivery after an anchor reset is safe to push naively.
 */
export class SyncHealthToPlatformUseCase {
  constructor(
    private readonly health: IHealthPort,
    private readonly sync: IHealthSyncPort,
    private readonly anchors: IHealthAnchorStore,
  ) {}

  async execute(today: string): Promise<void> {
    // ── weight (anchored) ──────────────────────────────────────────────────
    const weight = await this.health.pullWeightChanges(await this.anchors.get("weight"));
    for (const sample of weight.samples) await this.sync.pushWeight(sample);
    for (const id of weight.deletedExternalIds) await this.sync.deleteWeightByExternal(id);
    await this.anchors.set("weight", weight.newAnchor);

    // ── cardio (anchored) ──────────────────────────────────────────────────
    const cardio = await this.health.pullCardioChanges(await this.anchors.get("cardio"));
    for (const sample of cardio.samples) await this.sync.pushCardio(sample);
    for (const id of cardio.deletedExternalIds) await this.sync.deleteCardioByExternal(id);
    await this.anchors.set("cardio", cardio.newAnchor);

    // ── steps (windowed recompute → upsert by day) ─────────────────────────
    const from = isoMinusDays(today, STEPS_DRAG_DAYS);
    const days = await this.health.recomputeDailySteps(from);
    for (const day of days) await this.sync.upsertSteps(day);
  }
}
