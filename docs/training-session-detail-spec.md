# "Entreno · Detalle de sesión" — rationale, edge cases & API spec

> Architecture contract (fixed — see `CLAUDE.md` + `.claude/rules/architecture.md`):
> - One screen/segment → **one aggregate read-model** under `/api/v1`, not client fan-out.
> - The aggregate is a **domain UC composing other domain UCs/repos**. It does NOT
>   call MCP tools, and it does NOT call the API over HTTP.
> - All business derivation is **server-side**. The native app is a read-only viewer:
>   layout + icons/colors + locale formatting only.
> - Response type → Zod schema in `@verxion/shared` → OpenAPI (`/openapi.json`) →
>   native codegen. The parity test enforces the route is documented.
>
> Status: **ENRICHED, INTEGRATED & LIVE** (staging). The backend folded in per-set,
> prescription, catalog joins, routine, `dayType` and recap (commits `ae9808b1`→`5cdedef7`).
> `HttpTrainingRepository.getSessionDetailView` now reads `GET /api/v1/sessions/{id}/detail`
> and maps it via `sessionDetailMapper`; `sessionDetailFixture` kept only as test data.
> Design ref: `design_handoff_entreno/screenshots/` (Sesiones → detalle).
> **One ask deliberately dropped (user decision):** PR flags (`sets[].pr`, `prCount`,
> `hasPR`) are still NOT in the read-model — the screen's PR badges were removed
> rather than block on them. Re-add when/if the read-model exposes PR (the rest of
> §7 below is now satisfied; that item remains open as a future enhancement).

---

## SCOPE

The **Sesiones feed → tap a completed session** (`sesiones/[id]`): the persisted
report of a finished workout — hero, 6 KPI tiles, the agent recap, the **real
per-set breakdown by exercise (with PR flags)**, the user's 1–10 rating, the
close-out note, and the muscle-group split. **Fully read-only** — every
correct/adjust CTA routes to `/agent`; the screen has zero mutations.

Design thesis: *"la sesión ya pasó; aquí relees lo que ejecutaste, serie a serie,
y el agente la corrige si hace falta."*

---

## 1. Endpoint(s)

Staging **already ships** the route (commit `d419843c`, `90e369a8`):

```
GET /api/v1/sessions/{id}/detail              → 200  { data: WorkoutSessionDetail }
```

- **Scope:** `workouts.read`.
- Native originally proposed `GET /training/sessions/{id}/report` — **we adopt the
  shipped path** (`/sessions/{id}/detail`) per the source-of-truth-on-drift rule.
- The current `WorkoutSessionDetail` is an **aggregate-only** read-model. It does
  not (yet) carry the per-set log, PR flags, plan prescription, per-exercise
  muscle/equipment, routine name, or agent recap that the screen renders. §4 maps
  field-by-field; §7 lists the enrichment asks.

---

## 2-A. What staging ships today — `WorkoutSessionDetail`

```ts
interface WorkoutSessionDetail {
  session: {
    id: string; name: string; status: string; sessionType: string;
    startedAt: string | null; completedAt: string | null;
    durationSeconds: number | null; notes: string | null;
  };
  assessment: {
    pre:  { sleepQuality, energyLevel, stressLevel, readinessLevel,
            motivation: number | null; notes: string | null };
    post: { overallFeeling, effortScore, pump, qualityScore,
            standardizationScore, commitmentLevel: number | null;
            notes: string | null };
  };
  summary: {                                   // nullable — null until summary generated
    totalVolume, totalSets, totalReps, totalDurationSeconds: number;
    activeDurationSeconds, restDurationSeconds: number | null;
    completionRate, exerciseCompletionRate: number;
    averageRir, peakWeight, adherenceScore: number | null;
    summaryGeneratedAt: string;
    exercises: {                               // AGGREGATE per exercise, no per-set
      exerciseId, exerciseName: string;
      totalVolume, totalSets: number;
      averageRir, peakWeight: number | null;
    }[];
    muscleGroupDistribution: Record<string, { volume, percentage, exercises: number }>;
    setTypeBreakdown:        Record<string, { count, volume, percentage: number }>;
  } | null;
}
```

## 2-B. What the screen needs — `SessionDetailView` (authoritative TS)

> Source: `src/domain/training/models/SessionDetailView.ts`. Example payload =
> `src/domain/training/__fixtures__/sessionDetailFixture.ts` (per-set breakdown
> SYNTHESIZED from the day plan — the contract proposal for the missing fields).

