# "Entreno · Todas las rutinas" — rationale, edge cases & API spec

> Architecture contract (fixed — see `CLAUDE.md` + `.claude/rules/architecture.md`):
> one screen → one aggregate read-model; the aggregate is a domain UC composing
> other UCs/repos (no MCP, no HTTP); all derivation server-side; response → Zod in
> `@verxion/shared` → OpenAPI → native codegen.
>
> Status: **draft for the API agent.** | Design ref: `design_handoff_entreno/screenshots/03-todas-las-rutinas.png`.
> Native built against the `getRoutineLibrary` STUB in `HttpTrainingRepository`
> (returns `routineLibraryFixture`; swap to HTTP is a one-line repo change).
> Design thesis: *"tu rutina activa y el archivo de bloques completados — solo lees; crear/activar lo hace el agente."*

---

## SCOPE

The **`rutinas/index` screen** ("Todas las rutinas"), reached from the landing
header library icon and the "Todas tus rutinas" link. A read-only library grouped
by state, with client-side search / filter / sort over a **single read**. Routine
*detail* is a separate (deferred) spec.

---

## 1. Endpoint(s)

```
GET /api/v1/training/routine-library        → 200  { data: RoutineLibrary }
```

- **Params:** none. Returns **all** the user's routines (any status) in catalog
  order + the filter facets. Search / filter / sort are **100% client-side** over
  this one read (the catalog is small — a handful of routines). No pagination in v1.
- **Requires** `tzOffsetMinutes` only for the active routine's `week`/`weekFraction`
  (same as the dashboard, §7-A); omitted ⇒ UTC.
- **Scope:** `workouts.read`.

---

## 2. Response shape (authoritative TS)

> Copy-paste from native `src/domain/training/models/RoutineLibrary.ts`. Example =
> `src/domain/training/__fixtures__/routineLibraryFixture.ts`. `DayType` / `ScoreState`
> are shared with `RoutineDashboard`.

> **Update (2026-06-07):** the backend evolutivo **removed `scoreState`** (the
> pace chip) from every read-model; the native client dropped the field, the
> `ScoreState` type and the `ScoreChip`. Lines below mentioning `scoreState`/pace
> are historical.

```ts
type RoutineLibraryState = "active" | "draft" | "paused" | "completed";

interface RoutineLibraryItem {
  id: string;
  name: string;
  state: RoutineLibraryState;       // maps from Routine.status (§5)
  goal: string;
  split: string;                    // "Push · Pull · Legs"
  perWeek: number;                  // 6
  type: DayType;                    // representative (first training day) — bubble color
  week: number;                     // 3   (current block week; completed → totalWeeks)
  weeks: number;                    // 6
  weekFraction: number | null;      // 0..1 active only; null otherwise
  sessionsDone: number;             // 14
  sessionsPlanned: number;          // 36
  volumeTrendPct: number;           // 8
  finishedLabel: string | null;     // "1 mar 2026" ⚠️ display-ready (§3); null when ongoing
}

interface RoutineLibraryFacets {
  states: RoutineLibraryState[];    // states present in the catalog (filter chips)
  goals: string[];                  // distinct goals present
}

interface RoutineLibrary {
  routines: RoutineLibraryItem[];   // catalog order (active first, then recency)
  facets: RoutineLibraryFacets;
}
```

---

## 3. Client vs. server — formatting split

| Field | Current fixture | Recommended | Notes |
|---|---|---|---|
| `name/goal/split` | raw | **raw** | verbatim |
| `state`, `type`, `scoreState` | enum | **raw enum** | client → label/icon/tint |
| `perWeek/week/weeks/sessions*/volumeTrendPct` | raw | **raw** | client formats |
| `weekFraction` | raw 0..1 | **raw** | client widths the cell |
| `finishedLabel` `"1 mar 2026"` | display-ready | **→ raw** ISO date `endDate` | client localizes (§8.1) |
| `facets.goals` | raw strings | **raw** | derived from the routines (could be client-derived — §8.2) |

**Fixed on the client:** bubble icons/colors, state eyebrow + score tints, week
cells, search/filter/sort behavior, all labels, the "ask the agent" surface.

---

## 4. Field → platform source mapping

| Aggregate field | Domain UC / repo | Exists? | Notes |
|---|---|---|---|
| `routines[]` base (`id,name,goal,status`) | `GetUserRoutinesUseCase` | ✓ | all statuses |
| `state` | map `Routine.status` → state enum | ✓ | §5 (ready→draft) |
| `split` / `type` | `GetWorkoutDaysByRoutineIdUseCaseImpl` (day types) | ✓ | per routine; representative = first training day |
| `perWeek` | engagement `weeklyFrequencyTarget` / `countWorkoutDays()` | ✓ | |
| `weeks` | `maxSessions`÷perWeek or `startDate/endDate` | ✓ | |
| `week`, `weekFraction` | week resolver (active only) | **NEW** | same as dashboard §5 |
| `scoreState` | pace classifier | **NEW** | same as dashboard §5 |
| `sessionsDone` | `GetCompletedSessionsCountForRoutineUseCase` | ✓ | **per routine, for ALL routines** (loop/batch) |
| `sessionsPlanned` | weekly target × weeks / `maxSessions` | ✓ | |
| `volumeTrendPct` | block-scoped volume trend | ✓/NEW | reuse longitudinal narrative per block |
| `finishedLabel` | `Routine.endDate` | ✓ | send ISO; client formats (§3) |
| `facets.states/goals` | distinct over `routines[]` | ✓ | trivially derivable server- or client-side |

