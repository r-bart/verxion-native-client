# "Programas" (biblioteca + detalle) — rationale, edge cases & API spec

> One spec for the **`program` module**: the macro-plan that couples a routine +
> a diet plan under one goal, with a weekly calendar, a time window, and a
> **unified adherence** read-model. Covers two new native screens — **Programas**
> (library) and **Detalle de programa** — plus the **Hoy slot** addendum (§A),
> which reuses the existing `/today` aggregate.
>
> Design ref: `docs/design_handoff_programas/` (README + `screenshots/`).
> Design thesis: *"el programa es el paraguas — une rutina y dieta y las puntúa
> juntas; Entreno y Nutrición las viven por separado, el programa las une."*
>
> Read-only: creating/activating/pausing/duplicating a program is the **agent via
> MCP**. Every "edit" surface in the UI navigates to the Agent chat — never a
> write button. (Same justified posture as the rest of the app; programs are
> *content*, which stays on the platform.)
>
> Status: **draft for the API agent.** Verified directly against the platform
> source (`verxion-platform`, sibling repo) — not just the exported OpenAPI. The
> headline: the **domain logic exists** (entity, weeks derivation, a rich
> adherence read-model with `phase`), but the **list/detail endpoints return the
> bare `Program` entity** (coupling by id only, no week, no adherence) — so the
> library card and detail hero as designed need a **new aggregate read-model on
> the platform**, not just response typing. The adherence read-model is rich but
> its published Zod schema **drops** the fields the design wants (`phase`,
> interpretation). The Hoy slot needs **no** API change. Details in §7.

---

## 0. What already exists (verified against `contracts/develop.openapi.json`)

Endpoints (all present):

```
GET  /api/v1/programs                  # list (ProgramQuery params)
GET  /api/v1/programs/active            # the active program (or none)
GET  /api/v1/programs/{id}              # detail
GET  /api/v1/programs/{id}/adherence    # unified adherence read-model
# writes (agent/platform only — NOT called from native):
POST /api/v1/programs                   · activate · pause · resume · complete · duplicate
```

What the source actually returns (read directly, not from the lossy OpenAPI export):

- **`ListProgramsUseCase` → `Program[]`** and **`GetProgramDetailUseCase` → `Program`**
  return the **bare entity** (`packages/domain/src/program/Types.ts`):
  `{ id, profileId, name, description, goal, routineId, dietPlanId, durationType,
  startDate, endDate, status, isActive, isArchived, weeklySchedule: string[]|null,
  visibility, createdAt, updatedAt }`. **Coupling is id-only — no routine/diet
  names**, and there is **no `week`/`totalWeeks`/`weekFrac` and no adherence**.
- **`week`/`totalWeeks` are computed** by `deriveProgramWeeks(startDate,endDate,now)`
  (`today/Services/programWeeks.ts`) — a pure domain service used by the *today*
  read-model, **not composed into the program endpoints**. `weekFrac` exists
  nowhere (client can derive it from elapsed days).
- **`ProgramAdherence`** (`GetProgramAdherenceUseCase`) is *rich at runtime* — it
  populates `programContext.phase` (`cold_start|baseline_building|active_tracking`)
  and `overallInterpretation.{isProvisional,summary}`. **But the published Zod
  schema `programAdherenceSchema` (`@verxion/shared`) drops both** — so neither
  reaches native via codegen (§7.3).
- **`weeklyScheduleSchema` IS typed**: `z.enum(["training","rest","refeed","custom"]).length(7)`
  — the day-kind enum exists and is enforced on write (§7.2 ≈ resolved).
- **`Setup`/`SetupStatus`** are real (`SetupStatusService.derive`) and already in
  `TodayDashboard`. `ProgramProgress` (today slot) is `{name,week,totalWeeks,
  adherenceScore,adherenceMax}`.

`goal` (10 values), `status` (`draft|active|paused|completed`; entity also has
`deleted`), `durationType` and the coupling all match `programas-data.jsx`
**exactly** (handoff uses slug; API uses id).

---

## 1. Endpoint(s)

```
GET /api/v1/programs?status&visibility&limit&offset     → 200 ProgramListResponse
GET /api/v1/programs/active                              → 200 { data: ProgramSummary | null }
GET /api/v1/programs/{id}                                → 200 { data: ProgramDetail }
GET /api/v1/programs/{id}/adherence                      → 200 { data: ProgramAdherence }
```

- **`ProgramQuery` params (exist):** `status` (`draft|active|paused|completed`),
  `visibility` (`private|public`), `limit`, `offset`. The library groups by
  `status` client-side; for v1 we can fetch all and group, or page later.
