# "Entreno · Sesiones (feed)" — rationale, edge cases & API spec

> Architecture contract (fixed — see `CLAUDE.md` + `.claude/rules/architecture.md`):
> one screen → one aggregate read-model; domain UC composing UCs/repos (no MCP, no
> HTTP); all derivation server-side; response → Zod → OpenAPI → native codegen.
>
> Status: **draft for the API agent.** | Design ref: `design_handoff_entreno/screenshots/02-02-entreno.png`, `07-historial-de-sesiones.png`.
> Native built against the `getSessionFeed` STUB in `HttpTrainingRepository`
> (returns `sessionFeedFixture`, single page; swap to HTTP is a one-line repo change).
> Design thesis: *"todo tu log de entrenos, por bloque — un feed infinito, no una vista aparte."*

---

## SCOPE

The **Entreno tab → `Sesiones` segment**: an **infinite, cursor-paginated** feed of
completed sessions, grouped into routine **blocks**, with routine + sort filters in
bottom sheets. This is the *only* sessions surface (no dedicated history screen).
Session **detail** is a separate (deferred) spec.

---

## 1. Endpoint(s)

```
GET /api/v1/training/sessions-feed?routineId&sort&cursor   → 200  { data: SessionFeedPage }
```

- **Params:**
  - `routineId` — optional; filter to one routine block. Omitted ⇒ all blocks.
  - `sort` — `recent | oldest | volume | duration` (default `recent`).
  - `cursor` — opaque pagination cursor from the previous page's `nextCursor`;
    omitted ⇒ first page.
- **Cursor pagination** (not offset): the feed is append-only and can be long.
  Each page returns whole + partial blocks; the client **merges blocks across pages**
  by `block.id` (already implemented in `useSessionFeed`).
- **Scope:** `workouts.read`.

---

## 2. Response shape (authoritative TS)

> Copy-paste from native `src/domain/training/models/SessionFeed.ts`. Example =
> `src/domain/training/__fixtures__/sessionFeedFixture.ts` (single page, `nextCursor:null`).

```ts
type BlockState = "active" | "completed" | "paused";
type SessionSort = "recent" | "oldest" | "volume" | "duration";

interface SessionFeedRow {
  id: string;                  // session id
  dateLabel: string;           // "Sáb 31" ⚠️ display-ready (§3)
  monthLabel: string;          // "may"    ⚠️ display-ready (§3)
  type: DayType;               // push|pull|legs|core|rest → bubble color
  name: string;                // "Legs B"
  hasPR: boolean;              // any PR this session (§5 — enrichment)
  prCount: number;             // # of PRs
  volumeLabel: string;         // "16,3 t" ⚠️ display-ready (§3)
  volumeFraction: number;      // 0..1 — bar fill, relative to the block's max (§5)
  durationLabel: string;       // "66m"   ⚠️ display-ready (§3)
}

interface SessionFeedBlock {
  id: string;                  // routine/block id
  name: string;                // "PPL Hipertrofia"
  state: BlockState;
  dateRange: string;           // "12-31 may" ⚠️ display-ready (§3)
  totalVolume: string;         // "174,6 t"   ⚠️ display-ready (§3)
  sessions: SessionFeedRow[];  // newest-first within the block (for sort=recent)
}

interface SessionFeedPage {
  totalCount: number;          // total sessions across all blocks (lead "N sesiones")
  blocks: SessionFeedBlock[];  // this page's blocks (merge by id across pages)
  nextCursor: string | null;   // null ⇒ last page
}

// Request params (client → query):
interface SessionFeedParams { routineId?: string | null; sort?: SessionSort; cursor?: string | null; }
```

---

## 3. Client vs. server — formatting split

This aggregate is the **heaviest on display-ready strings**. Recommended target:
send **raw** numbers + ISO dates + enums; the client formats (digit grouping, month
abbrevs, duration, date ranges). Tracked in §8.1.

| Field | Current fixture | Recommended | Notes |
|---|---|---|---|
| `row.type`, `block.state` | enum | **raw enum** | client → color/label |
| `row.name`, `block.name` | raw | **raw** | verbatim |
| `row.dateLabel`/`monthLabel` `"Sáb 31"/"may"` | display-ready | **→ raw** ISO `completedAt` | client localizes day/month |
| `row.volumeLabel` `"16,3 t"` | display-ready | **→ raw** `{value,unit}` | client formats |
| `row.durationLabel` `"66m"` | display-ready | **→ raw** `durationSeconds` | client renders "66m" |
| `row.volumeFraction` | raw 0..1 | **raw** | server computes (needs the block max) |
| `row.hasPR`/`prCount` | raw | **raw** | server PR detection (§5) |
| `block.dateRange` `"12-31 may"` | display-ready | **→ raw** `{start,end}` ISO | client formats the range |
| `block.totalVolume` `"174,6 t"` | display-ready | **→ raw** `{value,unit}` | client formats |
| `totalCount`, `nextCursor` | raw | **raw** | opaque cursor |

**Fixed on the client:** type bubbles, PR badge, the volume bar styling, block
header chrome, sort/filter sheet UI, all labels.

---

## 4. Field → platform source mapping

