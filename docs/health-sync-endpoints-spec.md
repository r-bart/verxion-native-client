# "HealthKit Sync" — endpoints de ingesta (peso / pasos / cardio)

> **Tipo:** spec de endpoints de **escritura/ingesta** (no read-model). El cliente
> nativo lee samples de Apple Health en el dispositivo y los **empuja** a la
> plataforma para que persistan junto a los logs manuales.
> **Status:** draft para el agente de API (`verxion-platform`).
> **Origen:** análisis de integración HealthKit (2026-06-08). **Revisado en dos pasadas:**
> (1) contra el modelo real de `verxion-platform` (tablas `weight_logs`, `step_logs`,
> `cardio_logs`, repos Drizzle, UCs, Zod); (2) contra la **documentación oficial de
> Apple HealthKit** (no de memoria). Ambas pasadas corrigieron supuestos materiales
> del borrador anterior — ver el changelog al pie.
>
> El cliente pega directo a la API (el MCP no interviene). Flujo del contrato igual
> que siempre: request/response Zod en `@verxion/shared` → OpenAPI → codegen nativo.
>
> **Tesis (corregida):** *"Apple Health es una fuente más (`source`) de peso, pasos y
> cardio. Pero NO se ingesta con un único modelo: peso y cardio son **eventos con
> UUID estable** (dedup por `externalId`, con borrados); pasos es un **agregado
> diario sin UUID** (dedup por fecha, sin borrados explícitos). Sincronizar no debe
> duplicar (re-sync) ni pisar a ciegas el log manual."*

---

## 0. Alcance — leer primero

HealthKit alimenta **3 métricas**. El **agua queda fuera** (sigue siendo micro-write
manual; HealthKit no la lee). Tres flujos; sólo dos tocan backend:

| Flujo | Descripción | ¿Backend? |
|---|---|---|
| **A** | Health → display in-app (lectura local) | ❌ ya cubierto por read-models existentes |
| **B** | Health → log de **peso / pasos / cardio** | ✅ **este spec** |

### Estado REAL del modelo de plataforma (verificado contra el código)

| Métrica | Tabla | `source`/provenance | `externalId` | Idempotencia hoy | Falta |
|---|---|---|---|---|---|
| **Pasos** | `step_logs` | ⚠️ columna `data_source` enum (`apple_health`) + `confidence_score` **existen, pero el repo las TIRA al escribir** | — (no aplica) | ✅ `POST /steps/upsert` por `(profileId, loggedDate)` | **cablear `dataSource`/`confidenceScore` por Zod→UC→repo** (la columna existe pero es inalcanzable hoy) |
| **Peso** | `weight_logs` | ❌ | ❌ | ❌ inserta siempre | `source` enum + `externalId` + idempotencia por UUID + borrados |
| **Cardio** | `cardio_logs` | ⚠️ `data_source` **text libre** (el repo SÍ lo escribe) | ❌ | ❌ inserta siempre | promover `data_source`→enum (**con migración de datos**) + `externalId` + idempotencia por UUID + borrados + HR |

> **⚠️ Corrección clave vs. borrador anterior — pasos NO es "usar tal cual".** La columna
> `data_source` existe en `step_logs` (`packages/db/src/schema/steps.ts`), pero:
> - `logStepsSchema` (`packages/shared/.../measurement.ts`) **no acepta** `dataSource` ni `confidenceScore`.
> - `UpsertActivityStepsRequest` (`packages/domain/.../UpsertActivityStepsUseCase.ts`) **no tiene** esos campos.
> - `DrizzleStepLogRepository` (~línea 145) **omite `dataSource` del INSERT** → la DB siempre cae a `"manual"`.
>
> Es decir: **hoy el cliente NO puede marcar pasos como `apple_health`.** El valor
> `health_kit` del dominio (`StepLog.ts`) es **código muerto**. Hay que cablear el campo
> de extremo a extremo. Es trabajo real, no "nada".

> **Cardio NO es entidad nueva:** `cardio_logs` ya existe, separada de
> `workout_sessions` (sesiones de fuerza prescritas). Los `HKWorkout` mapean 1:1.

