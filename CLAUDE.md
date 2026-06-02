# Verxion Native Client

Read-only iOS companion app for the Verxion fitness platform, built with Expo.
It consumes a Verxion REST API. **All CRUD happens on the platform** — this app
is for **viewing data and 3 quick micro-writes only** (weight, water, steps).

## Stack (pinned)

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Expo SDK | 56 (New Architecture, Hermes v1) |
| Navigation | Expo Router | v5 (file-based) |
| Styling | NativeWind | v4 (Tailwind v3 syntax) |
| UI | react-native-reusables | shadcn philosophy: copy-paste, not a library |
| Server state | TanStack Query | v5 |
| Client state | Zustand | v5 (minimal — auth/preferences only) |
| Auth | Better Auth + `@better-auth/expo` | sessions in `expo-secure-store` |
| Charts | victory-native + `@shopify/react-native-skia` | |
| HTTP | native `fetch` | no axios |

## Architecture — Clean Architecture + DDD

Full rules in `.claude/rules/architecture.md`. Dependencies point inward only:

```
domain  ←  application  ←  infrastructure  ←  presentation  ←  app/
```

```
src/
  domain/          # Layer 0 — pure types: models + repository ports (I{Module}Port)
  application/     # Layer 1 — use cases ({Verb}{Noun}UseCase), depend on domain only
  infrastructure/  # Layer 2 — HTTP repositories, DI container, auth client, i18n
  presentation/    # Layer 3 — screens, feature components, TanStack Query hooks
app/               # Expo Router route files (3-5 lines: import screen, default export)
```

### Dependency rule (strict)

- **domain** imports nothing
- **application** imports domain ports/models only
- **presentation** accesses use cases via `useDI()` — never imports repos or `apiClient`
- **app/** imports only from `presentation/` (screens)

### Data flow

```
Route → Screen → Hook (useDI → UC.execute()) → Port → HttpRepository → apiClient → API
```

Every operation (read or write) flows through a Use Case. No shortcuts.

## Key rules

### Read-only first
- This app does NOT create, update, or delete resources — except 3 quick
  actions: log weight, water, steps.
- No workout session store, routine wizard, or exercise config. If a feature
  requires CRUD, it belongs on the platform, not here.

### API communication
- All data comes from a Verxion REST API (`${EXPO_PUBLIC_API_URL}/api/v1/*`).
- Auth via a Better Auth session cookie (stored in `expo-secure-store`); use
  `getCookie()` from `@better-auth/expo` for the auth header.
- HTTP calls live ONLY in `infrastructure/repositories/` — nowhere else.

### UI components
- react-native-reusables (shadcn for RN): Card, Badge, Button, Skeleton, Tabs,
  Progress, Separator. Dark theme, hsl colors via NativeWind CSS variables.

### Code style
- TypeScript strict, functional components only.
- Co-locate hooks with features. Screen files are thin (compose components);
  logic lives in hooks. Route files are 3-5 lines.

## Quality checks

```bash
npm run lint        # ESLint
npm run typecheck   # tsc — app (tsconfig.json) + tests/scripts (tsconfig.test.json)
npm test            # Jest
npx expo start      # dev server
```

## Environment

```
EXPO_PUBLIC_API_URL=http://localhost:3000   # your Verxion API base URL
```
