# "Hoy" — correcciones del read-model (`/today`)

> **Tipo:** revisión de contrato + gap de implementación sobre
> [`today-screen-spec.md`](./today-screen-spec.md).
> **Status:** draft para el agente de API (`verxion-platform`).
> **Origen:** revisión en staging con `reviewer1@verxion.ai` (2026-06-06). El
> `/today` devolvía anillo `0/4` (sin front de `steps`) y timeline vacío pese a
> tener entreno planificado + 2 suplementos planificados para el día.
>
> El cliente pega **directo a `api.rbart-dev.com`** (el MCP no interviene). Toda
> la derivación es server-side; el cliente sólo pinta.

Dos correcciones independientes:

1. **Fronts sin configurar → guion (`—`), no omitir** + alinear el contador del anillo.
2. **Timeline desde el plan** — emitir lo planificado, no sólo lo logueado.

---

## Fix 1 — Fronts sin configurar: guion en vez de omisión

### Problema

Hoy, un front sin meta/plan se **omite** de `fronts[]` (Edge 8 del spec
original). Resultado para `reviewer1`: sin step-goal ni pasos → `steps` ausente →
anillo `0/4`. Pero `water` **no** se omite nunca (su adapter devuelve el objeto
aunque `goalMl == null`), así que aparece `0 L` mientras `steps` desaparece. Dos
fronts en el **mismo estado** (sin datos, sin meta) con comportamiento opuesto.

### Decisión (revisa Edge 8 + regla del anillo de §5)