---

## 0.5. El concepto central — DOS formas de ingesta, no una

HealthKit modela estas tres métricas de **dos maneras estructuralmente distintas**.
El contrato debe reflejarlo; mezclarlas (un `externalId` uniforme para las tres) es
incorrecto y fue el error del borrador anterior.

| | **Peso · Cardio** | **Pasos** |
|---|---|---|
| Forma del dato en HealthKit | sample/workout discreto con **UUID estable** | **agregado diario, sin UUID propio** |
| Identidad | `HKSample.uuid` / `HKWorkout.uuid` → `externalId` | no hay UUID — la identidad es `(profileId, fecha)` |
| Sync nativo | `HKAnchoredObjectQuery` (delta por anchor, **por tipo de sample**) | `HKObserverQuery` (trigger) **+ recálculo** con `HKStatisticsCollectionQuery` |
| Idempotencia servidor | `(profileId, source, externalId)` | `(profileId, loggedDate)` ← **ya existe** |
| Borrados | `HKDeletedObject` (sólo trae el UUID) → entran en `deletions[]` | **implícitos**: el total recalculado baja; **NO hay `deletions[]`** |
| `on conflict` | `no-op` (duplicate) | upsert reemplaza el día |

**Por qué pasos no encaja en el modelo `externalId` (verificado contra Apple):**
1. **El total de pasos NO se suma de samples.** iPhone y Watch graban el mismo tramo
   → sumar `HKQuantitySample` **duplica**. El total de-duplicado sale de
   `HKStatisticsQuery`/`HKStatisticsCollectionQuery` con `.cumulativeSum` (aplica el
   merge por-fuente de HealthKit). *(No usar `.separateBySource` para el total.)*
2. **`HKStatisticsQuery` no admite anchor.** O tienes el total correcto de-duplicado,
   **o** tienes delta-sync por anchor — no ambos en una query. (`anchorDate` en
   `HKStatisticsCollectionQuery` es sólo el faseado de los intervalos, **no** un cursor de sync.)
3. **No hay `HKDeletedObject` a nivel de agregado.** Un borrado en Health aparece como
   un total más bajo en el siguiente recompute. Por eso pasos **no lleva `deletions[]`**.

**Consecuencia:** pasos se sincroniza como **agregado diario re-calculado**
(observer dispara → recompute de hoy + ventana de arrastre de ~7 días para los samples
del Watch que llegan tarde → **upsert por fecha**). El aparato de `externalId` / índice
único parcial / `deletions[]` es **exclusivo de peso y cardio.**

---

## 1. Endpoint(s)

**Recomendación: reutilizar/extender los endpoints por-métrica existentes** (la
plataforma ya tiene `/steps/upsert`, `/cardio`, `/weight`). Argumento extra a favor:
**los anchors de HealthKit son por tipo de sample**, así que el cliente ya sincroniza
cada métrica de forma independiente — N llamadas mapea natural a N anchors.

```
POST   /api/v1/activity/steps/upsert     # YA EXISTE (idempotente por fecha) — cablear dataSource/confidenceScore
POST   /api/v1/measurements/weight       # EXTENDER: dedup por externalId cuando viene
POST   /api/v1/activity/cardio           # EXTENDER: dedup por externalId cuando viene
DELETE /api/v1/measurements/weight/by-external/:source/:externalId   # NUEVO — propaga borrados de Health
DELETE /api/v1/activity/cardio/by-external/:source/:externalId       # NUEVO — propaga borrados de Health
```

> **El path de borrado NO es opcional ni "futuro".** HealthKit entrega borrados
> (`HKDeletedObject`) en el mismo delta del anchor; sin una ruta de borrado por
> `externalId`, un sample borrado en Health quedaría huérfano en Verxion. Hay que
> diseñarlo en v1 (peso + cardio; pasos NO lo necesita — §0.5).

> **Opción batch `POST /api/v1/health/sync` (post-v1, no bloqueante):** un endpoint que
> acepte las 3 métricas + `deletions[]` en un payload atómico. Ventaja: una llamada por
> ciclo. Desventaja: los anchors son por tipo, así que forzaría a coordinar 3 deltas
> independientes en un payload, y acopla los modos de fallo de las 3 métricas. v1 vive
> bien con las rutas por-métrica. Decisión cerrada en §8.1: **per-métrica para v1.**

