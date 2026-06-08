# Implementation Plan: Empty-State Completion (all routes)

**Date**: 2026-06-08
**Status**: Draft

---

## Overview

Close the empty-state gaps surfaced by the route audit: one **necessary** cold-start
gap (RutinasScreen browse mode), a set of **defensive** inline section gaps in detail
screens (anomalous API data → silently blank sections), and **consistency** polish
(SessionsScreen → shared `EmptyState`; chart robustness for sparse data). No route is
broken today; this hardens the long tail.

## Requirements

- [ ] **R1 (necessary)** — `workout/rutinas` shows a cold-start empty state when the library has 0 routines in browse mode (no filters active).
- [ ] **R2 (defensive)** — Workout detail screens (`dia/[id]`, `rutinas/[id]`, `sesiones/[id]`) render an inline notice instead of a blank gap when their primary collection is empty.
- [ ] **R3 (defensive)** — Nutrition detail screens (`dieta/[id]`, `comida/[id]`, `diario/[date]`) render an inline notice instead of silently skipping their content section(s).
- [ ] **R4 (consistency)** — `settings/sessions` renders the shared `EmptyState` primitive (matching ConnectedAppsScreen) instead of a bare `Text`.
- [ ] **R5 (robustness)** — `progress/medida/[metric]` chart does not crash on empty/single-point series; add a "no records yet" notice where the records card would be.
- [ ] **R6 (optional)** — `MetricasView` renders a defensive fallback if every metric group is empty (parent already gates this; lowest priority).
- [ ] All new copy added to **both** `locales/en.json` and `locales/es.json`.
- [ ] Quality gates pass: `typecheck`, `lint` (incl. architecture/contract), `test`.

---

## Approach Analysis

### Option A: Inline ad-hoc empty cards per screen

**Description**: Replicate the existing `GlassSurface` + icon + text card (as in
RutinasScreen `noResults`, nutrition `dietas` empty) directly in each screen.

**Pros**: Zero new abstractions; matches code already present.
**Cons**: ~6 near-identical inline blocks → drift risk; harder to test uniformly.
**Complexity**: Low.

### Option B: One shared inline primitive + reuse `EmptyState` for full-screen empties

**Description**: Two distinct shapes for two distinct needs:
- **Full-screen empty** (centered, `flex:1`): keep using the existing
  `EmptyState` primitive → used for `SessionsScreen` (R4).
- **Inline section gap** (compact glass row, mid-scroll under a populated hero):
  introduce a small `SectionEmptyNotice` component → used for R2/R3/R5.
- **RutinasScreen browse empty (R1)**: mirror the *existing* `noResults` inline card
  in the same file (it already sits mid-scroll under the search/filter UI), for visual
  parity with the filter-empty state right beside it.

**Pros**: One source of truth for the inline shape; testable; matches each context's
layout (the shared `EmptyState` is `flex:1`-centered and is wrong for a mid-scroll gap).
**Cons**: One new shared component file.
**Complexity**: Low–Medium.

### Recommendation

