# Implementation Plan: Nutrición · Dietas (diet library)

**Date**: 2026-06-07
**Status**: Approved (full-auto)
**Phase**: 1 of 8 (Nutrición curated read-models)

---

## Overview

Replace the `NutritionSoonScreen` placeholder at `app/(tabs)/nutrition/dietas.tsx`
with a real, read-only **Dietas** library screen that consumes the curated native
read-model `GET /api/v1/nutrition/diet-library` (`operationId: getDietLibrary`,
tag `Nutrition`). Mirror of Entreno's "Todas las rutinas". The agent creates/activates
diets — the UI only reads; every write affordance is framed as "ask the agent".

## Requirements

- [ ] Consume the **curated** read-model `/nutrition/diet-library` (NOT generic `/diet-plans`).
- [ ] Re-cable the wrong existing `INutritionPort.getDietPlans()` → `/diet-plans`; replace
      with `getDietLibrary(): Promise<DietLibrary>` matching the read-model 1:1.
- [ ] Active diet → large `DietCard`; non-active (completed/paused/draft) → compact `DietRow`,
      sectioned ("En curso" / "Archivo").
- [ ] Client-side search + sort (pure, read-only) per handoff `dietas-core.jsx`.
- [ ] Ask-agent CTA (no write buttons). All tappable cards navigate to `dieta/[id]`.
- [ ] i18n es/en; es-ES number formatting via `nutrition/lib/format.ts` (no `Intl`).
- [ ] Contract-drift test registers `/nutrition/diet-library`.
- [ ] `typecheck && lint && test` green; no layer violations.

---

## Approach Analysis

