import { SyncHealthToPlatformUseCase } from "../SyncHealthToPlatformUseCase";
import type { IHealthPort } from "@/domain/health/ports/IHealthPort";
import type { IHealthSyncPort } from "@/domain/health/ports/IHealthSyncPort";
import type { IHealthAnchorStore } from "@/domain/health/ports/IHealthAnchorStore";
import type { HealthChangeSet, WeightSample, CardioSample } from "@/domain/health/models/HealthSync";

function emptyChangeSet<T>(anchor = "a-new"): HealthChangeSet<T> {
  return { samples: [], deletedExternalIds: [], newAnchor: anchor };
}

function createHealthPort(overrides: Partial<IHealthPort> = {}): IHealthPort {
  return {
    getStatus: jest.fn(),
    requestAuthorization: jest.fn(),
    setMetricEnabled: jest.fn(),
    pullWeightChanges: jest.fn().mockResolvedValue(emptyChangeSet<WeightSample>()),
    pullCardioChanges: jest.fn().mockResolvedValue(emptyChangeSet<CardioSample>()),
    recomputeDailySteps: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
}

function createSyncPort(): jest.Mocked<IHealthSyncPort> {
  return {
    pushWeight: jest.fn().mockResolvedValue(undefined),
    pushCardio: jest.fn().mockResolvedValue(undefined),
    upsertSteps: jest.fn().mockResolvedValue(undefined),
    deleteWeightByExternal: jest.fn().mockResolvedValue(undefined),
    deleteCardioByExternal: jest.fn().mockResolvedValue(undefined),
  };
}

function createAnchorStore(): jest.Mocked<IHealthAnchorStore> {
  return {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  };
}

describe("SyncHealthToPlatformUseCase", () => {
  it("pushes weight & cardio samples, propagates deletions, and persists each new anchor", async () => {
    const weight: WeightSample = { externalId: "w1", weightKg: 80, loggedAt: "2026-06-08T07:00:00Z" };
    const cardio: CardioSample = { externalId: "c1", activityType: "run", durationMinutes: 30, loggedDate: "2026-06-08" };
    const health = createHealthPort({
      pullWeightChanges: jest.fn().mockResolvedValue({ samples: [weight], deletedExternalIds: ["w-del"], newAnchor: "w-anchor" }),
      pullCardioChanges: jest.fn().mockResolvedValue({ samples: [cardio], deletedExternalIds: ["c-del"], newAnchor: "c-anchor" }),
    });
    const sync = createSyncPort();
    const anchors = createAnchorStore();

    await new SyncHealthToPlatformUseCase(health, sync, anchors).execute("2026-06-08");

    expect(sync.pushWeight).toHaveBeenCalledWith(weight);
    expect(sync.deleteWeightByExternal).toHaveBeenCalledWith("w-del");
    expect(anchors.set).toHaveBeenCalledWith("weight", "w-anchor");

    expect(sync.pushCardio).toHaveBeenCalledWith(cardio);
    expect(sync.deleteCardioByExternal).toHaveBeenCalledWith("c-del");
    expect(anchors.set).toHaveBeenCalledWith("cardio", "c-anchor");
  });

  it("reads anchored deltas using the stored anchor per metric", async () => {
    const health = createHealthPort();
    const anchors = createAnchorStore();
    (anchors.get as jest.Mock).mockImplementation(async (m: string) => (m === "weight" ? "wA" : "cA"));

    await new SyncHealthToPlatformUseCase(health, createSyncPort(), anchors).execute("2026-06-08");

    expect(health.pullWeightChanges).toHaveBeenCalledWith("wA");
    expect(health.pullCardioChanges).toHaveBeenCalledWith("cA");
  });

  it("recomputes steps over a trailing 7-day window and upserts each day", async () => {
    const health = createHealthPort({
      recomputeDailySteps: jest.fn().mockResolvedValue([
        { loggedDate: "2026-06-07", totalSteps: 8000 },
        { loggedDate: "2026-06-08", totalSteps: 5000 },
      ]),
    });
    const sync = createSyncPort();

    await new SyncHealthToPlatformUseCase(health, sync, createAnchorStore()).execute("2026-06-08");

    expect(health.recomputeDailySteps).toHaveBeenCalledWith("2026-06-01"); // today − 7d
    expect(sync.upsertSteps).toHaveBeenCalledTimes(2);
    expect(sync.upsertSteps).toHaveBeenCalledWith({ loggedDate: "2026-06-07", totalSteps: 8000 });
  });

  it("is a safe no-op on empty changesets but still advances anchors", async () => {
    const sync = createSyncPort();
    const anchors = createAnchorStore();

    await new SyncHealthToPlatformUseCase(createHealthPort(), sync, anchors).execute("2026-06-08");

    expect(sync.pushWeight).not.toHaveBeenCalled();
    expect(sync.pushCardio).not.toHaveBeenCalled();
    expect(sync.upsertSteps).not.toHaveBeenCalled();
    expect(anchors.set).toHaveBeenCalledWith("weight", "a-new");
    expect(anchors.set).toHaveBeenCalledWith("cardio", "a-new");
  });

  it("isolates a failing metric: weight failure does NOT advance its anchor or starve cardio/steps", async () => {
    const weight: WeightSample = { externalId: "w1", weightKg: 80, loggedAt: "2026-06-08T07:00:00Z" };
    const cardio: CardioSample = { externalId: "c1", activityType: "run", durationMinutes: 30, loggedDate: "2026-06-08" };
    const health = createHealthPort({
      pullWeightChanges: jest.fn().mockResolvedValue({ samples: [weight], deletedExternalIds: [], newAnchor: "w-anchor" }),
      pullCardioChanges: jest.fn().mockResolvedValue({ samples: [cardio], deletedExternalIds: [], newAnchor: "c-anchor" }),
      recomputeDailySteps: jest.fn().mockResolvedValue([{ loggedDate: "2026-06-08", totalSteps: 5000 }]),
    });
    const sync = createSyncPort();
    sync.pushWeight.mockRejectedValueOnce(new Error("422 invalid"));
    const anchors = createAnchorStore();

    const result = await new SyncHealthToPlatformUseCase(health, sync, anchors).execute("2026-06-08");

    // weight failed → anchor NOT advanced, failure surfaced
    expect(result.weight).toEqual({ pushed: 0, deleted: 0, failed: 1, anchorAdvanced: false });
    expect(anchors.set).not.toHaveBeenCalledWith("weight", "w-anchor");
    // cardio + steps still ran
    expect(sync.pushCardio).toHaveBeenCalledWith(cardio);
    expect(anchors.set).toHaveBeenCalledWith("cardio", "c-anchor");
    expect(sync.upsertSteps).toHaveBeenCalledTimes(1);
    expect(result.cardio.anchorAdvanced).toBe(true);
    expect(result.steps).toEqual({ upserted: 1, failed: 0 });
  });

  it("isolates a failing item within a metric and reports it without advancing the anchor", async () => {
    const ok: WeightSample = { externalId: "w-ok", weightKg: 80, loggedAt: "2026-06-08T07:00:00Z" };
    const bad: WeightSample = { externalId: "w-bad", weightKg: -1, loggedAt: "2026-06-08T08:00:00Z" };
    const health = createHealthPort({
      pullWeightChanges: jest.fn().mockResolvedValue({ samples: [ok, bad], deletedExternalIds: [], newAnchor: "w-anchor" }),
    });
    const sync = createSyncPort();
    sync.pushWeight.mockImplementation(async (s) => {
      if (s.externalId === "w-bad") throw new Error("422");
    });
    const anchors = createAnchorStore();

    const result = await new SyncHealthToPlatformUseCase(health, sync, anchors).execute("2026-06-08");

    expect(result.weight).toEqual({ pushed: 1, deleted: 0, failed: 1, anchorAdvanced: false });
    expect(sync.pushWeight).toHaveBeenCalledTimes(2); // the good one was not blocked by the bad one
    expect(anchors.set).not.toHaveBeenCalledWith("weight", "w-anchor");
  });

  it("a device read that throws is captured as a failure, not a crash", async () => {
    const health = createHealthPort({
      pullWeightChanges: jest.fn().mockRejectedValue(new Error("HealthKit unavailable")),
    });
    const anchors = createAnchorStore();

    const result = await new SyncHealthToPlatformUseCase(health, createSyncPort(), anchors).execute("2026-06-08");

    expect(result.weight).toEqual({ pushed: 0, deleted: 0, failed: 1, anchorAdvanced: false });
    expect(anchors.set).not.toHaveBeenCalledWith("weight", expect.anything());
  });
});
