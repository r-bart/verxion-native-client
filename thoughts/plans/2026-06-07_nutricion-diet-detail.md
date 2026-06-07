# Implementation Plan: Nutrición · Detalle de dieta (diet-detail)

**Date**: 2026-06-07 · **Status**: Approved (full-auto) · **Phase**: 2 of 8

## Overview
Replace the `dieta/[id].tsx` placeholder with the real **Detalle de dieta** screen,
consuming the curated `GET /nutrition/diet-detail/{planId}` (`getDietDetail`). Mirror
of Entreno's "Detalle de rutina". Read-only; adjust-diet CTA → `/agent`.

## Reconciliation (DietDetail read-model → handoff `dieta-detalle-core`)
`DietDetail`: header (id, name, goal|null, state, targets{MacroSet}, proteinGoal,
mealCount, waterGoal{value,L}, week|null, weeks|null, weekFraction|null, scoreState,
score|null, adherence|null, daysLogged, endDate|null) + `meals[]` (id, name, mealType,
orderIndex, isKey, macros{MacroSet}, targets{MacroSet}|null) + agentNote|null.

| Handoff | Source | Class |
|---|---|---|
| hero name/goal/state/week cells/score | direct | 🟢 |
| stats grid: comidas/kcal/proteína/agua | mealCount, targets.kcal, proteinGoal, waterGoal | 🟢 |
| "{daysLogged} días registrados · {adherence}% adherencia" | daysLogged, adherence | 🟢 |
| meal cards (kcal·P/C/G, "principal") | meals[].macros, isKey, mealType→icon | 🟢 |
| agent note | agentNote | 🟢 |
| context "última: {lastDay}" | not in read-model | 🟠 drop |
| meal swap banner | not in read-model | 🟠 drop (lives in meal-detail) |
| meal time | no clock in read-model — order by orderIndex | 🟠 drop |

## Files
- domain: `models/DietDetail.ts` (new); `ports/INutritionPort.ts` (−getDietPlanDetail, +getDietDetail); **delete `models/DietPlan.ts`**.
- application: `GetDietDetailUseCase.ts` (+test); delete `GetDietPlanDetailUseCase.ts`.
- infra: `HttpNutritionRepository` (−getDietPlanDetail/DietPlan imports, +getDietDetail → `/nutrition/diet-detail/{id}`); `container.ts` swap; `contractDrift.test.ts` +`/nutrition/diet-detail/{planId}`.
- presentation: `hooks/useDietDetail.ts`, `keys.dietDetail(id)`, `lib/dietDetailFixture.ts`, `components/DietDetailHero.tsx`, `components/DietMealCard.tsx`, `screens/DietDetailScreen.tsx`. Reuse `DietWeekBar`/`ScoreChip`/`AgentNoteCard`/`mealTypeVisual`/`dietGoalVisual`/`goalLabel`/`nInt`/`nL`.
- route: `dieta/[id].tsx` → DietDetailScreen.
- mocks: update getDietPlanDetail→getDietDetail in the two UC test port mocks.
- i18n: `nutrition.dietDetail.*` es/en.

## Done Criteria
- `getDietDetail(id)` → DietDetail from `/nutrition/diet-detail/{id}`; no `getDietPlanDetail`/`DietPlan` left (`grep` empty); `DietPlan.ts` deleted.
- contractDrift covers `/nutrition/diet-detail/{planId}`.
- `dieta/[id].tsx` renders DietDetailScreen (no placeholder); meal card → meal-detail route carrying planId+mealId; ask-agent → `/agent`.
- typecheck + lint + test green; architecture-checker PASS.