**Option B.** The shared `EmptyState` is a centered full-screen block — correct for
SessionsScreen, wrong for the detail-screen mid-scroll gaps. A dedicated compact
`SectionEmptyNotice` removes the drift risk of Option A while respecting that the two
situations need two layouts. RutinasScreen's browse-empty deliberately reuses its own
file's `noResults` card so the two empties (no-library vs no-results) read identically.

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/presentation/_shared/components/SectionEmptyNotice.tsx` | Create | Compact inline empty-section notice (glass row: icon + line) |
| `locales/en.json` | Modify | Add R1–R5 copy keys (EN) |
| `locales/es.json` | Modify | Add R1–R5 copy keys (ES) |
| `src/presentation/training/screens/RutinasScreen.tsx` | Modify | R1: browse-mode cold-start empty card |
| `src/presentation/training/screens/DiaDetalleScreen.tsx` | Modify | R2: notice when 0 exercises (non-rest) |
| `src/presentation/training/screens/RutinaDetalleScreen.tsx` | Modify | R2: notice when 0 days |
| `src/presentation/training/screens/SesionDetalleScreen.tsx` | Modify | R2: notice when 0 exercises |
| `src/presentation/nutrition/screens/DietDetailScreen.tsx` | Modify | R3: notice when 0 meals |
| `src/presentation/nutrition/screens/MealDetailScreen.tsx` | Modify | R3: single notice when 0 items AND 0 supplements |
| `src/presentation/nutrition/screens/DiaryDayScreen.tsx` | Modify | R3: notice when 0 meals logged |
| `src/presentation/settings/screens/SessionsScreen.tsx` | Modify | R4: swap bare Text → `EmptyState` |
| `src/presentation/progress/screens/MeasureDetailScreen.tsx` | Modify | R5: "no records" notice |
| `src/presentation/progress/components/MeasureChart.tsx` | Read/Guard | R5: verify/harden empty/single-point handling |
| `src/presentation/progress/components/MetricasView.tsx` | Modify (opt.) | R6: all-groups-empty fallback |
| `src/presentation/_shared/components/__tests__/SectionEmptyNotice.test.tsx` | Create | Unit test for the primitive |
| `src/presentation/training/screens/__tests__/RutinasScreen.test.tsx` | Modify | R1 test |
| `src/presentation/settings/screens/__tests__/SessionsScreen.test.tsx` | Modify | R4 test |
| `src/presentation/training/screens/__tests__/{DiaDetalle,RutinaDetalle,SesionDetalle}Screen.test.tsx` | Modify | R2 tests |

---

## Implementation Phases

### Phase 1: Shared primitive + i18n

#### Task 1.1: Create `SectionEmptyNotice`
**File**: `src/presentation/_shared/components/SectionEmptyNotice.tsx`
```tsx
/**
 * SectionEmptyNotice — a compact inline "this section has nothing" row in the
 * glass language, for mid-scroll gaps inside an otherwise-populated screen
 * (a detail hero is already painted above). Distinct from EmptyState, which is
 * the centered, flex:1 full-screen blank-slate.
 */
import { View, Text } from "react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { mono } from "@/presentation/_shared/design/fonts";

type Props = { icon?: React.ReactNode; text: string };

