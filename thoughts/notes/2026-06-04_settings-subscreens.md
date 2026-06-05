# Settings subscreens — lessons learned (2026-06-04)

Branch: `feat/design-system`. Plan: `~/.claude/plans/reflective-drifting-floyd.md`.

## What was built
Full account-management surface: 9 subscreens (hub, account, personal/fitness,
sessions, connected-apps, data, health, notifications, about) + a `settings`
domain/application/infrastructure module and a `health` scaffold module.
Deliberate, documented departure from strict read-only: *account* management is a
write surface; *fitness content* stays read-only on the platform.

## What worked well
- **Contract audit before trusting the Explore agent.** The agent's API report was
  ~90% right but inferred some envelopes. Verifying against the platform's actual
  zod schemas + `handleResult` (`{ data }` envelope) and then probing **staging**
  unauthenticated (paths → 401, writes → `MISSING_IDEMPOTENCY_KEY` then 401)
  confirmed every path/method/shape end-to-end without needing a session.
- **Loader + inner-form + `key`-remount** seeding pattern. The React Compiler ESLint
  rules reject `setState` inside an effect and impure calls (`Date.now()`) in render.
  Splitting `Screen` (loads) from `Form` (seeds via `useState` initializers, remounts
  on a server-derived `key`) cleared both and removed all act() warnings.
- Heavy reuse of onboarding form primitives (`OptionList`, `DateOfBirthField`,
  `useUsernameAvailability`) cut the Personal/Account screens to mostly wiring.

## What was tricky
- **`.expo/cache/eslint` staleness**: newly-created files reported `import/no-unresolved`
  until the cache was cleared. Always `rm -rf .expo/cache/eslint` before trusting lint
  on new files.
- i18n key collisions: `settings.account` (string) vs an account-screen subtree.
  Resolved by namespacing all screen copy under `settings.screens.*`.

## Patterns discovered
- **Pattern**: shared domain kernel (`domain/_shared/`) for vocabulary used by two
  domain modules. **When**: two peer domains need the same enums/value objects —
  never let one domain import another (caught by strict review here).
- **Pattern**: form state from async query → loader gate + child seeded by `useState`
  initializer + remount `key` = `serverFieldsSnapshot`. **When**: editable screens
  backed by TanStack Query under the React Compiler.

## Strict-review fixes (done)
- **Domain purity**: moved the shared fitness enums to `domain/_shared/fitness.ts`
  (shared kernel); `onboarding` and `settings` both depend on it, neither on the other.
- **Cross-feature presentation coupling**: promoted the reused primitives to
  `presentation/_shared/` — `components/{OnboardingButton,Field,OptionList,DateOfBirthField}`,
  `hooks/useUsernameAvailability` (decoupled: inline query key + `errorCode` instead of
  onboarding `copy`), `hooks/useCurrentUser` + `keys.ts` (`userKeys.currentUser` — the
  authenticated user is app-shared, not onboarding-owned). Zero settings↔onboarding imports.
- **Telemetry**: all 9 settings write mutations now `track(...)` success/failure via `useDI`.

## Follow-ups (not done this round)
- Optimistic UI for connected-app scope toggles; real binary export download; native
  HealthKit binding; expo-notifications wiring.