---

## 2. Forma de request/response (TS autoritativo)

> Fuente de verdad para los Zod en `@verxion/shared/src/schemas/{activity,measurement}.ts`.
> Campos **NUEVO** marcados; el resto ya existe.

### Provenance canónico (compartido — ver §7 blocker de enum)

```ts
// Enum único de origen, reusado por las 3 tablas. Valor canónico = el de la DB.
type DataSource =
  | "manual"
  | "apple_health"
  | "google_fit"
  | "samsung_health"
  | "fitbit"
  | "garmin"
  | "other";
```

### Pasos — `POST /activity/steps/upsert` (date-keyed; SIN externalId)

```ts
{
  totalSteps: number;        // agregado diario de-duplicado (cliente: HKStatisticsCollectionQuery .cumulativeSum — NO suma de samples)
  loggedDate: string;        // YYYY-MM-DD (día local del dispositivo)
  dataSource: "apple_health";// NUEVO en el payload — REQUIERE cablear Zod→UC→repo (la columna existe pero hoy se ignora)
  confidenceScore?: number;  // 0..1 (columna existe; mismo cableado pendiente)
  distanceKm?: number;
  caloriesBurned?: number;
  activeMinutes?: number;
}
// SIN externalId, SIN deletions — pasos es agregado por fecha (§0.5)
```

### Peso — `POST /measurements/weight` (UUID-keyed)

```ts
{
  weightKg: number;          // ya existe — cliente normaliza con HKUnit fijo (kg), NO unidad preferida del usuario (§3)
  loggedAt?: string;         // ISO-8601; ya existe
  source?: DataSource;       // NUEVO (default "manual")
  externalId?: string;       // NUEVO — HKSample.uuid; clave de idempotencia
  notes?: string;
}
```

### Cardio — `POST /activity/cardio` (UUID-keyed; HR best-effort)

```ts
{
  activityType: "run" | "bike" | "swim" | "row" | "elliptical" | "walk" | "hike" | "other";
                             // NUEVO: ensanchar de 5→8 valores (la pgEnum DB ya tiene 8; dominio+Zod sólo 5 hoy)
  durationMinutes: number;   // ya existe
  loggedDate?: string;       // YYYY-MM-DD; ya existe
  distanceKm?: number;       // nullable — HKWorkout.totalDistance puede ser nil (p.ej. fuerza)
  caloriesBurned?: number;   // nullable — HKWorkout.totalEnergyBurned puede ser nil
  source?: DataSource;       // NUEVO (hoy `data_source` es text libre; promover a enum con migración de datos)
  externalId?: string;       // NUEVO — HKWorkout.uuid; clave de idempotencia
  avgHeartRate?: number;     // NUEVO opcional — NULLABLE best-effort (no es propiedad del workout; ver §4)
  maxHeartRate?: number;     // NUEVO opcional — NULLABLE best-effort
  notes?: string;
}
```

> Mapeo de enum: `HKWorkoutActivityType` (~80+ casos) → `cardioActivityType` (8). El
> cliente traduce; tipos no mapeables → `"other"`. Mantener `"other"` como catch-all
> para que casos nuevos de iOS nunca rompan la ingesta.

---

## 3. Cliente vs. servidor

El **cliente** lee de HealthKit y:
- **Normaliza a unidades canónicas con `HKUnit` FIJO** (`kg`, `count`, `km`, `kcal`,
  `min`, `bpm`). ⚠️ **Requisito duro:** HealthKit devuelve la unidad **preferida del
  usuario** (`preferredUnits(for:)`), no la SI. Un peso de 180 lb llega como el número
  `180`; si no se extrae con `quantity.doubleValue(for: .gramUnit(with: .kilo))`,
  aterriza como 180 kg. El servidor confía en que el número viene ya en unidad canónica.
- **Agrega pasos vía statistics** (`.cumulativeSum`), **no sumando samples** (§0.5).
- Envía valores **raw** + ISO + (`externalId` para peso/cardio).
- **No deriva negocio.**

