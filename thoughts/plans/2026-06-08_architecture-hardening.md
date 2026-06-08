# Implementation Plan: Architecture Hardening

**Date**: 2026-06-08
**Status**: Implemented with residual Jest native-handle follow-up

---

## Overview

Turn the 2026-06-08 architecture audit into executable guardrails and small
refactors. The goal is not to rewrite the app; it is to make the current Clean
Architecture shape enforceable, reduce ambiguous exceptions, isolate temporary
fixtures, and make API drift harder to miss.

## Requirements

- [ ] Enforce layer boundaries automatically during normal quality checks.
- [ ] Keep Expo Router files thin, especially `app/_layout.tsx`.
- [ ] Move i18n/bootstrap side effects out of presentation imports.
- [ ] Isolate fixture-backed training read models so `HttpTrainingRepository`
      is no longer a mixture of live HTTP and stubs.
- [ ] Expand contract drift coverage to every real `apiClient.*` route and add
      a coverage guard so new repository calls cannot be left unregistered.
- [ ] Formalize the allowed exceptions for domain constants/errors and
      cross-cutting DI services.
- [ ] Reduce quality noise enough that architecture regressions stand out.
- [ ] Keep the app behavior unchanged unless explicitly called out.

## Spec Tests

No `thoughts/tests/` directory exists, so there are no pre-generated spec tests
to integrate. Recommendation: no `/generate-tests` needed for this hardening
plan; the work is mostly guardrails/refactors with targeted script/tests.

---

## Approach Analysis

### Option A: Guardrails-First Incremental Hardening

**Description**: Add executable checks first, then refactor the specific gaps
the audit found: route bootstrap, i18n bootstrap, fixture isolation, contract
registry coverage, and documented exceptions.

**Pros**:
- Prevents future drift immediately.
- Keeps behavior stable while tightening boundaries.
- Lets the architecture checker define exactly what is allowed.
- Works without new npm dependencies.

**Cons**:
- Adds local scripts that must be maintained.
- Some current exceptions need careful wording so the checker does not become
  too strict or too permissive.

**Complexity**: Medium.

### Option B: Full Architecture Rewrite

**Description**: Split every cross-cutting service into domain/application
ports, move all fixtures out of `domain`, introduce typed OpenAPI wrappers, and
rework repository composition in one large pass.

**Pros**:
- Cleaner theoretical architecture.
- Could remove most exceptions.

**Cons**:
- High churn across auth, onboarding, settings, training, tests, and DI.
- Easy to break working screens.
- More rework than the audit requires.

**Complexity**: High.

### Option C: Docs-Only Alignment

**Description**: Update `CLAUDE.md` and `.claude/rules/architecture.md` to match
current practice, but do not add tooling or refactor code.

**Pros**:
- Very fast.
- No product risk.

**Cons**:
- Does not solve the biggest finding: architecture rules are currently social,
  not executable.
- Leaves fixtures and contract drift coverage as recurring risks.

**Complexity**: Low.

### Recommendation

Use **Option A**. It closes the important gaps while preserving the app's current
UX and delivery cadence. Option B can be revisited later for typed API helpers,
but it is too much blast radius for this pass. Option C is useful only as a
supporting step, not the main fix.

---

## Architecture Decisions

1. **Use a no-dependency architecture checker script.**
   Create `scripts/check-architecture.ts` and run it via `tsx`. This keeps
   enforcement close to the repo and avoids pulling in a boundary plugin.

2. **Make `npm run lint` include architecture checks.**
   The local guide says quality is `npm run lint && npm run typecheck &&
   npm test`; putting architecture in `lint` means existing habits catch it.

3. **Move root bootstrap into `presentation/app/RootLayout.tsx`.**
   `app/_layout.tsx` should become a route delegator. The app-shell component
   can own fonts, splash, `GestureHandlerRootView`, CSS import, providers, and
   `AppShell`.

4. **Bootstrap i18n from infrastructure/DI, not presentation.**
   Add an infrastructure bootstrap module and invoke it during container wiring.
   `AppProvider` should keep importing only `queryClient` and `DIProvider` from
   `infrastructure/di`.

5. **Separate live training HTTP from fixture read models.**
   Keep the UI working, but make the temporary fixture surface explicit:
   `HttpTrainingRepository` handles live HTTP methods; a clearly named fixture
   repository handles pending read-models; a composite training repository
   implements `ITrainingPort` for DI.

