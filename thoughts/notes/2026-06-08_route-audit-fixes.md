# Post-Review Notes — Route-Audit Fixes + HealthMetric correction

**Date**: 2026-06-08 · **Branch**: feat/design-system

## What worked well
- **Mechanical cross-file transform via a one-off node script** (32 static `as Href`
  casts + 20 unused `Href` imports) with a single `typecheck` gate afterwards was
  far faster than per-file editing, and the gate proved every static route resolves
  in the generated typed-routes — 0 casts needed restoring.
- **Token-presence check before stripping the `Href` import** (not just "no dynamic
  casts") correctly preserved imports in files that use `Href` as a type annotation
  (`ActivePlan`'s `(path: Href)`, `RoutineDayCard`'s `const href: Href`).

## Patterns discovered
- **`typedRoutes` is ON but was being defeated.** `app.json` has
  `experiments.typedRoutes: true`, yet ~50 navigations cast static literals with
  `as Href`, disabling compile-time route validation. Removing the cast on a static
  literal re-enables it; only interpolated template literals legitimately need it.
- **Domain-model drift caught by the sync spec.** `HealthMetric` listed `water`
  (HealthKit doesn't read water) and omitted `cardio` (a real sync target). The
  `docs/health-sync-endpoints-spec.md` §10 flagged it; corrected the domain model,
  stub, i18n, and test fixtures.

## Deferred (not bugs — future work)
- Steps endpoint `/activity/steps` → `/upsert`: coupled to platform wiring
  (`dataSource`), premature in isolation.
- Native HealthKit binding + `SyncHealthToPlatformUseCase`: separate feature.

## CLAUDE.md candidate rule
> Don't cast static route literals with `as Href`. `typedRoutes` is enabled — let it
> validate them so a typo'd path fails at compile time. Reserve `as Href` for
> interpolated template-literal targets the generator can't narrow.