### Option A — Replace `getDietPlans` with `getDietLibrary` (recommended)
Drop the unused generic `getDietPlans()` UC/port-method/`DietPlan` model (no UI consumes
them — only the Plan segment's `getDietDashboard` is live) and introduce `getDietLibrary()`
returning the curated `DietLibrary` read-model. Clean, no dead code, matches the
"curated read-models only" convention.

**Pros**: no dead generic endpoint; 1:1 with contract; less surface to maintain.
**Cons**: touches container + an existing UC test (delete it).
**Complexity**: Low.

### Option B — Add `getDietLibrary` alongside `getDietPlans`
Keep both. Faster diff, but leaves a wrong/unused generic endpoint wired — contradicts
the convention and invites future misuse.

**Pros**: smaller diff.
**Cons**: dead + wrong endpoint retained; drift risk.
**Complexity**: Low.

### Recommendation
**Option A.** The generic `/diet-plans` methods are unused and point at the wrong
endpoint family; removing them is the whole point of this re-cabling.

---

## Reconciliation (API is source of truth)

`DietLibrary = { diets: DietLibraryItem[], facets: { states: string[], goals: string[] } }`

`DietLibraryItem`: `id, name, state(active|draft|paused|completed), goal(string|null),
mealCount, proteinGoal, targets{kcal,protein,carbs,fat}, week(int|null), weeks(int|null),
weekFraction(0..1|null), scoreState(ahead|on|behind), score(number|null),
adherence(number|null), endDate(string|null)`.

| Handoff field | Source | Class |
|---|---|---|
| name, state, week, weeks, scoreState, score, adherence | direct | 🟢 |
| kcalGoal / pGoal | `targets.kcal` / `targets.protein` | 🟢 |
| `hasta {finished}` (archive row) | `endDate` (nullable → hide if null) | 🟢 |
| week cells | reuse `DietWeekBar` (week/weeks) or `weekFraction` | 🟢 |
| `macroSplit` ("N comidas · P g proteína") | derive `mealCount` + `proteinGoal` | 🟡 |
| goal color/icon/tag | map `goal` token via existing `goalLabel`; visual cfg w/ fallback | 🟡 |
| search/sort | pure client-side over `diets[]` | 🟡 |
| goal/state filter chips | `facets` (optional v1; group-by-state is enough) | 🟠 defer |
| `note`, `created`, `days` per diet | NOT in read-model → drop (live in detail) | 🟠 drop |

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/domain/nutrition/models/DietLibrary.ts` | Create | `DietLibrary`, `DietLibraryItem`, `DietState`, reuse `MacroSet` |
| `src/domain/nutrition/ports/INutritionPort.ts` | Modify | Remove `getDietPlans`; add `getDietLibrary(): Promise<DietLibrary>` |
| `src/domain/nutrition/index.ts` | Modify | Export new model (if barrel exists) |
| `src/application/nutrition/GetDietLibraryUseCase.ts` | Create | Thin UC → `port.getDietLibrary()` |
| `src/application/nutrition/GetDietPlansUseCase.ts` | Delete | Generic endpoint removed |
| `src/application/nutrition/__tests__/GetDietLibraryUseCase.test.ts` | Create | UC delegation test |
| `src/infrastructure/repositories/HttpNutritionRepository.ts` | Modify | Replace `getDietPlans` body with `getDietLibrary` → `GET /nutrition/diet-library` |
| `src/infrastructure/di/container.ts` | Modify | Swap `getDietPlans` UC for `getDietLibrary` |
| `src/infrastructure/api/__tests__/contractDrift.test.ts` | Modify | Register `/nutrition/diet-library` |
| `src/presentation/nutrition/keys.ts` | Modify | Add `nutritionKeys.dietLibrary()` |
| `src/presentation/nutrition/hooks/useDietLibrary.ts` | Create | TanStack Query hook |
| `src/presentation/nutrition/lib/dietGoalVisual.ts` | Create | goal token → {color,bg,glow,icon,tag} w/ fallback |
| `src/presentation/nutrition/lib/dietLibraryFixture.ts` | Create | Typed fixture (active + completed + empty) |
| `src/presentation/nutrition/screens/DietasScreen.tsx` | Create | Screen: states (loading/error/empty/list) |
| `src/presentation/nutrition/components/DietCard.tsx` | Create | Large active-diet card (reuse `DietWeekBar`/`ScoreChip`) |
| `src/presentation/nutrition/components/DietRow.tsx` | Create | Compact archive row |
| `src/presentation/nutrition/components/DietSearchBar.tsx` | Create | Search input (controlled) |
| `src/presentation/nutrition/components/DietSortSheet.tsx` | Create | Sort bottom sheet |
| `src/presentation/nutrition/components/DietasSkeleton.tsx` | Create | Loading skeleton |
| `src/presentation/nutrition/components/DietasAskAgent.tsx` | Create | Ask-agent CTA |
| `src/presentation/nutrition/lib/dietSort.ts` | Create | Pure filter+sort (testable) |
| `app/(tabs)/nutrition/dietas.tsx` | Modify | Render `DietasScreen` (3-5 lines) |
| `src/presentation/nutrition/components/__tests__/DietCard.test.tsx` | Create | Render test |
| `src/presentation/nutrition/lib/__tests__/dietSort.test.ts` | Create | Sort/filter unit tests |
| `locales/es.json`, `locales/en.json` | Modify | `nutrition.dietas.*` keys |

---

## Implementation Phases

### Phase 1: Domain
- **Task 1.1** — `DietLibrary.ts`: `DietState = "active"|"draft"|"paused"|"completed"`;
  `DietLibraryItem` (all fields above, nullable mirrored as `T | null`); `DietLibrary = { diets, facets }`.
  Reuse `MacroSet` from `NutritionDashboard.ts` for `targets`.
- **Task 1.2** — `INutritionPort.ts`: delete `getDietPlans`; add `getDietLibrary(): Promise<DietLibrary>`.

### Phase 2: Application
- **Task 2.1** — `GetDietLibraryUseCase` (`execute() → port.getDietLibrary()`); delete `GetDietPlansUseCase`.

### Phase 3: Infrastructure
- **Task 3.1** — `HttpNutritionRepository`: implement `getDietLibrary()` → `apiClient.get("/nutrition/diet-library")`
  (envelope unwrapped by apiClient, same as `getDietDashboard`); remove `getDietPlans`.
- **Task 3.2** — `container.ts`: replace `getDietPlans` key with `getDietLibrary: new GetDietLibraryUseCase(nutritionRepo)`.
- **Task 3.3** — `contractDrift.test.ts`: register `/nutrition/diet-library` GET.

### Phase 4: Presentation — plumbing
- **Task 4.1** — `keys.ts`: `dietLibrary: () => ["nutrition","dietLibrary"] as const`.
- **Task 4.2** — `useDietLibrary` hook (staleTime 60s, mirrors `useDietDashboard`).
- **Task 4.3** — `dietLibraryFixture.ts` (active + 2 completed + empty variant).
- **Task 4.4** — `dietGoalVisual.ts` + `dietSort.ts` (pure).

### Phase 5: Presentation — components
- **Task 5.1** — `DietCard` (reuse `DietWeekBar`, `ScoreChip`, `MacroRing`-free; macroSplit derived).
- **Task 5.2** — `DietRow`, `DietSearchBar`, `DietSortSheet`, `DietasAskAgent`, `DietasSkeleton`.

### Phase 6: Screen + route + i18n
- **Task 6.1** — `DietasScreen` (header + lead count + search + sort + grouped lists + ask-agent;
  pull-to-refresh via `GlassRefreshControl`; loading/error/empty states; nav → `/nutrition/dieta/{id}`).
- **Task 6.2** — `app/(tabs)/nutrition/dietas.tsx` renders `DietasScreen`.
- **Task 6.3** — i18n `nutrition.dietas.*` es/en.

---

## Task Dependencies

```yaml
dependencies:
  1.1: []
  1.2: [1.1]
  2.1: [1.2]
  3.1: [1.2]
  3.2: [2.1, 3.1]
  3.3: []
  4.1: []
  4.2: [2.1, 4.1]
  4.3: [1.1]
  4.4: [1.1]
  5.1: [4.3, 4.4]
  5.2: [4.3, 4.4]
  6.1: [4.2, 5.1, 5.2]
  6.2: [6.1]
  6.3: [6.1]
```

---

## Risk Analysis

### Edge Cases
- [ ] `diets: []` → empty state (only the ask-agent CTA + invite copy).
- [ ] No `active` diet (all completed) → skip "En curso" section.
- [ ] `endDate` null on a completed diet → hide "hasta" meta.
- [ ] `goal` null / unknown token → fallback visual cfg + generic label.
- [ ] `week`/`weeks` null → hide week cells (use `weekFraction` if present, else omit).
- [ ] `score`/`adherence` null → hide those chips.

### Technical Risks
- [ ] Removing `getDietPlans` must not break the container type or any import (verify none remain).
- [ ] Envelope: confirm apiClient unwraps `{ data }` (matches `getDietDashboard`).
- [ ] Hermes Intl: use `nInt` for kcal; no `toLocaleString`.

---

## Testing Strategy
- Unit: `dietSort` (filter by name/goal, sort recientes/nombre/adherencia/kcal); `GetDietLibraryUseCase` delegation.
- Component: `DietCard` renders name + derived macroSplit + week cells from fixture.
- Manual (device, user-side post-run): tab → library button → Dietas; search/sort; tap → detail route.

---

## Done Criteria

### Engine
- [ ] `getDietLibrary` returns `DietLibrary` from `/nutrition/diet-library`: repo method present, no `getDietPlans` left (`grep -r getDietPlans src` empty).
- [ ] `contractDrift.test.ts` covers `/nutrition/diet-library` (green with sibling contract).

### UI
- [ ] `app/(tabs)/nutrition/dietas.tsx` renders `DietasScreen` (no `NutritionSoonScreen`).
- [ ] Active diet → `DietCard`; completed → `DietRow`, grouped sections.
- [ ] Search + sort work on fixture; empty + no-results states render.
- [ ] Zero write surfaces; ask-agent CTA + card tap → `/nutrition/dieta/{id}`.
- [ ] i18n es/en complete; no raw keys.

### Overall
- [ ] `npm run typecheck && npm run lint && npm test` green.
- [ ] No TODO/FIXME in new code.
- [ ] No architecture layer violations.
