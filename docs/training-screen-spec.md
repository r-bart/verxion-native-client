# "Entreno" — rationale, edge cases & API spec

> Architecture contract (fixed — see `CLAUDE.md` + `.claude/rules/architecture.md`):
> - One screen → **one aggregate read-model** under `/api/v1`, not client fan-out.
> - The aggregate is a **domain UC composing other domain UCs/repos**. It does
>   NOT call MCP tools, and it does NOT call the API over HTTP.
> - All business derivation is **server-side**. The native app is a viewer:
>   layout + icons/colors + locale formatting only.
> - Response type → Zod schema in `@verxion/shared` → OpenAPI (`/openapi.json`)
>   → native codegen (`openapi-typescript`).
>
> Status: **draft for the API agent.** | Design ref: `screenshots/pantallas/02-Entreno.png`.
> Native screen built against `FixtureTrainingRepository` (swap to HTTP is a one-line DI change).
> Design thesis: *"el plan vive en la plataforma; aquí lo lees y el agente lo ejecuta."*

---

## SCOPE — what this doc covers (read first)

This doc specs **only the main view**: the **Entreno tab → `Rutina` sub-tab**
(`screenshots/pantallas/02-Entreno.png`). It is **fully read-only**.

Everything below the main view is **deferred** and, crucially, **most of it is not
yet designed** (see §10 — navigation tree). The write exception (start/pause/finish
session) belongs to those deferred sub-screens, **not here** — so this build needs
no `CLAUDE.md` amendment yet.

| Surface | Status |
|---|---|
| Entreno tab shell (3 sub-tabs) | **this build** (shell only) |
| `Rutina` sub-tab — active-routine overview | **this build** (fully specced) |
| `Sesiones` sub-tab (history list) | deferred §10 |
| `Ejercicios` sub-tab (catalog) + exercise detail | deferred §10 |
| Prescripción del día + session lifecycle **writes** | deferred §10 |
| Sesión en marcha (live) | deferred §10 |
| **Routines list · routine detail · workout-day detail** | **NOT DESIGNED** §10 |

---

## 1. Endpoint(s)

```
GET /api/v1/training/overview        → 200  TrainingOverview      # Rutina sub-tab
```

- **Params:** none. Resolves the user's *active* routine and *today's* session
  in the user TZ, server-side (§7). No client fan-out, no detail calls in v1 —
  the overview is self-contained (it does not embed the prescription).

---

## 2. Response shape (authoritative TS)

> Source of truth for the Zod schema in `@verxion/shared`. Mirrors native
> `domain/training/models/TrainingOverview.ts`. Reuses `AgentNote` from `domain/today`.

```ts
interface AgentNote { author: string; message: string; }   // reused from today

// ── Active routine card (screenshot 02) ─────────────────────────────────────
interface ActiveRoutineSummary {
  id: string;
  name: string;                  // "PPL Hipertrofia"
  goal: string | null;           // "Hipertrofia"  → goal chip
  split: string[];               // ["Push","Pull","Legs"]
  source: "verxion" | "user" | "coach";   // "por verxion" badge
  week: number;                  // 3
  totalWeeks: number | null;     // 6  (open-ended routine → null)
  sessionsCompleted: number;     // 14
  sessionsTotal: number | null;  // 36 (maxSessions; null = open-ended)
  adherenceScore: number;        // 86   (same structural execution score as Hoy, §8.1)
  adherenceMax: number;          // 100
  pace: "ahead" | "on_track" | "behind" | null;   // "Vas adelantado" (§8.2; null if no baseline)
}

// ── Today's session pointer (nav target only in v1; prescription is deferred) ─
interface TodaySessionPointer {  // null = rest day OR no session scheduled today
  workoutDayId: string;
  label: string;                 // "Legs A"
  focus: string;                 // "LEGS"  (client uppercases)
  state: "planned" | "in_progress" | "completed" | "missed" | "rest";
  liveSessionId: string | null;  // non-null iff state == "in_progress"
}

type RoutineEmptyReason = "never" | "all_completed" | "all_paused" | "all_archived";

interface TrainingOverview {
  routine: ActiveRoutineSummary | null;   // null → empty state (§6 cases 8–11)
  todaySession: TodaySessionPointer | null;
  agentNote: AgentNote | null;             // "Semana 3: tu volumen subió un 8 %…"
  emptyReason: RoutineEmptyReason | null;  // MUST be non-null iff routine == null; drives funnel copy
}
```

> The `Routine` domain model carries 5 statuses (`ready·active·paused·completed·
> deleted`) and rich set-type configs. The **overview** intentionally exposes only
> the active-routine projection above; paused/completed routine *screens* and the
> full config are deferred with the undesigned sub-screens (§10).

---

## 3. Client vs. server — formatting split

