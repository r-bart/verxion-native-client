# "Entreno · Ejercicios (biblioteca)" — rationale, edge cases & API spec

> Architecture contract (fixed — see `CLAUDE.md` + `.claude/rules/architecture.md`):
> one screen → one aggregate read-model; domain UC composing UCs/repos (no MCP, no
> HTTP); all derivation server-side; response → Zod → OpenAPI → native codegen.
>
> Status: **draft for the API agent.** | Design ref: `design_handoff_entreno/screenshots/02-Entreno (Ejercicios segment)`.
> Native built against the `getExerciseLibrary` STUB in `HttpTrainingRepository`
> (returns `exerciseLibraryFixture`; swap to HTTP is a one-line repo change).
> Design thesis: *"tu catálogo de ejercicios con tu historial — busca, filtra, y entra al detalle."*

---

## SCOPE

The **Entreno tab → `Ejercicios` segment**: the exercise catalog as a searchable,
filterable list with each exercise's training status (PR / log count / unlogged).
Search / group / equipment filter / sort run **client-side** over a single read.
Exercise **detail** (history, e1RM chart, how-to) is a separate (deferred) spec.

---

## 1. Endpoint(s)

```
GET /api/v1/training/exercise-library        → 200  { data: ExerciseLibrary }
```

- **Params:** none. Returns the user-relevant catalog (curated + the user's custom)
  with per-exercise training status + filter facets, in one read. Search / filter /
  sort are **100% client-side** (`useExerciseLibraryView`). No pagination in v1 —
  confirm catalog size (§8.2).
- **Scope:** `workouts.read`.

---

## 2. Response shape (authoritative TS)

> Copy-paste from native `src/domain/training/models/ExerciseLibrary.ts`. Example =
> `src/domain/training/__fixtures__/exerciseLibraryFixture.ts`. `ExercisePart` is the
> non-rest `DayType`.

```ts
type ExercisePart = "push" | "pull" | "legs" | "core";   // = Exclude<DayType,"rest">

interface ExerciseLibraryItem {
  id: string;
  name: string;                 // "Press banca"
  muscle: string;               // "Pecho"   (primary target)
  group: string;                // "Pecho"   (muscle group facet — may equal muscle)
  equipment: string;            // "Barra"
  part: ExercisePart;           // push|pull|legs|core → bubble color (§5 — mapping)
  prLabel: string | null;       // "82,5 kg" ⚠️ display-ready (§3); null if no PR
  logCount: number;             // times this exercise has been logged
  isCustom: boolean;            // user-created
}

interface ExerciseLibraryFacets {
  groups: string[];             // distinct muscle groups (filter chips)
  equipment: string[];          // distinct equipment
}

interface ExerciseLibrary {
  exercises: ExerciseLibraryItem[];
  facets: ExerciseLibraryFacets;
}
```

---

## 3. Client vs. server — formatting split

| Field | Current fixture | Recommended | Notes |
|---|---|---|---|
| `name/muscle/group/equipment` | raw | **raw** | verbatim (English from the catalog — §7-B) |
| `part` | enum | **raw enum** | client → bubble color/icon |
| `isCustom` | raw | **raw** | |
| `logCount` | raw | **raw** | client renders "{n} registros" |
| `prLabel` `"82,5 kg"` | display-ready | **→ raw** `{value, unit, kind}` | client formats; kind ∈ weight/reps/volume |
| `facets.*` | raw | **raw** | could be client-derived (§8.3) |

**Fixed on the client:** part bubbles/colors, PR/trophy styling, search + filter +
sort behavior, the "Sin registrar" muted state, all labels.

> **i18n caveat:** the catalog's `name`/`muscle`/`group`/`equipment` come from the
> exercise taxonomy and are **English-only** server-side (§7-B). The native app does
> NOT i18n these (they're proper exercise nouns); accepted as free text.

---

## 4. Field → platform source mapping

| Aggregate field | Domain UC / repo | Exists? | Notes |
|---|---|---|---|
| catalog base (`id,name,muscle,bodyPart,equipment`) | `GetAllExercisesUseCase` | ✓ | curated + custom |
| `isCustom` | `Exercise.source === "custom"` (or `GetUserCustomExercisesUseCase`) | ✓ | |
| `group` | muscle group from taxonomy | ✓ | may equal `muscle` |
| `part` | map muscle/bodyPart → training category (push/pull/legs/core) | **NEW** | §5 — client vocabulary |
| `logCount` | `GetExerciseSessionsUseCase` / `ExerciseAnalyticsRepository.getLifetimeStats()` | ⚠️ | exists but needs a **batch** count per exercise |
| `prLabel` | `GetPersonalRecordsUseCase` (best weight/reps/volume) | ✓ | one "headline" PR per exercise → label |
| `facets.groups/equipment` | `GetExerciseFiltersUseCase` or distinct over the list | ✓ | |

> **Batch concern:** `logCount` + `prLabel` are per-exercise; the library needs them
> for **every** catalog exercise. Avoid N×UC — needs a batched stats query (§7).

---

## 5. Server-computed business rules

| Rule | Definition | Lives in |
|---|---|---|
| `part` | map primary muscle/bodyPart → `push`/`pull`/`legs`/`core` (chest/shoulders/triceps→push; back/biceps/rear-delt→pull; quads/hams/glutes/calves→legs; abs/core→core) | mapping table (NEW) |
| `prLabel` | the exercise's headline PR rendered raw → `{value,unit,kind}`; null if never logged | from `GetPersonalRecordsUseCase` |
| `logCount` | distinct sessions (or set-logs) this exercise appears in, for this user | exercise analytics (batched) |
| `group` | canonical muscle-group bucket for the facet | taxonomy |
| catalog membership | curated catalog ∪ user's custom; exclude deleted | aggregate UC |

---

## 6. Edge cases

| # | Case | Server behavior | Client |
|---|---|---|---|
| 1 | Exercise never logged | `prLabel:null`, `logCount:0` | "Sin registrar" muted |
| 2 | Logged but no PR meaningful | `prLabel:null`, `logCount>0` | "{n} registros" |
| 3 | Custom exercise | `isCustom:true` | (detail later shows the custom flag) |
| 4 | Bodyweight/time exercises (e.g. Plancha) | PR `kind` may be reps/time, not weight | client formats by `kind` |
| 5 | Muscle that doesn't map cleanly to a part | fallback `part` (e.g. forearms→pull) | confirm fallback (§8.1) |
| 6 | Huge catalog | (see §8.2 — pagination/scoping) | client search filters |

---

## 7. Platform prerequisites — BLOCKERS

- [ ] **`part` mapping** — there is no muscle→training-category (push/pull/legs/core)
      mapping today; needs a server-owned table (the client uses it only for color).
- [ ] **Batched per-exercise stats** — `logCount` + `prLabel` for the whole catalog
      in one query (not N×UC). Probe `ExerciseAnalyticsRepository` for a batch path.
- [ ] **Catalog scoping** — define "the user-relevant catalog": full curated set
      (could be large) vs only exercises the user has logged + their custom + a
      searchable remainder. **Decision §8.2.**
- [ ] **Server-side localization** — exercise nouns are English-only; accepted as
      free text (not i18n'd client-side). `prLabel` ships raw + client formats.
- [ ] **New aggregate route** `/api/v1/training/exercise-library` + Zod + inventory entry.
- [ ] **Scope** — `workouts.read`.

---

## 8. Open decisions — PREFERENCES

1. **`part` fallback** for muscles that don't map cleanly (forearms, neck, full-body).
   **Recommend:** nearest bucket, default `pull`. *(open)*
2. **Catalog scoping / pagination.** If the curated catalog is large, returning it
   whole bloats the payload. **Recommend:** v1 returns the user's logged exercises +
   custom + a curated "common" set; full search hits a separate catalog endpoint
   later. Confirm catalog size. *(open)*
3. **`facets` server- vs client-derived.** **Recommend:** server includes them
   (consistent ordering). *(open)*
4. **`prLabel` shape.** Single headline PR vs structured `{weight,reps,volume}`.
   **Recommend:** raw `{value,unit,kind}` headline; full PRs live in exercise detail. *(open)*

---

## 9. Contract registration checklist (when implementing)

- [ ] `ExerciseLibrary` Zod schema in `@verxion/shared/src/schemas/training.ts`
- [ ] Read-model UC returns `Result<ExerciseLibrary>`; **batches** logCount + PR per exercise
- [ ] `part` mapping table built + unit-tested
- [ ] Route uses `handleResult`; `/api/v1`; `workouts.read`; route inventory → parity green
- [ ] Contract test validates live response vs schema
- [ ] Native: regenerate types; swap `getExerciseLibrary` STUB → `apiClient.get`; add to `contractDrift.test.ts`

---

## Swap-in checklist (native, when endpoint lands)

1. In `HttpTrainingRepository.getExerciseLibrary`, replace `return exerciseLibraryFixture;`
   with `return apiClient.get<ExerciseLibrary>("/training/exercise-library");`.
2. Delete `exerciseLibraryFixture` once unreferenced by tests.
3. Register `["GET","/api/v1/training/exercise-library"]` under `training` in `contractDrift.test.ts`.
4. No presentation changes — `EjerciciosSegment`, `useExerciseLibrary`, `useExerciseLibraryView`, keys are source-agnostic.