- **Detail = 2 reads:** `GET /programs/{id}` (container metadata + coupling) **+**
  `GET /programs/{id}/adherence` (the ring + sub-bars). Kept separate because
  adherence is an analytics read-model with its own date range / partiality, and
  is `null` for drafts. The native screen fires both via TanStack Query.
- **Coupled routine/diet detail** is reached by navigating to the *existing*
  routine-dashboard / diet-dashboard screens (with a contextual back) — NOT
  duplicated here. The detail only needs an **embedded summary** to render the
  two coupling cards (see §7.4).

---

## 2. Response shape (authoritative TS)

> Source of truth for the Zod schemas. `ProgramAdherence` below is **transcribed
> from the live contract** (trustworthy). `ProgramSummary`/`ProgramDetail` are
> **proposed** from `CreateProgram` + the handoff — to be confirmed against a live
> `GET /programs/{id}` (§7.4).

```ts
// ── shared enums (match CreateProgram / ProgramQuery exactly) ───────────────
type ProgramGoal =
  | "muscle_gain" | "fat_loss" | "strength" | "endurance" | "maintenance"
  | "recomp" | "general_fitness" | "athletic_performance"
  | "rehabilitation" | "health";
type ProgramStatus = "draft" | "active" | "paused" | "completed";
type ProgramDurationType = "indefinite" | "date_range";
/** Per-day kind for the weekly calendar heatmap. GAP §7.2 — not yet typed in the API. */
type ProgramDayKind = "training" | "rest" | "refeed" | "custom";

// ── list item (biblioteca) ──────────────────────────────────────────────────
interface ProgramSummary {
  id: string;
  name: string;
  goal: ProgramGoal | null;
  status: ProgramStatus;
  durationType: ProgramDurationType;
  startDate: string | null;        // ISO date; null when indefinite/draft
  endDate: string | null;
  totalWeeks: number;              // planned length
  week: number;                    // current week (0 for draft). PROPOSED §7.4
  weekFrac: number | null;         // 0..1 fill of the in-progress week cell. PROPOSED §7.4
  // coupling summary — enough to render the chips on the card
  routine: { id: string; name: string } | null;
  dietPlan: { id: string; name: string } | null;
  // headline adherence numbers for the card footer (null for drafts)
  unifiedExecutionScore: number | null;
  // NOTE (2026-06-07): the proposed `adherenceState` (pace chip, §7.3) was
  // settled by the backend evolutivo as NOT shipping — the pace concept is gone
  // from every read-model. The native client dropped the field + the chip; the
  // adherence ring now tints by `unifiedExecutionScore` band. §7.3 is closed.
}

interface ProgramListResponse {
  data: ProgramSummary[];
  // optional: total/limit/offset if we page later
}

// ── detail (hero + coupling) ────────────────────────────────────────────────
interface ProgramDetail {
  id: string;
  name: string;
  description: string | null;
  goal: ProgramGoal | null;
  status: ProgramStatus;
  durationType: ProgramDurationType;
  startDate: string | null;
  endDate: string | null;
  finishedDate: string | null;     // when status = completed
  createdDate: string;
  updatedDate: string | null;
  totalWeeks: number;
  week: number;                    // PROPOSED §7.4
  weekFrac: number | null;         // PROPOSED §7.4
  /** 7 entries Mon→Sun for the calendar heatmap. GAP §7.2 (currently array|null). */
  weeklySchedule: ProgramDayKind[] | null;
  /** Embedded coupling summaries so the 2 cards render without extra fetches. PROPOSED §7.4 */
  routine: ProgramCoupledRoutine | null;
  dietPlan: ProgramCoupledDiet | null;
  agentNote: string | null;        // server-localized free text, painted verbatim
}

interface ProgramCoupledRoutine {
  id: string;
  name: string;
  type: string | null;             // e.g. "split"/"fullbody" — drives bubble
  week: number;
  totalWeeks: number;
  adherenceScore: number | null;   // e.g. 86
}
interface ProgramCoupledDiet {
  id: string;
  name: string;
  calories: number | null;         // raw; client formats
  protein: number | null;          // raw grams
  week: number | null;
  totalWeeks: number | null;
}

// ── unified adherence — TRANSCRIBED FROM THE LIVE CONTRACT (ProgramAdherence) ─
interface ProgramExecutionBreakdown {
  plannedUnitsTotal: number;
  exactUnitsCompleted: number;
  substitutedUnitsCompleted: number;
  missedUnits: number;
  addedUnits: number;
  completionPct: number | null;
  strictAdherencePct: number | null;
  addedSharePct: number | null;
  executionScore: number | null;
}
interface ProgramAdherence {
  programId: string;
  programName: string;
  dateRange: { from: string | null; to: string | null };
  training: {
    available: boolean;
    sessionsCompleted: number;     // → "14" of the "14/36 sesiones" sub-bar
    sessionsExpected: number;      // → "36"
    adherencePercent: number;
    executionScore: number | null; // → the "Entreno 86%" number
    executionBreakdown: ProgramExecutionBreakdown;
  };
  diet: {
    available: boolean;            // false → render the diet sub-bar as "—"
    daysTracked: number;           // → "19" of "19/21 días"
    daysExpected: number;          // → "21"
    adherencePercent: number;
    avgCalorieAdherence: number;
    executionScore: number | null; // → the "Dieta 92%" number
    executionBreakdown: ProgramExecutionBreakdown;
    executionClassificationDistribution: {
      PERFECT_PLAN: number; PLAN_WITH_SUBSTITUTIONS: number;
      PLAN_PLUS_EXTRAS: number; PARTIAL_PLAN: number; OFF_PLAN: number;
    };
  };
  overallAdherencePercent: number;
  unifiedExecutionScore: number | null;  // → the ring "84/100"
  isPartial: boolean;                     // cold-start signal
  availableDomains: ("training" | "nutrition")[];
  confidence: "none" | "low" | "medium" | "high";  // → "Confianza alta"
  // GAPS — NOT in the live schema, needed by the design (§7.3):
  // adherenceState?: "ahead" | "on" | "behind";   // → "Vas adelantado" chip
  // phase?: "cold_start" | "baseline_building" | "active_tracking"; // → fase label
}

type ProgramAdherenceState = "ahead" | "on" | "behind"; // §7.3
```