6. **Share contract endpoint registry between test and coverage script.**
   Move endpoint rows into `scripts/contract-endpoints.ts`, have
   `contractDrift.test.ts` import them, and add
   `scripts/check-contract-coverage.ts` to compare registry rows against real
   repository `apiClient.*` calls.

7. **Document narrow exceptions instead of pretending they do not exist.**
   Allow immutable domain constants/error classes and a named list of
   cross-cutting DI services. The checker should encode the same rules.

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Add `architecture:check`, `contract:coverage`; wire them into `lint` |
| `scripts/check-architecture.ts` | Create | Enforce layer boundaries, route thinness, and restricted imports |
| `scripts/check-contract-coverage.ts` | Create | Ensure every real repository API call appears in contract registry |
| `scripts/contract-endpoints.ts` | Create | Shared contract endpoint inventory for drift test and coverage script |
| `src/infrastructure/api/__tests__/contractDrift.test.ts` | Modify | Import endpoint inventory instead of owning manual rows inline |
| `app/_layout.tsx` | Modify | Reduce to a thin route delegator |
| `src/presentation/app/RootLayout.tsx` | Create | Own app bootstrap/render shell formerly in `app/_layout.tsx` |
| `src/presentation/app/AppProvider.tsx` | Modify | Remove direct i18n infrastructure side-effect import |
| `src/infrastructure/di/bootstrap.ts` | Create | Initialize i18n and telemetry once from infrastructure |
| `src/infrastructure/di/container.ts` | Modify | Call bootstrap; wire composite training repo |
| `src/infrastructure/repositories/HttpTrainingRepository.ts` | Modify | Remove fixture imports/returns; keep live HTTP behavior |
| `src/infrastructure/repositories/FixtureTrainingReadModelsRepository.ts` | Create | Explicit temporary fixture-backed training read models |
| `src/infrastructure/repositories/TrainingRepository.ts` | Create | Composite `ITrainingPort` implementation delegating to HTTP + fixture repos |
| `src/infrastructure/repositories/__tests__/HttpTrainingRepository.test.ts` | Modify | Cover live HTTP methods only |
| `src/infrastructure/repositories/__tests__/FixtureTrainingReadModelsRepository.test.ts` | Create | Pin explicit fixture-backed methods |
| `src/infrastructure/repositories/__tests__/TrainingRepository.test.ts` | Create | Verify composite delegation |
| `.claude/rules/architecture.md` | Modify | Align rules with app-shell, domain constants/errors, and DI service exceptions |
| `CLAUDE.md` | Modify | Short project-level summary of new guardrails/scripts |
| `AGENTS.md` | Modify | Update quality command if `lint` now includes architecture checks |
| `jest.setup.js` | Modify if needed | Add teardown/reset for open handles once source is identified |
| `src/infrastructure/analytics/posthogClient.ts` | Modify if needed | Add flush/shutdown/reset helper if PostHog causes open handles |
| `src/application/settings/*UseCase.ts` | Modify | Merge duplicate `@/domain/settings` imports to reduce lint noise |
| `src/presentation/onboarding/components/StepTransition.tsx` | Modify | Remove unused `runOnJS` import if still unused |
| `src/infrastructure/repositories/HttpSessionRepository.ts` | Modify | Replace `Array<T>` warning with `T[]` |

---

## Implementation Phases

### Phase 1: Executable Architecture Guardrail

#### Task 1.1: Create `scripts/check-architecture.ts`

**Goal**: Fail on real layer violations using the repo's documented rules.

Checks:
- `domain/` cannot import `application/`, `infrastructure/`, `presentation/`,
  or `app/`.
- `application/` can import `domain/` and same-layer files only. External
  packages are allowed only if explicitly whitelisted; start strict with current
  observed usage.
- `infrastructure/` cannot import `presentation/` or `app/`.
- Feature `presentation/` can import domain types, allowed pure domain values,
  and `@/infrastructure/di/DIContext`; it cannot import repositories, API,
  storage, auth, config, analytics, or application use cases directly.
- `presentation/app/` can import `infrastructure/di/*` as the composition-root
  exception.
- `app/` can import only `presentation/app/*` or `presentation/*/screens/*`.
- `apiClient` can be imported only by infrastructure repositories, API tests,
  and approved infrastructure mappers/tests.
- Route files should stay thin. Warning threshold: more than 8 non-empty lines;
  hard fail for non-presentation project imports.

