# Implementation Plan: Unificación y cobertura de loading skeletons

**Date**: 2026-06-08
**Status**: Complete (todas las fases ✅ · 534/534 tests · typecheck/lint/architecture/contract en verde)

---

## Overview

Unificar el manejo de estados de carga en **un único primitivo de skeleton** y
cubrir las pantallas que hoy se salen del patrón. Hoy conviven dos primitivos
(el `Skeleton` animado de NativeWind y bloques `GlassSurface` estáticos), el
helper `Block` está duplicado en dos archivos, y **9 pantallas con peticiones
muestran un `ActivityIndicator` genérico** en vez de una silueta con forma de
contenido.

## Requirements

- [ ] Un único primitivo canónico de skeleton (`SkeletonBlock`) en `_shared`.
- [ ] El primitivo pulsa sutilmente, gateado por `useReducedMotion` (regla
      Reanimated de CLAUDE.md — el `Skeleton` actual NO la respeta).
- [ ] Eliminar el helper `Block` duplicado (`RoutineDashboardSkeleton`,
      `PlanSegmentSkeleton`) reusando el primitivo.
- [ ] Cubrir las 6 pantallas de **Settings** y las 3 de **Progress** que usan
      spinner de carga inicial, con skeletons con forma de contenido.
- [ ] Adoptar el primitivo en los branches `GlassSurface` inline ya existentes
      (Training / Nutrition / Program) → consistencia visual y animación.
- [ ] Pulido opcional: `DataScreen`, `SettingsScreen`, `LoginScreen`.
- [ ] Sin violaciones de capas; `typecheck`/`lint`/`test` en verde.

---

## Approach Analysis

### Option A: Estandarizar en un `SkeletonBlock` sobre `GlassSurface`

**Description**: Crear un primitivo único, wrapper fino de `GlassSurface` con un
pulso de opacidad gateado por `useReducedMotion`. Es el lenguaje visual dominante
(~16 pantallas ya usan bloques glass vs 1 sola usa el `Skeleton` NativeWind).
Migrar `TodaySkeleton` y deprecar el uso del `Skeleton` NativeWind en la app.

**Pros**:
- Un solo patrón, coherente con la estética glass de toda la app.
- Reconcilia "animado" (lo del `Skeleton`) con "glass" (lo de los bloques).
- Borra el helper `Block` duplicado.
- Respeta la regla de reduced-motion que el primitivo actual viola.

**Cons**:
- Toca muchos archivos (churn mecánico en branches inline).
- Migrar `TodaySkeleton` reescribe un componente que ya funciona.

**Complexity**: Medium

### Option B: Mantener ambos primitivos, solo cubrir los 9 huecos

**Description**: Dejar `Skeleton` y los bloques `GlassSurface` como están; solo
reemplazar los 9 `ActivityIndicator` por skeletons (usando el patrón inline que
ya existe).

**Pros**: Mínimo churn, riesgo bajo.
**Cons**: No unifica — sigue habiendo dos primitivos y el helper duplicado; la
petición explícita del usuario fue "unificar **y** cubrir todo".

**Complexity**: Low

### Recommendation