---

## 3. Client vs. server — formatting split

| Field | Mode | Notes |
|---|---|---|
| `unifiedExecutionScore`, `*.executionScore`, `adherencePercent` | raw | client paints the number; ring/bars are pure UI |
| `sessionsCompleted/Expected`, `daysTracked/Expected` | raw | "14/36 sesiones", "19/21 días" composed client-side |
| `dietPlan.calories`/`protein` | raw | client adds locale grouping + unit ("2.250 kcal · 180 g P") |
| `startDate`/`endDate`/`finishedDate` | iso (date) | client formats the window "13 may 2026 – 24 jun 2026" |
| `week`/`totalWeeks`/`weekFrac` | raw | "Semana 3 de 6" + partial cell fill |
| `weeklySchedule[]` | enum | client maps each day-kind → tint/label/legend |
| `goal`/`status`/`confidence` | enum | client maps → label + color + icon |
| `agentNote` | server-localized free text | painted verbatim, NOT i18n'd |
| `adherenceState`/`phase` | enum (if added) | client maps → "Vas adelantado" / fase label |

**Fixed on the client (not in the response):** goal icons/colors, day-kind tints
(training=lava, refeed=amber, custom=cyan, **rest=hollow cell**, no per-cell
glow), state eyebrow styling, ring color by state, header chrome, the contextual
back, and all "pídeselo a verxion" CTAs → navigate to Agente.

---

## 4. Field → platform source mapping

| Aggregate field | Domain UC / repo method | Exists? | Notes |
|---|---|---|---|
| program list | `ListProgramsUseCase` (`GET /programs`) | ✓ (untyped resp §7.1) | group by status client-side |
| active program | `GetActiveProgramUseCase` (`GET /programs/active`) | ✓ (untyped resp §7.1) | feeds the Hoy slot too (§A) |
| program detail | `GetProgramUseCase` (`GET /programs/{id}`) | ✓ (untyped resp §7.1) | |
| adherence | `GetProgramAdherenceUseCase` (`GET /programs/{id}/adherence`) | ✓ typed | trustworthy now |
| `weeklySchedule[]` item kind | program entity / schedule service | ✗ **NEW (type only)** | item enum undocumented (§7.2) |
| `week` / `weekFrac` | derived from `startDate` + cadence | **NEW?** | confirm it's in the read (§7.4) |
| coupled `routine`/`dietPlan` summary | embed in program read-model | **NEW?** | else 3 fetches (§7.4) |
| `adherenceState` (ahead/on/behind) | adherence service (pace rule) | ✗ **NEW** | §7.3 |
| `phase` (cold_start/…) | adherence service | ✗ **NEW** | §7.3 — or drop, use `confidence` |

---

## 5. Server-computed business rules