Output format:
```text
Architecture check failed:
- [critical] src/application/x.ts imports @/infrastructure/y
- [major] app/foo.tsx imports non-screen presentation module
```

#### Task 1.2: Add package scripts

**File**: `package.json`

Add:
```json
"architecture:check": "tsx scripts/check-architecture.ts",
"contract:coverage": "tsx scripts/check-contract-coverage.ts"
```

Change:
```json
"lint": "expo lint && npm run architecture:check && npm run contract:coverage"
```

#### Task 1.3: Add script-focused tests or fixtures if useful

If the checker logic becomes non-trivial, add a tiny fixture-based test under
`scripts/__tests__/check-architecture.test.ts`. Otherwise, the source tree run
itself is acceptable as the first guard.

### Phase 2: Root Route and Bootstrap Cleanup

#### Task 2.1: Create `src/presentation/app/RootLayout.tsx`

Move from `app/_layout.tsx`:
- global CSS import
- `SplashScreen.preventAutoHideAsync()`
- `useAppFonts()`
- `GestureHandlerRootView`
- `AppProvider`
- `AppShell`

Keep comments that explain splash and gesture root requirements.

#### Task 2.2: Thin `app/_layout.tsx`

Expected shape:
```tsx
import { RootLayout } from "@/presentation/app/RootLayout";

export default RootLayout;
```

#### Task 2.3: Move i18n side effect into infrastructure bootstrap

Create `src/infrastructure/di/bootstrap.ts`:
- import `@/infrastructure/i18n/i18n`
- call `initPostHog()` once
- expose `bootstrapInfrastructure()`

Update `container.ts`:
- call `bootstrapInfrastructure()` during module initialization
- remove direct `initPostHog()` import/call

Update `AppProvider.tsx`:
- remove `import "@/infrastructure/i18n/i18n";`
- keep only `queryClient` and `DIProvider` imports from `infrastructure/di`.

### Phase 3: Explicit Training Fixture Isolation

#### Task 3.1: Split fixture-backed read models out of `HttpTrainingRepository`

Create `FixtureTrainingReadModelsRepository` with:
- `getExerciseLibrary`
- `getRoutineLibrary`
- `getRoutineDetailView`
- `getDayDetailView`

It may import the existing training fixtures, but the class name must make the
temporary behavior explicit.

#### Task 3.2: Keep `HttpTrainingRepository` live-only

Remove fixture imports and fixture-returning methods from
`HttpTrainingRepository`. Keep live methods such as:
- `getRoutineDashboard`
- `getSessionFeed`
- `getSessionDetailView`
- raw routine/session/exercise/progression methods

If TypeScript requires a full `ITrainingPort`, stop declaring
`HttpTrainingRepository implements ITrainingPort`; the composite class will
carry that implementation.

#### Task 3.3: Create composite `TrainingRepository`

`TrainingRepository implements ITrainingPort` and delegates:
- live methods -> `HttpTrainingRepository`
- pending read models -> `FixtureTrainingReadModelsRepository`

This preserves current UI behavior while making stubs visible and searchable.

#### Task 3.4: Update DI wiring and tests

In `container.ts`:
```ts
const trainingRepo = new TrainingRepository(
  new HttpTrainingRepository(),
  new FixtureTrainingReadModelsRepository()
);
```

Update tests:
- `HttpTrainingRepository.test.ts` no longer expects fixture returns from HTTP.
- New fixture repo test pins the temporary fixture behavior.
- New composite repo test verifies delegation.

### Phase 4: Complete API Contract Coverage

#### Task 4.1: Move endpoint registry into `scripts/contract-endpoints.ts`

Export module-grouped rows:
```ts
export const CONTRACT_ENDPOINTS = {
  settings: [["GET", "/api/v1/users/me"], ...],
  activity: [...],
} as const;
```

Include every real `apiClient.*` call currently in repositories:
- activity steps/water
- analytics routes
- exercise catalog routes
- measurements weight
- nutrition daily logs and analytics weekly summary
- sessions list/live-progress/progression
- raw routines/day exercise routes
- all current settings/today/training/nutrition/program/progress rows

Do not include commented future URLs or fixture-only methods.

#### Task 4.2: Update `contractDrift.test.ts`

Import `CONTRACT_ENDPOINTS`, flatten rows, and keep existing shape-invariant
tests.

#### Task 4.3: Create `scripts/check-contract-coverage.ts`