| Field | Mode | Notes |
|---|---|---|
| `routine.name`, `goal`, `split[]` | **raw** | verbatim strings |
| `routine.week/totalWeeks/sessions*` | **raw** | client groups digits, renders bar |
| `routine.adherenceScore/Max` | **raw** | `86 /100` chip |
| `routine.pace`, `source` | **raw enum** | client maps to label + tint |
| `todaySession.state/focus/label` | **raw** | client maps state → chip style |
| `agentNote.message` | **server-localized free text** | rendered verbatim (NOT i18n'd) |
| `emptyReason` | **raw enum** | client maps to funnel copy (§6) |

**Fixed on the client (not in the response):** sub-tab chrome (Rutina/Sesiones/
Ejercicios), section titles, progress-bar styling, chip tints per state/pace,
glass surfaces & icons, the empty-state funnel layout + suggested-prompt copy
(localized client-side via i18n; the prompt text is UI, not data).

---

## 4. Field → platform source mapping

> RULE: every source is a **domain UC or `/api/v1` route** — never an MCP tool.
> Granular UCs already exist as lookbook scaffolding; the aggregate **composes** them.

| Aggregate field | Domain UC / repo method | Exists? | Notes |
|---|---|---|---|
| *(aggregate)* `TrainingOverview` | `GetTrainingOverviewUseCase` | **NEW** | pure composition of the rows below |
| `routine.*` | `GetActiveRoutineUseCase` / `GetRoutinesUseCase`(filter active) | ✓? | active engagement |
| `routine.adherenceScore/pace` | `GetProgramAdherenceUseCase` | ✓? | same score as Hoy (§8.1) |
| `todaySession` | `GetSuggestedNextWorkoutUseCase` + day-state | ✓? | which day is "today" + its state |
| `agentNote` | `GetCoachingDecisionUseCase` | ✓? | localized one-liner, cached daily |
| `emptyReason` | derived in the aggregate from routine history | **NEW** | see §5 |

> **NEW** to build: `GetTrainingOverviewUseCase` (composition + `emptyReason`
> derivation). Everything else is expected to exist — verify in the API repo.

---

## 5. Server-computed business rules

| Rule | Definition | Constant/threshold | Lives in |
|---|---|---|---|
| `routine` selection | the single routine with `status == "active"` (`isActive`) | — | engagement service |
| `routine.pace` | sessions-completed vs expected-by-today schedule, bucketed | TBD (§8.2) | engagement service |
| `todaySession.state` | day-state for today's scheduled day (planned/in_progress/completed/missed/rest) | — | day-state service |
| `todaySession` null | no day scheduled today AND not a rest day (gap) → `null` | — | day-state service |
| `todaySession.liveSessionId` | non-null **iff** an in-progress session exists for today | — | session service |
| `emptyReason` | when no active routine: `never` (no routine ever) / `all_completed` / `all_paused` / `all_archived` — by most-recent routine status | — | engagement service |

---

## 6. Edge cases (this screen, exhaustive)

| # | Case | Required server behavior | Client handling |
|---|---|---|---|
| **Active-routine variants** ||||
| 1 | Happy path | full `routine` + `todaySession` + `agentNote` | routine card + note + today chip |
| 2 | Open-ended routine | `totalWeeks/sessionsTotal: null` | hide progress bar, show count only |
| 3 | No agent note today | `agentNote: null` | note card hidden |
| 4 | No `pace` baseline yet | `pace: null` | hide "Vas adelantado" chip |
| **Today-session variants (routine active)** ||||
| 5 | Rest day | `todaySession.state: "rest"` | "Hoy descansas" chip, no CTA |
| 6 | Session in progress | `state:"in_progress"` + `liveSessionId` | "En curso" chip (nav to live = deferred §10) |
| 7 | Session completed today | `state:"completed"` | "Completado hoy" chip |
| 8 | Missed scheduled session | `state:"missed"` | "Pendiente" chip |
| 9 | No day scheduled today (gap) | `todaySession: null` (routine still present) | no today chip; routine card alone |
| **Empty (no active routine)** ||||
| 10 | Brand-new, never had a routine | `routine:null`, `todaySession:null`, `emptyReason:"never"` | funnel: "Aún no tienes rutina — pídesela al agente" + prompt + link a Ejercicios |
| 11 | Last routine completed | `emptyReason:"all_completed"` | funnel copy: "Tu rutina terminó — pide la siguiente" |
| 12 | Routine paused | `emptyReason:"all_paused"` | funnel copy nudges resuming (resume itself = deferred §10) |
| 13 | All archived/deleted | `emptyReason:"all_archived"` | generic funnel |
| **System states** ||||
| 14 | Loading | n/a | skeleton (routine card + chip placeholders) |
| 15 | Error / network failure | n/a | error state + retry (`training.error.*`) |
| 16 | Offline | n/a | last-cached overview via TanStack Query; stale banner |
| 17 | Timezone / "today" | resolve in user TZ server-side | client trusts server's chosen day |

> Each "server computes X" row implies a UC test case.

---

## 7. Platform prerequisites — BLOCKERS

- [ ] **New domain service** (§4 NEW): `GetTrainingOverviewUseCase` (composition +
      `emptyReason` derivation).
- [ ] **`emptyReason` derivation** — requires querying routine history (last
      routine's status) when none is active. Confirm the data is reachable.
- [ ] **`routine.pace` baseline** — needs an "expected sessions by now" schedule
      model (§8.2). If absent, ship `pace: null`.
- [ ] **User timezone source** — "today's session" must resolve server-side. *TZ is
      NOT a canonical user field today (lives on weekly snapshots).* Same blocker as Hoy.
- [ ] **Agent-note localization** — composed server-side (no client i18n for prose).
- [ ] **OAuth `.read` scope** for `/training/overview`.

---

## 8. Open decisions — PREFERENCES (recommend + confirm)

1. **Adherence number** — reuse Hoy's structural execution score (0–100).
   **recommend:** yes, identical source. *(open)*
2. **`pace` model** — `completed − expectedByToday`, bucketed ahead/on_track/behind;
   `null` if no baseline. **recommend:** ship `null` for v1 if the baseline isn't
   modelled yet. *(open)*
3. **Empty state** — funnel to agent, **Entreno-specific** copy + suggested prompt
   + link to Ejercicios catalog. **resolved.**
4. **`emptyReason` granularity** — 4 reasons vs just `null`. **recommend:** ship the
   4 reasons (cheap, lets copy adapt; resume/repeat actions deferred). *(open)*
5. **Today chip interactivity** — in v1 the prescription screen is deferred, so the
   today chip is **display-only** (no nav). **recommend:** non-interactive in v1. *(open)*

---

## 9. Contract registration checklist (when implementing)

- [ ] Zod schema in `@verxion/shared/src/schemas/training.ts` (`TrainingOverview`
      + nested types, + inferred type, + index export)
- [ ] `GetTrainingOverviewUseCase` in `packages/domain` returns `Result<T>`; composes existing UCs
- [ ] `emptyReason` derivation unit-tested (the 4 reasons + active path)
- [ ] Route in `apps/api` uses `handleResult(c, result)`; registered under `/api/v1`
- [ ] Route added to OpenAPI route inventory → parity test green
- [ ] Contract test validates live response against the shared schema
- [ ] Native: regenerate `api-types.ts`; add `HttpTrainingRepository`; swap DI from fixture

---

## 10. Below the main view — deferred & DESIGN GAPS

> The sub-tabs and detail screens reachable from Entreno. **Spec each one in its
> own doc when scheduled.** Marked **GAP** = no design exists yet (must be designed
> before it can be specced — do not invent the shape).

| Sub-screen | Design? | Notes |
|---|---|---|
| **Prescripción del día** ("Sesión de hoy") | ✅ `07-Prescripcion del dia.png` | + session lifecycle **writes** (start/pause/finish) → the `CLAUDE.md` exception. Reuses `GetWorkoutDayExercisesUseCase` + `GetProgressionPlanUseCase`. |
| **Sesión en marcha** (live) | ✅ `06-Sesion en marcha.png` | poll `GetLiveSessionProgressUseCase` while `in_progress`; app renders agent-logged sets, only writes pause/finish. Transport = blocker. |
| **Detalle de ejercicio** | ✅ `09-Detalle de ejercicio.png` | e1RM/Volumen chart + history. **Chart card shared with Progreso** — build in `_shared`, not twice. |
| `Sesiones` sub-tab (history list) | ⚠️ partial (recientes in 02) | cursor-paged `GetWorkoutSessionsUseCase`. Full-list layout **GAP**. |
| `Ejercicios` sub-tab (catalog/search) | ⚠️ implied | `ListExercisesUseCase` + filters. Catalog layout **GAP**. |
| **Routines list** (multiple routines) | ❌ **GAP** | no screen for browsing/selecting among routines. |
| **Routine detail** (full multi-week plan) | ❌ **GAP** | no screen for the whole routine, its weeks, all days. |
| **Workout-day detail** (a non-today day) | ❌ **GAP** | no screen for inspecting a day that isn't today. |
| **Routine reactivation** (resume paused / activate ready) | ❌ **GAP** | a write/handoff (MCP `activate_routine`); decide ownership when designed. |

### Native swap-in (when `/training/overview` lands)
1. Add `HttpTrainingRepository implements ITrainingPort` calling
   `apiClient.get("/training/overview")`, mapping to the model (shapes match).
2. In `infrastructure/di/container.ts`: replace `FixtureTrainingRepository` with the HTTP one.
3. No presentation changes — screen, hook, keys are source-agnostic.