export function SectionEmptyNotice({ icon, text }: Props) {
  return (
    <GlassSurface
      radius={16}
      style={{ padding: 18, flexDirection: "row", alignItems: "center", gap: 10 }}
    >
      {icon != null && <View>{icon}</View>}
      <Text
        style={{
          flex: 1,
          fontFamily: mono(400),
          fontSize: 12.5,
          lineHeight: 18,
          color: glass.ink2,
        }}
      >
        {text}
      </Text>
    </GlassSurface>
  );
}
```

#### Task 1.2: Add i18n keys (EN + ES)
**File**: `locales/en.json` — add inside the matching namespaces:
- `training.routineLibrary.emptyLibrary` = `"No routines yet"`
- `training.routineLibrary.emptyLibraryBody` = `"When verxion builds your first routine it'll show up here."`
- `training.dayDetail.noExercises` = `"No exercises scheduled for this day."`
- `training.routineDetail.noDays` = `"This routine has no days configured yet."`
- `training.sessionDetail.noExercises` = `"No exercises were logged in this session."`
- `nutrition.dietDetail.noMeals` = `"This diet has no meals yet."`
- `nutrition.mealDetail.noItems` = `"This meal has no foods yet."`
- `nutrition.diaryDay.noMeals` = `"No meals logged this day."`
- `progress.measure.noRecords` = `"No records for this period yet."`

**File**: `locales/es.json` — same keys:
- `training.routineLibrary.emptyLibrary` = `"Aún no hay rutinas"`
- `training.routineLibrary.emptyLibraryBody` = `"Cuando verxion arme tu primera rutina aparecerá aquí."`
- `training.dayDetail.noExercises` = `"Sin ejercicios en este día."`
- `training.routineDetail.noDays` = `"Esta rutina aún no tiene días configurados."`
- `training.sessionDetail.noExercises` = `"No se registraron ejercicios en esta sesión."`
- `nutrition.dietDetail.noMeals` = `"Esta dieta aún no tiene comidas."`
- `nutrition.mealDetail.noItems` = `"Esta comida aún no tiene alimentos."`
- `nutrition.diaryDay.noMeals` = `"No registraste comidas este día."`
- `progress.measure.noRecords` = `"Aún no hay registros para este periodo."`

> Keep keys alphabetically/locally consistent with neighbours; both files must stay
> structurally identical (same key set).

---

### Phase 2: R1 — RutinasScreen browse-mode empty (necessary)

#### Task 2.1: Add cold-start empty branch
**File**: `src/presentation/training/screens/RutinasScreen.tsx` (the non-filtering
`else` branch, currently lines 450–480). `Sparkles` is already imported.

Change the `view.filtering ? (...) : (<>{sections.map(...)}</>)` so the else-branch
first checks an empty library:
```tsx
) : data.routines.length === 0 ? (
  <GlassSurface radius={18} style={{ padding: 26, alignItems: "center", gap: 8 }}>
    <Sparkles size={24} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
    <Text style={{ fontFamily: sans(700), fontSize: 15, color: glass.white }}>
      {t("training.routineLibrary.emptyLibrary")}
    </Text>
    <Text
      style={{
        fontFamily: mono(400),
        fontSize: 12,
        color: glass.ink2,
        textAlign: "center",
      }}
    >
      {t("training.routineLibrary.emptyLibraryBody")}
    </Text>
  </GlassSurface>
) : (
  <>
    {sections.map(/* unchanged */)}
    {view.groups.completed.length > 0 && (/* unchanged */)}
  </>
)
```
`AskAgentSurface` (line 483) already renders below → it supplies the "ask verxion" CTA.

---

### Phase 3: R2/R3 — detail-screen inline notices (defensive)

For each, import `SectionEmptyNotice` and a lucide icon already used nearby.

#### Task 3.1: DiaDetalleScreen — 0 exercises (non-rest)
**File**: `src/presentation/training/screens/DiaDetalleScreen.tsx` (lines 181–189).
Replace the bare `.map` wrapper:
```tsx
<View style={{ gap: 8 }}>
  {data.exercises.length === 0 ? (
    <SectionEmptyNotice
      icon={<Dumbbell size={16} color={glass.ink3} strokeWidth={2} />}
      text={t("training.dayDetail.noExercises")}
    />
  ) : (
    data.exercises.map((ex) => (
      <DayExerciseCard key={ex.exerciseId} exercise={ex} type={data.header.type} />
    ))
  )}