Scan `src/infrastructure/repositories/**/*.ts` for `apiClient.get/post/put/patch/delete/postForm`
calls and compare normalized paths against `CONTRACT_ENDPOINTS`.

Rules:
- ignore comments
- normalize `/foo/${id}` to `/api/v1/foo/{param}`
- match any `{param}` names by segment position
- fail if a real call has no registry row
- fail if a registry row no longer has a matching live call unless it is marked
  as a shape-only contract row

#### Task 4.4: Re-run contract drift locally

If the sibling `../verxion-platform/contracts` repo is present, the Jest drift
test should validate all registered rows. If absent, it may still skip, but the
coverage script must run regardless.

### Phase 5: Rule Alignment and Documentation

#### Task 5.1: Update `.claude/rules/architecture.md`

Clarify:
- `presentation/app/` is the only app-shell exception.
- feature presentation may import `useDI` from `infrastructure/di/DIContext`.
- immutable domain constants and domain error classes are allowed when they are
  pure and have no infrastructure dependency.
- cross-cutting DI services are allowed only by named keys: telemetry,
  onboarding draft storage, language preference, last auth provider, and app
  metadata.
- `Http*Repository` classes should not serve fixtures; fixture-backed behavior
  must be in explicitly named fixture repositories.
- `contract:coverage` and `architecture:check` are part of quality.

#### Task 5.2: Update `CLAUDE.md` and `AGENTS.md`

Keep it short:
- quality command remains `npm run lint && npm run typecheck && npm test`
  because `lint` now includes architecture + contract coverage.
- mention `npm run architecture:check` for focused boundary debugging.
- mention `npm run contract:coverage` for repository/contract inventory drift.

### Phase 6: Quality Noise and Jest Open Handles

#### Task 6.1: Clean low-risk lint warnings

Targets:
- merge duplicate `@/domain/settings` imports in settings use cases
- remove unused `runOnJS` in `StepTransition`
- change `Array<T>` to `T[]` in `HttpSessionRepository`
- remove unused imports in tests where straightforward

Keep `require()` warnings in Jest mocks only if converting them would make the
mocks less stable. If retained, document why or add a local ESLint override for
test setup/mocks.

#### Task 6.2: Investigate Jest open handles

Run:
```bash
npm test -- --runInBand --detectOpenHandles
```

Likely suspects:
- PostHog native client initialization
- global `queryClient`
- i18n/native localization setup

Fix options:
- add a test-only analytics reset/shutdown helper
- clear React Query client in test teardown
- ensure bootstrap is idempotent and no native client starts when no key exists

Done only when Jest exits without the "did not exit" warning.

### Phase 7: Final Verification and Post-Review

#### Task 7.1: Final verification and post-review

Run:
```bash
npm run lint
npm run typecheck
npm test -- --runInBand
```

Then run a post-review pass focused on:
- no new layer exceptions slipped in
- route files remain thin
- no production HTTP repo imports `__fixtures__`
- every `apiClient.*` call appears in the registry

---

## Task Dependencies

```yaml
dependencies:
  1.1: []
  1.2: [1.1]
  1.3: [1.1]
  2.1: [1.1]
  2.2: [2.1]
  2.3: [2.1]
  3.1: [1.1]
  3.2: [3.1]
  3.3: [3.1, 3.2]
  3.4: [3.3]
  4.1: []
  4.2: [4.1]
  4.3: [4.1]
  4.4: [4.2, 4.3]
  5.1: [1.1, 2.3, 3.3, 4.3]
  5.2: [5.1]
  6.1: [1.2]
  6.2: [2.3]
  7.1: [1.2, 2.2, 2.3, 3.4, 4.4, 5.2, 6.1, 6.2]
```

---

## Risk Analysis

### Edge Cases

- [ ] `app/_layout.tsx` CSS import order changes and NativeWind globals stop
      loading. Verify UI/tests after moving the import.
- [ ] `SplashScreen.preventAutoHideAsync()` runs too late after moving modules.
      Keep it at module top in `RootLayout.tsx`.
- [ ] i18n is initialized after first `useTranslation()`. Ensure DI/container
      bootstrap loads before `AppShell` children render.
- [ ] Architecture checker flags many test-only imports. Scope production and
      test rules separately.
- [ ] Contract coverage script mis-parses dynamic template strings. Keep the
      first implementation conservative and print clear remediation guidance.
- [ ] Fixture isolation changes class names used by tests. Update tests in the
      same phase, not later.

### Technical Risks

