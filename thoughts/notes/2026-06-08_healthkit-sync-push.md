# Post-Review (strict) — HealthKit sync, push half

**Date**: 2026-06-08 · **Branch**: feat/design-system · **Verdict**: CHANGES REQUESTED (harden before Phase 5)

## Quality / architecture
- typecheck ✅ · lint ✅ · 551 tests ✅ (+13) · architecture-checker PASS (0 violations) · contract:coverage PASS (82↔80).
- Pure-TS push half, fully port-isolated; device-read half stubbed inert.

## Strict findings (all sharpened by Phase 5's headless/background nature)
1. **🟠 Metric coupling + poison-sample wedge.** `execute()` runs weight→cardio→steps as
   one sequential chain; any rejected push throws and aborts the rest. A *persistently*
   rejected item (4xx on a bad value) re-reads every cycle (anchor not advanced) and
   starves cardio+steps forever. Fix: isolate per metric (try/catch per block) so one
   metric can't starve the others; consider per-sample skip-and-record.
2. **🟠 Delete 404 not treated as success.** Plan risk-analysis said "404 (already gone) →
   success", but `apiClient.del` throws `ApiError` on any non-2xx. An already-deleted
   sample would wedge the weight loop. Fix: swallow 404 in the delete methods (or in the UC).
3. **🟠 Zero observability.** A background sync with no telemetry is undebuggable in prod.
   Add `telemetry.track` on outcome (pushed/deleted/failed counts per metric).
4. **🟡 Stub persists "" anchor** (cosmetic; replaced by real impl).
5. **🟡 `isoMinusDays` parses `today` as UTC** — harmless given idempotent date-upsert (window only widens), but note device-local vs UTC.

## What worked
- Two-port split (`IHealthSyncPort` push / `IHealthPort` read) let the entire orchestration
  ship + unit-test now with the device half stubbed. Anchor store as injected namespace =
  no DI-key/architecture-note churn.

## Decision
Address findings 1–3 (and ideally 4–5) **before wiring the Phase 5 background trigger** —
that's exactly when coupling + silent failure become outages.