> **Batch concern:** `sessionsDone` / adherence / volume are currently **per-routine**
> UCs. The library needs them for **every** routine → the aggregate must batch them
> (N routines). Flag for an efficient repo query rather than N round-trips (§7).

---

## 5. Server-computed business rules

| Rule | Definition | Lives in |
|---|---|---|
| `state` | `Routine.status` map: `ready→draft`, `active→active`, `paused→paused`, `completed→completed`; `deleted` excluded | aggregate UC |
| catalog order | active first, then by `lastTrained`/`startDate` desc | aggregate UC |
| `type` (representative) | first non-rest workout day's type | aggregate UC |
| `week`/`weekFraction`/`scoreState` | as dashboard §5 (active routine only; completed → `week=weeks`, `weekFraction=null`) | shared services |
| `volumeTrendPct` | per-block week-over-week Δ% (completed → trend over the block's span) | volume svc |

---

## 6. Edge cases

| # | Case | Server behavior | Client |
|---|---|---|---|
| 1 | No routines at all | `routines:[]`, `facets:{states:[],goals:[]}` | (handoff has no explicit empty — client shows the "ask agent" surface only) |
| 2 | Only completed routines (no active) | all items `completed`; none `active`/`now` | browse shows only the "Archivo" section |
| 3 | Draft (agent proposal, never started) | `state:"draft"`, `sessionsDone:0`, `weekFraction:null` | draft card variant ("ver plan") |
| 4 | Paused routine | `state:"paused"` | paused section + eyebrow |
| 5 | Deleted routines | excluded from `routines[]` | n/a |
| 6 | Routine with 0 completed sessions | `sessionsDone:0`, `scoreState:"on"` | adherence "0%" |

---

## 7. Platform prerequisites — BLOCKERS

- [ ] **NEW**: shared with dashboard — pace classifier, week/weekFraction resolver,
      block-scoped volume trend. Plus a **batch** path to compute sessionsDone +
      volume for ALL routines in one query (avoid N×UC).
- [ ] **`Routine.status` enum** includes `ready` (≈ draft) — confirm the `ready→draft`
      label mapping is the intended product vocabulary.
- [ ] **User timezone** — only needed for the single active routine's week math;
      `tzOffsetMinutes` param (§7-A of the dashboard spec).
- [ ] **Server-side localization** — `finishedLabel` should ship as raw `endDate`
      (ISO) and be localized client-side (no server i18n).
- [ ] **New aggregate route** `/api/v1/training/routine-library` + Zod + inventory entry.
- [ ] **Scope** — `workouts.read`.

---

## 8. Open decisions — PREFERENCES

1. **`finishedLabel` → raw `endDate`** (ISO), client formats. **Recommend:** yes. *(open)*
2. **`facets` server- vs client-derived.** They're just distinct values over
   `routines[]`. **Recommend:** server includes them (stable ordering, one source of
   truth) but client could derive if we want a leaner payload. *(open)*
3. **`ready` → `draft` mapping.** Confirm the platform's `ready` status is what the
   design calls an agent "draft". **Recommend:** yes. *(open)*
4. **Sort "recientes"** ordering key — `lastTrained` vs `startDate` vs `updatedAt`.
   **Recommend:** active first, then `lastTrained` desc. *(open)*

---

## 9. Contract registration checklist (when implementing)

- [ ] `RoutineLibrary` Zod schema in `@verxion/shared/src/schemas/training.ts`
- [ ] Read-model UC returns `Result<RoutineLibrary>`; **batches** per-routine derivations
- [ ] Shared NEW services (§7) built + tested
- [ ] Route uses `handleResult`; `/api/v1`; `workouts.read`; added to route inventory → parity green
- [ ] Contract test validates live response vs schema
- [ ] Native: regenerate types; swap `getRoutineLibrary` STUB → `apiClient.get`; add to `contractDrift.test.ts`

---

## Swap-in checklist (native, when endpoint lands)

1. In `HttpTrainingRepository.getRoutineLibrary`, replace `return routineLibraryFixture;`
   with `return apiClient.get<RoutineLibrary>("/training/routine-library", { tzOffsetMinutes });`.
2. Delete `routineLibraryFixture` once unreferenced by tests.
3. Register `["GET","/api/v1/training/routine-library"]` under `training` in `contractDrift.test.ts`.
4. No presentation changes — `RutinasScreen`, `useRoutineLibrary`, `useRoutineLibraryView`, keys are source-agnostic.
