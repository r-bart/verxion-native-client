# Verxion Native Client — Agent Guide

Read-only iOS companion app for the Verxion fitness platform. Expo + Clean
Architecture + DDD. See `CLAUDE.md` for the full project overview and
`.claude/rules/architecture.md` for the architecture rules.

## Commands

- **Dev**: `npm run start`
- **Run iOS**: `npm run ios`
- **Quality**: `npm run lint && npm run typecheck && npm test`

Run quality checks after every change.

## Code Style

- **Files**: PascalCase components, camelCase utils
- **Code**: camelCase vars/functions, PascalCase types
- **Unused**: prefix with `_`
- TypeScript strict, functional components only.

## Code Patterns

- **Client state**: Zustand (minimal — auth/preferences only)
- **Server state**: TanStack Query, accessed via `useDI()` hooks
- **Domain logic**: Use Cases (`application/`)
- HTTP calls live ONLY in `infrastructure/repositories/`. Never fetch from UI.

## Architecture

Dependencies point INWARD only:
`domain ← application ← infrastructure ← presentation ← app/`.
See `.claude/rules/architecture.md` for the detailed layer structure and the
violation table.