- [ ] Updating `lint` to include scripts makes lint slower and stricter.
      Mitigation: scripts are no-dependency static scans and should finish fast.
- [ ] Composite `TrainingRepository` may feel like extra abstraction.
      Mitigation: it exists only because the current port contains both live and
      pending read-models; remove it once all endpoints are live.
- [ ] Contract registry can become another manual list.
      Mitigation: coverage script fails if real `apiClient` calls and registry
      rows drift apart.
- [ ] Jest open-handle fix might touch global setup. Keep changes minimal and
      verify all tests pass twice.

---

## Testing Strategy

- Script checks:
  - `npm run architecture:check`
  - `npm run contract:coverage`
- Unit tests:
  - fixture repository returns expected training fixtures
  - composite training repository delegates each method to the expected inner
    repository
  - contract endpoint flattening still feeds `contractDrift.test.ts`
- Existing integration/unit suite:
  - `npm test -- --runInBand`
- Focused manual/code review:
  - route files under `app/` import only presentation app/screen modules
  - no `apiClient` outside infrastructure
  - no `Http*Repository` imports `__fixtures__`

---

## Done Criteria

### Phase 1: Guardrails

- [ ] `npm run architecture:check` passes on the current repo.
- [ ] A deliberate local layer violation causes `architecture:check` to fail
      with a readable message.
- [ ] `npm run lint` runs Expo lint plus architecture and contract coverage
      checks.

### Phase 2: Bootstrap

- [ ] `app/_layout.tsx` is a thin delegator to `presentation/app/RootLayout`.
- [ ] `src/presentation/app/AppProvider.tsx` no longer imports
      `@/infrastructure/i18n/i18n`.
- [ ] i18n keys still resolve in screen tests; no raw translation keys appear.

### Phase 3: Fixtures

- [ ] `HttpTrainingRepository.ts` has no imports from `__fixtures__`.
- [ ] Fixture-backed methods live in an explicitly named fixture repository.
- [ ] DI still provides one `ITrainingPort` implementation to all existing use
      cases.
- [ ] Training screens/hooks tests still pass.

### Phase 4: Contract Coverage

- [ ] Every real repository `apiClient.*` call has a registry row.
- [ ] `contractDrift.test.ts` uses the shared registry.
- [ ] `npm run contract:coverage` fails if a repository call is added without a
      registry row.

### Phase 5: Documentation

- [ ] `.claude/rules/architecture.md`, `CLAUDE.md`, and `AGENTS.md` describe the
      same boundary rules that scripts enforce.
- [ ] Domain constants/error classes and cross-cutting DI services are explicitly
      named as narrow exceptions.

### Phase 6: Quality Noise

- [ ] Lint warnings are reduced, or remaining warnings are test/mock-specific and
      documented.
- [ ] `npm test -- --runInBand` exits without the open-handle warning.

### Overall

- [ ] All phases complete.
- [ ] Quality checks pass:
      `npm run lint && npm run typecheck && npm test -- --runInBand`.
- [ ] No TODO/FIXME/HACK introduced.
- [ ] No architecture layer violations.
- [ ] No production HTTP repository imports fixtures.
- [ ] Audit health score can be revised upward from 72/100 to at least 88/100.

---

## Verification

Package manager: npm (`package-lock.json` present).

Implemented on 2026-06-08. Final checks run:

```bash
npm run lint
npm run typecheck
npm test -- --runInBand --forceExit
```

Results:

- `npm run lint`: passed. Remaining lint warnings are test/mock `require()`
  imports only.
- `npm run typecheck`: passed.
- `npm test -- --runInBand --forceExit`: passed, 108 suites / 525 tests.
- `SettingsScreen`/TanStack Query `act(...)` warnings were removed by making
  test Query notifications deterministic in `src/__tests__/test-utils.tsx`.
- `npm test -- --runInBand` still prints the Jest open-handle warning and does
  not exit by itself in this local macOS/React Native/Jest environment. The
  visible retained native resource is `fsevents.node` / kqueue from
  `jest-haste-map`; JS diagnostics show no active app handles beyond
  stdout/stderr. This remains the follow-up for Task 6.2.

Original intended checks:

```bash
npm run lint
npm run typecheck
npm test -- --runInBand
```

If Jest still reports open handles:

```bash
npm test -- --runInBand --detectOpenHandles
```

Then run a post-review/audit follow-up and update
`thoughts/audit/2026-06-08_audit.md` or create a new audit note with the closed
findings.
