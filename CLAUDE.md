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
- One more write is allowed: **onboarding** (`POST /users/onboard`). It is the
  entry gate, not content CRUD — a brand-new social sign-in has no athlete
  profile, so there is nothing to view until it completes. Same justified
  exception as the 3 micro-writes. The gate is `GET /users/me` →
  `hasAthleteProfile`; `AuthGuard` routes profile-less users to `(onboarding)`.
- **Account & settings management is also a write surface** (the `settings`
  module): your profile (username, display name, bio), personal/fitness
  preferences, app preferences, security (revoke sessions & connected apps),
  and data/privacy (export, delete account). This is *account* management, not
  *fitness-content* CRUD — the same justified-exception family as onboarding
  and the micro-writes. The line is: **content** (workouts, routines, meals,
  measurements beyond the 3 micro-writes) stays read-only and lives on the
  platform; **your account** can be managed here.
- No workout session store, routine wizard, or exercise config. If a *content*
  feature requires CRUD, it belongs on the platform, not here.

### API communication
- All data comes from a Verxion REST API (`${EXPO_PUBLIC_API_URL}/api/v1/*`).
- Auth via a Better Auth session cookie (stored in `expo-secure-store`); use
  `getCookie()` from `@better-auth/expo` for the auth header.
- HTTP calls live ONLY in `infrastructure/repositories/` — nowhere else.

### UI components
- react-native-reusables (shadcn for RN): Card, Badge, Button, Skeleton, Tabs,
  Progress, Separator. Dark theme, hsl colors via NativeWind CSS variables.
- **Equal-width controls in a flex row** (e.g. filter pills): put `flex:1` on a
  plain wrapper `View` around each item — NOT on a `Pressable`'s style-callback
  (a flex returned from `({pressed}) => …` doesn't size the row slot) and NOT on
  a `GlassSurface` (the native iOS 26 GlassView under-fills, or overflows with
  `width:"100%"`). The pill itself is a plain translucent `View`
  (`glass.fill2` + `glass.stroke`), which reads the same as glass at that size.
  GlassSurface is fine as a lone full-width / fixed-size surface. Tests run the
  fallback `View`, so flex-row sizing only shows on device. (See the filter pills
  in `SesionesSegment`/`EjerciciosSegment`.)
- **Scrubbable / draggable controls inside a ScrollView** (e.g. the Cinta's
  timeline scrub): use react-native-gesture-handler `Gesture.Pan()` with
  `.activeOffsetX([-8,8])` + `.failOffsetY([-12,12])` so the pan only claims
  horizontal drags and a vertical drag falls through to the page scroll. Do NOT
  use the RN responder system (`onMoveShouldSetResponder => true`) for this — it
  hijacks vertical scrolling over the control. The root already has
  `GestureHandlerRootView` (`app/_layout.tsx`). gesture-handler + reanimated's
  `runOnJS` are mocked in `jest.setup.js`. (See `CintaView`.)

### Code style
- TypeScript strict, functional components only.
- Co-locate hooks with features. Screen files are thin (compose components);
  logic lives in hooks. Route files are 3-5 lines.
- **Reanimated:** update shared values only inside `useEffect` (or worklets),
  never in the render body — a render-body write re-fires the animation on
  every render. Gate pulses/glow behind `useReducedMotion`. (See
  `GhostTimeline`, `StepTransition`, `SegmentedControl`.)

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
