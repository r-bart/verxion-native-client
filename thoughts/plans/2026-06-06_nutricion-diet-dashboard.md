# Implementation Plan: Nutrición — landing + segmento **Plan** (`getDietDashboard`)

**Date**: 2026-06-06
**Status**: Draft
**Branch**: `feat/design-system`
**Module**: `nutrition` (new presentation vertical; domain/application/infra partly exist from the legacy build)

---

## Overview

Primer slice del módulo **Nutrición**: la landing de 3 segmentos (Plan/Diario/Alimentos)
con el segmento **Plan** completamente construido contra el read-model real
`GET /api/v1/nutrition/diet-dashboard` (`NutritionDashboard`). Diario y Alimentos quedan
como placeholders (`WipBody`) para los siguientes slices. Espejo estructural del landing de
Entreno.

## Requirements

- [ ] Landing `Nutrición` con header (título + botón glass `layers` → Dietas) y `SegmentedControl` Plan/Diario/Alimentos.
- [ ] Segmento **Plan** hi-fi: hero de dieta, intake de hoy (anillo kcal segmentado + barras de macros + próxima comida), hidratación, espina de comidas, suplementos, nota del agente.
- [ ] Estados `fresh` / `empty` (cold-start → CTA al agente).
- [ ] Datos **en vivo** desde `getDietDashboard`; fixture solo para tests; registrado en `contractDrift.test.ts`.
- [ ] Ruta convertida a **stack** (`app/(tabs)/nutrition/`) lista para las pantallas de detalle.
- [ ] Read-only: cero botones de escritura; toda "edición" → `/agent`.
- [ ] Pull-to-refresh (mismo patrón que las otras read-views).
- [ ] i18n es/en, typecheck/lint/test verdes, sin violaciones de capas.

---

## Decisiones tomadas (con el usuario)

1. **Fuente de datos** → **Live HTTP ya**. El endpoint existe en `develop.openapi.json` (`operationId: getDietDashboard`, verificado). Mismo precedente que `session-detail` de Entreno: repo real + fixture para tests + registro en `contractDrift`.
2. **Rutas** → **Convertir a stack ahora**. `app/(tabs)/nutrition.tsx` → `nutrition/_layout.tsx` (NativeStack, espejo de `workout/`) + `index.tsx` (landing).

---

## Reconciliación API ↔ handoff (el principio: la API manda en datos, el handoff en píxeles)

Schema `NutritionDashboard` (raw): `state · activeDiet · today · mealSpine · supplements · next · agentNote`.

| Campo handoff (`nutricion-core.jsx`) | En la API | Resolución |
|---|---|---|
| `diet.name`, `goal`, `week/weeks`, `weekFraction`, `score`, `scoreState`, `adherence` | ✅ `activeDiet.*` | 🟢 directo |
| `diet.macroSplit` (chip "180 g proteína") | ❌ no hay string | 🟡 **derivar** chips desde `activeDiet`: `goal` + `{mealCount} comidas` + `{targets.protein} g proteína` |
| Anillo kcal segmentado por macro | parcial | 🟡 **derivar** la segmentación (P×4/C×4/F×9) desde `today.consumed`; **fill = `consumed.kcal / activeDiet.targets.kcal`**. Consumido viene de `today.consumed` (la API lo calcula — NO sumar comidas cliente-side como el prototipo) |
| Barras de macros (consumido/objetivo) | ✅ `today.consumed` vs `activeDiet.targets` | 🟢 directo |
| "X de Y comidas" | ✅ `today.mealsLogged / mealsTotal` | 🟢 directo |
| Hidratación `water / waterGoal` | ✅ `today.water` / `activeDiet.waterGoal` | 🟢 directo |
| Próxima comida (CTA) | ✅ `next` (name, mealType, targets) | 🟢 directo. **Sin `time`** → CTA muestra `next.name` + `targets.kcal kcal · targets.protein g P` |
| Espina: **hora de cada comida** (07:45…) | ❌ no hay `time` | ⚪ **drop** — ordenar por `orderIndex`; fila liderada por icono (mapeado de `mealType`) + nombre, sin columna de hora |
| Espina: banner **swap** "Cambio del agente" | ❌ no en dashboard | ⚪ **drop** en la landing (vive en Detalle de comida) |
| Espina: badge **"principal"** (`e.key`) | ❌ no hay flag | ⚪ **drop** por ahora (no derivable de forma fiable de `mealType`) |
| Espina: macros P/C/G por comida | ✅ `mealSpine[].targets` (son *targets* del plan, correcto) | 🟢 directo |
| Suplementos (timeline mezclada con comidas por hora) | ✅ `supplements[]` pero `schedule` es string libre nullable, **no hora** | 🟠 **no interleave** — renderizar como grupo "Suplementos" propio bajo la espina; `schedule` como texto, `taken`→check |
| Nota del agente | ✅ `agentNote` (nullable) | 🟢 directo (ocultar si null) |
| Estados `active/fresh/empty` | ✅ `state` | 🟢 directo |