| Rule | Definition | Lives in |
|---|---|---|
| `unifiedExecutionScore` | roll-up of training + diet execution; `null` until enough data | adherence service ✓ |
| `isPartial` / `confidence` | data-sufficiency of the adherence read | adherence service ✓ |
| `diet.available=false ⇒ unified falls back to training-only` | already implied by `availableDomains` | adherence service ✓ |
| `adherenceState` (ahead/on/behind) | expected vs. actual *pace* at current week | **NEW (§7.3)** — pace rule is server's; client must not invent it |
| `phase` | maturity of tracking | **NEW or derive from `confidence`** (§7.3) |
| `week` / `weekFrac` | position in the window from `startDate` + today | server (TZ-aware) — confirm in read (§7.4) |
| status grouping order | active → paused → draft → completed(archive) | client (pure ordering) |

---

## 6. Edge cases

| # | Case | Required server behavior | Client handling |
|---|---|---|---|
| 1 | **Draft program** | `adherence: null`; `startDate/week` null/0 | card shows "Sin empezar · N semanas" + "Ver plan ›"; detail shows "por qué este programa" note + activate CTA → Agente |
| 2 | **No diet coupled** | `diet.available=false`; `dietPlan: null` | diet sub-bar "—"; coupling slot dashed "+ Sin dieta" → Agente |
| 3 | **No routine coupled** | `routine.available=false`; `routine: null` | symmetric to #2 |
| 4 | **Indefinite program** | `durationType:"indefinite"`, dates null | window chip "Indefinido"; no end cell |
| 5 | **Completed program** | `status:"completed"`, `finishedDate` set | archive row, trophy badge w/ unified score; back → Programas |
| 6 | **Cold-start adherence** | `isPartial:true`, `confidence:"none"`, scores may be null | hide/soften the ring; show "Aún pocos datos" |
| 7 | **No active program** | `/programs/active` → `data:null` | Hoy slot falls through to rutina/dieta/sueltas/nada (§A) |
| 8 | **Empty library** | `[]` | "Pídele a verxion un programa nuevo" (dashed) → Agente |

---

## 7. Platform prerequisites — BLOCKERS (source-verified)

> Re-graded after reading `verxion-platform` directly. The big one is **7.4**: the
> endpoints return bare entities; the screens need a composed read-model.

- [ ] **7.4 (BIGGEST) — Build an aggregate read-model for list + detail.**
      `ListProgramsUseCase`/`GetProgramDetailUseCase` return the **bare `Program`
      entity** — coupling by `routineId`/`dietPlanId` (no names), **no `week`/
      `totalWeeks`**, no adherence. The library card (coupling chips, "Semana 3 de
      6", week cells, "Entreno 86% · Dieta 92% · 84 unificado") and the detail
      hero are **not satisfiable today**. The pieces exist — `deriveProgramWeeks()`
      (`today/Services`) computes weeks, the routine/diet repos have the summaries,
      `GetProgramAdherenceUseCase` has the scores — they're just **not composed**.
      → Platform builds a `GetProgramOverviewUseCase` (detail) + `ListPrograms
      OverviewUseCase` (list) that embed: `week/totalWeeks` (via `deriveProgramWeeks`),
      coupled `{routine:{id,name,type,week,adherence}, dietPlan:{id,name,calories,
      protein}}`, and a headline adherence (`unifiedExecutionScore` + state). This
      is **new domain composition**, not response typing. (`weekFrac` we derive
      client-side from elapsed days — no server need.)
- [ ] **7.1 — Publish read schemas + wire the responses.** There is **no read
      Zod schema for the `Program` entity** (only `create`/`update`/`query` +
      `adherence`), and the GET responses are registered untyped (`data:{object}`;
      the inventory even only lists a stray `PUT …/adherence`). → Add the read
      schema(s) for the §7.4 aggregate(s), register the GET routes, and the parity
      test will enforce it. Adherence we can type on our side **now** from the
      existing `programAdherenceSchema`.
- [x] **7.2 — `weeklySchedule` day-kind enum: ALREADY TYPED.** `weeklyScheduleSchema`
      = `z.enum(["training","rest","refeed","custom"]).length(7)`. Resolved on the
      write side; the only nit is the *entity* read type is loose `string[]` —
      tighten it to the enum in the §7.4 read schema. "días/sem" = count of
      `training` days; order is Mon→Sun (confirm).
- [ ] **7.3 — Adherence: expose `phase` + interpretation; `adherenceState` is
      missing.** `GetProgramAdherenceUseCase` **already computes** `programContext.
      phase` (`cold_start|baseline_building|active_tracking`) and
      `overallInterpretation.{isProvisional,summary}` — but `programAdherenceSchema`
      **drops them**, so native can't see them. → Add `programContext` +
      `overallInterpretation` to the published schema (cheap; data already flows).
      The "Vas adelantado / En objetivo / Vas justo" chip needs `ahead|on|behind`
      which **exists nowhere** — decide in §8.1 (add server-side vs. reuse the
      `overallInterpretation.summary` line vs. drop the chip).
- [ ] **User timezone** — `week` + "today" position use `now` (TZ-sensitive).
      *TZ is not yet a canonical user field* (lives on weekly snapshots) — confirm
      the aggregate resolves it server-side.
- [x] **OAuth scope** — program routes already gate on `requireResourceScope("workouts")`
      (`apps/api/src/routes/programs.ts`). The read tier exists.

---

## 8. Open decisions — PREFERENCES

1. **Adherence chip + fase (§7.3)** — `phase` already exists at runtime, so
   **recommend:** expose `programContext.phase` + `overallInterpretation` in the
   published schema (no new logic), and for the "Vas adelantado / En objetivo /
   Vas justo" chip, add `adherenceState: "ahead"|"on"|"behind"` server-side (pace
   is a business rule — must not be client-invented). If we want zero new fields,
   the fallback is to render `overallInterpretation.summary` as the status line
   and drop the discrete chip. **recommend:** expose phase now; add `adherenceState`
   if the chip stays. *(open)*
