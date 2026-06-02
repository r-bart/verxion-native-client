# Verxion Native Client

A read-only iOS companion app for the [Verxion](https://verxion.app) fitness
platform, built with Expo. It connects to a Verxion REST API to **view your
training and body-composition data** and perform three quick micro-writes
(log weight, water, and steps). Everything else (creating routines, logging
workouts, nutrition planning) lives in the platform itself.

This repository is **open source so you can run your own client against your
Verxion account, or use it as a reference for building your own.** It is a
clean, production-style Expo app you can learn from: Clean Architecture + DDD,
TanStack Query, NativeWind, Better Auth, and Skia/Reanimated charts.

> [!NOTE]
> This is a **client only**. It does not include the Verxion backend. Point it
> at your own Verxion-compatible API via `EXPO_PUBLIC_API_URL` (see
> [Configuration](#configuration)).

## Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Expo SDK 56 | New Architecture, Hermes v1 |
| Navigation | Expo Router v5 | File-based routing |
| Styling | NativeWind v4 | Tailwind v3 syntax |
| UI | react-native-reusables | shadcn-style, copy-paste components |
| Server state | TanStack Query v5 | |
| Client state | Zustand v5 | Minimal — auth/preferences only |
| Auth | Better Auth + `@better-auth/expo` | Sessions in `expo-secure-store` |
| Charts | victory-native + `@shopify/react-native-skia` | |
| HTTP | native `fetch` | No axios, no SDK |

## Architecture

Clean Architecture + DDD. Dependencies point **inward only**:

```
domain  ←  application  ←  infrastructure  ←  presentation  ←  app/
```

```
src/
  domain/          # Pure types: models + repository ports (zero dependencies)
  application/     # Use cases — one class per operation
  infrastructure/  # Port implementations: HTTP repositories, DI container, auth, i18n
  presentation/    # UI: screens, feature components, TanStack Query hooks
app/               # Expo Router route files (thin, 3-5 lines each)
```

Every data operation (read or write) flows through a Use Case, accessed in the
UI via a dependency-injection hook (`useDI`). HTTP calls live **only** in
`infrastructure/repositories/`. The full rules live in
[`.claude/rules/architecture.md`](.claude/rules/architecture.md).

## Getting started

**Prerequisites:** Node.js 20.19.4+ and the [Expo](https://docs.expo.dev/) tooling.

```bash
npm install
cp .env.example .env        # then edit EXPO_PUBLIC_API_URL
npx expo start
```

This is iOS-only and uses the New Architecture, so it requires a development
build (Expo Go is not supported). See the
[Expo dev client docs](https://docs.expo.dev/develop/development-builds/introduction/).

## Configuration

The app reads a single public env var:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000   # your Verxion API base URL
```

All requests go to `${EXPO_PUBLIC_API_URL}/api/v1/*`. Authentication uses a
Better Auth session cookie stored in `expo-secure-store`.

## Scripts

```bash
npm run start       # Expo dev server
npm run ios         # build & run on iOS
npm run lint        # ESLint
npm run typecheck   # tsc (app + tests/scripts)
npm test            # Jest
npm run test:e2e    # Maestro flows
```

## Contributing

Issues and pull requests are welcome. Please run `npm run lint`,
`npm run typecheck`, and `npm test` before opening a PR.

## License & trademark

Licensed under the [Apache License 2.0](LICENSE). You are free to use, modify,
and distribute this code — including to build your own Verxion client.

The Apache 2.0 license does **not** grant any rights to the **"Verxion" name,
logo, or brand** (see Section 6 of the license). If you ship your own client,
please use your own branding.