> Las derivaciones (`vxDeriveCF`, etc.) del prototipo **no se portan**: la API ya devuelve
> consumido y targets reales. Solo la segmentación caló­rica del anillo es una derivación pura de
> presentación.

---

## Files to Create/Modify

### Domain (Layer 0)
| File | Action | Purpose |
|---|---|---|
| `src/domain/nutrition/models/NutritionDashboard.ts` | Create | Modelo raw 1:1 con el schema API |
| `src/domain/nutrition/ports/INutritionPort.ts` | Modify | + `getDietDashboard(): Promise<NutritionDashboard>` |
| `src/domain/nutrition/index.ts` | Modify (si existe barrel) | export del nuevo modelo |

### Application (Layer 1)
| File | Action | Purpose |
|---|---|---|
| `src/application/nutrition/GetDietDashboardUseCase.ts` | Create | UC read |
| `src/application/nutrition/__tests__/GetDietDashboardUseCase.test.ts` | Create | test del UC |

### Infrastructure (Layer 2)
| File | Action | Purpose |
|---|---|---|
| `src/infrastructure/repositories/HttpNutritionRepository.ts` | Modify | + `getDietDashboard()` → `apiClient.get("/nutrition/diet-dashboard")` (envelope `{data}`) |
| `src/infrastructure/di/container.ts` | Modify | wire `getDietDashboard: new GetDietDashboardUseCase(nutritionRepo)` |
| `src/infrastructure/api/__tests__/contractDrift.test.ts` | Modify | + grupo `nutrition: [["GET","/api/v1/nutrition/diet-dashboard"]]` |

### Presentation (Layer 3)
| File | Action | Purpose |
|---|---|---|
| `src/presentation/nutrition/keys.ts` | Create | query-key factory |
| `src/presentation/nutrition/lib/dietDashboardFixture.ts` | Create | fixture raw (forma del contrato; datos del handoff) |
| `src/presentation/nutrition/lib/mealType.ts` | Create | `mealType` → icono Lucide + label |
| `src/presentation/nutrition/hooks/useDietDashboard.ts` | Create | useQuery vía useDI |
| `src/presentation/nutrition/hooks/useNutricionSegment.ts` | Create | estado del segmented control (plan/diario/alimentos) |
| `src/presentation/nutrition/screens/NutricionScreen.tsx` | Create | landing (header + selector + body por segmento) |
| `src/presentation/nutrition/components/PlanSegment.tsx` | Create | composición del segmento Plan (ScrollView + refresh) |
| `src/presentation/nutrition/components/DietHero.tsx` | Create | hero dieta activa (espejo `RoutineHero`) |
| `src/presentation/nutrition/components/DietWeekBar.tsx` | Create | barra de semana (espejo `WeekBar`, tipada a `ActiveDietSummary`) |
| `src/presentation/nutrition/components/TodayIntake.tsx` | Create | anillo kcal + barras macros + próxima comida |
| `src/presentation/nutrition/components/HydrationCard.tsx` | Create | hidratación (vasos) |
| `src/presentation/nutrition/components/MealSpine.tsx` | Create | espina de comidas (orden por `orderIndex`) |
| `src/presentation/nutrition/components/SupplementsList.tsx` | Create | grupo de suplementos |
| `src/presentation/nutrition/components/NutritionInvite.tsx` | Create | estados fresh/empty (ask-agent) |
| `src/presentation/nutrition/components/PlanSegmentSkeleton.tsx` | Create | skeleton de carga |
| `src/presentation/_shared/components/MacroRing.tsx` | Create | anillo kcal segmentado por macro (Skia) — reusado luego por comida/alimento/día-diario |
| `src/presentation/_shared/components/ScoreChip.tsx` | Create (lift) | mover desde `training/components`, tipar a union `"ahead"\|"on"\|"behind"` |
| `src/presentation/training/components/ScoreChip.tsx` | Delete | re-export o eliminar tras mover |
| `src/presentation/training/components/WeekBar.tsx` | Modify | actualizar import de `ScoreChip` a `_shared` |
| `src/presentation/app/NutricionStack.tsx` | Create | NativeStack (espejo `EntrenoStack`) |