| Aggregate field | Domain UC / repo | Exists? | Notes |
|---|---|---|---|
| session rows base | `ListWorkoutSessionsUseCase` (status=completed) | ✓ | already paginated (offset today) |
| `row.{id,name,completedAt}` | session model | ✓ | |
| `row.type` | session's workout-day type | ✓ | join workout day |
| `row.volume*` | session `totalVolume` (SetLog `getTotalVolume()`) | ✓ | raw value exists |
| `row.duration*` | session `durationSeconds` | ✓ | |
| `row.hasPR`/`prCount` | per-session PR detection in `ComputeWorkoutSessionAnalyticsUseCase` | ⚠️ | computed inline, **not exposed** → enrich (§5/§7) |
| `row.volumeFraction` | `row.volume ÷ max(block.sessions.volume)` | **NEW** | needs block grouping first |
| `block` grouping | group sessions by `routineId` into blocks | **NEW** | aggregate concern |
| `block.state` | routine status of the block | ✓ | `GetUserRoutinesUseCase` |
| `block.dateRange` | min/max `completedAt` in the block | ✓ | derive |
| `block.totalVolume` | SUM block session volumes | ✓ | aggregate |
| `totalCount` | count completed sessions (filtered) | ✓ | |
| cursor pagination | — | **NEW** | `ListWorkoutSessionsUseCase` is offset today → add cursor, or wrap |

> **NEW:** block grouping + per-block `volumeFraction`/`dateRange`/`totalVolume`,
> per-session PR flag exposure, and **cursor** semantics (the existing list UC is
> offset-based). The cursor must be stable under the chosen `sort`.

---

## 5. Server-computed business rules

| Rule | Definition | Lives in |
|---|---|---|
| block grouping | sessions partitioned by `routineId`, ordered by the block's recency | aggregate UC |
| `volumeFraction` | `session.totalVolume ÷ max(totalVolume across the block's sessions)`, 0..1 | aggregate UC (NEW) |
| `hasPR`/`prCount` | count of exercises in the session that set a lifetime PR (weight/volume/reps) | from `ComputeWorkoutSessionAnalyticsUseCase` (expose) |
| sort | `recent`=completedAt desc · `oldest`=asc · `volume`=totalVolume desc · `duration`=durationSeconds desc | aggregate UC |
| cursor | opaque, encodes (sort key of last row + id) for stable keyset pagination | aggregate UC (NEW) |

> Note: under `sort=volume|duration`, blocks may interleave sessions differently —
> confirm whether grouping-by-block holds for all sorts or only `recent`/`oldest` (§8.3).

---

## 6. Edge cases

| # | Case | Server behavior | Client |
|---|---|---|---|
| 1 | No sessions ever | `totalCount:0`, `blocks:[]`, `nextCursor:null` | empty: "Aún no hay sesiones registradas." |
| 2 | Last page | `nextCursor:null` | stops `fetchNextPage` |
| 3 | Block spans a page boundary | same `block.id` appears on consecutive pages | client merges by id (done) |
| 4 | `routineId` filter | only that block's sessions | single-block feed |
| 5 | Session with 0 PRs | `hasPR:false`, `prCount:0` | no PR badge |
| 6 | In-progress/canceled sessions | excluded (completed only) | n/a |
| 7 | `volumeFraction` when block has 1 session | `1.0` | full bar |

---

## 7. Platform prerequisites — BLOCKERS

- [ ] **Cursor pagination** — `ListWorkoutSessionsUseCase` is offset-based; the feed
      needs a **stable keyset cursor** per sort. Either extend it or wrap in the aggregate.
- [ ] **Per-session PR flag** — PR detection exists inside
      `ComputeWorkoutSessionAnalyticsUseCase` but is not exposed per session; surface
      `hasPR`/`prCount` (or a lightweight per-session PR count).
- [ ] **Block grouping + per-block derivations** (`volumeFraction`, `dateRange`,
      `totalVolume`) — NEW aggregate logic.
- [ ] **Server-side localization** — all the `*Label` fields should ship raw
      (ISO dates, `{value,unit}`, seconds); client formats. No server i18n.
- [ ] **New aggregate route** `/api/v1/training/sessions-feed` + Zod + inventory entry.
- [ ] **Scope** — `workouts.read`.

---

## 8. Open decisions — PREFERENCES

1. **`*Label` → raw.** Send `completedAt` (ISO), `durationSeconds`, volume
   `{value,unit}`, block range `{start,end}`; client formats. **Recommend:** yes
   (the alternative is a brand-new server i18n layer). *(open)*
2. **Page size** — sessions per page (e.g. 20). **Recommend:** ~one block or 20 rows,
   whichever first; confirm. *(open)*
3. **Grouping under `sort=volume|duration`.** Keep block grouping (sort *within*
   blocks) vs flatten to a ranked list. **Recommend:** keep blocks; sort within. *(open)*
4. **`volumeFraction` denominator** — block max (current) vs a global/normalized max.
   **Recommend:** block max (relative bars per block read best). *(open)*

---

## 9. Contract registration checklist (when implementing)

- [ ] `SessionFeedPage` Zod schema in `@verxion/shared/src/schemas/training.ts`
- [ ] Read-model UC returns `Result<SessionFeedPage>`; groups + derives per §5; cursor stable per sort
- [ ] Expose per-session PR flag from session analytics
- [ ] Route uses `handleResult`; `/api/v1`; `workouts.read`; route inventory → parity green
- [ ] Contract test validates live response vs schema (incl. a multi-page case)
- [ ] Native: regenerate types; swap `getSessionFeed` STUB → `apiClient.get` (honor params); add to `contractDrift.test.ts`

---

## Swap-in checklist (native, when endpoint lands)

1. In `HttpTrainingRepository.getSessionFeed`, replace `return sessionFeedFixture;`
   with `return apiClient.get<SessionFeedPage>("/training/sessions-feed", { routineId, sort, cursor });`
   (the STUB currently ignores params — the real one honors them).
2. Delete `sessionFeedFixture` once unreferenced by tests.
3. Register `["GET","/api/v1/training/sessions-feed"]` under `training` in `contractDrift.test.ts`.
4. No presentation changes — `SesionesSegment`, `useSessionFeed` (infinite query), keys are source-agnostic.