```ts
interface SessionDetailHeader {
  id: string; name: string;
  dateLong: string;            // "Sábado · 31 may" ⚠️ display-ready (§3)
  type: DayType;               // ⚠️ see §7 — NOT session.sessionType semantics
  routineName: string;         // "PPL Hipertrofia"  ❌ MISSING from staging
  completionPct: number;       // 100
  perfectPlan: boolean;        // completionPct === 100
  prCount: number;             // ❌ MISSING — no PR data in staging
}
interface SessionTiles {       // all display-ready strings; raw numbers exist in summary
  volume; duration; series; reps; peak; avgRir: string;
}
interface SessionExerciseItem {
  exerciseId; name: string;
  muscle: string;              // ❌ MISSING — staging gives exerciseName only
  equipment: string;           // ❌ MISSING
  prescription: string;        // "4×6–8 · RIR 2" — plan target  ❌ MISSING
  hasPR: boolean;              // ❌ MISSING
  sets: { display: string; pr: boolean }[];  // ❌ MISSING — the per-set table
}
interface SessionAssessment { effort; quality; pump: number; }   // post.* subset
interface SessionMuscleShare { name: string; volume: string; pct: number; }
interface SessionDetailView {
  header: SessionDetailHeader;
  recap: string;               // agent's persisted narrative  ❌ MISSING
  tiles: SessionTiles;
  exercises: SessionExerciseItem[];
  assessment: SessionAssessment | null;
  note: string | null;
  muscles: SessionMuscleShare[];
}
```

---

## 3. Client vs. server — formatting split (the COVERED fields)

These map cleanly from staging today; the client only formats/derives:

| View field | Staging source | Client work |
|---|---|---|
| `header.{id,name}` | `session.{id,name}` | verbatim |
| `header.dateLong` | `session.completedAt` | localize date |
| `header.completionPct` / `perfectPlan` | `summary.exerciseCompletionRate` (or `completionRate`) | round, derive `=== 100` |
| `tiles.volume` | `summary.totalVolume` | group digits + unit |
| `tiles.duration` | `summary.totalDurationSeconds` (or `session.durationSeconds`) | → minutes |
| `tiles.series` / `reps` | `summary.totalSets` / `totalReps` | verbatim |
| `tiles.peak` | `summary.peakWeight` | format kg |
| `tiles.avgRir` | `summary.averageRir` | format |
| `assessment.{effort,quality,pump}` | `assessment.post.{effortScore,qualityScore,pump}` | verbatim |
| `note` | `assessment.post.notes` (or `session.notes`) | verbatim |
| `muscles[]` | `summary.muscleGroupDistribution` (map) | map dict→array, format volume |

**Bonus available, screen doesn't use yet:** `summary.setTypeBreakdown`
(drop/giant/superset…), the full `assessment.pre` readiness block, and
`assessment.post.{standardizationScore,commitmentLevel,overallFeeling}`. The
screen under-consumes the assessment — richer data is welcome, not a blocker.

---

## 4. Field → gap classification

| View field | Status | Source / ask |
|---|---|---|
| header id/name/date/completion, all 6 tiles, assessment, note, muscles | ✅ **covered** | §3 — client formats raw |
| `recap` | ❌ **gap** | no agent narrative on the read-model |
| `exercises[].sets[]` (per-set display + `pr`) | ❌ **gap** | staging `summary.exercises[]` is per-exercise aggregate only |
| `prCount` / `header` PR count / `exercises[].hasPR` | ❌ **gap** | no PR detection anywhere in the contract |
| `exercises[].prescription` (`"4×6–8 · RIR 2"`) | ❌ **gap** | plan target not joined into the report |
| `exercises[].muscle` / `equipment` | ❌ **gap** | only `exerciseName` ships |
| `header.routineName` | ❌ **gap** | session detail doesn't link the parent routine |
| `header.type` (`DayType`) | ⚠️ **drift** | `session.sessionType` is a free string of different semantics — see note |

> **`header.type`** — the screen's day-type chip is being realigned to whatever the
> platform's canonical taxonomy is (same call as the routine-dashboard spine; the
> muscle-split `DayType` was a native design liberty being dropped). Confirm what
> `session.sessionType` enumerates so the native chip maps to it directly.

---

## 5. Server-computed business rules (for the gap fields)