</View>
```
(Use an icon already imported in the file; if none fits, add `Dumbbell` from lucide.)

#### Task 3.2: RutinaDetalleScreen — 0 days
**File**: `src/presentation/training/screens/RutinaDetalleScreen.tsx` (lines 202–206).
Same ternary pattern around `data.days.map`, text `training.routineDetail.noDays`.

#### Task 3.3: SesionDetalleScreen — 0 exercises
**File**: `src/presentation/training/screens/SesionDetalleScreen.tsx` (lines 228–235).
Same pattern around `data.exercises.map`, text `training.sessionDetail.noExercises`.

#### Task 3.4: DietDetailScreen — 0 meals
**File**: `src/presentation/nutrition/screens/DietDetailScreen.tsx` (lines 174–183).
Convert `{meals.length > 0 && (...)}` into a ternary; when empty render a
`SectionEmptyNotice` (keep the `daySpine` SectionLabel above it), text
`nutrition.dietDetail.noMeals`.

#### Task 3.5: MealDetailScreen — 0 items AND 0 supplements
**File**: `src/presentation/nutrition/screens/MealDetailScreen.tsx` (lines 229–260).
Leave the two existing `length > 0` sections as-is, then append a single fallback so an
empty meal isn't headerless below the hero:
```tsx
{data.items.length === 0 && data.supplements.length === 0 && (
  <SectionEmptyNotice
    icon={<UtensilsCrossed size={16} color={glass.ink3} strokeWidth={2} />}
    text={t("nutrition.mealDetail.noItems")}
  />
)}
```

#### Task 3.6: DiaryDayScreen — 0 meals logged
**File**: `src/presentation/nutrition/screens/DiaryDayScreen.tsx` (lines 185–224).
Convert `{meals.length > 0 && (...)}` to a ternary; when empty render a
`SectionEmptyNotice`, text `nutrition.diaryDay.noMeals`. The consumed/target hero
above already renders, so this only fills the gap where the meals list would be.

---

### Phase 4: R4 — SessionsScreen consistency

#### Task 4.1: Swap bare Text → `EmptyState`
**File**: `src/presentation/settings/screens/SessionsScreen.tsx` (lines 113–116).
Mirror ConnectedAppsScreen (lines 117–123). Import `EmptyState` and a lucide icon
(`MonitorSmartphone` or `ShieldCheck`):
```tsx
{items.length === 0 ? (
  <View style={{ paddingTop: 48 }}>
    <EmptyState
      icon={<MonitorSmartphone size={30} color={glass.ink2} strokeWidth={1.6} />}
      title={t("settings.screens.sessions.empty")}
    />
  </View>
) : (
  /* unchanged */
)}
```
Reuse the existing `settings.screens.sessions.empty` key (no new copy needed).

---

### Phase 5: R5/R6 — progress robustness (lower priority)

#### Task 5.1: Harden `MeasureChart` for sparse data
**File**: `src/presentation/progress/components/MeasureChart.tsx` (read first).
Confirm `values.length === 0` and `=== 1` don't divide-by-zero / produce NaN Skia
paths. If unguarded, early-return a flat baseline or null for `length <= 1`.

#### Task 5.2: MeasureDetailScreen — "no records" notice
**File**: `src/presentation/progress/screens/MeasureDetailScreen.tsx` (lines 160–176).
Convert `{data.records.length > 0 && (...)}` to a ternary; when empty render a
`SectionEmptyNotice` (text `progress.measure.noRecords`) where the records card sits.

#### Task 5.3 (optional): MetricasView all-groups-empty fallback
**File**: `src/presentation/progress/components/MetricasView.tsx` (after line 38).
If `byGroup.length === 0`, render a single `SectionEmptyNotice`. Note: the parent
`ProgresoScreen` already gates the Métricas tab on `dataState !== "empty"`, so this is
defensive only — implement last, skip if it complicates the layout.

---

### Phase 6: Tests

#### Task 6.1: SectionEmptyNotice unit test
**File**: `src/presentation/_shared/components/__tests__/SectionEmptyNotice.test.tsx`
Render with a `text` prop, assert the text node is present.

#### Task 6.2: RutinasScreen R1 test
**File**: `src/presentation/training/screens/__tests__/RutinasScreen.test.tsx`
Add a case: mock `getRoutineLibrary.execute` to resolve a fixture with
`routines: []`, empty groups, empty results; assert
`getByText("training.routineLibrary.emptyLibrary")`. (The mocked `t` returns the key.)

#### Task 6.3: SessionsScreen R4 test
**File**: `src/presentation/settings/screens/__tests__/SessionsScreen.test.tsx`
Add a case: sessions resolve to `{ items: [], total: 0 }`; assert
`getByText("settings.screens.sessions.empty")` still renders (now via EmptyState).

#### Task 6.4: Detail-screen R2/R3 tests
Extend `DiaDetalleScreen.test.tsx`, `RutinaDetalleScreen.test.tsx`,
`SesionDetalleScreen.test.tsx`: resolve a fixture variant with the relevant collection
emptied; assert the new notice key renders. (Nutrition screens have no `__tests__` yet —
add only if a fixture is trivially derivable; otherwise rely on the segment tests +
manual check.)

---

## Task Dependencies

```yaml
dependencies:
  1.1: []
  1.2: []
  2.1: [1.2]
  3.1: [1.1, 1.2]
  3.2: [1.1, 1.2]
  3.3: [1.1, 1.2]
  3.4: [1.1, 1.2]
  3.5: [1.1, 1.2]
  3.6: [1.1, 1.2]
  4.1: [1.2]
  5.1: []
  5.2: [1.1, 1.2]
  5.3: [1.1, 1.2]
  6.1: [1.1]
  6.2: [2.1]
  6.3: [4.1]
  6.4: [3.1, 3.2, 3.3]
