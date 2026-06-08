# Progreso — fundación + lente Resumen (post-review estricto)

**Fecha:** 2026-06-07 · **Branch:** feat/design-system

## Qué se hizo
- Reemplazo completo del módulo `progress` legacy (fan-out a `/analytics/*`) por los
  4 read-models curados de `/api/v1/progress`: domain (4 modelos + IProgressPort 11→4 +
  `__fixtures__`), application (4 UCs, 11 legacy borrados), infra (HttpProgressRepository
  = 4 GET directos), DI, contractDrift (+bloque progress). 448 tests verdes.
- Presentation: pantalla madre (`ProgresoScreen`) con shell de 3 lentes (SegmentedControl),
  gating empty/fresh/full + loading + error, y la lente **Resumen** completa (StrengthCard
  PR único + ResumenSectionCard por métrica con Sparkline Skia + DeltaChip + chip objetivo).
  Libs `metricVisual` y `format` (es-ES a mano). i18n ns reescrita. 461 tests verdes.

## Post-review estricto — hallazgos y fixes
- 🟠 **Error vs vacío conflados (real UX bug).** `ProgresoScreen` caía en `!overview` ante
  un fallo de red y pintaba el blank-slate "Tu trayectoria empieza aquí", enmascarando el
  error. **Fix:** rama `isError || !overview` → `ProgresoError` con retry, ANTES del check de
  `dataState === "empty"`. Test que verifica que un read fallido NO muestra el invite.
- 🟡 **`formatNumber` podía emitir "−0" / "−0,0"** para negativos que redondean a cero.
  **Fix:** solo prepende "−" si `Number(fixed) !== 0`. + tests del lib (era la lógica más
  delicada y no tenía cobertura).
- 🟡 **RefreshControl crudo** en ResumenView → cambiado a `GlassRefreshControl` (de marca).
- 🟢 `overview.strengthPr!` (non-null assertion) → capturado en `const pr` narrowed.
- 🟢 Clave i18n `goalChip` sin uso → eliminada de es/en.

Arquitectura: PASS (architecture-checker, 24 ficheros, 0 violaciones).

## Patrones / lecciones
- **Regla:** con TanStack Query, `isError` debe tener su propia rama ANTES de tratar
  `!data` como "vacío" — si no, un error se disfraza de estado vacío. El proyecto ya tenía
  el patrón (`SegmentError` en training); lo repliqué.
- **Hermes/Intl:** formateo es-ES a mano (grouping "." + decimal ",") como `relativeTime.ts`,
  no `Intl.NumberFormat`. Validar en simulador.
- **Read-only:** el contrato no trae veredictos editoriales ni el agrupado de perímetros del
  proto → diferidos (additive), no inventados en cliente. El índice "+9% fuerza" se descartó
  (decisión A): el card usa `strengthPr` único.
- Fixtures viven en `domain/<m>/__fixtures__` (neutrales, = payloads de test); el repo es
  HTTP-directo (contrato vivo), sin clase Fixture aparte.

## Pendiente (siguiente)
Métricas (drill-down → /measure on-expand), Historial (Cinta⇄Carrete), subpáginas
Detalle de medida + ejercicio (route→stack + navegación de las cards), Compartir.
