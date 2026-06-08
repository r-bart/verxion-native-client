# Implementation Plan: HealthKit → Platform Sync (native)

**Date**: 2026-06-08
**Status**: Draft
**Package manager**: npm (`package-lock.json`)
**Platform side**: ✅ shipped & deployed to staging (`api.rbart-dev.com`) — weight/cardio/steps ingestion, idempotency, DELETE by-external, provenance read-models all verified in `verxion-platform@develop`.

---

## Overview

Build the native side of Apple Health sync: read weight/cardio/steps from HealthKit
on-device and push them to the now-ready platform endpoints. Split into a **push
half (🟢 buildable + testable now, pure TS)** and a **device-read half (🔴 gated on
a HealthKit-capable dev client)**, cleanly separated behind ports so the gated half
slots in without touching the rest.

## Requirements

- [ ] Domain: sync models + `IHealthSyncPort` (push) + `IHealthPort` read extension
- [ ] Application: `SyncHealthToPlatformUseCase` (orchestration, fully unit-tested)
- [ ] Infrastructure (push): `apiClient.delete`, `HttpHealthSyncRepository`, anchor store, DI wiring, contract registry
- [ ] Tests for push half (repo + use case) green
- [ ] 🔴 Native binding: library + entitlements + real `HealthKitRepository` + background delivery (gated on dev client + Apple HealthKit capability)
- [ ] `typecheck` / `lint` (incl. `architecture:check` + `contract:coverage`) / `test` green

---

## Context Discovered (native repo)

| Concern | State |
|---|---|
| `apiClient` | get/post/postForm/put/patch — **no `delete`** → must add `delete<T>` |
| Repos | thin classes implementing a domain port, calling `apiClient` (mirror `HttpMeasurementsRepository`) |
| DI crosscutting | storage modules (`onboardingDraftStore`, `languagePreference`) exposed via container as `* as module`; CLAUDE.md requires an **explicit architecture note** to add a new DI key |
| Anchors | none yet → new ephemeral storage module `healthSyncAnchors` (SecureStore), exposed via DI |
| Domain models | `activity` (StepLog/StepLogEntry/DailyWater), `measurements` (WeightLog). **No cardio, no sync sample DTOs** → add under `domain/health` |
| `HealthMetric` | already corrected to `weight \| steps \| cardio` |
| `IHealthPort` | status-only today (`getStatus/requestAuthorization/setMetricEnabled`); `HealthKitRepository` = stub `UNAVAILABLE` |
| Contract | new routes already exist in platform contract (`/activity/cardio`, `/activity/steps/upsert`, both DELETE by-external) → registry additions will pass `contract:coverage` |
| `app.json` ios | `bundleIdentifier: app.verxion.native`, `appleTeamId: YJ37Y4TMK5`, `usesAppleSignIn`; no HealthKit plugin/entitlements yet |

Authoritative shape source: `docs/health-sync-endpoints-spec.md` §0.5, §3, §4, §10, swap-in checklist.

---

## Approach Analysis

### Option A — Two ports: `IHealthSyncPort` (push, HTTP) + `IHealthPort` extension (read, native) ✅ recommended
Sync UC orchestrates: reads device changes via `IHealthPort`, pushes via
`IHealthSyncPort`, persists anchors via the anchor store.

**Pros**: the push half (HTTP repo + UC) is fully buildable and unit-testable **now**
with the read port mocked; the 🔴 native read impl drops in behind `IHealthPort`
later with zero changes to application/infrastructure-push. Anchors-per-type match
HealthKit's per-sample anchors. **Cons**: two ports to define.
**Complexity**: Medium.

### Option B — One fat `IHealthPort` doing read+push
**Pros**: fewer files. **Cons**: can't build/test anything until the native binding
lands (push logic trapped behind device code); violates the read-only-vs-push
separation; harder to mock. **Complexity**: Medium, worse leverage.

### Recommendation
**Option A.** It is exactly what the spec's swap-in checklist prescribes and it lets
us ship + test the entire orchestration now while the device half is blocked.

---

## Files to Create/Modify

