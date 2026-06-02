# Verxion Native

**The official open-source iOS client for [Verxion](https://verxion.app).**

![License](https://img.shields.io/badge/license-Apache--2.0-blue) ![Expo SDK](https://img.shields.io/badge/Expo%20SDK-56-000020) ![Platform](https://img.shields.io/badge/platform-iOS-lightgrey) ![Status](https://img.shields.io/badge/status-pre--release%20v0.1.0-orange)

A focused companion for your training data: progress, sessions, and body
composition at a glance, plus quick logging of weight, water, and steps.

I'm building Verxion in public — follow along on
[X/Twitter (@_rbart_)](https://x.com/_rbart_) for updates on this client and the
platform.

## Why I built this

Verxion is **agent-first**: you create routines, log workouts, and plan nutrition
by talking to ChatGPT or Claude through MCP. That's great for *doing* things — but
a chat can't draw you a progress chart, and an agent can't read your Apple Health
data or send you a push notification.

This client fills those gaps. Beyond a faster, more visual experience, it's where
the pieces an agent can't reach are meant to live: **HealthKit** on iOS (and
**Health Connect** on Android), **push notifications**, and more over time. I've
also tried to build it as well as I could — Clean Architecture, strict typing, a
real test suite — so it can double as a reference for your own client.

## Two ways to use it

- **Use it as-is.** Sign in with your Verxion account and check your training on
  the go. *(App Store distribution arrives with Verxion v1.)*
- **Build your own.** When Verxion Platform v1 ships, you'll be able to mint your
  own API keys and point a custom client at the Verxion API. This repo is a
  complete, production-grade place to start — fork it, restyle it, make it yours.

> [!NOTE]
> This is a **client only** — it doesn't include the Verxion backend. Point it at
> a Verxion API via `EXPO_PUBLIC_API_URL`.

## Screenshots

_Coming soon._ <!-- today · progress · live session · quick actions -->

## Features

- **Today** — streaks, weekly rings, today's training state, nutrition summary
- **Live session viewer** — follow an in-progress workout, set by set
- **Progress** — overview, body composition, exercises, trends, records, timeline,
  weeks & months
- **Quick actions** — log weight, water, and steps
- Dark-first design, i18n (English & Spanish), and native charts

## Built with care

| Layer | Choice |
|------|--------|
| Framework | Expo SDK 56 (New Architecture, Hermes v1) |
| Navigation | Expo Router v5 |
| Styling | NativeWind v4 |
| Server state | TanStack Query v5 |
| Auth | Better Auth (`expo-secure-store`) |
| Charts | victory-native + Skia |

**Architecture — Clean Architecture + DDD.** Dependencies point inward only:

```
domain  ←  application  ←  infrastructure  ←  presentation  ←  app/
```

Every read or write flows `Route → Screen → Hook → UseCase → Repository → API`.
HTTP lives only in repositories; the UI never touches it directly. The full rules
live in [`.claude/rules/architecture.md`](.claude/rules/architecture.md).

## Getting started

**Prerequisites:** Node.js 20.19.4+ and the [Expo](https://docs.expo.dev/) tooling.
iOS-only; requires a development build (no Expo Go).

```bash
npm install
cp .env.example .env     # set EXPO_PUBLIC_API_URL
npx expo start
```

## Configuration

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000   # your Verxion API base URL
```

All requests go to `${EXPO_PUBLIC_API_URL}/api/v1/*`. Auth uses a Better Auth
session cookie stored securely on device.

## Project structure

```
src/
  domain/          # Pure types: models + repository ports
  application/     # Use cases — one class per operation
  infrastructure/  # HTTP repositories, DI container, auth, i18n
  presentation/    # Screens, components, TanStack Query hooks
app/               # Expo Router routes (thin)
```

## Development

```bash
npm run lint        # ESLint
npm run typecheck   # tsc (app + tests)
npm test            # Jest
npm run test:e2e    # Maestro flows
```

## Status & roadmap

Pre-release (`v0.1.0`). The MVP covers auth, today, the live session viewer,
progress screens, and quick actions.

- [ ] HealthKit (iOS) & Health Connect (Android)
- [ ] Push notifications
- [ ] App Store distribution (with Verxion v1)
- [ ] User-provided API keys (bring your own account)
- [ ] Android support

## Contributing

Issues and PRs welcome. Please run `npm run lint`, `npm run typecheck`, and
`npm test` before opening a PR.

## License & trademark

[Apache License 2.0](LICENSE). Use, modify, and distribute freely — including to
build your own Verxion client.

The license does **not** grant rights to the **"Verxion" name, logo, or brand**
(Section 6). If you ship your own client, please use your own branding.
