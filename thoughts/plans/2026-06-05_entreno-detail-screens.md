# Implementation Plan: Entreno Detail Screens (7 subroutes)

**Date**: 2026-06-05
**Status**: Draft
**Branch**: feat/design-system
**Predecessor**: Entreno landing (3 segments) — done. This plan fills the 7 `WipBody` placeholders.

---

## Overview

Replace the 7 `WipBody` placeholders under `app/(tabs)/workout/*` with hi-fi screens
matching `design_handoff_entreno/`, following the **contract-driven, STUB+fixture**
method already validated on the landing (dashboard / feed / library): the client
defines the presentation-shaped aggregate it needs (typed view model + fixture), the
repo serves the fixture as a STUB with a documented proposed endpoint, and that shape
becomes the backend contract proposal. Read-only throughout — every edit/start/adjust
CTA navigates to the **Agent tab** (`/agent`), never writes.

## Requirements

- [ ] All 7 detail screens render the handoff design at hi-fi parity (loading / error / empty / data states)
- [ ] Each screen is **contract-driven**: a typed view aggregate in `domain/training/models/` + a fixture in `__fixtures__/` + a STUB repo method with a proposed endpoint comment
- [ ] Routes are **id-based** (`rutinas/[id]`, `dia/[id]`, `sesiones/[id]`, `ejercicio/[id]`); `prescripcion`/`sesion` resolve today/active
- [ ] Read-only: no writes. All edit/adjust/correct/start CTAs route to `/agent`
- [ ] Architecture compliant: domain pure, UCs via `useDI`, routes 3–5 lines, screens thin
- [ ] Each screen has a render test (data + skeleton), like the landing segments
- [ ] i18n: all copy in `locales/{en,es}.json` under the `training` namespace
- [ ] `npm run typecheck && npm run lint && npm test` green after each phase

---

## Approach Analysis

The central tension surfaced in research: **the handoff invents rich, denormalized,
presentation-ready data** (per-day `focus`/`exerciseCount`/`estimate`/`status`,
per-exercise `last session`, `scoreState`, week-cell fractions, e1RM series, per-session
muscle distribution), but **the currently-wired real-HTTP training methods return raw,
normalized platform shapes** (`RoutineDetail = {routine, workoutDays[]}` with no
summaries; `WorkoutDayExercise[]` raw configs; etc.). There is also **no backend running
in dev** (`localhost:3000`), so any real-HTTP screen would spin/fail — which is exactly
why the landing uses STUBs.

### Option A — Presentation aggregate per screen (STUB + fixture), uniform

**Description**: For each detail screen, define a view-shaped aggregate in the training
domain, fixture it, STUB the repo method (proposed endpoint in a swap comment), wire
UC + hook, build the UI. Identical to the validated landing pattern. Where a rich real
model already exists (`SessionReport`, `LiveSessionProgress`), shape the aggregate to
mirror it so the eventual backend swap is a thin mapping.

**Pros**: One consistent pattern across all of Entreno; renders with no backend (works
for build-in-public / portfolio demo); the fixtures ARE the contract proposal; hi-fi
parity is achievable because the shape is designed for the UI; decoupled from whether
platform endpoints exist yet.
**Cons**: Introduces view-aggregate methods alongside the existing raw methods (the raw
methods become the documented server-side mapping source, temporarily unused on-device);
fixtures must be authored by hand.
**Complexity**: Medium.

### Option B — Build against existing real-HTTP endpoints + client-side enrichment

**Description**: Reuse `getRoutineDetail` / `getWorkoutDayExercises` / `getSessionReport`
/ `getLiveProgress` / `getExerciseDetail` (real HTTP) and enrich raw → view in the
repo/UC client-side.

**Pros**: No new contract surface; uses endpoints that may already exist on the platform.
**Cons**: **Won't render in dev** (no backend); raw endpoints **lack** much of what the
handoff shows (focus, estimate, last-session, scoreState, e1RM series, muscle
distribution) — can't reach parity without server changes anyway; mixes real-HTTP
(failing) with STUB (working) inconsistently; the enrichment logic would be throwaway
once the backend ships aggregate endpoints.
**Complexity**: High (and still blocked on backend for parity).

### Recommendation