El **servidor** es dueño de idempotencia, provenance, resolución de conflicto
manual↔Health (§5), y validación por-ítem (rechaza el ítem inválido sin tumbar el lote).

---

## 4. Mapeo HealthKit → métrica de plataforma

| Sample HealthKit | Métrica | Forma | Endpoint | Almacén |
|---|---|---|---|---|
| `HKQuantityTypeIdentifierBodyMass` (discreto, UUID estable) | peso | UUID-keyed | `POST /measurements/weight` | `weight_logs` (+ source/externalId) |
| `HKQuantityTypeIdentifierStepCount` (acumulativo, sin UUID útil) | pasos | date-keyed | `POST /activity/steps/upsert` | `step_logs` (cablear dataSource) |
| `HKWorkout` (+ HR / energía / distancia) | cardio | UUID-keyed | `POST /activity/cardio` | `cardio_logs` (+ externalId) |

**Notas verificadas (Apple):**
- **Peso = caso limpio.** Discreto, sin problema de overlap, UUID estable. Varios
  pesajes/día = varios samples con UUID distinto → cada uno una fila.
- **Cardio HR no es propiedad del workout.** Hay que pedirlo con
  `workout.statistics(for: HKQuantityType(.heartRate))` (iOS 16+), y **sólo existe** si
  el workout adjuntó HR vía `HKWorkoutBuilder`/`HKLiveWorkoutBuilder` (workouts del
  Watch). Para workouts importados de terceros suele ser `nil` → fallback a query de
  samples acotada a `[startDate, endDate]`, y si nada → enviar `null`. **HR es
  nullable best-effort, nunca garantizado.**
- **Borrados (peso/cardio):** `HKAnchoredObjectQuery` entrega `HKDeletedObject` que
  **sólo trae el UUID** (+ metadata), no el dato. Por eso el borrado server-side es por
  `externalId`, y guardar el UUID en `externalId` al insertar es **obligatorio** o no
  se pueden honrar borrados.

---

## 5. Reglas de negocio server-side — DOBLE LOG

Dos tipos de duplicado, dos mecanismos:

### Tipo 1 — re-entrega del mismo dato (anchor re-dispara, reinstall, revoke+regrant)

| Métrica | Clave de idempotencia | On conflict |
|---|---|---|
| pasos | `(profileId, loggedDate)` | upsert reemplaza el día (ya implementado) |
| peso | `(profileId, source, externalId)` | `no-op` (`duplicate`) |
| cardio | `(profileId, source, externalId)` | `no-op` (`duplicate`) |

Peso y cardio admiten varios/día (dos pesajes; carrera matinal + bici vespertina),
así que **no se deduplica por fecha — sólo por `externalId`**.

> **Por qué la idempotencia por UUID es obligatoria, no opcional:** reinstalar la app o
> revocar+reconceder permiso **resetea el anchor** (vive en la app, no en HealthKit) →
> HealthKit hace **re-entrega completa**. El servidor RECIBIRÁ los mismos samples otra
> vez; sólo el `no-op` por `externalId` evita duplicar. **Asunción explícita:** los
> UUID de HKSample son **estables e inmutables**; editar en Health = borrar+insertar con
> UUID nuevo (los `HKObject` son inmutables). Por eso un re-sync nunca trae un valor
> cambiado bajo el mismo `externalId` → `no-op` es seguro.

### Tipo 2 — manual vs. Health (sin externalId compartido)

| Métrica | Regla | Nota |
|---|---|---|
| pasos | **Health gana** el día (sensor > estimación manual). Sobrescribe y sella `dataSource=apple_health`. | ⚠️ **Es lógica NUEVA en `UpsertActivityStepsUseCase`** — hoy el upsert es last-write-wins ciego al origen. "Health gana" requiere un guard de prioridad-por-source. Guard opcional adicional: sólo sobrescribir si `confidenceScore` entrante ≥ existente. No romper el caso manual-sobre-manual. |
| peso | **No auto-fusionar.** Cada pesaje es un registro; manual y Health coexisten salvo mismo `externalId`. | badge de origen en el read-model (§8.4) |
| cardio | **No auto-fusionar** en v1. `externalId` mata el re-sync; "logueé la carrera en la web Y vino de Health" es dedup blando → mostrar ambas con badge. | (futuro) heurística ventana-de-tiempo + `activityType` |