2. **List paging** — **recommend:** fetch all for v1 (program counts are small),
   group by status client-side; wire `limit/offset` only if needed. *(open)*
3. **Library entry point** — handoff puts it behind the Hoy header "capas" button
   (no tab; the 5-tab bar is full). **recommend:** ship that; later add a
   secondary "pertenece a tu programa →" hop from routine/diet detail. *(open)*

---

## A. Addendum — the Hoy slot (`ActivePlan`), reuses `/today`

The polymorphic "qué sigo" slot does **not** need a new endpoint — `GET /today`
(`TodayDashboard`) already carries everything:

- `routine`, `diet`, `program` (= `ProgramProgress`) — the three plan objects.
- **`setup: { routine, dietPlan, program }`**, each `active|inactive_only|none`
  — the signal that drives the 5 slot states.

**Client derivation (presentation grouping, not a business rule):**

```
setup.program === "active"                       → "programa"   → /programs/active
setup.routine === "active" && setup.dietPlan === "active" → "sueltas"  → routine + diet rows
setup.routine === "active"                       → "rutina"
setup.dietPlan === "active"                      → "dieta"
otherwise                                        → "nada"       → Agente
```

**Verified in source** (`GetTodayDashboardUseCase`): `routine`, `diet`, `program`
are sourced **independently** (`getRoutineProgress`/`getDietProgress`/
`getProgramProgress`), so when a program is active the `routine` + `diet` objects
are **also populated** — the slot subline "PPL Hipertrofia · Definición" composes
from `routine.name` + `diet.name`. (Caveat: `/today` carries no coupling linkage,
so "program ⇒ show only program" *assumes* the active routine/diet are the
program's — true in practice; no field guarantees it.)

**One native-side TODO (no platform work):**

1. **Drift:** `src/domain/today/models/TodayDashboard.ts` is missing the `setup`
   field the server already returns — add `setup: { routine: SetupStatus;
   dietPlan: SetupStatus; program: SetupStatus }` (`SetupStatus = "active" |
   "inactive_only" | "none"`).

---

## 9. Native module to build (new `program` module)

Per `architecture.md`:

- **domain/program**: models above (`ProgramSummary`, `ProgramDetail`,
  `ProgramAdherence`, coupling types, enums) + `IProgramPort`.
- **application/program**: `ListProgramsUseCase`, `GetActiveProgramUseCase`,
  `GetProgramUseCase`, `GetProgramAdherenceUseCase`.
- **infrastructure**: `HttpProgramRepository implements IProgramPort` (or
  `FixtureProgramRepository` first — fixture from `programas-data.jsx`); wire in
  `di/container.ts`.
- **presentation/program**: `ProgramLibraryScreen`, `ProgramDetailScreen`,
  components, hooks (`usePrograms`, `useProgram`, `useProgramAdherence`),
  `keys.ts`. Plus the Hoy `ActivePlan` slot rework in `presentation/today`.
- **app/**: routes `app/(tabs)/today/programs.tsx` (library) +
  `app/(tabs)/today/program/[id].tsx` (detail), 3–5 lines each.

---

## Swap-in checklist (native, when endpoints land)

1. Add `HttpProgramRepository` calling `apiClient.get("/programs", …)` etc.,
   mapping to the models (shapes match once §7.1 lands).
2. In `di/container.ts`: replace `FixtureProgramRepository` with the HTTP one.
3. No presentation changes — screens, hooks, keys are source-agnostic.
