# "Hoy" — rationale, edge cases & API spec

> Architecture contract (fixed — see `CLAUDE.md` + `docs/ARCHITECTURE.md`):
> - One screen → **one aggregate read-model** under `/api/v1`, not client fan-out.
> - The aggregate is a **domain UC composing other domain UCs/repos**. It does
>   NOT call MCP tools, and it does NOT call the API over HTTP.
> - All business derivation is **server-side**. The native app is a read-only
>   viewer: layout + icons/colors + locale formatting only.
> - Response type → Zod schema in `@verxion/shared` → OpenAPI (`/openapi.json`)
>   → native codegen (`openapi-typescript`).
>
> Status: **draft for the API agent.** | Design ref: `screenshots/pantallas/01-Hoy.png`
> Native screen built against `FixtureTodayRepository` (swap to HTTP is a one-line DI change).
> Design thesis: *"la línea del día como espina — el anillo resume, el timeline guía."*

---

## 1. Endpoint(s)

```
GET /api/v1/today?date=YYYY-MM-DD       # primary aggregate
→ 200  TodayDashboard
```

- **Params:** `date` — calendar day to summarize (ISO `yyyy-mm-dd`). **Omitted =
  "today" in the user's timezone**, resolved server-side (see §7 — TZ source).
- **Lazy/detail endpoints:** a timeline item expands into a card that fetches its
  detail **on demand**. Prefer **reusing existing per-entity detail routes**
  (meal, session, workout-day, supplement, weight, water, steps, cardio,
  perimeter) over a new aggregate-detail route. A single uniform route is only
  justified if a **union shape** is wanted:
  ```
  GET /api/v1/today/timeline/<id>      # optional — returns TimelineItemDetail union
  ```
  Native currently calls one method (`getTimelineItemDetail(ref)`); it can map to
  either the per-entity routes or the union route.

---

## 2. Response shape (authoritative TS)

> Source of truth for the Zod schema in `@verxion/shared`. Mirrors native
> `domain/today/models/TodayDashboard.ts`.

```ts
// ── Summary ────────────────────────────────────────────────────────────────
type DayFrontKey    = "training" | "nutrition" | "water" | "steps" | "supplements";
type DayFrontStatus = "completed" | "in_progress" | "planned" | "rest" | "missed";

interface DayFront {
  key: DayFrontKey;                // canonical order: training, nutrition, water, steps, supplements
  closed: boolean;                 // server-computed; counts toward the ring (§5)
  current: number | null;          // numeric fronts only (kcal, L, steps, count)
  target:  number | null;          // goal; null when no numeric goal
  unit: "kcal" | "L" | "steps" | "count" | null;
  status: DayFrontStatus | null;   // non-numeric fronts (training) only
}

interface DayRing { completed: number; total: number; }   // e.g. 3 / 5

// ── Plans section (routine / diet / program — whichever exist) ───────────────
interface RoutineProgress {
  name: string; week: number; totalWeeks: number;
  adherenceScore: number; adherenceMax: number;            // e.g. 86 / 100
}
// diet + program rows are PLANNED (§8) — same expandable-card pattern; send when present.

interface AgentNote { author: string; message: string; }  // built but currently HIDDEN in the UI

// ── Timeline ────────────────────────────────────────────────────────────────
type TimelineEventKind =
  "weight"|"water"|"steps"|"cardio"|"perimeter"|"supplement"|"meal"|"workout"|"session"|"note";
type TimelineItemState = "done"|"in_progress"|"upcoming"|"overdue"|"rest";
interface TimelineRef { kind: TimelineEventKind; id: string; }

interface TimelineEvent {
  id: string;
  time: string | null;             // FULL ISO-8601, or null = untimed pending (§6)
  kind: TimelineEventKind;
  state: TimelineItemState;
  title: string; subtitle: string | null;
  ref: TimelineRef | null;         // null = not expandable
}

interface TodayDashboard {
  date: string;                    // ISO yyyy-mm-dd this dashboard summarizes
  ring: DayRing;
  fronts: DayFront[];              // ordered; length == ring.total
  routine: RoutineProgress | null; // active routine (shipped); diet/program planned (§8)
  agentNote: AgentNote | null;
  timeline: TimelineEvent[];       // timed items first (sorted asc), untimed last
}

// ── Lazy expand detail (one per opened card) ────────────────────────────────
type TimelineItemDetail = MealDetail | WorkoutDetail | SessionDetail | SupplementDetail | MetricDetail;
// MealDetail:       name, window, calories, protein, items[{name, amount, alternatives[]}], supplements[]
// WorkoutDetail:    name, focus, durationMin, exercises[{name, detail}]
// SessionDetail:    name, durationMin, volumeKg, sets, completionPct
// SupplementDetail: items[{name, dose, timing, taken}]
// MetricDetail (weight|water|steps|cardio|perimeter): value, caption, rows[{label, value}]
```