---

## 6. Edge cases

| # | Caso | Servidor | Cliente |
|---|---|---|---|
| 1 | Mismo `externalId` reenviado (peso/cardio) | `duplicate`, no-op | persiste anchor |
| 2 | Sample de peso/cardio borrado en Health | `DELETE …/by-external/:source/:externalId` borra la fila | envía `HKDeletedObject.uuid` del delta del anchor |
| 3 | **Pasos borrados/editados en Health** | siguiente upsert trae total recalculado (más bajo); **no hay borrado explícito** | recompute de la ventana, re-upsert |
| 4 | Revoca y vuelve a conceder acceso | anchors reset → re-entrega completa; idempotencia por UUID/fecha protege | reset anchor local |
| 5 | Día con pasos manual + Health | una fila/día; Health sobrescribe (§5 Tipo 2) | — |
| 6 | Valor inválido (negativo/futuro/rango absurdo) | rechaza ese ítem, procesa el resto del lote | descarta y loguea |
| 7 | Cardio sin `distanceKm`/`caloriesBurned` (fuerza en Apple Watch) | acepta; campos null | mapea a `other` si el tipo no encaja |
| 8 | Cardio sin HR (workout de tercero sin HR adjunta) | acepta; `avg/maxHeartRate` null | intenta `statistics(for:)` → fallback sample query → `null` |

---

## 7. Prerrequisitos de plataforma — BLOCKERS

- [ ] **Canonicalizar el enum de `source` (blocker raíz).** Hoy hay **4 superficies divergentes**:
      DB `stepDataSource` (`apple_health…`, 7 valores), domain `StepDataSource`
      (`health_kit…`, 9 valores con `strava`/`apple_watch`/`other_device`), domain
      `CardioDataSource` (`health_kit…`, 8 valores), y `cardio_logs.data_source` como
      **text libre**. Unificar en **un enum** (valor canónico DB: `apple_health`) reusado
      en las 3 tablas.
      - **Antes de renombrar:** confirmar que **nada emite `health_kit` hoy** (el repo de
        pasos lo tira, pero `UpdateCardioLogUseCase` valida contra una lista que lo
        incluye y el repo de cardio SÍ escribe el text libre → puede haber filas
        `health_kit` persistidas).
- [ ] **Migración `0068_healthkit_provenance.sql`:**
  - `weight_logs` += `source` (enum, default `manual`) + `external_id` (text, null)
    + índice **único parcial** `(profile_id, source, external_id) WHERE external_id IS NOT NULL`.
  - `cardio_logs`: **(1) migrar datos** `UPDATE cardio_logs SET data_source='apple_health' WHERE data_source='health_kit'`
    (y mapear cualquier otro valor domain-only) **antes** del `ALTER`; **(2) promover**
    `data_source` text → enum canónico; **(3)** += `external_id` (text, null) + único
    parcial; **(4)** opcional `avg_heart_rate`/`max_heart_rate` int.
  - `step_logs`: (opcional) promover el índice `(profile_id, logged_date)` a **único**
    para blindar el upsert ante carreras (hoy lo garantiza sólo el UC).
- [ ] **Probe en `reconcileDrizzleMigrations.ts` para 0068** (regla de CLAUDE.md: toda
      migración necesita probe o queda susceptible al gap-bug de drizzle-kit). **No omitir.**
- [ ] **Cablear pasos de verdad:** `logStepsSchema` (+`dataSource`,`confidenceScore`),
      `UpsertActivityStepsRequest` (+ ambos campos), y `DrizzleStepLogRepository` (incluir
      `dataSource`/`confidenceScore` en el INSERT). Sin esto el sync de pasos no marca origen
      pese a que la columna existe.