**Option A.** It is the only path that (1) renders today with no backend, (2) reaches
hi-fi parity, and (3) stays consistent with the validated landing pattern while
producing a clean, screen-shaped contract proposal for backend. For
`Detalle de sesión` and `Sesión en marcha`, the aggregate mirrors the existing rich
`SessionReport` / `LiveSessionProgress` shapes so the backend swap is a thin remap, not a
new aggregation. Existing raw training methods (`getRoutineDetail`,
`getWorkoutDayExercises`, `getExerciseConfiguration`, `getProgressionPlan`, `getRoutines`)
are **retained** and referenced in each STUB's swap comment as the raw source the
aggregate composes from server-side; a final reconciliation note tracks them.

---

## Open Questions (resolve before Phases 5–7)

These do not block Phases 1–4. Recommended defaults in **bold**.

1. **`Sesión en marcha` scope.** The handoff's live session includes a close-flow
   (`sesion-cierre`) where the user rates effort/quality/pump + note — that is a **content
   write**, disallowed here. Options: **(a) build the live session as a read-only mirror
   (agent logs sets; "Cerrar/Valorar" CTA → `/agent`), drop the in-app feedback form**;
   (b) defer the whole screen until the Agent tab exists. Recommend **(a)**.
2. **"Empezar sesión" semantics (Prescripción → Sesión).** Starting a session is a write
   (the agent starts it). Options: **(a) "Empezar con el agente" → `/agent`**; (b) navigate
   to view the already-live session if one exists, else `/agent`. Recommend **(a)** for now,
   revisit when live-session state plumbing lands.
3. **`prescripcion` / `sesion` route params.** Add optional `?dayId=` / `?sessionId=` so
   they're addressable, **defaulting to "today's day" / "active session"** from the fixture
   when absent. Recommend yes.

---

## Files to Create/Modify (per phase; ~6–9 files each)

Pattern repeated per screen (X = screen):
| File | Action | Purpose |
|------|--------|---------|
| `src/domain/training/models/{X}View.ts` | Create | View aggregate type |
| `src/domain/training/__fixtures__/{x}ViewFixture.ts` | Create | Contract fixture |
| `src/domain/training/ports/ITrainingPort.ts` | Modify | Add `get{X}View()` |
| `src/infrastructure/repositories/HttpTrainingRepository.ts` | Modify | STUB method + proposed-endpoint comment |
| `src/application/training/Get{X}ViewUseCase.ts` | Create | Use case |
| `src/infrastructure/di/container.ts` | Modify | Wire UC |
| `src/presentation/training/hooks/use{X}.ts` | Create | TanStack Query hook |
| `src/presentation/training/components/{…}.tsx` | Create | Feature cards + skeleton |
| `src/presentation/training/screens/{X}Screen.tsx` | Modify | Replace WipBody with real body |
| `src/presentation/training/{hooks,components}/__tests__/…` | Create | Render + view-logic tests |
| `locales/{en,es}.json` | Modify | `training.*` copy |
| `app/(tabs)/workout/{route}.tsx` | Modify (if param) | id/param wiring (stays 3–5 lines) |

Reused as-is: `DetailScaffold`, `DetailHeader`, `GlassSurface`, `ScreenBloom`, `Chip`,
`IconBubble`, `Progress`, `Skeleton`, `ScoreChip`, `WeekBar`, `BottomSheet`, `SheetOption`,
`sans()/mono()`, `glass` tokens. Search/filter/sort + `BottomSheet` pattern reused from
`EjerciciosSegment`/`SesionesSegment`.

---

## Implementation Phases

> Each phase is a self-contained increment: domain → application → infrastructure →
> presentation → tests → quality gate → **device-verify with user** → commit. One screen
> per phase. Order chosen by reuse + user flow.

### Phase 1: Todas las rutinas (`rutinas/index`)

