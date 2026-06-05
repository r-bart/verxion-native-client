# Entreno — Phase 0 scaffold (post-review, strict)

**Branch:** feat/design-system · **Date:** 2026-06-05

## What shipped
Presentation + nested-routing scaffold for the **Entreno** tab (9 screens as one
nested stack under `app/(tabs)/workout/` → `presentation/app/EntrenoStack`).
New presentation module `src/presentation/training/` (mirrors the `training`
domain): 9 screens, `trainingKeys` factory, `useEntrenoSegment` hook, and four
components (`SegmentedControl`, `DetailHeader`, `DetailScaffold`, `WipBody`).
i18n `training` namespace (es/en). No data layer touched — domain/application/
infrastructure for training/sessions/progress already existed and are wired in DI.

## Lessons learned

### What worked well
- **Reusing existing primitives.** `GlassSurface`, `ScreenBloom`, `glass.ts`,
  `sans()/mono()` already encode the handoff's design language. Building only the
  genuinely-missing primitives (segmented control, back chrome) kept the diff small.
- **Thin-route / presentation-navigator split** (`_layout.tsx` → `EntrenoStack`)
  mirrored `SettingsStack` cleanly — architecture-checker passed all hard rules.

### What was difficult / caught in review
- **Reanimated shared-value updates must live in `useEffect`, never the render
  body.** First pass wrote `x.value = withTiming(...)` in render (re-fires the
  timing every render + Reanimated warnings). Repo convention is `useEffect`
  (see `GhostTimeline`, `StepTransition`). Fixed.
- **Screen-thinness rule is easy to soft-violate.** Segment `useState` + options
  array sat in `EntrenoScreen`; extracted to `useEntrenoSegment`. Cheap now, costly
  after real segment content lands.

### Pattern: nested stack inside a NativeTab
- `NativeTabs.Trigger name="workout"` resolves to the `workout/` directory; its
  `_layout.tsx` Stack owns push/pop. List+detail grouped by folder
  (`rutinas/`, `sesiones/`). `sesion.tsx` (live) ≠ `sesiones/` (history) — no collision.
- **Tab bar on detail screens (resolved as native-correct):** investigated —
  neither `expo-router` NativeTabs nor `react-native-screens` exposes a per-screen
  API to hide the native `UITabBar` on push (no `hidesBottomBarWhenPushed`). The
  handoff's "tab bar only on landing" is a web-ism; the native equivalent is the
  already-configured `minimizeBehavior="onScrollDown"` (liquid-glass minimize on
  scroll). Keeping detail routes as subroutes of the tab (per product intent) and
  accepting the persistent-but-minimizing bar. Only revisit if product insists on a
  full hide, which would mean hoisting detail routes to the root stack (above tabs).

## Tech debt tracked (remove during F1–F3)
- Demo nav rows with hardcoded Spanish strings (`PPL Hipertrofia →`, `Push A · 26 may →`,
  `▶ Empezar sesión`) in `RutinasScreen`/`RutinaDetalleScreen`/`DiaDetalleScreen`/
  `PrescripcionScreen`/`SesionesScreen`/`SesionDetalleScreen` — placeholders proving
  push depth; replace with real data-driven rows + i18n.
- `WipBody` placeholder bodies — delete per screen as real composition lands.
- `as Href` string casts on `router.push` bypass typed routes — revisit if typed
  routes are enabled.

## Open data gaps for backend (contract-driven)
1. `Routine` model lacks `week/weeks/scoreState/weekFrac/volTrend` the active-routine hero needs.
2. Confirm `SessionExerciseReport` carries real per-set breakdown + `scores{effort,quality,pump}` + `muscles[]`.
