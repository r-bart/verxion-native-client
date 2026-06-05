---
name: integrate-endpoint
description: Use when integrating or re-validating a screen's API surface against the platform contract — when the user says "integra los endpoints de X", "revisa el drift de settings", "valida el screen-spec contra la API", or types `/integrate-endpoint <screen-spec>`. Starts from a docs/*-screen-spec.md, deduces the target environment from the sibling platform repo, diffs the live OpenAPI contract against the native module (port/repo/models/inputs), reports classified drifts, and applies native fixes on confirmation. The API contract is always the source of truth.
version: "1.0.0"
---

# Integrate Endpoint

Validate and align a native module's hand-written infrastructure (port, repo,
domain models, inputs) against the **platform OpenAPI contract**, one
**screen-spec** at a time.

**Golden rule — the API contract is the source of truth.** Every drift between
native and the spec is a native problem; fix native to match the contract. Never
propose changing the platform to fit the client. The only exception is a value
the spec genuinely does not describe (e.g. a `requestBody` typed `{}` while the
route clearly needs fields) — there, native keeps what already works at runtime
and you *note* the gap; you do not block on a backend change.

## Inputs

- A screen-spec doc: `docs/<feature>-screen-spec.md` (e.g. `docs/settings-screen-spec.md`).
- If the user names a module instead ("settings"), resolve to `docs/settings-screen-spec.md`.

## Step 0 — Resolve the environment (HARD GATE — never guess)

The native branch does **not** decide the contract (it's usually a feature branch
like `feat/design-system`). The authoritative contract is **per-branch in the
sibling platform repo** (`../verxion-platform/contracts/`). You MUST pass every
check below; on **any** ambiguity or mismatch, STOP and ask the user — do not
fall back to a default.

1. **Find the platform repo branch:**
   ```bash
   git -C ../verxion-platform rev-parse --abbrev-ref HEAD
   ```
2. **Map platform branch → contract file** (per `contracts/README.md`):
   | Platform branch | Contract file | Expected `servers.url` |
   |---|---|---|
   | `develop` | `develop.openapi.json` | `http://localhost:3000` |
   | `staging` | `staging.openapi.json` | `https://api.rbart-dev.com` |
   | `main`    | `prod.openapi.json`    | `https://api.verxion.ai` |

   If the platform branch is none of these, STOP and ask which env to target.
3. **Verify the file exists.** `prod.openapi.json` may be absent (generated only
   at release to `main`). If the target file is missing, STOP and report it.
4. **Verify `servers.url` matches the expected URL** for that file:
   ```bash
   jq -rc '.servers' ../verxion-platform/contracts/<file>
   ```
   If it doesn't match the table, the file is mislabeled — STOP.
5. **Verify the contract actually contains the screen-spec's operations** (Step 1).
   If any referenced `operationId` is missing from the chosen file, the contract
   is stale or you're on the wrong branch — STOP and tell the user to regenerate
   (`pnpm export:openapi <env>` in platform) or switch platform branch.
6. **Cross-check (warn, don't block):** the native build's configured base URL
   (env / app config, `EXPO_PUBLIC_API_URL`) should point at the same env as the
   chosen file's `servers.url`. If they diverge, WARN — you may be validating
   against an env the app doesn't target.

State explicitly which file you resolved and why before proceeding.

## Step 1 — Parse the screen-spec → declared endpoints

Read the screen-spec doc. Extract its declared routes and `operationId`s
(usually in its "Endpoint(s)" and "Response/Input shapes" sections). Build the
work-list of operations to validate. Reference operations by **`operationId`**,
never by path string.

## Step 2 — Extract the real contract shapes

For each operationId, pull the request body, every response code, and the 2xx
schema with `$ref`s resolved. Reusable jq (run from `../verxion-platform`):

```bash
# request + response codes + 2xx schema for an operationId
jq -c --arg OP "$OP" '
  .paths | to_entries[] | .key as $p | .value | to_entries[]
  | .key as $m | .value | select(.operationId == $OP)
  | { op:.operationId, method:($m|ascii_upcase), path:$p,
      codes:(.responses|keys),
      req:(.requestBody.content["application/json"].schema // null),
      res2xx:(.responses["200"].content["application/json"].schema
              // .responses["201"].content["application/json"].schema // null) }
' contracts/<file>

# resolve a component
jq -c --arg S "<SchemaName>" '.components.schemas[$S]' contracts/<file>
```

Note carefully: the **response envelope is `{ data: <Component> }`**; the native
`apiClient` auto-unwraps `.data` (see `src/infrastructure/api/apiClient.ts`), so
the repo should type the **inner** shape. Also capture **error codes** — they
drive empty-state handling (e.g. a `404`, not a `204`, may mean "no resource").

## Step 3 — Locate the native module

For module `<m>`, read:
- `src/domain/<m>/ports/I<M>Port.ts`
- `src/domain/<m>/models/*.ts` and `models/inputs.ts`
- `src/infrastructure/repositories/Http<M>Repository.ts`

## Step 4 — Diff & classify

Compare contract ⇄ native. Classify each drift:

- 🔴 **Bug (fix native now):** native contradicts the contract and breaks at
  runtime — wrong error handling (`204` assumed where the spec returns `404`),
  wrong field name, missing required field, wrong envelope.
- 🟡 **Scope (note):** the API offers more than native consumes (extra fields,
  extra endpoints, richer enums). Not broken; record as available surface.
- 🟠 **Spec gap (note, don't escalate):** the contract under-describes a body the
  route needs. Native keeps what works at runtime; record the gap. Per the golden
  rule, do **not** ask the platform to change.

Apply known native↔API renames (from the screen-spec's "field renames" table),
e.g. `sex`↔`gender`, `firstName`↔`name`, `fitnessGoals.primary`↔`primaryGoal`.
Watch for enum tightening (e.g. `sportTags` is a fixed enum) and divergent
validation (e.g. username patterns differ per endpoint).

## Step 5 — Report

Produce a classified report: per operation, the verdict (✓ aligned / 🔴 / 🟡 /
🟠) with the concrete contract-vs-native diff and the proposed native fix. Lead
with 🔴 bugs.

## Step 6 — Apply on confirmation

After the user confirms, apply the native fixes (repo mapping, domain model,
input shape, error handling — never the contract), then run:

```bash
npm run typecheck && npm run lint
```

Leave the tree green. If the contract changed shapes broadly, remind the user to
regenerate types:

```bash
npx openapi-typescript ../verxion-platform/contracts/<file> \
  -o src/infrastructure/api/generated/api-types.d.ts
```

## Boundaries

- Touch only native (`src/domain`, `src/application`, `src/infrastructure`).
  Never edit the platform repo or its contracts.
- Stay within the architecture rules: HTTP only in `infrastructure/repositories`,
  repos map raw API shapes → domain models, presentation untouched.
