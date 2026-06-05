# "<Pantalla>" — rationale, edge cases & API spec

> **How to use this template.** One file per native screen. Fill every section.
> The goal: by the time this doc is done, the API agent can implement the
> read-model(s) with **zero open product questions** — only platform decisions.
>
> Architecture contract (fixed — see `CLAUDE.md` + `docs/ARCHITECTURE.md`):
> - One screen → **one aggregate read-model** under `/api/v1`, not client fan-out.
> - The aggregate is a **domain UC composing other domain UCs/repos**. It does
>   NOT call MCP tools, and it does NOT call the API over HTTP.
> - All business derivation is **server-side**. The native app is a read-only
>   viewer: layout + icons/colors + locale formatting only.
> - Response type → Zod schema in `@verxion/shared` → OpenAPI (`/openapi.json`)
>   → native codegen (`openapi-typescript`). The parity test enforces the route
>   is documented; the codegen is how native gets the type.
>
> Status: **draft for the API agent.** | Design ref: `screenshots/...` | Native
> screen built against `Fixture<X>Repository` (swap to HTTP is a one-line DI change).
> Design thesis: *"<one line>"*

---

## 1. Endpoint(s)

```
GET /api/v1/<resource>?<params>        # primary aggregate
→ 200  <ResponseTypeName>
```

- **Params:** `<param>` — `<meaning; what omitted means; server-resolved?>`
- **Lazy/detail endpoints (if any):** list them; each is a separate route.
  Default to **reusing existing per-entity detail endpoints** before adding a new
  aggregate-detail route — only add one if you need a *uniform union shape* the
  existing endpoints don't give.

---

## 2. Response shape (authoritative TS)

> This block is the source of truth for the Zod schema in `@verxion/shared`.
> Keep it copy-paste-able from the native `domain/<x>/models/`.

```ts
interface <ResponseTypeName> {
  // ...
}
```

---

## 3. Client vs. server — formatting split

Everything *displayed* is computed server-side. The client adds no business
logic. For each field, mark how it's sent:

- **raw** — number + `unit` enum; client applies locale digit grouping/decimals.
- **display-ready** — server-formatted localized string; client paints verbatim.
- **server-localized free text** — agent/coach prose; rendered verbatim (NOT i18n'd).
- **timestamp** — full ISO-8601 with offset; client renders local `HH:mm`.

| Field | Mode | Notes |
|---|---|---|
| `<field>` | raw / display-ready / localized / iso | |

**Fixed on the client (not in the response):** `<icons, colors, node styles, header chrome…>`

---

## 4. Field → platform source mapping

> RULE: every source MUST be a **domain UC or `/api/v1` route** — never an MCP
> tool name. MCP tools are themselves API consumers; the aggregate composes the
> layer *below* them. Translate any tool name to its backing UC here.

| Aggregate field | Domain UC / repo method | Exists? | Notes |
|---|---|---|---|
| `<field>` | `<UseCaseName>` / `<repo.method>` | ✓ / ✗ / **NEW** | |

> Mark **NEW** for any field with no backing UC — those become **new domain
> services to build**, not composition. List them again in §7.

---

## 5. Server-computed business rules

Every derivation, threshold, and constant the server owns. The client treats
these as opaque.

| Rule | Definition | Constant/threshold | Lives in |
|---|---|---|---|
| `<e.g. front.closed>` | `<condition>` | `<value>` | `<domain service>` |

---

## 6. Edge cases

| # | Case | Required server behavior | Client handling |
|---|---|---|---|
| 1 | | | |

> Each row that says "server computes X" implies a test. These become the UC's
> test cases.

---

## 7. Platform prerequisites — BLOCKERS

> Not preferences — things that must exist before the read-model is implementable.
> If any is unchecked, flag it; don't silently assume it.

- [ ] **New domain services/derivations** (from §4 **NEW** rows): `<list>`
- [ ] **User timezone source** — is `date`/"today" resolved server-side? From
      where (user profile field? `tz` param/header?). *Currently TZ is NOT a
      canonical user field — it lives on weekly snapshots only.*
- [ ] **User locale source** — needed if any field is display-ready/localized.
      From profile? `Accept-Language`? *The API has no general i18n layer today.*
- [ ] **Server-side string localization** — if §3 has display-ready/localized
      fields beyond free-text coach prose, the API must compose localized strings
      (new capability). Prefer pushing structured captions to **raw + client i18n**.
- [ ] **New migration / column / index** needed? (→ probe in `reconcileDrizzleMigrations.ts`)
- [ ] **New OAuth scope** for the route? (→ update BOTH `auth/scopes.ts` and
      `mcp-server/utils/scopes.ts`; ensure `.read` tier exists)

---

## 8. Open decisions — PREFERENCES (recommend + confirm)

> Genuine platform forks. State a recommendation; mark resolved as they close.

1. `<decision>` — **recommend:** `<X>`. *(open / resolved)*

---

## 9. Contract registration checklist (when implementing)

- [ ] Response Zod schema added to `@verxion/shared/src/schemas/<x>.ts` (+ inferred type, + index export)
- [ ] Read-model UC in `packages/domain` returns `Result<T>`; composes existing UCs/repos
- [ ] New domain services (§7) built + unit-tested
- [ ] Route in `apps/api` uses `handleResult(c, result)`; registered under `/api/v1`
- [ ] Route added to the **OpenAPI route inventory** (`apps/api/src/openapi/routeInventory.ts`) → parity test green
- [ ] Contract test validates the live response against the shared schema
- [ ] Native: regenerate `api-types.ts` from `/openapi.json`; add `Http<X>Repository`; swap DI from fixture

---

## Swap-in checklist (native, when endpoint lands)

1. Add `Http<X>Repository implements I<X>Port` calling `apiClient.get("/<resource>", {…})`, mapping to the model (shapes match).
2. In `infrastructure/di/container.ts`: replace `Fixture<X>Repository` with the HTTP one; delete the fixture.
3. No presentation changes — screen, hook, and keys are source-agnostic.