Un front sin configurar **se muestra** con un guion `—` (descubrible: "tienes esta
opción, no la has configurado") pero **no cuenta para el anillo**. Regla única para
los 5 fronts:

> **`/today` emite siempre los 5 fronts.** Un front *configurado* cuenta para el
> anillo y muestra su valor; uno *sin configurar* se muestra como `—` y queda
> fuera del cómputo del anillo.

"Configurado" por front:

| Front | Configurado cuando… |
|-------|---------------------|
| `training` | hay engagement (≠ `NO_ENGAGEMENT_ACTIVE`) |
| `nutrition` | hay objetivo/diet plan (`target != null`) |
| `water` | `goalMl != null` |
| `steps` | `goal != null` |
| `supplements` | `planned > 0` |

### Cambio de contrato — `DayFront`

Añadir un booleano explícito `counted`:

```ts
interface DayFront {
  key: DayFrontKey;
  counted: boolean;     // NUEVO. true → configurado: cuenta para el anillo y tiene segmento.
                        //        false → sin configurar: se pinta "—", sin segmento, fuera del anillo.
  closed: boolean;      // si counted=false ⇒ closed=false siempre.
  current: number | null;  // counted=false ⇒ null  (el cliente ya pinta null como "—")
  target: number | null;   // counted=false ⇒ null
  unit: DayFrontUnit | null;
  status: DayFrontStatus | null; // counted=false ⇒ null
}
```

**Invariante del anillo (cambia):**

```
ring.total      === fronts.filter(f => f.counted).length     // antes: === fronts.length
ring.completed  === fronts.filter(f => f.closed).length      // closed ⇒ counted
```

> Alternativa sin tocar el wire-schema: derivar `counted` en el cliente como
> `status != null || current != null || target != null` (un front "guion" tiene
> los tres a null). Funciona, pero es implícito/frágil. **Se recomienda el campo
> explícito `counted`** por ser auto-documentado y testeable.

### Dónde se implementa

**Plataforma (`verxion-platform`):**

- `packages/domain/src/today/Services/DayCompletionService.ts` — núcleo. Para cada
  front: si está configurado → push con `counted:true` y sus valores; si no →
  push con `counted:false`, `closed:false`, `current/target/unit/status` a `null`.
  `ring.total = count(counted)`, `ring.completed = count(closed)`.
  - `training`: `NO_ENGAGEMENT_ACTIVE` → guion (`counted:false`) en vez de omitir.
  - `water`: `goalMl == null` → guion.
  - `steps`: `goal == null` → guion.
  - `supplements`: `planned === 0` → guion (hoy se omite).
- `apps/api/src/today/TodayDataAdapter.ts` — `getWater`/`getSteps`/`getSupplements`
  **dejan de devolver `null` por "sin configurar"**; devuelven la forma en cero
  (`{totalMl:0, goalMl:null}`, `{steps:0, goal:null}`, `{logged:0, planned:0}`) y
  el service decide. `null` queda **reservado para error de fuente**.
- `packages/domain/src/today/Types.ts` — `DayFront` += `counted: boolean`.
- `packages/shared/src/schemas/today.ts` — `dayFrontSchema` += `counted: z.boolean()`.
  Actualizar el comentario de `fronts` (ya no `length === ring.total`).
- Tests: `DayCompletionService.test.ts` (casos guion por front + invariante del
  anillo), `apps/api/src/openapi/__tests__/response-schema.test.ts` si afirma el
  invariante viejo.

**Cliente (`verxion-native-client`):**

- `src/domain/today/models/TodayDashboard.ts` — `DayFront` += `counted: boolean`.
- `src/presentation/today/components/DaySummary.tsx` — los **segmentos** del anillo
  pasan a `fronts.filter(f => f.counted)`; la **lista** sigue mostrando los 5
  (los `counted:false` ya renderizan `—` vía `frontValueCompact`). Opcional: bajar
  la opacidad de las filas `—`.
- `src/domain/today/__fixtures__/*` — reflejar el nuevo campo + un front en guion.
- `src/infrastructure/api/__tests__/contractDrift.test.ts` — parar la paridad.

---

## Fix 2 — Timeline desde el plan (sólo adapter)

### Problema

`TodayDashboard.timeline` aparece vacío en un día con plan. Prueba: `reviewer1`
tiene `training: "Planned"` y `supplements: 0/2` (hay plan), pero el timeline está
vacío → se pinta el `GhostTimeline`. Todas las fuentes de `getTimelineSources`
consultan **sólo logs** (`GetDailyMealLogs`, `GetWorkoutSessions`,
`GetStepLogs…`, `GetSupplementLogs`…) y emiten `logged:true`. No hay ninguna
fuente que proyecte lo **planificado**. Esto contradice §5 (`state` sale "from
logs vs **plan** vs now") y §6/Edge 18 (`upcoming`/`overdue`/now-marker).

### El dominio y el cliente YA lo soportan

`TimelineAssemblyService.computeState` ya resuelve todos los estados a partir de
`TimelineSourceItem`:

```ts
if (it.rest) return "rest";
if (it.liveInProgress) return "in_progress";
if (it.logged) return "done";
if (it.plannedWindowEnd != null && nowMs > ms(it.plannedWindowEnd)) return "overdue";
return "upcoming";
```

`TimelineSourceItem` ya tiene `logged`, `liveInProgress`, `rest`,
`plannedWindowEnd`. **No hay que tocar dominio ni cliente.** El único gap es que el
adapter no emite items planificados.

### Cambio — `apps/api/src/today/TodayDataAdapter.ts`

`getTimelineSources` debe emitir **lo planificado + lo logueado, reconciliados**:

- **Workout planificado del día** (del routine activo) → `kind:"workout"`,
  `logged:false`, `time` = hora prevista si la hay (o `null`), `ref` al día de
  rutina. Si ya hay una **sesión** logueada/en curso para ese workout, NO emitir
  también el planificado (la sesión, `kind:"session"`, lo representa: `done` /
  `in_progress`).
- **Comidas planificadas del diet plan** → `kind:"meal"`, `logged:false`,
  `time`/`plannedWindowEnd` desde la ventana de la comida. Reconciliar contra los
  meal-logs: una comida ya logueada se emite **una vez** como `done`, no además
  como `upcoming`.
- **Suplementos programados** → `kind:"supplement"`, `logged:false`, con
  `timing`/ventana → `plannedWindowEnd`. Reconciliar contra supplement-logs.

**Reconciliación (clave — "lo configurado y lo logueado con metadatos"):** por cada
entidad planificada, si existe su log del día, emitir **sólo** la versión logueada
(`done`/`in_progress`); si no, emitir la planificada (`upcoming`, u `overdue` si la
ventana ya pasó). Evita filas duplicadas para la misma comida/entreno/suplemento.

> Nota: el comentario de `TimelineAssemblyService` dice "No dedup of a metric that
> also appears as a front (Edge 16 — intentional double view)". Eso es métrica↔front
> (p.ej. agua en el anillo y agua en el timeline) y se mantiene. La reconciliación
> de aquí es **planificado↔logueado de la misma entidad**, que sí se deduplica.

### Tests

`apps/api/src/today/*` (o `apps/api/src/routes/__tests__/today.test.ts`): día con
plan y nada logueado → items `upcoming`; día parcial → mezcla `done` + `upcoming`;
ventana pasada sin log → `overdue`; entidad logueada → una sola fila `done`.

---

## Checklist de implementación

**Fix 1**
- [ ] `DayCompletionService`: 5 fronts siempre; `counted`; anillo sobre `counted`.
- [ ] `TodayDataAdapter`: `getWater/getSteps/getSupplements` devuelven forma-cero, no `null`, por "sin configurar".
- [ ] `Types.ts` + `today.ts` (Zod): `DayFront.counted`.
- [ ] Native: modelo + `DaySummary` (segmentos = counted) + fixture + `contractDrift`.
- [ ] OpenAPI regenerado; tests de schema/respuesta actualizados.

**Fix 2**
- [ ] `getTimelineSources`: fuentes planificadas (workout/comidas/suplementos), `logged:false` + `plannedWindowEnd`.
- [ ] Reconciliación planificado↔logueado (sin duplicar entidad).
- [ ] Tests de adapter/ruta para `upcoming`/`overdue`/`done`.
- [ ] Verificar `GET /today?date=2026-06-06` para `reviewer1`: anillo refleja configurados; timeline muestra el entreno + 2 suplementos planificados.