**Option A.** Es lo que pidió el usuario (unificar + cubrir) y deja el sistema en
un solo patrón mantenible. El churn es mecánico y de bajo riesgo (paridad visual),
y se hace por fases verificables. La migración de `TodaySkeleton` se aísla en su
propia tarea para poder validarla sola.

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/presentation/_shared/components/SkeletonBlock.tsx` | Create | Primitivo canónico (glass + pulso gateado) |
| `src/presentation/_shared/components/SkeletonBlock.test.tsx` | Create | Render + reduced-motion |
| `src/presentation/today/components/TodaySkeleton.tsx` | Modify | Migrar a `SkeletonBlock` |
| `src/presentation/training/components/RoutineDashboardSkeleton.tsx` | Modify | Borrar `Block`, usar primitivo |
| `src/presentation/nutrition/components/PlanSegmentSkeleton.tsx` | Modify | Borrar `Block`, usar primitivo |
| `src/presentation/training/screens/RutinaDetalleScreen.tsx` | Modify | Branch inline → `SkeletonBlock` |
| `src/presentation/training/screens/DiaDetalleScreen.tsx` | Modify | Branch inline → `SkeletonBlock` |
| `src/presentation/training/screens/SesionDetalleScreen.tsx` | Modify | Branch inline → `SkeletonBlock` |
| `src/presentation/training/screens/RutinasScreen.tsx` | Modify | Branch inline → `SkeletonBlock` |
| `src/presentation/training/components/SesionesSegment.tsx` | Modify | Branch inicial → `SkeletonBlock` (footer paginación se queda) |
| `src/presentation/training/components/EjerciciosSegment.tsx` | Modify | Branch inline → `SkeletonBlock` |
| `src/presentation/nutrition/screens/DietasScreen.tsx` | Modify | Branch inline → `SkeletonBlock` |
| `src/presentation/nutrition/screens/DietDetailScreen.tsx` | Modify | Branch inline → `SkeletonBlock` |
| `src/presentation/nutrition/screens/FoodDetailScreen.tsx` | Modify | Branch inline → `SkeletonBlock` |
| `src/presentation/nutrition/screens/DietDayPlanScreen.tsx` | Modify | Branch inline → `SkeletonBlock` |
| `src/presentation/nutrition/screens/MealDetailScreen.tsx` | Modify | Branch inline → `SkeletonBlock` |
| `src/presentation/nutrition/screens/DiaryDayScreen.tsx` | Modify | Branch inline → `SkeletonBlock` |
| `src/presentation/nutrition/components/DiarioSegment.tsx` | Modify | Branch inline → `SkeletonBlock` |
| `src/presentation/nutrition/components/AlimentosSegment.tsx` | Modify | Branch inline → `SkeletonBlock` |
| `src/presentation/program/screens/ProgramLibraryScreen.tsx` | Modify | Branch inline → `SkeletonBlock` |
| `src/presentation/program/screens/ProgramDetailScreen.tsx` | Modify | Branch inline → `SkeletonBlock` |
| `src/presentation/settings/components/SettingsSkeleton.tsx` | Create | Skeleton compartido form/list dentro de `SettingsScaffold` |
| `src/presentation/settings/screens/AccountScreen.tsx` | Modify | Spinner → `SettingsSkeleton variant="form"` |
| `src/presentation/settings/screens/PersonalScreen.tsx` | Modify | Spinner → `SettingsSkeleton variant="form"` |
| `src/presentation/settings/screens/PrivacyScreen.tsx` | Modify | Spinner → `SettingsSkeleton variant="form"` |
| `src/presentation/settings/screens/HealthScreen.tsx` | Modify | Spinner → `SettingsSkeleton variant="list"` |
| `src/presentation/settings/screens/SessionsScreen.tsx` | Modify | Spinner → `SettingsSkeleton variant="list"` |
| `src/presentation/settings/screens/ConnectedAppsScreen.tsx` | Modify | Spinner → `SettingsSkeleton variant="list"` |
| `src/presentation/progress/components/ResumenSkeleton.tsx` | Create | Skeleton del Resumen de Progreso |
| `src/presentation/progress/screens/ProgresoScreen.tsx` | Modify | Spinner → `ResumenSkeleton` |
| `src/presentation/progress/components/ExerciseDetailSkeleton.tsx` | Create | Skeleton de detalle de ejercicio (+ guía) |
| `src/presentation/progress/screens/ExerciseDetailScreen.tsx` | Modify | Spinner (x2) → `ExerciseDetailSkeleton` |
| `src/presentation/progress/components/MeasureDetailSkeleton.tsx` | Create | Skeleton de detalle de medida |
| `src/presentation/progress/screens/MeasureDetailScreen.tsx` | Modify | Spinner → `MeasureDetailSkeleton` |
| `src/presentation/settings/screens/DataScreen.tsx` | Modify | (Pulido) badge de estado con skeleton |
| `src/presentation/settings/screens/SettingsScreen.tsx` | Modify | (Pulido) `ProfileCard` skeleton si `user` cargando |
| `src/presentation/auth/screens/LoginScreen.tsx` | Modify | (Pulido) spinner visible durante sign-in |

> **No se toca**: `OnboardingButton`, `AuthGuard`, `UsernameStep`,
> `HistorialView`, `TimelineItemCard` (sus `ActivityIndicator` son spinners de
> botón / paginación / acción puntual — uso correcto, no carga inicial).

---

## Implementation Phases

### Phase 1: Primitivo canónico

#### Task 1.1: Crear `SkeletonBlock`
**File**: `src/presentation/_shared/components/SkeletonBlock.tsx`
```tsx
import { useEffect } from "react";
import type { DimensionValue, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";

type Props = {
  /** Block height in px. */
  height: number;
  /** Optional fixed width (defaults to full width of the parent slot). */
  width?: DimensionValue;
  radius?: number;
  style?: ViewStyle;
};

/**
 * SkeletonBlock — the canonical loading placeholder. A muted GlassSurface block
 * that gently pulses (gated by reduced-motion). Replaces the per-file `Block`
 * helpers and the centered ActivityIndicator spinners so every screen loads with
 * a content-shaped silhouette in the same glass language. Pulse runs only in an
 * effect, never in the render body (Reanimated rule, CLAUDE.md).
 */
export function SkeletonBlock({ height, width, radius = 16, style }: Props) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      false
    );
  }, [opacity, reduced]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[width != null ? { width } : null, animatedStyle]}>
      <GlassSurface radius={radius} style={[{ height }, style]} />
    </Animated.View>
  );
}
```

#### Task 1.2: Test del primitivo
**File**: `src/presentation/_shared/components/SkeletonBlock.test.tsx`
- Renderiza sin crash con `height`.
- Con `useReducedMotion` mock → no lanza (el mock ya devuelve `false` en
  `jest.setup.js:144`; añadir un caso forzando `true` vía `jest.spyOn`).

### Phase 2: Migrar skeletons dedicados al primitivo

#### Task 2.1: `RoutineDashboardSkeleton` + `PlanSegmentSkeleton`
Borrar el helper local `Block` de ambos; importar `SkeletonBlock` y sustituir
`<Block height=… radius=… />` por `<SkeletonBlock height=… radius=… />`.
Geometría idéntica → paridad visual + pulso nuevo.

#### Task 2.2: `TodaySkeleton`
Reescribir con `SkeletonBlock`. Las líneas de texto → bloques finos
(`height: 12/28`, `width` fija); el ring → `height/width: 128, radius: 9999`;
las cards → bloques con su `radius`. Mantener el ritmo de layout actual.

### Phase 3: Adoptar el primitivo en branches inline (unificación de breadth)

#### Task 3.1: Training
`RutinaDetalleScreen`, `DiaDetalleScreen`, `SesionDetalleScreen`,
`RutinasScreen`, `EjerciciosSegment`, `SesionesSegment` (solo el branch de carga
**inicial**; el footer `isFetchingNextPage` se queda con su spinner).
Reemplazar `<GlassSurface radius style={{height}} />` por `<SkeletonBlock …/>`.

#### Task 3.2: Nutrition
`DietasScreen`, `DietDetailScreen`, `FoodDetailScreen`, `DietDayPlanScreen`,
`MealDetailScreen`, `DiaryDayScreen`, `DiarioSegment`, `AlimentosSegment`.

#### Task 3.3: Program
`ProgramLibraryScreen`, `ProgramDetailScreen`.

### Phase 4: Cubrir Settings (6 pantallas)

#### Task 4.1: `SettingsSkeleton` compartido
**File**: `src/presentation/settings/components/SettingsSkeleton.tsx`
```tsx
import { View } from "react-native";
import { SettingsScaffold } from "./SettingsScaffold";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";