**View model `RoutineLibraryView`** — grouped library with search/filter/sort:
- `groups`: `{ active: RoutineCard[]; draft: RoutineCard[]; paused: RoutineCard[]; completed: RoutineRowItem[] }`
- `RoutineCard`: `{ id, name, goal, split, perWeek, week, weeks, weekFraction, scoreState, sessionsDone, sessionsPlanned, volumeTrendPct, type: DayType, contextLabel (created/last-trained), note: string|null }`
- `RoutineRowItem` (completed, compact): `{ id, name, goal, finishedLabel, sessionsDone, type }`
- `facets`: `{ states: BlockState[]; goals: string[] }`, `totalCount`
- Components: `RoutineLibraryCard`, `RoutineLibraryRow`, section headers, reuse `ScoreChip`,
  `WeekBar`-style cells, search input + Filtrar/Orden pills + `BottomSheet`/`SheetOption`.
- Hook: `useRoutineLibrary` (query) + `useRoutineLibraryView` (client search/filter/sort,
  reuse accent-insensitive `norm()`).
- STUB endpoint: `GET /training/routine-library` (maps from raw `GET /routines`).
- Screen wires card → `rutinas/[id]`; "Pídele al agente" → `/agent`.

#### Task 1.1: `RoutineLibraryView` model + fixture
#### Task 1.2: Port + STUB + UC + container wiring
#### Task 1.3: Hook(s) + components + screen + i18n + tests

### Phase 2: Detalle de rutina (`rutinas/[id]`)

**View model `RoutineDetailView`**:
- `header`: `{ id, name, goal, state: BlockState, contextLabel, perWeek, weeks, adherencePct|sessionsPlanned, volumeTotal, weekFraction, sessionsDone, sessionsPlanned, volumeTrendPct, scoreState }`
- `agentNote: string | null`
- `days: RoutineDayCard[]` — `{ dayId: string|null, dayOfWeek, name, type: DayType, focus, exercisesCount, setsCount, estimate, status: "done"|"now"|"up", isRest }`
- `sessionsBlockLabel` (link back to Entreno → Sesiones segment, filtered to this routine)
- Components: `RtHero` (or generalize `RoutineHero`), `RtDayCard` (reuse `WeekSpine` row idiom),
  `RtAgentNote` (reuse `AgentNoteCard`), skeleton.
- STUB endpoint: `GET /training/routines/{id}/detail` (maps from `GET /routines/{id}` + `/days`).
- Screen: day card → `dia/[id]`; today's day → `prescripcion?dayId=`; sessions link →
  Entreno Sesiones; "Activar/ajustar con el agente" → `/agent`. Param via `useLocalSearchParams<{id}>`.

#### Task 2.1: model + fixture (keyed by id) · #### Task 2.2: port/STUB/UC/DI · #### Task 2.3: hook/components/screen/i18n/tests

### Phase 3: Detalle de día (`dia/[id]`)

**View model `DayDetailView`**:
- `header`: `{ dayId, type: DayType, routineName, dayOrdinal (e.g. "día 1/6"), name, focus, estimate, exercisesCount, setsCount, volumeEstimate, isRest }`
- `agentNote: string | null` (only when "today")
- `exercises: DayExerciseItem[]` — `{ exerciseId, index, name, isKey, muscle, equipment, target, sets, repRange, rir, rest, lastResult: string|null, progression: string|null }`
- Rest-day variant (minimal card).
- Components: `DdHero`, `DdExCard`, rest-day card, skeleton.
- STUB endpoint: `GET /training/days/{id}/detail` (maps from `/days/{id}/exercises` + last-session lookup).
- Screen: exercise card → `ejercicio/[id]`; "Cambiar día con el agente" → `/agent`.

### Phase 4: Detalle de sesión (`sesiones/[id]`)

**View model `SessionDetailView`** — mirror existing `SessionReport`:
- `header`: `{ id, name, dateLong, type: DayType, routineName, completionClass ("Plan perfecto"|"Plan seguido"), completionPct, prCount }`
- `recap: string` (agent summary)
- `tiles`: `{ volume, duration, series, reps, peakWeight, avgRir }` (6 KPI tiles)
- `exercises: SessionExerciseItem[]` — `{ exerciseId, name, muscle, equipment, prescription, hasPR, sets: {disp, pr}[] }`
- `assessment: { effort, quality, pump } | null` (1–10)
- `note: string | null`
- `muscles: { name, volume, pct }[]`
- Components: `SdHero`, `SdTiles` (6-grid), `SdExercise` (set table), `SdAssess` (3 score tiles),
  `SdMuscles` (bars), skeleton.