### App routes (Expo Router)
| File | Action | Purpose |
|---|---|---|
| `app/(tabs)/nutrition.tsx` | Delete | reemplazado por carpeta stack |
| `app/(tabs)/nutrition/_layout.tsx` | Create | `<NutricionStack />` |
| `app/(tabs)/nutrition/index.tsx` | Create | `<NutricionScreen />` |

### i18n
| File | Action | Purpose |
|---|---|---|
| `locales/es.json` | Modify | bloque `nutrition.*` |
| `locales/en.json` | Modify | bloque `nutrition.*` |

### Tests (presentation)
| File | Action | Purpose |
|---|---|---|
| `src/presentation/nutrition/screens/__tests__/NutricionScreen.test.tsx` | Create | render del landing + Plan |
| `src/presentation/nutrition/components/__tests__/PlanSegment.test.tsx` | Create | estados active/fresh/empty |

---

## Approach Analysis

### Componentes: reutilizar vs duplicar

**Recomendado:** reutilizar los primitivos **de verdad compartidos** desde `_shared`
(`SegmentedRing`/`Ring` ya existen, `Chip`, `IconBubble`, `GlassSurface`, `ScreenBloom`,
`Isotype`, `ProgressBar`, `SegmentedControl`, `BottomSheet`, `AgentNoteCard`) y crear
componentes **nutrition-local** para todo lo específico del dominio (DietHero, TodayIntake,
MealSpine…), igual que hizo Entreno. Dos movimientos de DRY justificados:

- **`MacroRing` → `_shared`**: el anillo kcal segmentado por macro es vocabulario de macros de
  toda la app (lo usan Plan, Detalle de comida, Detalle de alimento, Día del diario). Nace
  compartido. Se apoya en el `SegmentedRing` Skia existente extendiéndolo a **arcos
  proporcionales + fracción de relleno** (el actual son segmentos iguales lit/dim).
- **`ScoreChip` → `_shared`**: hoy vive en `training/components` pero solo depende de la union
  `"ahead"|"on"|"behind"`. Subirlo a `_shared` evita un import cross-module nutrition→training
  (violación de convención) y es 1 cambio de import en `WeekBar`.

`DietWeekBar` se duplica nutrition-local (está atado a la forma `ActiveDietSummary`), igual que
Entreno tiene su `WeekBar` atado a `ActiveRoutineSummary`.

### Anillo kcal: extender `SegmentedRing` vs `MacroRing` nuevo

**Recomendado: `MacroRing` nuevo en `_shared`.** El `SegmentedRing` actual dibuja N segmentos de
arco **igual** (lit/dim) — no sirve para arcos **proporcionales al aporte calórico** con un
**relleno global** `consumed/goal`. `MacroRing` toma `consumed{protein,carbs,fat,kcal}` + `goalKcal`
y dibuja: track + arco rellenado a `min(1, kcal/goal)`, subdividido por contribución calórica
(lava/cyan/amber). Mantiene `SegmentedRing` intacto para sus usos actuales.

---

## Implementation Phases