```

---

## Risk Analysis

### Edge Cases
- [ ] `data.routines.length === 0` but a stale filter is active → handled: the
      `view.filtering` branch wins first; empty-library card only shows in browse mode.
- [ ] MealDetail with items but no supplements (or vice-versa) → unchanged; the
      combined fallback only fires when **both** are empty.
- [ ] MeasureChart with a single data point → Task 5.1 guards NaN/divide-by-zero.
- [ ] i18n key drift → en.json and es.json must end with identical key sets.

### Technical Risks
- [ ] **Low** — all changes are additive presentation-layer branches; no domain/
      application/infrastructure edits, so `architecture:check` and `contract:coverage`
      are unaffected.
- [ ] No new DI keys, no new endpoints → contract registry untouched.

---

## Testing Strategy

- Unit: SectionEmptyNotice (6.1), RutinasScreen empty (6.2), SessionsScreen empty (6.3),
  detail screens empty (6.4).
- Manual: run the app, force-empty fixtures or a fresh account, visit
  `workout/rutinas` (no routines) and `settings/sessions` (single/no session).
- Regression: existing screen tests must still pass (the populated paths are unchanged).

---

## Done Criteria

### Phase 1
- [ ] `SectionEmptyNotice.tsx` exists and imports only `_shared/design` + GlassSurface.
- [ ] All 9 new keys present in BOTH `locales/en.json` and `locales/es.json`; key sets identical: `node -e "const a=require('./locales/en.json'),b=require('./locales/es.json');const f=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'?f(v,p+k+'.'):[p+k]);const A=new Set(f(a)),B=new Set(f(b));console.log([...A].filter(x=>!B.has(x)),[...B].filter(x=>!A.has(x)))"` → prints `[] []`.

### Phase 2 (R1)
- [ ] `workout/rutinas` with an empty library (browse mode) shows `emptyLibrary` copy, not a blank scroll.

### Phase 3 (R2/R3)
- [ ] Each of the 6 detail screens renders a `SectionEmptyNotice` (not a blank gap) when its collection is empty.

### Phase 4 (R4)
- [ ] `settings/sessions` empty renders via the `EmptyState` primitive (icon sphere + title), matching ConnectedAppsScreen.

### Phase 5 (R5/R6)
- [ ] `MeasureChart` renders without crashing for `values=[]` and `values=[x]`.
- [ ] MeasureDetail empty period shows `noRecords` notice.

### Overall
- [ ] `npm run typecheck` → 0 errors.
- [ ] `npm run lint` → passes (incl. `architecture:check` + `contract:coverage`).
- [ ] `npm test` → all green, including new cases 6.1–6.4.
- [ ] No TODO/FIXME/HACK in new code.
- [ ] No layer-boundary violations (presentation-only changes).

---

## Verification

Package manager: **npm** (`package-lock.json`).

```bash
npm run typecheck && npm run lint && npm test
```

Then manual: `npx expo start`, open `workout/rutinas` (empty), `settings/sessions`
(no other sessions), and a measure detail with no period records.