| File | Action | Phase |
|------|--------|-------|
| `src/domain/health/models/HealthSync.ts` | Create | 1 |
| `src/domain/health/ports/IHealthSyncPort.ts` | Create | 1 |
| `src/domain/health/ports/IHealthPort.ts` | Modify (add read methods) | 1 |
| `src/domain/health/index.ts` | Modify (export new types) | 1 |
| `src/application/health/SyncHealthToPlatformUseCase.ts` | Create | 2 |
| `src/infrastructure/api/apiClient.ts` | Modify (add `delete`) | 3 |
| `src/infrastructure/repositories/HttpHealthSyncRepository.ts` | Create | 3 |
| `src/infrastructure/storage/healthSyncAnchors.ts` | Create | 3 |
| `src/infrastructure/repositories/HealthKitRepository.ts` | Modify (read methods → stub throws/empty until binding) | 3 |
| `src/infrastructure/di/container.ts` | Modify (wire repo + UC + anchor store DI key) | 3 |
| `scripts/contract-endpoints.ts` | Modify (register new routes) | 3 |
| `src/application/health/__tests__/SyncHealthToPlatformUseCase.test.ts` | Create | 4 |
| `src/infrastructure/repositories/__tests__/HttpHealthSyncRepository.test.ts` | Create | 4 |
| `app.json` | Modify (HealthKit plugin + entitlements) | 🔴 5 |
| `src/infrastructure/repositories/HealthKitRepository.ts` | Replace (real native impl) | 🔴 5 |

---

## Implementation Phases

> Phases 1–4 are 🟢 buildable + verifiable now. Phase 5 is 🔴 gated on a dev client
> with HealthKit capability and is NOT runnable in Expo Go / JS tests.

### Phase 1 — Domain (sync contracts)

#### Task 1.1: Sync models
**File**: `src/domain/health/models/HealthSync.ts`
```ts
// HealthKit always syncs as the "apple_health" source.
export type CardioActivityType =
  | "run" | "bike" | "swim" | "row" | "elliptical" | "walk" | "hike" | "other";

/** UUID-keyed sample (weight/cardio) — externalId = HKSample/HKWorkout.uuid. */
export interface WeightSample {
  externalId: string;
  weightKg: number;     // client normalizes to kg with a FIXED HKUnit (spec §3)
  loggedAt: string;     // ISO-8601
}
export interface CardioSample {
  externalId: string;
  activityType: CardioActivityType;
  durationMinutes: number;
  loggedDate: string;            // YYYY-MM-DD
  distanceKm?: number | null;
  caloriesBurned?: number | null;
  avgHeartRate?: number | null;  // nullable best-effort (spec §4)
  maxHeartRate?: number | null;
}
/** Date-keyed aggregate (steps) — no UUID, dedup by loggedDate. */
export interface StepsDailyAggregate {
  loggedDate: string;
  totalSteps: number;            // HKStatisticsCollectionQuery .cumulativeSum
  distanceKm?: number;
  caloriesBurned?: number;
  activeMinutes?: number;
  confidenceScore?: number;      // 0..1
}
/** Delta returned by an anchored device read. */
export interface HealthChangeSet<TSample> {
  samples: TSample[];
  deletedExternalIds: string[];  // from HKDeletedObject
  newAnchor: string;
}
export type SyncMetric = "weight" | "cardio";  // anchored types (steps is windowed, no anchor)
```

#### Task 1.2: Push port
**File**: `src/domain/health/ports/IHealthSyncPort.ts`
```ts
import type { WeightSample, CardioSample, StepsDailyAggregate } from "../models/HealthSync";

/** Push-to-platform side (HTTP). source is always apple_health, baked in the repo. */
export interface IHealthSyncPort {
  pushWeight(sample: WeightSample): Promise<void>;
  pushCardio(sample: CardioSample): Promise<void>;
  upsertSteps(day: StepsDailyAggregate): Promise<void>;
  deleteWeightByExternal(externalId: string): Promise<void>;
  deleteCardioByExternal(externalId: string): Promise<void>;
}
```