> Slice vertical único (el segmento Plan). Receta de Entreno aplicada de punta a punta.

### Phase 1: Domain

#### Task 1.1: Modelo `NutritionDashboard`
**File**: `src/domain/nutrition/models/NutritionDashboard.ts`
```typescript
/** Raw, locale-neutral mirror of the API `NutritionDashboard` read-model
 *  (GET /nutrition/diet-dashboard). No formatting, no display strings. */
export type DietState = "active" | "fresh" | "empty";
export type DietScoreState = "ahead" | "on" | "behind";
export type MealStatus = "done" | "now" | "up";

export interface MacroSet {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}
export interface WaterAmount {
  value: number;
  unit: "L";
}

export interface ActiveDietSummary {
  id: string;
  name: string;
  goal: string | null;
  mealCount: number;
  week: number;
  weeks: number | null;
  weekFraction: number | null;
  scoreState: DietScoreState;
  score: number | null;
  adherence: number | null;
  targets: MacroSet;
  waterGoal: WaterAmount;
}
export interface DietToday {
  consumed: MacroSet;
  water: WaterAmount;
  mealsLogged: number;
  mealsTotal: number;
}
export interface MealSpineItem {
  mealId: string;
  orderIndex: number;
  name: string;
  mealType: string;
  targets: MacroSet;
  status: MealStatus;
}
export interface SupplementItem {
  id: string;
  name: string;
  schedule: string | null;
  taken: boolean;
}
export interface NextMeal {
  mealId: string;
  name: string;
  mealType: string;
  targets: MacroSet;
}
export interface NutritionDashboard {
  state: DietState;
  activeDiet: ActiveDietSummary | null;
  today: DietToday;
  mealSpine: MealSpineItem[];
  supplements: SupplementItem[];
  next: NextMeal | null;
  agentNote: string | null;
}
```

#### Task 1.2: Port
**File**: `src/domain/nutrition/ports/INutritionPort.ts` (add)
```typescript
import type { NutritionDashboard } from "../models/NutritionDashboard";
// ...
export interface INutritionPort {
  // ...existing legacy methods...
  getDietDashboard(): Promise<NutritionDashboard>;
}
```

### Phase 2: Application

#### Task 2.1: Use case (+test)
**File**: `src/application/nutrition/GetDietDashboardUseCase.ts`
```typescript
import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { NutritionDashboard } from "@/domain/nutrition/models/NutritionDashboard";

export class GetDietDashboardUseCase {
  constructor(private readonly port: INutritionPort) {}
  async execute(): Promise<NutritionDashboard> {
    return this.port.getDietDashboard();
  }
}
```
> Añadir `getDietDashboard: jest.fn()` a los mocks de puerto de **todos** los tests de UC de
> nutrition existentes (GetDietPlans/GetDietPlanDetail/GetDailyMealLogs/SearchFoods/
> GetNutritionDayState/GetNutritionWeeklySummary) para que sigan compilando.

### Phase 3: Infrastructure

#### Task 3.1: Repo (live HTTP)
**File**: `src/infrastructure/repositories/HttpNutritionRepository.ts` (add)
```typescript
async getDietDashboard(): Promise<NutritionDashboard> {
  // GET /api/v1/nutrition/diet-dashboard → { data: NutritionDashboard }
  return apiClient.get<NutritionDashboard>("/nutrition/diet-dashboard");
}
```
> Verificar cómo `apiClient.get` desenvuelve `{ data }` (mirar un repo live existente, p.ej.
> `HttpTrainingRepository.getRoutineDashboard`). Replicar exactamente.

#### Task 3.2: DI
**File**: `src/infrastructure/di/container.ts`
```typescript
import { GetDietDashboardUseCase } from "@/application/nutrition/GetDietDashboardUseCase";
// ...en el objeto container, sección Nutrition:
getDietDashboard: new GetDietDashboardUseCase(nutritionRepo),
```

#### Task 3.3: Contract drift
**File**: `src/infrastructure/api/__tests__/contractDrift.test.ts`
```typescript
const ENDPOINTS = {
  // ...
  nutrition: [["GET", "/api/v1/nutrition/diet-dashboard"]],
};
```

