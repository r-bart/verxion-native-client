# "Entreno · Rutina (dashboard)" — rationale, edge cases & API spec

> Architecture contract (fixed — see `CLAUDE.md` + `.claude/rules/architecture.md`):
> - One screen/segment → **one aggregate read-model** under `/api/v1`, not client fan-out.
> - The aggregate is a **domain UC composing other domain UCs/repos**. It does NOT
>   call MCP tools, and it does NOT call the API over HTTP.
> - All business derivation is **server-side**. The native app is a read-only viewer:
>   layout + icons/colors + locale formatting only.
> - Response type → Zod schema in `@verxion/shared` → OpenAPI (`/openapi.json`) →
>   native codegen. The parity test enforces the route is documented.
>
> Status: **SHIPPED & RECONCILED** (staging). | Design ref: `design_handoff_entreno/screenshots/01-entreno-rutina.png`, `01-02-entreno.png`.
> The platform serves `GET /api/v1/training/routine-dashboard`; `HttpTrainingRepository.getRoutineDashboard` now calls it live (`routineDashboardFixture` kept only as the test payload). The native `RoutineDashboard` model mirrors the contract 1:1.
> **Reconciled deltas vs. this draft:** §8.1 resolved in favour of RAW — `activeRoutine.volume` is `{value,unit}` (not a display string), `spine` carries `orderIndex` + `estimateMin` (not `dayOfWeek` + display `estimate`), and `weeks`/`sessionsPlanned`/`volumeTrendPct` are nullable. The muscle-split `DayType` was a design liberty — the spine/next now use the platform's `DayKind` taxonomy (`workout|rest|cardio|deload|mobility|active_rest|conditioning|technique`). Per-kind chip visuals are a deferred follow-up (`lib/dayType.dayKindChip` is a temporary fallback). The TS in §2 below predates this — the live contract + `src/domain/training/models/RoutineDashboard.ts` are authoritative.
> Design thesis: *"el plan vive en la plataforma; aquí lees tu bloque activo de un vistazo y el agente lo ejecuta."*

---

## SCOPE