type Props = { title: string; variant: "form" | "list" };

/** Loading placeholder for settings subscreens, rendered inside the scaffold so
 *  the header/back chrome stays put. `form` = label+field pairs; `list` = rows. */
export function SettingsSkeleton({ title, variant }: Props) {
  return (
    <SettingsScaffold title={title}>
      <View style={{ gap: variant === "form" ? 18 : 10 }}>
        {variant === "form" && <SkeletonBlock height={120} radius={20} />}
        {Array.from({ length: variant === "form" ? 4 : 5 }).map((_, i) => (
          <SkeletonBlock key={i} height={variant === "form" ? 56 : 72} />
        ))}
      </View>
    </SettingsScaffold>
  );
}
```

#### Task 4.2: Conectar Settings
En cada pantalla, sustituir el branch
`return (<SettingsScaffold …><ActivityIndicator/></SettingsScaffold>)` por
`return <SettingsSkeleton title={…} variant={…} />`.
- `form`: Account, Personal, Privacy.
- `list`: Health, Sessions, ConnectedApps.
Conservar el título i18n actual de cada pantalla.

### Phase 5: Cubrir Progress (3 pantallas)

#### Task 5.1: `ResumenSkeleton` + `ProgresoScreen`
Crear `ResumenSkeleton` (hero + 2-3 cards con `SkeletonBlock`) y reemplazar el
branch `isLoading` (spinner centrado, `ProgresoScreen.tsx:84-87`). Renderizar
**debajo** del header existente para no perder el chrome del título.

#### Task 5.2: `ExerciseDetailSkeleton` + `ExerciseDetailScreen`
Skeleton de cabecera + bloque de gráfico + filas de historial. Reemplazar el
spinner principal (`:114`) y el de la pestaña guía (`:293`).

#### Task 5.3: `MeasureDetailSkeleton` + `MeasureDetailScreen`
Skeleton que imita el card de la medida + gráfico. Reemplazar spinner (`:83`).

### Phase 6: Pulido (opcional, confirmar con el usuario)

#### Task 6.1: `DataScreen` — badge de estado
Mientras `latest.isLoading` (primera carga), renderizar un `SkeletonBlock`
pequeño en lugar del badge `export-status`.

#### Task 6.2: `SettingsScreen` — ProfileCard
Si `useCurrentUser().isLoading`, mostrar un `SkeletonBlock` con la silueta del
`ProfileCard` en vez de la tarjeta con nombre vacío.

#### Task 6.3: `LoginScreen` — feedback de sign-in
Mostrar un `ActivityIndicator` (spinner de acción, correcto aquí) en el botón
activo durante `isPending`, además del disabled actual.

### Phase 7: Verificación

`typecheck` → `lint` (incluye `architecture:check` + `contract:coverage`) →
`test`. Revisar tests que renderizan estas pantallas en estado de carga.

---

## Task Dependencies

```yaml
dependencies:
  1.1: []
  1.2: [1.1]
  2.1: [1.1]
  2.2: [1.1]
  3.1: [1.1]
  3.2: [1.1]
  3.3: [1.1]
  4.1: [1.1]
  4.2: [4.1]
  5.1: [1.1]
  5.2: [1.1]
  5.3: [1.1]
  6.1: [1.1]
  6.2: [1.1]
  6.3: []