### Phase 4: Presentation — plumbing

#### Task 4.1: Keys
**File**: `src/presentation/nutrition/keys.ts`
```typescript
export const nutritionKeys = {
  all: ["nutrition"] as const,
  dietDashboard: () => ["nutrition", "dietDashboard"] as const,
};
```

#### Task 4.2: Fixture (raw, contract-shaped, handoff data)
**File**: `src/presentation/nutrition/lib/dietDashboardFixture.ts`
Datos del handoff (`VX_DIET`: Definición · 2.250 kcal, 5 comidas, 180 g P, semana 3/6,
adherencia 78 "on"; `VX_MEAL_SPECS` → mealSpine; `VX_SUPPS` → supplements) **tipados a
`NutritionDashboard`**. `today.consumed` = el escenario "afternoon" (3 comidas hechas). Solo
para tests.

#### Task 4.3: `mealType` map
**File**: `src/presentation/nutrition/lib/mealType.ts` — `mealType` → `{ icon: LucideIcon }`
(`breakfast→Sunrise`, `snack→Apple/Coffee`, `lunch/main→Utensils`, `dinner→Moon`, fallback
`Utensils`). Bilingüe vía i18n para labels si hiciera falta.

#### Task 4.4: Hooks
**File**: `src/presentation/nutrition/hooks/useDietDashboard.ts`
```typescript
export function useDietDashboard() {
  const uc = useDI((c) => c.getDietDashboard);
  return useQuery({
    queryKey: nutritionKeys.dietDashboard(),
    queryFn: () => uc.execute(),
    staleTime: 60_000,
  });
}
```
**File**: `src/presentation/nutrition/hooks/useNutricionSegment.ts` — espejo de
`useEntrenoSegment` (segment `"plan"|"diario"|"alimentos"`, `options` i18n).

### Phase 5: Presentation — shared primitives

#### Task 5.1: Lift `ScoreChip` a `_shared`
Mover `training/components/ScoreChip.tsx` → `_shared/components/ScoreChip.tsx`; cambiar la prop
a `state: "ahead" | "on" | "behind"` (no importar el tipo de training). Actualizar import en
`WeekBar.tsx`. Re-export temporal en la ruta vieja o actualizar todos los imports.

#### Task 5.2: `MacroRing` (Skia)
**File**: `src/presentation/_shared/components/MacroRing.tsx`
```typescript
// props: { consumed: {kcal,protein,carbs,fat}, goalKcal, size, stroke, children }
// fill = clamp(consumed.kcal / goalKcal, 0..1)
// segmentos proporcionales a P*4 / C*4 / F*9 dentro del fill; colores lava/body/neutral.
// track gris; gap ~2.5°; drop-shadow por color. Center via children.
```
Reusar las utilidades de arco de `Ring.tsx`/`SegmentedRing.tsx` (Skia `Path.addArc`).

### Phase 6: Presentation — Plan segment components

#### Task 6.1: `DietWeekBar` — espejo de `WeekBar`, tipado a `ActiveDietSummary` (week/weeks/weekFraction/scoreState) + `ScoreChip`.
#### Task 6.2: `DietHero` — espejo de `RoutineHero`: eyebrow "DIETA ACTIVA" + `Isotype` "por verxion" + chevron; `name`; chips (`goal`, `{mealCount} comidas`, `{targets.protein} g proteína`); divider; `DietWeekBar`. Tap → `router.push(/nutrition/dieta/${activeDiet.id})`.
#### Task 6.3: `TodayIntake` — `MacroRing` (consumed vs targets.kcal) con kcal central + label "CONSUMIDO HOY" + tag (`{left} kcal restantes` / `{over} kcal de más`) + "`{mealsLogged} de {mealsTotal} comidas`"; 3 barras de macro (`ProgressBar`, consumed/targets, colores lava/body/neutral); CTA próxima comida (si `next`) → `/nutrition/plan-comidas`.
#### Task 6.4: `HydrationCard` — `IconBubble` droplet (body/cyan) + `{water.value} / {waterGoal.value} L` + 8 vasos (`Math.round(frac*8)` llenos).
#### Task 6.5: `MealSpine` — filas ordenadas por `orderIndex`: nodo de estado (done=check, now=icono+badge "ahora" pulso gateado por `useReducedMotion`, up=icono atenuado), icono por `mealType`, nombre, `{kcal} kcal · P/C/G` (de `targets`). Tap → `/nutrition/comida/${mealId}`. Sin hora, sin swap, sin "principal".
#### Task 6.6: `SupplementsList` — sección "Suplementos": `IconBubble` pill (insight/morado), nombre, `schedule` (texto, si no null), `taken`→check verde.
#### Task 6.7: `NutritionInvite` — estados `fresh`/`empty`: `Isotype` glow + título + cuerpo + prompt tap → `/agent`.
#### Task 6.8: `PlanSegmentSkeleton` — placeholders glass (hero + ring + barras).

