# Lessons — Entreno staging integration (landing + F4 session-detail)

**Date:** 2026-06-06 · **Branch:** feat/design-system · **Scope:** wire the live
staging read-models behind the Entreno landing (`routine-dashboard`) and the
session-detail report (F4) after the backend shipped + enriched them.

## What worked well

1. **Contract-first reconciliation.** Dumping the staging OpenAPI schema and
   diffing it field-by-field against the native model (before touching code)
   caught every drift up front: raw-vs-display, nullability, renamed fields, and
   the muscle-split→`DayKind` taxonomy change. No guessing at runtime.
2. **Scoping the `DayType`→`DayKind` migration to the landing only** by adding a
   NEW `DayKind` type and leaving legacy `DayType` for the not-yet-reconciled
   sibling models. Zero ripple across the module; the 8-kind chip vocabulary was
   deferred behind a `dayKindChip` fallback instead of a module-wide redesign.
3. **Repo mapper + its own unit test.** `sessionDetailMapper` isolates the
   raw→display transform from the repo wiring; an inline-DTO test locks the
   mapping (formatting, sort/top-N, null-summary degrade, null-assessment) without
   a live API.
4. **`apiClient.get<T>` is a generic passthrough**, so the landing model could
   mirror the contract 1:1 with no mapper, while the session-detail (model ≠
   contract) got a dedicated mapper. Right tool per shape.

## What was tricky / what bit

1. **Locale formatting leaked into the infrastructure layer.** The
   display-ready `*View` models force the formatting to happen *somewhere* at
   runtime once live; I put it in the mapper (`num()` decimal-comma, hardcoded
   Spanish `dateLong`). The architecture rule assigns locale formatting to
   **presentation**. While stubbed this was invisible (the fixture was canned
   data); going live surfaced it as a real layer violation + an en-locale latent
   bug (English users would see Spanish dates). **Takeaway:** when promoting a
   display-ready stub to a live endpoint, the formatting that the fixture used to
   bake in must move to a presentation `lib/`, not into the repo mapper.
   **Resolved (strict-review fix):** model is now raw, `mapSessionDetail` is
   structural-only, and `presentation/training/lib/sessionFormat.ts` does the
   bilingual (es/en) formatting with explicit tables (no Intl).
2. **Ambiguous numeric scales in the contract.** `completionRate`/`percentage`
   carry no documented 0..1-vs-0..100 scale. I used one defensive heuristic
   (`>1 ? x : x*100`) for both — but their NAMES imply different scales (`*Rate`
   = fraction, `percentage` = already 0..100), and the heuristic mis-renders
   sub-1% values as 100%. **Takeaway:** don't unify differently-named scale
   fields under one guess; resolve the scale against a real payload.
3. **`isWarmup` ignored.** The per-set list renders all sets incl. warmups, but
   the `series` tile uses `totalSets` (which may exclude them) → a possible
   count mismatch. Need to confirm whether warmups count and filter/badge them.

## Patterns reaffirmed

- API is source of truth on drift — adapt native to the contract; only flag
  genuine gaps back (the session-detail gap-report → backend enriched 6/7; PR
  dropped by product decision).
- Hermes Intl gap is narrower than I assumed: `Intl.RelativeTimeFormat` is
  missing, but `Intl.NumberFormat`/`DateTimeFormat` work on Hermes-iOS — so a
  presentation-layer locale formatter doesn't have to hand-roll Spanish arrays.
