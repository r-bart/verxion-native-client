# Implementation Plan: Route-Audit Fixes

**Date**: 2026-06-08
**Status**: Draft
**Package manager**: npm (`package-lock.json`)

---

## Overview

Resolve the navigation findings from the route/navigation audit: remove an
orphan screen, add a branded not-found route, and strip the `as Href` casts that
defeat the already-enabled `typedRoutes`. **No new features and no data-layer
changes.**

> **Out of scope — micro-writes.** Weight/water/steps are *not* manual-entry
> modals. They are sourced from **Apple HealthKit** and synced to the platform
> via the existing `health` module (`IHealthPort` / `HealthKitRepository` stub)
> and the `LogWeight/LogWater/LogStepsUseCase` write path. That HealthKit→sync
> integration is its own plan (see `docs/health-sync-endpoints-spec.md`). This
> plan does **not** add logging UI and does **not** touch those UCs/repos/DI.

## Requirements

- [ ] Delete orphan `NutritionSoonScreen.tsx` (unreferenced dead code)
- [ ] Add a branded `app/+not-found.tsx` so unknown deep links land on a glass screen
- [ ] Remove unnecessary `as Href` casts so `typedRoutes` (already `true`) catches 404s at compile time
- [ ] No regressions: `typecheck`, `lint` (incl. `architecture:check` + `contract:coverage`), `test` all green

---

## Context Discovered (research)

| Concern | State today |
|---------|-------------|
| `typedRoutes` | **Already `true`** in `app.json` (`expo.experiments`). The ~50 `as Href` casts bypass it. |
| `NutritionSoonScreen` | Orphan: `grep -rn "NutritionSoonScreen" src app` returns only the file itself. Live nutrition uses `NutricionScreen`. |
| not-found | No `app/+not-found.tsx` → unknown deep links fall to Expo Router's default screen, not the glass design. |
| Reusable UI for not-found | `EmptyState` (`{icon,title,body,action}`), `ScreenBloom`, `OnboardingButton`, `glass` tokens. |
| Micro-writes | Data layers exist and are wired, **but are the HealthKit-sync write path** — left untouched. No manual UI is wanted. |

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/presentation/nutrition/screens/NutritionSoonScreen.tsx` | **Delete** | Orphan dead code |
| `src/presentation/app/screens/NotFoundScreen.tsx` | Create | Glass not-found body + "back to Today" action |
| `app/+not-found.tsx` | Create | Not-found route (3-line delegator) |
| `locales/en.json`, `locales/es.json` | Modify | `notFound.{title,body,action}` keys |
| `src/presentation/**` (≈20 files) | Modify | Drop `as Href` casts on **static** route literals |

---

## Implementation Phases

### Phase 0 — Navigation hygiene

#### Task 0.1: Delete orphan screen
**File**: `src/presentation/nutrition/screens/NutritionSoonScreen.tsx` — delete.
Pre-check (already confirmed in audit): `grep -rn "NutritionSoonScreen" src app --include="*.tsx"`
returns only the file itself.

#### Task 0.2: Branded not-found body
**File**: `src/presentation/app/screens/NotFoundScreen.tsx`
```tsx
import { View } from "react-native";
import { router } from "expo-router";
import { Compass } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";
import { glass } from "@/presentation/_shared/design/glass";

export function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <EmptyState
        icon={<Compass size={30} color={glass.ink2} strokeWidth={1.75} />}
        title={t("notFound.title")}
        body={t("notFound.body")}
        action={<OnboardingButton title={t("notFound.action")} onPress={() => router.replace("/today")} />}
      />
    </View>
  );
}
```
> Confirm `ScreenBloom`/`OnboardingButton` import paths + `OnboardingButton`
> prop name (`title` vs `label`) against the existing usage before writing.

#### Task 0.3: Not-found route
**File**: `app/+not-found.tsx`
```tsx
import { NotFoundScreen } from "@/presentation/app/screens/NotFoundScreen";
export default function NotFoundRoute() {
  return <NotFoundScreen />;
}
```

#### Task 0.4: i18n keys
Add to `locales/{en,es}.json`:
```jsonc
"notFound": { "title": "...", "body": "...", "action": "..." }
```

---

### Phase 1 — Restore typed-route safety

`typedRoutes` is already on, so removing a cast on a **statically-known** route
makes TS validate it (a typo'd path becomes a compile error). Interpolated
template literals (`/workout/dia/${id}`) may still legitimately need the cast —
**keep those**; only remove where the typecheck stays green.

#### Task 1.1: Strip casts on static literals
Across `src/presentation/**`, change `router.push("/x" as Href)` →
`router.push("/x")` for static paths, e.g. `/settings`, `/agent`, `/today`,
`/programas`, `/programas/activo`, `/workout`, `/workout/rutinas`,
`/workout/sesion`, `/(auth)/login`, `/(tabs)/today`, `/(onboarding)`. Remove the
now-unused `Href` import where nothing else needs it. Same for `<Link href>`
props with static targets.

**Verification gate**: after each file, `npm run typecheck` must stay green. If a
removal errors (route not in generated types), restore the cast and note the
route — that surfaces a *real* typed-routes gap, not a cast to delete.

> Net effect: future path typos on static routes fail at compile time instead of
> 404-ing at runtime. Dynamic interpolations remain casted by necessity.

---

## Task Dependencies

```yaml
dependencies:
  0.1: []
  0.2: []
  0.3: [0.2]
  0.4: [0.2]
  1.1: []
```

---

## Risk Analysis

### Edge cases
- [ ] Unknown deep link (`/nope`) → `+not-found` instead of Expo default.
- [ ] Not-found reached while logged-out → `AuthGuard` still governs redirects (route is under the guarded root).

### Technical risks
- [ ] Phase 1: a cast removal that was load-bearing for a dynamic route → mitigated by the per-file typecheck gate (restore + flag).
- [ ] No endpoints/repos touched → `contract:coverage` and `architecture:check` should stay green; run to confirm.

---

## Testing Strategy

- **Regression**: existing suites unaffected (Phase 0/1 are additive/mechanical).
- **Manual (simulator)**:
  1. Navigate to a bogus path (`/nope`) → branded not-found → "back to Today" returns to `/today`.
  2. Smoke-test a few re-typed navigations (settings, agent, programas) still push correctly.

---

## Done Criteria

### Phase 0
- [ ] `grep -rn "NutritionSoonScreen" src app` → no matches (file deleted)
- [ ] `app/+not-found.tsx` exists and renders `NotFoundScreen`; a bogus path shows the glass screen and "back to Today" works
- [ ] `notFound.{title,body,action}` present in both `en.json` and `es.json`

### Phase 1
- [ ] No `as Href` cast remains on a **static** route literal (interpolated ones may remain)
- [ ] `npm run typecheck` passes (proves remaining static routes resolve in generated types)

### Overall
- [ ] `npm run typecheck` ✅
- [ ] `npm run lint` ✅ (includes `architecture:check` + `contract:coverage`)
- [ ] `npm test` ✅
- [ ] No `TODO`/`FIXME`/`HACK` in new code
- [ ] No layer violations

---

## Verification

```bash
npm run typecheck && npm run lint && npm test
```
Then on simulator: `npx expo start` → run the 2 manual flows above.

---

## Not in this plan (tracked elsewhere)

- **HealthKit micro-write sync** (weight/water/steps from Apple Health → platform):
  belongs to the `health` module + `docs/health-sync-endpoints-spec.md`. The
  existing `LogWeight/LogWater/LogStepsUseCase` + repos are that write path and
  are intentionally left untouched.