### Phase 7: Presentation — screen + segment composition

#### Task 7.1: `PlanSegment`
**File**: `src/presentation/nutrition/components/PlanSegment.tsx` — `ScrollView` con
`GlassRefreshControl` (refetch del hook). Según `data.state`:
- `active`: `DietHero` → `TodayIntake` → `HydrationCard` → `MealSpine` → `SupplementsList` (si hay) → `AgentNoteCard` (si `agentNote`).
- `fresh`/`empty`: `NutritionInvite`.
Loading → `PlanSegmentSkeleton`. Error → `SegmentError` (reusar de training o copiar a `_shared`).
Padding inferior `insets.bottom + 64` (clearance de tab-bar, convención Entreno).

#### Task 7.2: `NutricionScreen`
**File**: `src/presentation/nutrition/screens/NutricionScreen.tsx` — espejo de `EntrenoScreen`:
`ScreenBloom` + `SafeAreaView`, header (título `nutrition.title` + botón glass `Layers` →
`/nutrition/dietas`), `SegmentedControl`, y body: `plan` → `<PlanSegment />`, `diario`/
`alimentos` → `<WipBody />`.

### Phase 8: Routes + i18n

#### Task 8.1: Stack delegator
**File**: `src/presentation/app/NutricionStack.tsx` — espejo de `EntrenoStack` (NativeStack,
header oculto en `index`, screens de detalle registradas según se construyan).

#### Task 8.2: Rutas
- Delete `app/(tabs)/nutrition.tsx`.
- `app/(tabs)/nutrition/_layout.tsx` → `<NutricionStack />`.
- `app/(tabs)/nutrition/index.tsx` → `<NutricionScreen />`.
> Verificar que `NativeTabs.Trigger name="nutrition"` en `TabLayout` sigue resolviendo a la
> carpeta (Expo Router resuelve `nutrition.tsx` o `nutrition/index.tsx` igual).

#### Task 8.3: i18n
Bloque `nutrition.*` en `locales/{es,en}.json`: `title`, `segments.{plan,diario,alimentos}`,
`hero.{activeDiet,byVerxion,meals,protein}`, `intake.{consumedToday,remaining,over,meals,next,startWith,nowEat}`, `hydration.title`, `spine.{now,supplements}`, `invite.{title,body,prompt}`,
`agentEdit.*`, `wip.*`.

---

## Task Dependencies

```yaml
dependencies:
  1.1: []
  1.2: [1.1]
  2.1: [1.2]
  3.1: [1.2]
  3.2: [2.1, 3.1]
  3.3: []
  4.1: []
  4.2: [1.1]
  4.3: []
  4.4: [3.2, 4.1]
  5.1: []
  5.2: []
  6.1: [5.1, 1.1]
  6.2: [6.1, 4.3]
  6.3: [5.2, 1.1]
  6.4: [1.1]
  6.5: [4.3, 1.1]
  6.6: [1.1]
  6.7: []
  6.8: []
  7.1: [6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 4.4]
  7.2: [7.1, 4.4]
  8.1: []
  8.2: [7.2, 8.1]
  8.3: [7.2]
```

---

## Risk Analysis