- STUB endpoint: `GET /training/sessions/{id}/report` (thin map of existing `SessionReport`).
- Screen: exercise → `ejercicio/[id]`; "Corregir con el agente" → `/agent`.

### Phase 5: Prescripción del día (`prescripcion`)  *(resolve Q2, Q3)*

**View model `PrescriptionView`**:
- `header`: `{ dayId, type, routineName, week, weeks, name, focus, exercisesCount, setsCount, estimate, volumeEstimate }`
- `agentNote: string | null`
- `exercises: PrescriptionExerciseItem[]` — DayExerciseItem + optional `swap: { from, to, why } | null`
- `startCta` → `/agent` (per Q2 default)
- Components: reuse `DdExCard` + swap-note variant, skeleton.
- STUB endpoint: `GET /training/prescription/today?dayId=` (maps from `getExerciseConfiguration` + `getProgressionPlan`).
- Route: add optional `?dayId=`, default today.

### Phase 6: Detalle de ejercicio (`ejercicio/[id]`)  *(heaviest — Skia chart)*

**View model `ExerciseDetailView`**:
- `hero`: `{ exerciseId, name, target, equipment, part: ExercisePart, category, group, sinceLabel, isCustom }`
- `kpis`: `{ prLabel: string|null, e1rm, e1rmDeltaPct, bestVolume, volumeDeltaPct, logCount }`
- `series`: `{ e1rm: {value, label}[]; volume: {value, label}[] }` (chart data)
- `history: { date, topSet, hasPR, secondary, value, deltaPct }[]`
- `howTo`: `{ description, steps: string[] }` (+ anim slot placeholder)
- `muscles: { name, role: "primary"|"secondary"|"tertiary", pct }[]`
- `agentNote: string | null`
- Components: `XHero`, `XKpis`, metric toggle (e1RM|Volumen) reusing `SegmentedControl`,
  `ExChart` (**Skia area+line**, follow `GhostTimeline`/Skia rules — shared values in
  `useEffect`, gate motion behind `useReducedMotion`), `XHistRow`, how-to tab, `XMuscles`, skeleton.
- STUB endpoint: `GET /training/exercises/{id}/detail` (maps from `getExerciseDetail` +
  catalog detail + computed e1RM series).
- Screen: "Añadir a rutina / pedir progresión" → `/agent`.

### Phase 7: Sesión en marcha (`sesion`)  *(resolve Q1 first — read-only mirror)*

**View model `LiveSessionView`** — mirror existing `LiveSessionProgress` + handoff states:
- `state: "active"|"paused"|"rest"|"last"|"completed"`
- `header`: `{ name, routineName, dayName, elapsedSeconds, completedExercises, totalExercises, pct, syncLine: {message, agoSeconds} }`
- `kpis`: `{ volume, sets, reps, progressionLabel }`
- `current`: `{ name, target, status, sets: {n, w, reps, rir, vol, deltaDir}[], guide?, rest?, overload?, nextName? }`
- `done: {...}[]`, `pending: {...}[]`
- Read-only: live timer ticks (display only), agent logs sets; "Cerrar/Valorar" → `/agent`.
  **No in-app feedback write form** (per Q1 default). Drop `sesion-cierre` write flow.
- Components: `SessHeader` (timer), `KpiStrip`, `CurrentExercise` (set table + delta),
  `RestModule`, `NextGuide`, `SyncLine`, `DoneRow`, `PendingRow`, skeleton.
- STUB endpoint: `GET /training/sessions/active/live` (thin map of `LiveSessionProgress`).
- Route: add optional `?sessionId=`, default active.

---

## Task Dependencies

```yaml
dependencies:
  # Each phase: model/fixture (a) → port+UC+DI (b) → hook/components/screen/tests (c)
  1.1: []
  1.2: [1.1]
  1.3: [1.2]
  2.1: [1.3]   # sequential phases (shared files: ITrainingPort, container, locales)
  2.2: [2.1]
  2.3: [2.2]
  3.1: [2.3]
  3.2: [3.1]
  3.3: [3.2]
  4.1: [3.3]
  4.2: [4.1]
  4.3: [4.2]
  5.1: [4.3]
  5.2: [5.1]
  5.3: [5.2]
  6.1: [5.3]
  6.2: [6.1]
  6.3: [6.2]
  7.1: [6.3]
  7.2: [7.1]
  7.3: [7.2]
```

