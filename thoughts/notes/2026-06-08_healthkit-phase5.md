# Post-Review — HealthKit Phase 5 (5.1–5.3)

**Date**: 2026-06-08 · **Branch**: feat/design-system

## Quality / architecture
- typecheck (app+test) ✅ · lint ✅ · 557 tests ✅ (+2) · architecture-checker PASS (0 violations) · contract:coverage PASS (82↔80).
- Dev client compiled with HealthKit linked → native config (plugin/entitlements/encryption) validated for real.

## Findings
1. **🟠 Auto-sync runs while logged out.** `useHealthAutoSync` is mounted in `AppShell`
   (above AuthGuard), so on a real device it fires on the login/onboarding screens too:
   `available` is true → it reads HealthKit and pushes to the API with no session → 401
   on every push, every foreground. The UC isolates the failures (so no crash) but it (a)
   spams unauthenticated requests, (b) re-reads the full HealthKit delta each time (anchor
   never advances on all-failed), (c) fires misleading `health_synced` telemetry. → Gate on
   an authenticated session before syncing.
2. **🟠 `getStatus` is optimistic.** Reports `connected: available` and all metrics enabled
   whenever HealthKit is available — so the screen shows "Connected" + toggles-on + "Sync now"
   even if the user denied permission. iOS keeps read-auth private; needs device-tuned status
   (e.g. track a local "requested" flag or probe `getRequestStatusForAuthorization`).
3. **🟡 No throttle on auto-sync.** Every foreground recomputes a 7-day steps window + up to
   7 upserts. The `running` ref blocks overlap but not frequency; add a min-interval guard.
4. **Headline caveat (accepted):** HealthKitRepository runtime is device-only-verifiable —
   anchor round-trip, unit conversions (duration s→min, distance m→km), workout-type mapping,
   statistics intervals. HR is null v1 (best-effort). Typecheck validated the API surface only.

## What worked
- Moving `SyncResult` to `domain/health/models` to satisfy the presentation→domain boundary
  (architecture-checker caught the application import immediately — fast feedback loop).
- 5.3 is JS-only → loads on the existing dev client via Metro, no native rebuild to test.

## Recommendation
Fix #1 (auth gate) before the on-device session — it's cheap and bites immediately on a
logged-out foreground. #2/#3 are device-tuning, fold into the device-feedback loop.
