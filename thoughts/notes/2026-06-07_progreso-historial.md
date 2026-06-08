# Progreso — lente Historial (Cinta ⇄ Carrete) · post-review estricto

**Fecha:** 2026-06-07 · **Branch:** feat/design-system

## Qué se hizo
Lente 3 del Progreso. HistorialView (toggle Cinta/Carrete + loading/error/fresh).
- **Cinta:** ReadoutAll cross-dominio en el scrub + 3 HistoryLane (Skia área+línea+
  cambio-de-fase+playhead compartido) + scrub + JumpChips (PR) + PhaseSummary.
- **Carrete:** capítulos por band (name/why + "nueva etapa") + hitos PR con expand
  (snapshot 3 dominios + ver-ejercicio). Datos por SEMANA → etiquetas relativas.
- lib/history.ts (bandAtWeek/valueAtWeek/weeksAgo/fillForward). 479 tests.

## Post-review estricto — hallazgos y fixes
- 🟠 **Scrub atrapaba el scroll vertical.** El scrub iba con el responder system
  (`onMoveShouldSetResponder=>true`) dentro de un ScrollView → bloqueaba el scroll
  vertical al empezar el gesto sobre los carriles. **Fix:** gesture-handler `Gesture.Pan()`
  con `.activeOffsetX([-8,8])` + `.failOffsetY([-12,12])` → el pan solo se activa en
  arrastre horizontal y cede el vertical al ScrollView. (`GestureHandlerRootView` ya en
  app/_layout.tsx por gorhom). Requirió mocks de jest (gesture-handler + `runOnJS`).
- 🟡 **Punto null hundía la curva a 0.** `points.map(p=>p.value??0)` craterea con nulls.
  **Fix:** `fillForward` (forward-fill; back-fill de nulls iniciales).
- 🟡 **Historial empty caía en Cinta vacía.** **Fix:** `dataState!=="full" || series.length===0`
  → nota "se está escribiendo" (como fresh).
- + tests unitarios de lib/history (sin cobertura antes).

Arquitectura: PASS (architecture-checker, 7 ficheros, 0 violaciones).

## Lección / patrón (→ CLAUDE.md)
**Controles scrubbables dentro de un ScrollView:** usar gesture-handler `Pan` con
`activeOffsetX`/`failOffsetY`, NUNCA el responder system (`onMoveShouldSetResponder`),
que secuestra el scroll vertical. El root ya tiene `GestureHandlerRootView`. En tests,
gesture-handler y `runOnJS` van mockeados en jest.setup.js.

## Pendiente
Métricas (drill-down) — única lente en placeholder. Compartir spike. Diferido:
Cinta focus-mode (Ribbon ampliado), Editar/reordenar Resumen, agrupado perímetros.