```

---

## Risk Analysis

### Edge Cases
- [ ] **Reduced-motion**: el pulso debe quedar estático (no warnings de
      Reanimated). Ya hay mock en `jest.setup.js:144`.
- [ ] **Ancho de bloques**: `SkeletonBlock` sin `width` debe ocupar el slot del
      padre (igual que `GlassSurface` hoy). Verificar en filas flex.
- [ ] **Pantallas con header propio** (Progreso): el skeleton va **dentro** del
      contenido, no reemplaza la pantalla completa, para no perder el título.

### Technical Risks
- [ ] **Tests existentes** que afirman sobre `ActivityIndicator` o sobre datos
      ya pintados pueden romper. Grep previo: `ActivityIndicator`,
      `getByTestID` de loading. Ajustar asserts a la silueta nueva (sin añadir
      testIDs nuevos salvo necesidad).
- [ ] **`TodaySkeleton`** es el único consumidor del `Skeleton` NativeWind; tras
      migrarlo, dejar el componente `skeleton.tsx` (es de react-native-reusables)
      pero sin uso en la app. No borrarlo en este plan.
- [ ] **Churn amplio en Phase 3**: es paridad visual; revisar pantalla por
      pantalla que la geometría (height/radius) se preserve.

---

## Testing Strategy

- Unit: `SkeletonBlock.test.tsx` (render + reduced-motion forzado).
- Integración (RTL): para 1 pantalla de cada familia tocada (1 Settings, 1
  Progress), forzar `isLoading` y afirmar que aparece la silueta y NO el
  `ActivityIndicator`.
- Manual (simulador): verificar el pulso real y reduced-motion en iOS (Hermes;
  el pulso de opacidad no usa `Intl`, así que no aplica el gap de
  `[[hermes-intl-gap-jest-masks]]`).

---

## Done Criteria

### Phase 1
- [ ] `SkeletonBlock` existe y exporta el primitivo; `SkeletonBlock.test.tsx` pasa.
- [ ] El pulso solo corre en `useEffect` y se gatea con `useReducedMotion`.

### Phase 2
- [ ] `RoutineDashboardSkeleton`/`PlanSegmentSkeleton` ya no definen `Block`.
- [ ] `TodaySkeleton` usa `SkeletonBlock`; "Hoy" carga con la misma silueta.

### Phase 3
- [ ] Ningún branch de carga inicial en Training/Nutrition/Program usa
      `GlassSurface` "pelado" como placeholder: `grep` de `style={{ height`
      dentro de branches `isLoading` → 0 (salvo footers de paginación).

### Phase 4
- [ ] Las 6 pantallas de Settings no muestran `ActivityIndicator` en carga
      inicial: `grep -L SettingsSkeleton` sobre esas 6 → vacío para el branch.

### Phase 5
- [ ] `ProgresoScreen`/`ExerciseDetailScreen`/`MeasureDetailScreen` cargan con
      skeleton con forma de contenido, sin spinner centrado.

### Overall
- [ ] `npm run typecheck` sin errores.
- [ ] `npm run lint` en verde (architecture + contract).
- [ ] `npm test` en verde.
- [ ] Sin TODO/FIXME en el código nuevo.

---

## Verification

```bash
npm run typecheck && npm run lint && npm test
npx expo start   # validación manual en simulador (pulso + reduced-motion)
```
</content>
</invoke>