| Field | Definition | Lives in |
|---|---|---|
| `exercises[].sets[].display` | each logged set rendered raw: `{ weight, reps }` (client formats `"82,5 × 8"`) | set-log read |
| `exercises[].sets[].pr` | set matched/beat the exercise's prior best (e2x or load PR) | PR detector (exists for `/analytics/exercises/records`?) — reuse |
| `prCount` | count of PR sets in the session | derive from the above |
| `exercises[].prescription` | the day plan's `sets × repRange · RIR` for this exercise | join `WorkoutDayExercise` |
| `exercises[].muscle` / `equipment` | exercise catalog fields | join exercise catalog |
| `header.routineName` | parent routine name via the session's day → routine | join |
| `recap` | the session's persisted coach narrative | session reflection / summary builder |

> Each "server computes X" implies a UC test case (mirrors the routine-dashboard spec rule).

---

## 6. Edge cases

| # | Case | Server behavior | Client |
|---|---|---|---|
| 1 | `summary` null (not generated yet) | `summary: null` | tiles/muscles → skeleton or "report en proceso"; offer `/agent` regenerate |
| 2 | Exercise skipped / no sets logged | exercise present, `sets: []` | row shows "sin series" |
| 3 | Time/other-load sets (planks, carries) | set `display` carries the non-kg label | rendered verbatim, no kg math |
| 4 | No PRs in session | `prCount: 0`, all `pr: false` | no PR badges |
| 5 | No close-out note / no post assessment | `notes: null` / `post.*: null` | sections hide |
| 6 | Archived/old session | full report served from history | identical screen |

---

## 7. Platform prerequisites — BLOCKERS (the enrichment asks)

The screen is built and faithful to the handoff, but **stays on the fixture stub
until the read-model carries these.** Priority order:

- [ ] **Per-set breakdown** — `summary.exercises[]` needs a `sets: { weight, reps,
      setType, rir }[]` (raw; client formats). This is the spine of the screen.
- [ ] **PR flags** — per-set `pr: boolean` + a session `prCount`. Reuse the records
      detector behind `/analytics/exercises/records` if it exists.
- [ ] **Plan prescription per exercise** — `sets × repRange · targetRir` joined from
      `WorkoutDayExercise`, so the report shows planned-vs-done.
- [ ] **Exercise catalog fields** — `muscle` + `equipment` on each
      `summary.exercises[]` entry (currently `exerciseName` only).
- [ ] **Routine name** — `session.routineName` (or a `routine: {id,name}` block) via
      the session's day → routine join.
- [ ] **Agent recap** — the session's persisted coach narrative as `summary.recap`
      (or top-level), English-only until server i18n exists (same caveat as the
      routine-dashboard `agentNote`).
- [ ] **Confirm `session.sessionType` enum** so the native day-type chip aligns (§4).

> Already satisfied: tiles, assessment (pre+post), note, muscle distribution,
> set-type breakdown, completion rates. No new route needed — the route exists; it
> needs the joins above folded into the `summary` builder.

---

## 8. Open decisions — PREFERENCES (recommend + confirm)

1. **Per-set raw vs display.** Recommend the report ships raw `{ weight, reps,
   setType, rir }` per set; native formats `"82,5 × 8"` and the type badges.
2. **Recap placement.** Recommend `summary.recap: string | null` (lives with the
   generated summary, shares its lifecycle/`summaryGeneratedAt`). *(open)*
3. **`prCount` vs derive-on-client.** Recommend server sends `prCount` so the hero
   badge needs no client scan of the sets. *(open)*

---

## 9. Contract registration checklist (when enriched)

- [ ] Extend the `WorkoutSessionDetail` Zod schema in `@verxion/shared` with the §7 fields
- [ ] Fold the joins (set logs, PR detect, plan prescription, catalog, routine, recap) into the summary builder UC
- [ ] NEW/reused services unit-tested (the §5 rules are the cases)
- [ ] Contract test validates a live response against the extended schema
- [ ] Native: regenerate `api-types.ts`; map `WorkoutSessionDetail` → `SessionDetailView`

---

## Swap-in checklist (native, when the read-model is enriched)

1. In `HttpTrainingRepository.getSessionDetailView`, replace
   `return sessionDetailFixtureFor(id);` with
   `apiClient.get<WorkoutSessionDetail>(`/sessions/${id}/detail`)` + a mapper to
   `SessionDetailView` (raw → display: format tiles, build per-set `display`, map
   the muscle dict, derive `perfectPlan`).
2. Delete `sessionDetailFixture` + its `dayDetailFixtures` synthesis once no test depends on it.
3. Register `["GET","/api/v1/sessions/{id}/detail"]` under `training` in `contractDrift.test.ts`.
4. No presentation changes — screen, `useSessionDetailView`, keys are source-agnostic.