#### Task 1.3: Extend read port + barrel
**File**: `src/domain/health/ports/IHealthPort.ts` — add device-read methods:
```ts
import type { HealthChangeSet, WeightSample, CardioSample, StepsDailyAggregate } from "../models/HealthSync";
// ...existing status methods unchanged...
  pullWeightChanges(anchor: string | null): Promise<HealthChangeSet<WeightSample>>;
  pullCardioChanges(anchor: string | null): Promise<HealthChangeSet<CardioSample>>;
  recomputeDailySteps(fromDate: string): Promise<StepsDailyAggregate[]>;
```
**File**: `src/domain/health/index.ts` — export the new models + `IHealthSyncPort`.

---

### Phase 2 — Application

#### Task 2.1: Sync use case
**File**: `src/application/health/SyncHealthToPlatformUseCase.ts`
```ts
import type { IHealthPort } from "@/domain/health/ports/IHealthPort";
import type { IHealthSyncPort } from "@/domain/health/ports/IHealthSyncPort";

// Anchor store: minimal get/set keyed by metric (injected, not imported).
export interface IHealthAnchorStore {
  get(metric: "weight" | "cardio"): Promise<string | null>;
  set(metric: "weight" | "cardio", anchor: string): Promise<void>;
}

const STEPS_DRAG_DAYS = 7; // late-arriving Watch samples (spec §0.5)

export class SyncHealthToPlatformUseCase {
  constructor(
    private readonly health: IHealthPort,
    private readonly sync: IHealthSyncPort,
    private readonly anchors: IHealthAnchorStore,
  ) {}

  async execute(today: string): Promise<void> {
    // weight (anchored): delta → push + propagate deletes → persist anchor
    const w = await this.health.pullWeightChanges(await this.anchors.get("weight"));
    for (const s of w.samples) await this.sync.pushWeight(s);
    for (const id of w.deletedExternalIds) await this.sync.deleteWeightByExternal(id);
    await this.anchors.set("weight", w.newAnchor);

    // cardio (anchored): same shape
    const c = await this.health.pullCardioChanges(await this.anchors.get("cardio"));
    for (const s of c.samples) await this.sync.pushCardio(s);
    for (const id of c.deletedExternalIds) await this.sync.deleteCardioByExternal(id);
    await this.anchors.set("cardio", c.newAnchor);

    // steps (windowed recompute → upsert by day; no anchor, no deletes)
    const from = isoMinusDays(today, STEPS_DRAG_DAYS);
    const days = await this.health.recomputeDailySteps(from);
    for (const d of days) await this.sync.upsertSteps(d);
  }
}
// isoMinusDays: pure helper (or reuse an existing date util).
```

---

### Phase 3 — Infrastructure (push side — all buildable now)

#### Task 3.1: Add `apiClient.delete`
**File**: `src/infrastructure/api/apiClient.ts` — mirror `get`/`post` (auth header, error handling):
```ts
async delete<T>(path: string): Promise<T> { /* fetch DELETE, same error handling */ }
```

#### Task 3.2: HTTP sync repository
**File**: `src/infrastructure/repositories/HttpHealthSyncRepository.ts`
```ts
import type { IHealthSyncPort } from "@/domain/health/ports/IHealthSyncPort";
import type { WeightSample, CardioSample, StepsDailyAggregate } from "@/domain/health/models/HealthSync";
import { apiClient } from "../api/apiClient";

const SOURCE = "apple_health";

export class HttpHealthSyncRepository implements IHealthSyncPort {
  async pushWeight(s: WeightSample): Promise<void> {
    await apiClient.post("/measurements/weight", {
      weightKg: s.weightKg, loggedAt: s.loggedAt, source: SOURCE, externalId: s.externalId,
    });
  }
  async pushCardio(s: CardioSample): Promise<void> {
    await apiClient.post("/activity/cardio", {
      activityType: s.activityType, durationMinutes: s.durationMinutes, loggedDate: s.loggedDate,
      distanceKm: s.distanceKm, caloriesBurned: s.caloriesBurned,
      source: SOURCE, externalId: s.externalId,
      avgHeartRate: s.avgHeartRate, maxHeartRate: s.maxHeartRate,
    });
  }
  async upsertSteps(d: StepsDailyAggregate): Promise<void> {
    await apiClient.post("/activity/steps/upsert", {
      totalSteps: d.totalSteps, loggedDate: d.loggedDate, dataSource: SOURCE, // ← steps body uses dataSource
      confidenceScore: d.confidenceScore, distanceKm: d.distanceKm,
      caloriesBurned: d.caloriesBurned, activeMinutes: d.activeMinutes,
    });
  }
  async deleteWeightByExternal(id: string): Promise<void> {
    await apiClient.delete(`/measurements/weight/by-external/${SOURCE}/${encodeURIComponent(id)}`);
  }
  async deleteCardioByExternal(id: string): Promise<void> {
    await apiClient.delete(`/activity/cardio/by-external/${SOURCE}/${encodeURIComponent(id)}`);
  }
}
```
> **Naming wart (spec):** weight/cardio bodies use `source`; steps body uses `dataSource`. Mapped explicitly above.