- [ ] **Zod:** `logWeightSchema` (+`source`,`externalId`), `logCardioSchema`
      (+`source`,`externalId`,`avg/maxHeartRate`, `activityType` 5→8) en `@verxion/shared`.
- [ ] **Dominio:** `Weight` y `CardioLog` += `source`/`externalId`; `CardioLog` += HR;
      UCs idempotentes `UpsertWeightUseCase`/`UpsertCardioUseCase` (dedup por índice único
      + `ON CONFLICT DO NOTHING` → re-query → devolver existente; agnóstico a códigos pg).
      Guard "Health gana" en `UpsertActivityStepsUseCase`.
- [ ] **Scope OAuth:** verificar `.write` para las rutas extendidas **y `.destructive`**
      para las nuevas rutas DELETE — en **ambos** archivos (`auth/scopes.ts` **y**
      `mcp-server/utils/scopes.ts`; `route-scope-policy.ts` autogenera `.destructive` para
      DELETE y da 403 si no existe).
- [ ] **OpenAPI:** anotar rutas/respuestas extendidas + las DELETE en `routeInventory.ts`
      → parity test.

---

## 8. Decisiones abiertas — RECOMENDACIONES (la mayoría ya cerradas)

1. **Per-métrica vs. batch `/health/sync`** → **CERRADO: per-métrica para v1.** Los
   anchors son por tipo de sample, así que N llamadas es lo natural. Batch = mejora
   posterior si el volumen lo pide.
2. **Conflicto pasos manual↔Health** → **Health gana el día**, sella `dataSource`. Guard
   opcional por `confidenceScore`. (Recordar: es lógica nueva en el UC, no gratis.)
3. **Dedup blando cardio cross-source** → v1 **no fusiona**, muestra ambas con badge.
   Heurística por ventana de tiempo = futuro.
4. **`source` en los read-models de lectura** → añadir `source` (aditivo) a los
   read-models de peso/pasos/cardio para pintar badge "vía Apple Health". Hacer en el
   mismo PR que el badge nativo. *(la única decisión de producto realmente abierta)*
5. **HR en cardio** → añadir `avg/maxHeartRate` opcionales ahora (baratos), asumiendo
   **nullable best-effort**.

---

## 9. Checklist de implementación (plataforma)

- [ ] Canonicalizar enum `source` (blocker §7) + confirmar que nada emite `health_kit`.
- [ ] Migración `0068`: `weight_logs` (+source,+externalId,+único parcial), `cardio_logs`
      (**migrar datos** → `data_source`→enum, +externalId, +único parcial, +HR), `step_logs`
      (índice único opcional). **+ probe en `reconcileDrizzleMigrations.ts`.**
- [ ] Cablear `dataSource`/`confidenceScore` en pasos (Zod + UC request + repo INSERT).
- [ ] Zod `logWeightSchema`/`logCardioSchema` extendidos (+`activityType` 5→8); index export.
- [ ] Dominio `Weight`/`CardioLog` +source/externalId(+HR); `UpsertWeightUseCase`/`UpsertCardioUseCase`;
      guard "Health gana" en `UpsertActivityStepsUseCase`.
- [ ] Rutas idempotentes (`/weight`, `/cardio` dedup por externalId; `/steps/upsert` ya)
      **+ DELETE `…/by-external/:source/:externalId`** (peso + cardio).
- [ ] Scopes `.write` + `.destructive` en ambos archivos.
- [ ] `routeInventory.ts` + parity test; contract test de idempotencia/duplicado/borrado.
- [ ] (Decisión §8.4) `source` en read-models de lectura.

---

## 10. Notas de alineación NATIVA (verxion-native-client)

El módulo de salud nativo está **greenfield para sync** (`HealthKitRepository` es un
stub que devuelve `UNAVAILABLE`; `IHealthPort` sólo tiene status; sin librería, sin
entitlements). Nada contradice este contrato. Dos desalineaciones a corregir cuando
aterrice el binding:

1. **`HealthMetric` = `"weight" | "steps" | "water"`** (`src/domain/health/models/HealthStatus.ts`)
   está **desalineado con los targets de sync**: incluye `water` (HealthKit NO la lee
   — debería ser un toggle manual, no "de HealthKit") y **omite `cardio`** (sí es target
   de sync). Ajustar el set a `weight | steps | cardio` para los toggles de Health.
