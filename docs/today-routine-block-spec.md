# "Hoy" · bloque de periodización en la fila de Rutina — API spec

> **Una sola petición additive al agregado `today`.** El slot "qué sigo"
> (`ActivePlan`) de Hoy quiere pintar el bloque activo de la rutina —
> «RUTINA · ACUMULACIÓN» con sub «Bloque 1/3 · Sem 2/4» — igual que ya lo pinta
> el segmento Rutina del Entreno landing. El dato existe y ya se expuso en el
> read-model hermano (`getRoutineDashboard.activeRoutine.mesocycle`); aquí solo
> falta **reflejarlo en el agregado `today`**.
>
> Read-only. Native solo lee y pinta — crear/editar periodización es del agente
> vía MCP. Contexto completo: `docs/native-screens/periodization-mesocycles-microcycles.md`.
>
> Estado: ✅ **DONE.** Backend lo entregó (`routineProgressSchema.mesocycle =
> activeMesocycleSchema.nullable()`, develop + staging) y native ya hizo el flip
> (`RoutineBlock` en `TodayDashboard`, eyebrow/sub en `ActivePlan`, aserción de
> drift `RoutineProgress.mesocycle`). Lo que sigue abajo es el registro de la
> petición. Pendiente solo: promoción a producción (Railway) — decisión del equipo.

---

## 0. El hueco (verificado)

`ActivePlan` consume el agregado **`today`** (`GET /api/v1/today`), no
`getRoutineDashboard`. Su `routineProgressSchema`
(`packages/shared/src/schemas/today.ts`) hoy lleva:

```ts
routineProgressSchema = z.object({
  name: z.string(),
  week: z.number(),
  totalWeeks: z.number(),
  adherenceScore: z.number().nullable(),
  adherenceMax: z.number(),
});
```

→ Solo `week`/`totalWeeks`. **No hay `mesocycle`.** Con esto Hoy puede pintar
«Sem 2/4» pero **no** el nombre/posición del bloque («Acumulación · Bloque 1/3»),
que es justo lo que el handoff dibuja en el eyebrow del slot.

⚠️ No mezclar fuentes: `ActivePlan` está cableado al agregado `today` (un solo
fetch). Tirar de `routine-dashboard` solo para el bloque sería un round-trip extra
y un olor de arquitectura. Lo correcto es **enriquecer `today`**.

## 1. La petición — additive nullable, espejo del dashboard

Añadir un campo `mesocycle` a `routineProgressSchema`, **idéntico** al
`activeMesocycleSchema` que ya viaja en `training.ts`
(`getRoutineDashboard.activeRoutine.mesocycle`) — mismo resolver, misma forma:

```ts
// nuevo en routineProgressSchema (today.ts) — additive, nullable:
mesocycle: activeMesocycleSchema.nullable(),
// donde activeMesocycleSchema = {
//   id, name, goal: string|null, orderIndex (0-based),
//   totalBlocks, isLastWeek, isLastBlock
// }
```

- **Reutiliza** el schema y el resolver ya existentes (no es lógica nueva: el
  bloque activo de la rutina ya se resuelve para el dashboard; aquí solo se
  adjunta al mismo `RoutineProgress` del `today`).
- **Tri-estado igual que el dashboard**: `null` en rutina plana, periodizada
  terminada y pausada (ver doc §10.2). Native lo trata igual → sin eyebrow de
  bloque, solo «Sem x/y».
- `name`/`goal` RAW free-text inglés (sin i18n); native localiza solo «Bloque».

## 2. Qué pinta native cuando llegue

`ActivePlan` (fila Rutina, standalone y dentro del PROGRAMA):
- eyebrow → «RUTINA · {mesocycle.name uppercased}» (hoy «RUTINA · SEMANA 3/6»)
- sub → «Bloque {orderIndex+1}/{totalBlocks} · Sem {week}/{totalWeeks}»
- color **lava** (acento de bloque activo en rutina/Hoy; el morado insight queda
  para sesión/historial).

## 3. El flip en native (trivial cuando aterrice)

1. `RoutineProgress` (`src/domain/today/models/TodayDashboard.ts`): añadir
   `mesocycle: ActiveMesocycle | null` (el tipo ya existe en
   `models/RoutineDashboard.ts`). El agregado pasa 1:1 → sin mapper.
2. `ActivePlan.tsx`: leer `routine.mesocycle` para el eyebrow/sub (null-safe; el
   componente `BlockLine` y la regla de color ya están construidos para el
   Entreno landing y el Detalle de rutina).
3. Añadir la aserción a `contractDrift.test.ts`:
   `props("RoutineProgress").mesocycle` (o el nombre del componente OpenAPI).

Sin esto, Hoy se queda como está: «Sem x/y», sin nombre de bloque. No se inventa
el bloque (la regla de la app: pintar solo lo que el read-model entrega).

## 4. Nota de prioridad

Es la pieza de **menor coste / valor medio**: el bloque ya se ve en el Entreno
landing y en el Detalle de rutina (ambos ya construidos). Hoy es la tercera
superficie del mismo dato. Útil para coherencia, no bloqueante.