#### Task 3.3: Anchor ephemeral storage
**File**: `src/infrastructure/storage/healthSyncAnchors.ts` — SecureStore get/set keyed by metric, mirroring `languagePreference.ts`. Shape satisfies `IHealthAnchorStore`.

#### Task 3.4: Stub read methods on `HealthKitRepository`
**File**: `src/infrastructure/repositories/HealthKitRepository.ts` — implement the three new `IHealthPort` read methods as "unavailable" no-ops until the binding (empty changesets / `[]`), so DI typechecks and the UC is safely inert in JS builds.

#### Task 3.5: DI wiring + contract registry
**File**: `src/infrastructure/di/container.ts`:
```ts
const healthSyncRepo = new HttpHealthSyncRepository();
// ...
  syncHealthToPlatform: new SyncHealthToPlatformUseCase(healthRepo, healthSyncRepo, healthSyncAnchors),
  healthSyncAnchors,   // ← new crosscutting DI key (ARCHITECTURE NOTE required, see below)
```
**File**: `scripts/contract-endpoints.ts` — add under a `healthSync` group:
```ts
["POST", "/api/v1/activity/cardio"],
["POST", "/api/v1/activity/steps/upsert"],
["DELETE", "/api/v1/measurements/weight/by-external/{source}/{externalId}"],
["DELETE", "/api/v1/activity/cardio/by-external/{source}/{externalId}"],
// POST /api/v1/measurements/weight already registered under `measurements`
```
**Architecture note** (add to `.claude/rules/architecture.md` crosscutting list): `healthSyncAnchors` joins the narrow set of DI-exposed cross-cutting services (HealthKit per-type sync cursors; ephemeral SecureStore).

---

### Phase 4 — Tests (push half)

#### Task 4.1: Use-case test
**File**: `src/application/health/__tests__/SyncHealthToPlatformUseCase.test.ts` — mock all 3 deps:
- pushes every weight/cardio sample; calls `deleteByExternal` for each deleted id; persists anchors with `newAnchor`.
- steps: recompute window = today−7d; upserts each returned day.
- empty changeset → no pushes, anchor still persisted.

#### Task 4.2: Repository test
**File**: `src/infrastructure/repositories/__tests__/HttpHealthSyncRepository.test.ts` — mock `apiClient`; assert exact paths/bodies (incl. `source` vs `dataSource` mapping, `apple_health` baked into DELETE path, `encodeURIComponent`).

---

### Phase 5 — 🔴 Native HealthKit binding (gated — separate execution)

