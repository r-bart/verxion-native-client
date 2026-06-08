# Architecture Hardening Post-Review

**Date**: 2026-06-08
**Plan**: `thoughts/plans/2026-06-08_architecture-hardening.md`
**Verdict**: Ready with one explicit follow-up

## What Changed

- Added executable architecture and contract guardrails under `scripts/`.
- Moved root layout behavior into `src/presentation/app/RootLayout.tsx`; kept
  `app/_layout.tsx` as a thin delegator.
- Moved i18n/telemetry bootstrap into infrastructure DI bootstrap.
- Split fixture-backed training read models out of `HttpTrainingRepository` and
  introduced a composite `TrainingRepository`.
- Shared contract endpoint rows between `contractDrift.test.ts` and
  `contract:coverage`.
- Reduced lint noise and fixed TanStack Query test `act(...)` warnings.

## Verification

- `npm run lint`: pass. Remaining warnings are test/mock `require()` imports.
- `npm run typecheck`: pass.
- `npm test -- --runInBand --forceExit`: pass, 108 suites / 525 tests.
- `npm run architecture:check`: pass via lint.
- `npm run contract:coverage`: pass via lint.

## Architecture Review

- Clean Architecture direction is now executable via `architecture:check`.
- Route files stay thin; `app/_layout.tsx` delegates to presentation app shell.
- `apiClient` usage remains inside infrastructure.
- Production `Http*Repository` files do not import fixture modules; existing
  fixture mentions in HTTP repositories are comments describing test payloads.
- Fixture-backed training behavior is now searchable by class name.

## Residual

`npm test -- --runInBand` still does not exit naturally in the local macOS React
Native/Jest environment. After removing the app-level `act(...)` warnings,
diagnostics showed no active JS app handles beyond stdout/stderr, while `lsof`
showed `fsevents.node` / kqueue retained by `jest-haste-map`. Keep this as a
separate harness follow-up instead of hiding it as an application bug.

## Lessons

- A contract registry needs a coverage guard; otherwise it becomes another
  manual list.
- Fixture-backed methods can be tolerated temporarily when the class name makes
  the compromise explicit.
- TanStack Query tests are calmer when the notify scheduler is deterministic and
  QueryClients are cleared/unmounted after each test.