> Phases are sequenced (not parallel) because they share `ITrainingPort.ts`,
> `container.ts`, and `locales/*` — and because each ends in a device-verify+commit gate.
> Within a phase, tasks are strictly ordered a → b → c.

---

## Risk Analysis

### Edge Cases (per screen: loading / error / empty / data)
- [ ] Routine with no active block / fresh / archived-only → empty + grouping correctness
- [ ] Rest day in day-detail / spine → minimal variant, no exercise list
- [ ] Session with 0 PRs / no user note / no assessment → hide those sections
- [ ] Exercise with no logged sessions → `XEmptyProgress` (no chart), how-to still renders
- [ ] No active session (Phase 7) → empty state, not a spinner
- [ ] Unknown `[id]` param → error state via query error, `DetailHeader` back still works

### Technical Risks
- [ ] **Read-only integrity**: every edit/start/adjust/correct CTA must navigate to `/agent`
      — never a mutation. Audit each screen. (Highest-priority invariant.)
- [ ] **Skia chart (Phase 6)**: follow Reanimated/Skia rules (shared values in `useEffect`,
      `useReducedMotion` gate); Jest renders Skia as no-op View (mock already in place) so
      chart shape only verifiable on device.
- [ ] **Sesión en marcha write tension (Phase 7)**: the close-flow writes — must be dropped
      / routed to Agent (Q1). Do not introduce a logging form.
- [ ] **Raw vs view method duplication**: retained raw training methods are temporarily
      unused on-device; tracked in Reconciliation note, not silently abandoned.
- [ ] **Fixture realism**: fixtures double as the backend contract — keep field names and
      shapes implementable from the platform (cross-check against the MCP `verxion` tool
      shapes where relevant, e.g. `get_session_detail`, `get_exercise_performance_history`).

---

## Testing Strategy

- Unit (view logic): `useRoutineLibraryView` search/filter/sort; any client-side derivation
  (volume fractions, status computation, e1RM series selection by metric toggle).
- Render tests (per screen, like landing): data state renders key fields; skeleton state
  renders while loading; empty/error states render. Use `renderWithProviders` +
  `createMockContainer` returning the fixture.
- Mocks already present: reanimated, skia, expo-glass-effect, @gorhom/bottom-sheet.
- Manual (device, per phase): navigation in/out, back button, CTA → `/agent`, scroll,
  hi-fi parity vs screenshot, sheet open reliability (Phases 1/5 if sheets used).

---

## Done Criteria

### Per phase (1–7)
- [ ] `{X}View` model + fixture exist; fixture is layer-neutral (imports only domain types)
- [ ] `get{X}View` added to `ITrainingPort`, STUB returns fixture with proposed-endpoint comment, UC created + wired in `container.ts`
- [ ] Hook returns query; screen renders data / skeleton / empty / error (no infinite skeleton)
- [ ] Screen replaces `WipBody`; route file still 3–5 lines; param read via `useLocalSearchParams`
- [ ] Every edit/start/adjust CTA navigates to `/agent` (grep-verified: no mutation in screen)
- [ ] i18n keys added to `en.json` + `es.json`; no hardcoded user-facing strings
- [ ] Render test(s) pass for the screen
- [ ] `npm run typecheck && npm run lint && npm test` green
- [ ] `architecture-checker` PASS on changed files
- [ ] Device-verified with user; committed (conventional commit)

### Overall
- [ ] All 7 `WipBody` placeholders replaced
- [ ] No TODO/FIXME/HACK in new code
- [ ] Reconciliation note: disposition of retained raw training methods documented
- [ ] `thoughts/notes/2026-06-05_entreno-detail-screens.md` lessons captured

---

## Verification

PM = **npm** (package-lock.json).

After each phase:
1. `npm run typecheck`
2. `npm run lint`
3. `npm test`
4. Manual on simulator: open screen via its route, verify parity + back + CTA→`/agent`
5. `/devtronic:post-review --strict` at phase boundaries
6. Commit, then proceed to next phase