**Hard prerequisites (not code):** Apple Developer **HealthKit capability** on team `YJ37Y4TMK5`; an **EAS dev client** build (HealthKit doesn't run in Expo Go).

#### Task 5.1: Library + config
- `npx expo install @kingstinct/react-native-healthkit`.
- `app.json`: add the HealthKit config plugin + iOS entitlements `NSHealthShareUsageDescription`, `NSHealthUpdateUsageDescription`, `com.apple.developer.healthkit.background-delivery`.

#### Task 5.2: Real `HealthKitRepository`
- `getStatus/requestAuthorization/setMetricEnabled`: real authorization sheet + status.
- `pullWeightChanges`/`pullCardioChanges`: `HKAnchoredObjectQuery` per type → `{samples, deletedExternalIds, newAnchor}`; normalize units with **fixed `HKUnit`** (kg/km/kcal/min/bpm); map `HKWorkoutActivityType`→`CardioActivityType` (fallback `other`); HR via `workout.statistics(for:)` → fallback sample query → null.
- `recomputeDailySteps`: `HKStatisticsCollectionQuery` `.cumulativeSum` (NOT sum of samples).

#### Task 5.3: Background + trigger
- `HKObserverQuery` + `enableBackgroundDelivery` (steps hourly cap); call `syncHealthToPlatform.execute()` — idempotent/auto-healing.

#### Task 5.4: Device verification
- Real authorize → log a weight in Apple Health → confirm it lands via `GET /measurements/weight` (now returns `source: apple_health` + `externalId`); delete it in Health → confirm propagation via the DELETE route.

---

## Task Dependencies

```yaml
dependencies:
  1.1: []
  1.2: [1.1]
  1.3: [1.1]
  2.1: [1.2, 1.3]
  3.1: []
  3.2: [1.2, 3.1]
  3.3: [1.1]
  3.4: [1.3]
  3.5: [2.1, 3.2, 3.3, 3.4]
  4.1: [2.1]
  4.2: [3.2]
  5.1: []
  5.2: [1.3, 5.1]
  5.3: [2.1, 5.2]
  5.4: [3.5, 5.3]
```

---

## Risk Analysis

### Edge cases
- [ ] Empty changeset → no pushes, anchor still advanced.
- [ ] Duplicate re-sync (anchor reset on reinstall) → platform no-ops by `externalId` (verified server-side). Client stays naive.
- [ ] Deleted sample → `deleteByExternal`; 404 from platform (already gone) treated as success.
- [ ] Steps day boundary / device-local date → `loggedDate` is device-local YYYY-MM-DD.
- [ ] HR / distance / calories absent → send `null`, platform accepts.
- [ ] `externalId` with URL-unsafe chars → `encodeURIComponent` in DELETE path.

### Technical risks
- [ ] **Unit footgun (🔴 5):** HealthKit returns the user's *preferred* unit — must extract with a fixed `HKUnit` or 180 lb lands as 180 kg.
- [ ] New DI key `healthSyncAnchors` needs the architecture note or `architecture:check` intent drift.
- [ ] `contract:coverage` — new routes must match the platform contract rows (they do, verified).
- [ ] Steps `cumulativeSum` vs sum-of-samples (🔴 5) — wrong query double-counts iPhone+Watch.

---

## Testing Strategy
- **Unit (now)**: `SyncHealthToPlatformUseCase` (mock ports + anchor store), `HttpHealthSyncRepository` (mock apiClient). Mirror existing repo/UC test style.
- **Contract**: `contract:coverage` + `contractDrift.test.ts` against sibling platform contract.
- **Device (🔴 5)**: Task 5.4 manual flow on a dev client.

---

## Done Criteria

### Phase 1–2 (domain + application)
- [ ] `IHealthSyncPort` + sync models exported from `@/domain/health`; `typecheck` green
- [ ] `SyncHealthToPlatformUseCase` compiles against the two ports + anchor store

### Phase 3 (infra push)
- [ ] `apiClient.delete` exists and sets auth header like the others
- [ ] `HttpHealthSyncRepository` hits the 5 routes with correct bodies (incl. `source`/`dataSource` mapping)
- [ ] `healthSyncAnchors` storage module + DI key wired; architecture note added
- [ ] `npm run contract:coverage` green (new routes match platform contract)

### Phase 4 (tests)
- [ ] `npm test` includes new UC + repo suites, all green

### Phase 5 (🔴 gated — do NOT block 1–4)
- [ ] Library + entitlements added; dev client builds
- [ ] Real `HealthKitRepository` implements read methods; Task 5.4 device flow passes

### Overall (push half)
- [ ] `npm run typecheck && npm run lint && npm test` green
- [ ] No `TODO/FIXME/HACK` in new code
- [ ] No layer violations (`architecture:check`)

---

## Verification
```bash
npm run typecheck && npm run lint && npm test
```
🔴 Phase 5: `eas build --profile development` → install dev client → Task 5.4 manual flow.

---

## Recommended execution
Run **Phases 1–4 now** (`/execute-plan` — pure TS, fully tested, ships the whole
orchestration). Hold **Phase 5** until the dev client + HealthKit capability are
ready; it then slots in behind `IHealthPort` with no changes to 1–4.
