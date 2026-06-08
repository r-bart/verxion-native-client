import type { IHealthPort } from "@/domain/health/ports/IHealthPort";
import type { IHealthSyncPort } from "@/domain/health/ports/IHealthSyncPort";
import type { IHealthAnchorStore } from "@/domain/health/ports/IHealthAnchorStore";
import type { HealthChangeSet, SyncMetric } from "@/domain/health/models/HealthSync";

/** Days re-walked for steps each cycle, to catch late-arriving Watch samples (spec §0.5). */
const STEPS_DRAG_DAYS = 7;

/** Outcome of syncing one anchored metric (weight/cardio). */
export interface AnchoredOutcome {
  pushed: number;
  deleted: number;
  failed: number;
  /** Anchor only advances when the whole delta succeeded, so failures retry next cycle. */
  anchorAdvanced: boolean;
}

/** Outcome of the steps recompute→upsert pass. */
export interface StepsOutcome {
  upserted: number;
  failed: number;
}

/** Structured result so the (Phase 5) background trigger can emit telemetry — the UC
 *  stays free of an infrastructure telemetry dependency. */
export interface SyncResult {
  weight: AnchoredOutcome;
  cardio: AnchoredOutcome;
  steps: StepsOutcome;
}

/** `YYYY-MM-DD` minus N days, in UTC. Input is the device-local `today` date.
 *  A slightly wide window is harmless: the platform upserts steps by date. */
function isoMinusDays(today: string, days: number): string {
  const d = new Date(`${today}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Reads Apple Health changes on-device and pushes them to the platform.
 *   - weight & cardio: anchored delta → push each sample, propagate deletions,
 *     then advance the anchor ONLY if the whole delta succeeded.
 *   - steps: recompute a trailing window → upsert by day (no anchor, no deletes).
 *
 * Failure isolation: each metric is independent (one failing metric never starves
 * the others) and each item is independent (one bad sample never blocks its peers).
 * Server idempotency (no-op by `externalId`, upsert by date) makes the retry of an
 * un-advanced anchor safe. The returned {@link SyncResult} is the observability seam:
 * the background trigger logs it.
 */
export class SyncHealthToPlatformUseCase {
  constructor(
    private readonly health: IHealthPort,
    private readonly sync: IHealthSyncPort,
    private readonly anchors: IHealthAnchorStore,
  ) {}

  async execute(today: string): Promise<SyncResult> {
    const weight = await this.syncAnchored(
      "weight",
      (a) => this.health.pullWeightChanges(a),
      (s) => this.sync.pushWeight(s),
      (id) => this.sync.deleteWeightByExternal(id),
    );
    const cardio = await this.syncAnchored(
      "cardio",
      (a) => this.health.pullCardioChanges(a),
      (s) => this.sync.pushCardio(s),
      (id) => this.sync.deleteCardioByExternal(id),
    );
    const steps = await this.syncSteps(today);
    return { weight, cardio, steps };
  }

  private async syncAnchored<T>(
    metric: SyncMetric,
    pull: (anchor: string | null) => Promise<HealthChangeSet<T>>,
    push: (sample: T) => Promise<void>,
    remove: (externalId: string) => Promise<void>,
  ): Promise<AnchoredOutcome> {
    const out: AnchoredOutcome = { pushed: 0, deleted: 0, failed: 0, anchorAdvanced: false };

    let changes: HealthChangeSet<T>;
    try {
      changes = await pull(await this.anchors.get(metric));
    } catch {
      // Couldn't even read the device delta — nothing to advance; surface as a failure.
      out.failed += 1;
      return out;
    }

    for (const sample of changes.samples) {
      try {
        await push(sample);
        out.pushed += 1;
      } catch {
        out.failed += 1;
      }
    }
    for (const externalId of changes.deletedExternalIds) {
      try {
        await remove(externalId);
        out.deleted += 1;
      } catch {
        out.failed += 1;
      }
    }

    // Advance only on a clean delta, so a transient/poison failure retries next cycle
    // (server no-ops the duplicates) instead of being silently skipped.
    if (out.failed === 0) {
      await this.anchors.set(metric, changes.newAnchor);
      out.anchorAdvanced = true;
    }
    return out;
  }

  private async syncSteps(today: string): Promise<StepsOutcome> {
    const out: StepsOutcome = { upserted: 0, failed: 0 };

    let days;
    try {
      days = await this.health.recomputeDailySteps(isoMinusDays(today, STEPS_DRAG_DAYS));
    } catch {
      out.failed += 1;
      return out;
    }

    for (const day of days) {
      try {
        await this.sync.upsertSteps(day);
        out.upserted += 1;
      } catch {
        out.failed += 1;
      }
    }
    return out;
  }
}