---

## 3. Client vs. server — formatting split

Everything *displayed* is computed server-side; the client adds no business
logic. Per field:

| Field group | Mode | Notes |
|---|---|---|
| `fronts[].current/target` | **raw** | number + `unit` enum; client locale-groups (`2250`→`2.250`/`2,250`) |
| `fronts[].closed/status`, `ring` | **raw** (computed) | booleans/counts; client renders, never recomputes |
| `routine.*` (name, week, adherence) | **raw** | name verbatim; numbers client-grouped |
| `agentNote.message` | **server-localized free text** | rendered verbatim (NOT i18n'd) |
| `timeline[].title/subtitle` | **server-localized free text** | content labels |
| `timeline[].time` | **timestamp** | full ISO-8601; client → local `HH:mm` |
| `timeline[].state/kind/ref` | **raw** (computed) | client maps to node style/icon |
| detail: `MealDetail.calories/protein`, amounts, `SessionDetail` numbers | **raw** *(recommended)* | see §8 decision — native fixture currently uses strings |
| detail: `MetricDetail.value/caption/rows` | **display-ready** *(today)* / **raw** *(recommended)* | see §8 — these need server i18n if kept as strings (§7) |

**Fixed on the client (not in the response):** header date title + settings
avatar (no greeting/name); front icons & colors; ring segment colors; node
styles per `state`; accordion/layout.

---

## 4. Field → platform source mapping

> Sources are **domain UCs / `/api/v1` routes** (no MCP). Names below are
> best-guess from the data; the API agent confirms exact UC names in the API
> repo. `✓?` = expected to exist (verify); **NEW** = no backing service yet.

| Aggregate field | Domain UC / repo method | Exists? | Notes |
|---|---|---|---|
| *(aggregate)* `TodayDashboard` | `GetTodayDashboardUseCase` (composes the rows below) | **NEW** | the read-model UC for this screen |
| `fronts.training` | `GetDayTrainingStateUseCase` | ✓? | enum → `status`/`closed` (§5) |
| `fronts.nutrition` | `GetDayNutritionStateUseCase` | ✓? | actual vs target kcal + adherence |
| `fronts.water` | `GetDailyWaterUseCase` | ✓? | total mL vs goal |
| `fronts.steps` | `GetDailyStepsUseCase` / `GetStepSummaryUseCase` | ✓? | steps vs goal |
| `fronts.supplements` | `GetTodayDietPlanDayUseCase` + `ListSupplementLogsUseCase` | ✓? | logged vs planned count |
| `ring` | derived in the aggregate from `fronts[].closed` | — | n/a |
| `routine` | `GetActiveEngagementUseCase` + `GetProgramAdherenceUseCase` | ✓? | name, week, adherence/exec score |
| `diet` *(planned)* | `GetActiveDietPlanUseCase` | ✓? | plans-section row |
| `program` *(planned)* | `GetActiveProgramUseCase` | ✓? | plans-section row |
| `agentNote` | `GetCoachingDecisionUseCase` / `GetCoachingSnapshotUseCase` | ✓? | localized one-liner |
| `timeline` | `BuildDayTimelineUseCase` — merges weight/meal/supplement/session/step/water/cardio/perimeter logs + plan, computes `state`, sorts | **NEW** | the day-merge composition |
| detail: meal | `GetMealLogDetailUseCase` / `GetTodayDietPlanDayUseCase` | ✓? | per-entity detail route |
| detail: workout | `GetWorkoutDayExercisesUseCase` | ✓? | |
| detail: session (`done`/`in_progress`) | `GetSessionSummaryUseCase` / `GetLiveSessionProgressUseCase` | ✓? | live UC while training |
| detail: supplement | `GetTodayDietPlanDayUseCase` + `ListSupplementLogsUseCase` | ✓? | |
| detail: weight/water/steps/cardio/perimeter | the matching daily/summary UC | ✓? | → `MetricDetail` |
| detail: note | `GetNoteDetailUseCase` | ✓? | |

---

## 5. Server-computed business rules

| Rule | Definition | Constant/threshold | Lives in |
|---|---|---|---|
| `fronts.training.closed` | training day-state == `SESSION_COMPLETED` (rest day → see §6/§8) | — | day-state service |
| `fronts.training.status` | map day-state enum: `SESSION_COMPLETED→completed`, `SESSION_IN_PROGRESS→in_progress`, `WORKOUT_PLANNED→planned`, `MISSED_WORKOUT→missed`, `REST_DAY→rest`, `NO_ENGAGEMENT_ACTIVE→omit front` | — | day-state service |
| `fronts.nutrition.closed` | nutrition day-state ∈ {`FULL_LOGS_TODAY`,`ON_TRACK`} **or** adherence ≥ threshold | threshold TBD (§8) | nutrition day-state |
| `fronts.water.closed` | `total_ml ≥ goal_ml` | user water goal | — |
| `fronts.steps.closed` | `steps ≥ goal` | user step goal | — |
| `fronts.supplements.closed` | `logged_count ≥ planned_count` (planned > 0) | — | — |
| `ring.completed / total` | count of closed fronts / number of **active** fronts | total ≤ 5 | aggregate |
| `timeline[].state` | done/in_progress/upcoming/overdue/rest from logs vs plan vs now | overdue = window passed, unlogged | timeline merge |
| timeline order | timed items sorted ascending by `time`; untimed (`time:null`) last | — | timeline merge |

---

## 6. Edge cases

| # | Case | Required server behavior | Client handling (built) |
|---|---|---|---|
| 1 | **Rest day** | training `status:"rest"`; decide if rest counts as `closed` (recommend yes) | renders status; ring from server counts |
| 2 | **No active routine/program** | `routine: null` (and diet/program null) | plans row hidden |
| 3 | **No agent note** | `agentNote: null` | (note is hidden anyway for now) |
| 4 | **Empty timeline** | `timeline: []` | timeline section hidden |
| 5 | **Partial day** (front below goal) | `closed:false`; `ring.completed < total` | ring arc partial; segment dimmed |
| 6 | **Metric over target** (11.260/10.000) | `current` may exceed `target`; still `closed:true` | value shows real number |
| 7 | **No goal set** | `target: null` | value renders `current` only |
| 8 | **Front not applicable** (no plan) | **omit** that front from `fronts[]` & `ring.total` (no 0/0 front) | length-driven; nothing special |
| 9 | **Decimal units** (2,5 L) | raw `2.5` + `unit:"L"` | locale formatter |
| 10 | **Timezone / midnight** | resolve "today" in user TZ; return `date` | header title from `date` → always matches server day |
| 11 | **Agent note language** | `message` localized server-side | rendered verbatim |
| 12 | **Timeline timestamps** | full ISO-8601 with offset (not `HH:mm`) | `new Date(time)` → local `HH:mm` |
| 13 | **Adherence number** | pick ONE (recommend structural execution score, 0–100); `adherenceMax`=100 | `86 /100` chip |
| 14 | **Header** | n/a | full date only; no greeting/name/streak (resolved) |
| 15 | **Loading & failure** | n/a | skeleton; empty-state (`today.error.*`) |
| 16 | **Metric shown twice** (front + timeline) | a daily metric may appear as a **front** (roll-up) AND a **timeline item** (logged event) — intentional | renders both; no dedup |
| 17 | **Untimed pending** (dinner/supps not scheduled) | `time: null`; only timestamped when logged | grouped under "Pendiente · sin hora" divider at the end |
| 18 | **"Now" marker** | from states + times | shown only when a timed `upcoming` exists; else the pending divider separates |

---

## 7. Platform prerequisites — BLOCKERS

- [ ] **New domain services** (§4 **NEW**): `GetTodayDashboardUseCase` (the
      aggregate) and `BuildDayTimelineUseCase` (the day merge + `state` derivation).
- [ ] **User timezone source** — `date`/"today" must resolve server-side. From
      where? *TZ is NOT a canonical user field today (lives on weekly snapshots).*
- [ ] **User locale source** — needed only if any detail field stays
      **display-ready/localized** (§3). From profile? `Accept-Language`?
- [ ] **Server-side string localization** — `MetricDetail.value/caption/rows`
      (and other detail strings) are display-ready today. The API has no general
      i18n layer → **prefer making detail raw/structured + client i18n** (§8.4).
- [ ] **Per-entity detail routes** reachable for the lazy expand (meal, session,
      workout-day, supplement, weight, water, steps, cardio, perimeter, note).
- [ ] **New OAuth `.read` scope** for `/today` if scoping requires it.

---

## 8. Open decisions — PREFERENCES (recommend + confirm)

1. **`closed` thresholds** (§5) — confirm each, especially nutrition (state enum
   vs adherence %) and rest-day counting. *(open)*
2. **Adherence number** (Edge 13) — legacy % vs structural execution score.
   **recommend:** execution score (0–100). *(open)*
3. **Agent note source** — `GetCoachingDecision` vs `GetCoachingSnapshot`; cached
   per day? **recommend:** coaching decision, cached daily. *(open — note hidden in UI for now)*
4. **Detail formatting** — display-ready localized strings (needs server i18n,
   §7) vs **raw/structured + client formats**. **recommend:** raw/structured +
   client i18n (no server i18n layer needed); move the native fixture off strings. *(open)*
5. **Timeline scope / cap** — all of today, or paginate? **recommend:** all of
   today, no paging. *(open)*
6. ~~Header reconcile~~ — **resolved**: full date only.
7. **Empty / cold-start "Hoy"** (new user, no plan/logs) — **out of scope for
   this aggregate**; the team builds a dedicated empty state that funnels to the
   agent. Aggregate just returns empty/null sections. *(resolved — owned by us)*
8. **Plans rows** — ship `routine` now; **program** + **diet** rows + their
   expand cards are planned (reuse `TimelineItemCard`). *(deferred)*
9. **Micro-write actions** from `upcoming`/pending cards (log water/weight/steps —
   the allowed exception). **recommend:** OFF for v1. *(deferred)*

---

## 9. Contract registration checklist (when implementing)

- [ ] Response Zod schema added to `@verxion/shared/src/schemas/today.ts` (+ inferred type, + index export)
- [ ] `GetTodayDashboardUseCase` in `packages/domain` returns `Result<T>`; composes existing UCs/repos
- [ ] New domain services (§7) built + unit-tested (`GetTodayDashboard`, `BuildDayTimeline`)
- [ ] Route in `apps/api` uses `handleResult(c, result)`; registered under `/api/v1`
- [ ] Route added to the OpenAPI route inventory (`apps/api/src/openapi/routeInventory.ts`) → parity test green
- [ ] Contract test validates the live response against the shared schema
- [ ] Native: regenerate `api-types.ts` from `/openapi.json`; add `HttpTodayRepository`; swap DI from fixture

---

## Swap-in checklist (native, when endpoint lands)

1. Add `HttpTodayRepository implements ITodayPort` calling `apiClient.get("/today", { date })` (+ the
   detail call), mapping to the model (shapes match).
2. In `infrastructure/di/container.ts`: replace `FixtureTodayRepository` with the HTTP one; delete the fixture.
3. No presentation changes — screen, hooks, and keys are source-agnostic.