2. **Pasos:** el nativo hoy postea a `POST /activity/steps`; el sync debe usar
   `POST /activity/steps/upsert` (idempotente por fecha).

---

## Swap-in checklist (nativo, cuando aterrice el binding)

Librería: `@kingstinct/react-native-healthkit`. Entitlements requeridos en `app.json`:
`NSHealthShareUsageDescription`, `NSHealthUpdateUsageDescription`, y
`com.apple.developer.healthkit.background-delivery` (iOS 15+) para background.

1. **Ampliar `IHealthPort`** con DOS formas de lectura (no una):
   - **peso/cardio:** `pullChanges(type, anchor)` → `{ samples, deletedUUIDs, newAnchor }`
     vía `HKAnchoredObjectQuery` (un anchor **por tipo**, persistido vía DI, no `AsyncStorage` directo).
   - **pasos:** `recomputeDailySteps(fromDate)` vía `HKStatisticsCollectionQuery`
     `.cumulativeSum` (NO suma de samples), disparado por `HKObserverQuery`.
2. **`HealthKitRepository` real:** normalizar unidades con `HKUnit` **fijo** (footgun §3);
   mapear `HKWorkoutActivityType`→`cardioActivityType` (con `other` fallback); HR vía
   `workout.statistics(for:)` con fallback a sample query acotada, nullable.
3. **`SyncHealthToPlatformUseCase`:**
   - peso/cardio: delta del anchor → `POST /weight` + `POST /cardio` (upsert por externalId)
     + `DELETE …/by-external/:source/:externalId` para `deletedUUIDs`.
   - pasos: recompute de hoy + ventana de arrastre ~7d → `POST /steps/upsert` por día.
   - Vía `HttpHealthSyncRepository implements IHealthSyncPort`. Anchors en ephemeral
     storage **vía DI**.
4. **Background:** `HKObserverQuery` + `enableBackgroundDelivery(for:frequency:)`. Pasos
   está capado a frecuencia **horaria**; el observer es "despierta y reconcilia", no un
   evento por cambio → el sync debe ser **idempotente y auto-sanable** (recompute de ventana).
5. Sin cambios en pantallas de lectura; sólo badge de `source` si se aprueba §8.4.

---

## Changelog de la revisión (2026-06-08)

Correcciones materiales sobre el borrador original, tras verificar contra el código de
`verxion-platform` y la documentación oficial de Apple HealthKit:

- **Pasos NO es "usar tal cual".** La columna `data_source` existe pero el camino de
  escritura (Zod→UC→repo) la tira; hay que cablearla. (verificado en código)
- **DOS formas de ingesta, no una** (§0.5). Peso/cardio = UUID-keyed con borrados;
  pasos = date-keyed sin UUID ni borrados. (Apple: statistics ≠ anchored)
- **Pasos no se suman de samples** — `HKStatisticsCollectionQuery .cumulativeSum`, y
  statistics no admite anchor → modelo observer+recompute. (Apple)
- **`deletions[]` sólo aplica a peso/cardio**; pasos no tiene borrado explícito. Path de
  borrado por `externalId` promovido a blocker de v1.
- **HR en cardio = nullable best-effort** (no es propiedad del workout; `statistics(for:)`,
  builder-dependent). (Apple)
- **Unidades = requisito duro del cliente** (`HKUnit` fijo; HealthKit devuelve unidad
  preferida del usuario). (Apple)
- **Enum: 4 superficies divergentes** (no 3); cardio `data_source` TEXT→enum **necesita
  migración de datos** previa. (verificado en código)
- **"Health gana el día" = lógica nueva** en el UC de pasos, no gratis. (verificado)
- **Blockers añadidos:** probe en `reconcileDrizzleMigrations.ts`; scope `.destructive`
  para las rutas DELETE; cablear `dataSource` de pasos.
- **Notas de alineación nativa** (§10): `HealthMetric` debe ser weight/steps/cardio (no
  water); pasos al endpoint `/upsert`.
</content>
</invoke>