The **Entreno tab → `Rutina` segment** (the landing's primary view): the active
routine at a glance — hero + score, the weekly rotation spine, the next action,
and an agent note. **Fully read-only.** Sibling aggregates live in their own specs:
`training-routine-library-spec.md`, `training-sessions-feed-spec.md`,
`training-exercise-library-spec.md`.

---

## 1. Endpoint(s)

```
GET /api/v1/training/routine-dashboard        → 200  { data: RoutineDashboard }
```

- **Params:** none in the body. **Requires** the caller's UTC offset to resolve
  "today" / current-week progress server-side — pass `?tzOffsetMinutes=<int>`
  (same convention as `/analytics/contribution-grid`; see §7-A). Omitted ⇒ server
  falls back to UTC day boundaries.
- **No detail calls in v1.** The dashboard does NOT embed the day prescription —
  tapping a day navigates to its own route (deferred specs).
- **Scope:** `workouts.read`.

---

## 2. Response shape (authoritative TS)

> Source of truth for the Zod schema. Copy-paste from native
> `src/domain/training/models/RoutineDashboard.ts`. Example payload =
> `src/domain/training/__fixtures__/routineDashboardFixture.ts`.

> **Update (2026-06-07):** the backend evolutivo **removed `scoreState`** (the
> "Vas adelantado / En objetivo / Vas justo" pace chip) from every read-model.
> The native client dropped the field, the `ScoreState` type and the `ScoreChip`
> component accordingly. The pace classifier (§5) is **no longer shipped**.
> `volumeTrendPct` / `sessionsDone` / `sessionsPlanned` stay as the progress
> signal. Lines below that still mention `scoreState`/pace are historical.

```ts
type DayType = "push" | "pull" | "legs" | "core" | "rest";
type RoutineDashboardState = "active" | "fresh" | "empty";
type SpineStatus = "done" | "now" | "live" | "up";

interface ActiveRoutineSummary {
  id: string;
  name: string;
  goal: string | null;
  split: string | null;            // "Push · Pull · Legs"
  week: number;                    // 3
  weeks: number;                   // 6
  weekFraction: number | null;     // 0..1 — fill of the CURRENT week cell (§5)
  sessionsDone: number;            // 14
  sessionsPlanned: number;         // 36
  volumeTotal: string;             // "32,1 t"  ⚠️ display-ready (§3)
  volumeTrendPct: number;          // 8  → "+8% vol."
}

interface SpineDay {
  dayOfWeek: string;               // "Lun" ⚠️ display-ready (§3)
  name: string;                    // "Push A"
  focus: string;                   // "Pecho y hombros" ⚠️ localized free text (§3)
  type: DayType;
  exercisesCount: number | null;   // null on rest
  setsCount: number | null;
  estimate: string | null;         // "~62 min" ⚠️ display-ready (§3)
  status: SpineStatus;
  dayId: string | null;            // null on rest
}

interface NextWorkout {
  kind: "workout";
  type: DayType; title: string; focus: string;
  exercisesCount: number; setsCount: number; estimatedMin: number; dayId: string;
}
interface NextRest {
  kind: "rest";
  title: string; subtitle: string; tomorrow: string | null;
}
type NextSession = NextWorkout | NextRest;

interface LiveSessionBanner {
  sessionId: string; name: string; elapsedSeconds: number;
  exercisesDone: number; exercisesTotal: number; paused: boolean;
}

interface RoutineDashboard {
  state: RoutineDashboardState;       // "empty" → no active routine (§6)
  activeRoutine: ActiveRoutineSummary | null;
  spine: SpineDay[];                  // the 7-day rotation (incl. rest)
  next: NextSession | null;
  liveSession: LiveSessionBanner | null;
  agentNote: string | null;           // server-localized free text (§3)
}
```

---

## 3. Client vs. server — formatting split

The client adds **no business logic**. But our fixtures were authored UI-first and
carry several **display-ready / localized strings** the platform does not produce
today (no server i18n — §7-B). Per the template rule, prefer **raw + client i18n**.
**Open decision §8.1** tracks the reconciliation; the recommended target shapes:

| Field | Current fixture | Recommended | Notes |
|---|---|---|---|
| `activeRoutine.name/goal/split` | raw | **raw** | verbatim strings |
| `activeRoutine.week/weeks/sessions*/volumeTrendPct` | raw | **raw** | client groups digits, renders bar/chip |
| `activeRoutine.weekFraction` | raw 0..1 | **raw** | client widths the cell |
| `activeRoutine.scoreState` | enum | **raw enum** | client → "Vas adelantado" + tint |
| `activeRoutine.volumeTotal` `"32,1 t"` | display-ready | **→ raw** `{ value: 32.1, unit: "t" }` | client formats per locale |
| `spine.dayOfWeek` `"Lun"` | display-ready | **→ raw** ISO weekday `1..7` | client localizes the day name |
| `spine.estimate` `"~62 min"` / `next.estimatedMin` | mixed | **→ raw minutes** | client renders "~62 min" |
| `spine.focus`, `agentNote`, `next.subtitle` | localized free text | **server free text** | coach prose; rendered verbatim, NOT i18n'd. English-only until §7-B. |
| `spine.type` / `status`, `next.kind/type` | enum | **raw enum** | client maps to icon/color/label |

**Fixed on the client (never in the response):** day-type icons & colors
(`DAY_TYPE` map), score-chip tints, week-cell styling, header chrome, all labels.

---

## 4. Field → platform source mapping

> RULE: every source is a **domain UC or `/api/v1` route** — never an MCP tool.
> The aggregate UC composes the layer below the tools.

| Aggregate field | Domain UC / repo | Exists? | Notes |
|---|---|---|---|
| `activeRoutine.{id,name,goal}` | `GetActiveRoutinesUseCase` | ✓ | active routine projection |
| `activeRoutine.split` | derive from workout-day types | ✓ | join via `GetWorkoutDaysByRoutineIdUseCaseImpl` |
| `activeRoutine.weeks` | `Routine.maxSessions` ÷ perWeek, or `startDate/endDate` | ✓ | open-ended → null |
| `activeRoutine.week` | (today − startDate) in weeks, user TZ | **NEW** | needs tz (§7-A) |
| `activeRoutine.weekFraction` | day-of-week position in the plan week | **NEW** | §5 |
| `activeRoutine.scoreState` (pace) | — | **NEW** | no pace UC exists (§5, §7) |
| `activeRoutine.sessionsDone` | `GetCompletedSessionsCountForRoutineUseCase` | ✓ | per-routine count |
| `activeRoutine.sessionsPlanned` | engagement `weeklyFrequencyTarget` × weeks, or `maxSessions` | ✓ | |
| `activeRoutine.volumeTotal` | SUM session `totalVolume` for the block | ✓ | SetLog `getTotalVolume()`; aggregate NEW |
| `activeRoutine.volumeTrendPct` | `GetLongitudinalProgressNarrativeUseCase.volumeDeltaPct` | ✓ | global today; **scope to block = partial NEW** |
| `spine[].{name,type,dayId}` | `GetWorkoutDaysByRoutineIdUseCaseImpl` | ✓ | not yet a public route |
| `spine[].{exercisesCount,setsCount}` | `GetWorkoutDayExercisesUseCase` | ✓ | not yet public |
| `spine[].estimate` | sets×~2.6 + ex×~1.2 min | **NEW** | server-owned constant (§5) |
| `spine[].focus` | workout-day focus field / muscle summary | ✓ | free text |
| `spine[].status` | today vs day index + session completion | **NEW** | §5 |
| `next` | derived from spine + today | **NEW** | §5 |
| `liveSession` | `ListWorkoutSessionsUseCase` status `in_progress` | ✓ | map to banner |
| `agentNote` | coach narrative (e.g. progress-report builders) | ✓ | English-only (§7-B) |

> **NEW domain services to build** (also in §7): pace classifier, week/weekFraction
> resolver, per-day estimate, spine status + `next` derivation, block-scoped volume
> aggregate + trend. The day/exercise UCs exist but are **not exposed publicly** —
> the aggregate composes them internally (no new public sub-routes needed).

---

## 5. Server-computed business rules

| Rule | Definition | Constant | Lives in |
|---|---|---|---|
| `week` | `floor((today − startDate)/7) + 1`, clamped to `weeks`; user TZ | — | week resolver (NEW) |
| `weekFraction` | trained-days-this-week ÷ planned-days-this-week (0..1); the CURRENT cell's fill | — | week resolver (NEW) |
| `scoreState` | `ahead` if sessionsDone ≥ expected-by-now × 1.05; `behind` if ≤ ×0.85; else `on` | 1.05 / 0.85 | pace classifier (NEW) |
| `spine[].status` | `done` if past today & session completed; `now` if today; `live` if a live session exists for it; else `up` | — | spine builder (NEW) |
| `spine[].estimate` | `round(setsCount×2.6 + exercisesCount×1.2)` min | 2.6 / 1.2 | estimate svc (NEW; mirrors native `rdDaySummary`) |
| `next` | first `up`/`now` workout from today; else `NextRest` w/ tomorrow's day | — | spine builder (NEW) |
| `volumeTrendPct` | week-over-week block volume Δ% | — | reuse longitudinal narrative, scoped to block |

> Each rule that says "server computes X" implies a UC test case.

---

## 6. Edge cases

| # | Case | Server behavior | Client |
|---|---|---|---|
| 1 | No active routine | `state:"empty"`, `activeRoutine/next/liveSession:null`, `spine:[]` | empty state → `/agent` |
| 2 | Active routine, week 1, no sessions yet | `state:"fresh"`, `scoreState:"on"`, `sessionsDone:0`, `weekFraction:0` | hero renders, spine all `up`/`now` |
| 3 | Rest day today | `next.kind:"rest"`; the rest `SpineDay` has null counts/estimate/dayId | rest card |
| 4 | Live session in progress | `liveSession` non-null; matching spine day `status:"live"` | live banner replaces next card |
| 5 | Open-ended routine (no maxSessions/endDate) | `weeks:null`? → **decision §8.2**; `sessionsPlanned` from weekly target | bar handles null weeks |
| 6 | No baseline for trend (week 1) | `volumeTrendPct:0`, `scoreState:"on"` | "+0% vol." / neutral |
| 7 | tzOffset omitted | resolve "today" in UTC | acceptable; client always sends it |

---

## 7. Platform prerequisites — BLOCKERS

- [ ] **NEW domain services** (§4/§5): pace classifier · week & weekFraction resolver ·
      per-day estimate · spine-status + `next` builder · block-scoped volume total + trend.
- [ ] **User timezone** — NOT a canonical user field (only on weekly snapshots /
      analytics queries). The dashboard MUST resolve "today"/current-week, so it needs
      `tzOffsetMinutes` as a query param (recommended) — confirm the convention.
- [ ] **Server-side localization** — there is none (raw + English). `spine.focus`,
      `agentNote`, `next.subtitle` ship English-only until an i18n layer exists. The
      display-ready numeric/date fields in §3 should move to **raw + client i18n**.
- [ ] **New aggregate route** `/api/v1/training/routine-dashboard` + Zod schema + route-inventory entry.
- [ ] **Scope** — `workouts.read` exists; reuse it.

---

## 8. Open decisions — PREFERENCES (recommend + confirm)

1. **Display-ready strings → raw.** Fixtures carry `volumeTotal`, `estimate`,
   `dayOfWeek` as localized strings. **Recommend:** API sends raw (`{value,unit}`,
   minutes, ISO weekday); native formats. Requires a small native model change.
   *(open)*
2. **Open-ended routines** (no `weeks`). **Recommend:** allow `weeks:null` +
   `weekFraction:null`; client renders a rolling bar. *(open)*
3. **`spine` length** — always 7 (calendar week incl. rest) vs only training days.
   **Recommend:** 7, matching the handoff rotation. *(open)*

---

## 9. Contract registration checklist (when implementing)

- [ ] `RoutineDashboard` Zod schema in `@verxion/shared/src/schemas/training.ts` (+ inferred type + index export)
- [ ] Read-model UC in `packages/domain` returns `Result<RoutineDashboard>`; composes the UCs in §4
- [ ] NEW domain services (§7) built + unit-tested (rules in §5 are the cases)
- [ ] Route in `apps/api` uses `handleResult(c, result)`; registered under `/api/v1`; `workouts.read`
- [ ] Route added to `apps/api/src/openapi/routeInventory.ts` → parity test green
- [ ] Contract test validates a live response against the shared schema
- [ ] Native: regenerate `api-types.ts`; swap `HttpTrainingRepository.getRoutineDashboard` from the fixture STUB to `apiClient.get`; add the endpoint to `contractDrift.test.ts`

---

## Swap-in checklist (native, when endpoint lands)

1. In `HttpTrainingRepository.getRoutineDashboard`, replace `return routineDashboardFixture;`
   with `return apiClient.get<RoutineDashboard>("/training/routine-dashboard", { tzOffsetMinutes });`
   (map only if the raw-vs-display decisions in §8.1 change the shape).
2. Delete `routineDashboardFixture` once no test depends on it.
3. Register `["GET","/api/v1/training/routine-dashboard"]` under `training` in `contractDrift.test.ts`.
4. No presentation changes — screen, hooks (`useRoutineDashboard`), keys are source-agnostic.