### Edge cases
- [ ] `activeDiet` null pero `state==="active"` → tratar como `fresh` (defensivo).
- [ ] `weeks` null (dieta abierta) → `DietWeekBar` cae a `weeks = week` (igual que `WeekBar`).
- [ ] `score`/`adherence`/`weekFraction` null → ocultar/degradar el chip, no romper.
- [ ] `next` null (día cerrado) → ocultar la CTA de próxima comida.
- [ ] `agentNote` null → no renderizar `AgentNoteCard`.
- [ ] `mealSpine` vacío / `supplements` vacío → secciones colapsan.
- [ ] `consumed.kcal > targets.kcal` → anillo capa al 100%, tag "de más".
- [ ] División por cero en anillo/barras si `targets.kcal === 0` → guard `|| 1`.

### Technical risks
- [ ] **El endpoint EXISTE en el backend** (confirmado en develop + staging, schema 200 completo, no deprecated, no stub). Único matiz: confirmar que `EXPO_PUBLIC_API_URL` local apunta a un env que ya lo sirve (develop/staging). El fixture cubre los tests; el `contractDrift` igual pasa. **No hay trabajo de backend pendiente** — solo device-verify del env correcto.
- [ ] **Envelope `{data}`**: confirmar el desenvuelto de `apiClient` (replicar un repo live).
- [ ] **Hermes Intl**: usar formato propio (separador de miles es-ES) sin `Intl` — helper local `nInt`/`nL` en `nutrition/lib/format.ts` (espejo de `training/lib/sessionFormat.ts`).
- [ ] **Mover `ScoreChip`** rompe imports de training → actualizar y correr tests de training.
- [ ] **Reanimated**: pulso "ahora" / glow solo en `useEffect`, gateado por `useReducedMotion`.

---

## Testing Strategy

- **Unit**: `GetDietDashboardUseCase` (delega al puerto). `MacroRing` (segmentación/fill — smoke).
- **Component**: `PlanSegment` con fixture → estados `active`/`fresh`/`empty`; presencia de hero/intake/hydration/spine; ausencia de cualquier botón de escritura (read-only).
- **Screen**: `NutricionScreen` render — header, 3 segmentos, body Plan montado.
- **Drift**: `contractDrift.test.ts` valida que `/nutrition/diet-dashboard` sigue en el contrato.
- **Manual (device)**: abrir tab Nutrición → segmento Plan contra el env real; pull-to-refresh; tap hero/comida/CTA navegan (aunque las pantallas destino aún no existan → placeholder).

---

## Done Criteria

### Phase 1–3 (engine)
- [ ] `NutritionDashboard` compila y refleja el schema 1:1: `npm run typecheck`.
- [ ] `GetDietDashboardUseCase` test pasa.
- [ ] `contractDrift.test.ts` incluye y valida `nutrition` (verde cuando el contrato sibling está presente).

### Phase 4–7 (UI)
- [ ] Tab Nutrición renderiza el segmento Plan hi-fi con datos reales (o fixture en test).
- [ ] Estados `fresh`/`empty` muestran el invite ask-agent.
- [ ] Cero superficies de escritura; todas las CTAs de "edición" → `/agent`.
- [ ] Pull-to-refresh refetch del dashboard.

### Phase 8
- [ ] `app/(tabs)/nutrition/` es un stack; la tab resuelve a la landing.
- [ ] i18n es/en completo; sin claves crudas en pantalla.

### Overall
- [ ] `npm run typecheck && npm run lint && npm test` verdes.
- [ ] Sin TODO/FIXME en código nuevo.
- [ ] `devtronic:architecture-checker` sin violaciones de capas (presentation→useDI only; domain puro).
- [ ] **Device-verify con el usuario ANTES de commitear** (un commit para el slice).

---

## Verification

PM: **npm** (`package-lock.json`).
1. `npm run typecheck`
2. `npm run lint`
3. `npm test`
4. Subagente `devtronic:architecture-checker` sobre los archivos nuevos.
5. Simulador: tab Nutrición → Plan contra env real; verificar datos, refresh, navegación.
6. `/post-review` tras aprobación.
