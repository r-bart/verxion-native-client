# "HealthKit Sync" — endpoints de ingesta (peso / pasos / cardio)

> **Tipo:** spec de endpoints de **escritura/ingesta** (no read-model). El cliente
> nativo lee samples de Apple Health en el dispositivo y los **empuja** a la
> plataforma para que persistan junto a los logs manuales.
> **Status:** draft para el agente de API (`verxion-platform`).
> **Origen:** análisis de integración HealthKit (2026-06-08), **revisado contra el
> modelo real de `verxion-platform`** (tablas `weight_logs`, `step_logs`,
> `cardio_logs`). Ver el módulo `health` nativo (`domain/health`, `IHealthPort`,
> `HealthKitRepository`).
>
> El cliente pega directo a la API (el MCP no interviene). Flujo del contrato igual
> que siempre: request/response Zod en `@verxion/shared` → OpenAPI → codegen nativo.
>
> Tesis: *"Apple Health es una fuente más (`source`) de peso, pasos y cardio;
> sincronizar no debe duplicar (re-sync) ni pisar ciegamente el log manual."*

---

## 0. Alcance — leer primero

HealthKit alimenta **3 métricas**. El **agua queda fuera** (sigue siendo micro-write
manual; HealthKit no la lee). Tres flujos; sólo dos tocan backend:

| Flujo | Descripción | ¿Backend? |
|---|---|---|
| **A** | Health → display in-app (lectura local) | ❌ ya cubierto por read-models existentes |
| **B** | Health → log de **peso / pasos / cardio** | ✅ **este spec** |

### Estado del modelo de plataforma (hallazgo de la revisión)

| Métrica | Tabla | `source`/provenance | `externalId` | Idempotencia hoy | Falta |
|---|---|---|---|---|---|
| **Pasos** | `step_logs` | ✅ `dataSource` enum (`apple_health`) + `confidenceScore` | — | ✅ `POST /steps/upsert` por `(profileId, loggedDate)` | **nada** — usar tal cual |
| **Peso** | `weight_logs` | ❌ | ❌ | ❌ inserta siempre | `source` enum + `externalId` + idempotencia |
| **Cardio** | `cardio_logs` | ⚠️ `dataSource` **text libre** | ❌ | ❌ inserta siempre | promover `dataSource`→enum + `externalId` + idempotencia |

> **Cardio NO es entidad nueva:** `cardio_logs` ya existe, separada de
> `workout_sessions` (sesiones de fuerza prescritas). Los `HKWorkout` mapean 1:1.

---

## 1. Endpoint(s)

**Recomendación: reutilizar/extender los endpoints por-métrica existentes** (la
plataforma ya tiene `/steps/upsert`, `/cardio`, `/weight`), añadiéndoles
idempotencia por `source`+`externalId`. Es menos fricción que un endpoint nuevo.

```
POST /api/v1/activity/steps/upsert     # YA EXISTE — usar sin cambios (idempotente por fecha)
POST /api/v1/measurements/weight       # EXTENDER: dedup por externalId cuando viene
POST /api/v1/activity/cardio           # EXTENDER: dedup por externalId cuando viene
```

> **Opción ergonómica (recomendada a medio plazo, no bloqueante para v1):** un
> `POST /api/v1/health/sync` batch que acepte las 3 métricas en un payload + un
> array `deletions[]`, atómico, una sola llamada por ciclo de sync. v1 puede vivir
> con las 3 rutas por-métrica (el cliente hace N llamadas; pasos ya es idempotente,
> peso/cardio pasan a serlo). Decidir en §8.1.

---

## 2. Forma de request/response (TS autoritativo)

> Fuente de verdad para los Zod en `@verxion/shared/src/schemas/{activity,measurement}.ts`.
> Los campos **nuevos** van marcados; el resto ya existe en los schemas actuales.

### Provenance canónico (compartido — ver §7 blocker de enum)

```ts
// Enum único de origen, reusado por las 3 tablas. Se recomienda el de la DB.
type DataSource =
  | "manual"
  | "apple_health"
  | "google_fit"
  | "samsung_health"
  | "fitbit"
  | "garmin"
  | "other";
```

### Pasos — `POST /activity/steps/upsert` (sin cambios de schema)

```ts
// logStepsSchema ya existente; el cliente sólo rellena dataSource + confidenceScore
{
  totalSteps: number;        // agregado diario (cliente suma vía queryStatisticsForQuantity)
  loggedDate: string;        // YYYY-MM-DD (día local)
  dataSource: "apple_health";// NUEVO en el payload (la columna ya existe)
  confidenceScore?: number;  // 0..1 (la columna ya existe)
  distanceKm?: number;
  caloriesBurned?: number;
  activeMinutes?: number;
}
```

### Peso — `POST /measurements/weight` (campos nuevos)

```ts
{
  weightKg: number;          // ya existe
  loggedAt?: string;         // ISO-8601; ya existe
  source?: DataSource;       // NUEVO (default "manual")
  externalId?: string;       // NUEVO — HKSample.uuid; clave de idempotencia
  notes?: string;
}
```

### Cardio — `POST /activity/cardio` (campos nuevos)

```ts
{
  activityType: "run" | "bike" | "swim" | "row" | "elliptical" | "walk" | "hike" | "other";
  durationMinutes: number;   // ya existe
  loggedDate?: string;       // YYYY-MM-DD; ya existe
  distanceKm?: number;
  caloriesBurned?: number;
  source?: DataSource;       // NUEVO (hoy es `dataSource` text; promover a enum)
  externalId?: string;       // NUEVO — HKWorkout.uuid; clave de idempotencia
  avgHeartRate?: number;     // NUEVO opcional (display de cardio)
  maxHeartRate?: number;     // NUEVO opcional
  notes?: string;
}
```

> Mapeo de enum: `HKWorkoutActivityType` → `cardioActivityType`. La librería expone
> el tipo; el cliente lo traduce. Tipos no mapeables → `"other"`.

---

## 3. Cliente vs. servidor

El **cliente** lee de HealthKit, normaliza a unidades canónicas (`kg`, `count`,
`km`, `kcal`, `min`, `bpm`), agrega pasos a total diario, y envía valores **raw** +
ISO + `externalId`. No deriva negocio. El **servidor** es dueño de idempotencia,
provenance, y la resolución de conflicto manual↔Health (§5).

---

## 4. Mapeo HealthKit → métrica de plataforma

| Sample HealthKit | Métrica | Endpoint | Almacén |
|---|---|---|---|
| `HKQuantityTypeIdentifierBodyMass` | peso | `POST /measurements/weight` | `weight_logs` (+ source/externalId) |
| `HKQuantityTypeIdentifierStepCount` | pasos | `POST /activity/steps/upsert` | `step_logs` (listo) |
| `HKWorkoutType` (+ HR / energía / distancia) | cardio | `POST /activity/cardio` | `cardio_logs` (+ externalId) |

---

## 5. Reglas de negocio server-side — DOBLE LOG

Dos tipos de duplicado, dos mecanismos:

### Tipo 1 — re-entrega del mismo sample (anchor re-dispara, reinstall)

| Métrica | Clave de idempotencia | On conflict |
|---|---|---|
| pasos | `(profileId, loggedDate)` | upsert reemplaza el día (ya implementado) |
| peso | `(profileId, source, externalId)` | no-op (`duplicate`) |
| cardio | `(profileId, source, externalId)` | no-op (`duplicate`) |

Peso y cardio admiten varios/día (dos pesajes; carrera matinal + bici vespertina),
así que **no se puede deduplicar por fecha — sólo por `externalId`**. De ahí la
columna nueva.

### Tipo 2 — manual vs. Health (sin externalId compartido)

| Métrica | Regla | Constante/criterio |
|---|---|---|
| pasos | **Health gana** el día (sensor > estimación manual). Sobrescribe y sella `dataSource=apple_health`. | opcional: sólo sobrescribir si `confidenceScore` entrante ≥ existente |
| peso | **No auto-fusionar.** Cada pesaje es un registro; manual y Health coexisten salvo mismo `externalId`. | badge de origen en el read-model |
| cardio | **No auto-fusionar** en v1. `externalId` mata el re-sync; "logueé la carrera en la web Y vino de Health" es dedup blando → mostrar ambas con badge. | (futuro) heurística ventana-de-tiempo + `activityType` |

---

## 6. Edge cases

| # | Caso | Servidor | Cliente |
|---|---|---|---|
| 1 | Mismo `externalId` reenviado | `duplicate`, no-op | persiste anchor |
| 2 | Sample borrado en Health | `deletions[]` → borra `(profileId, source, externalId)` | envía deletedSamples del anchor |
| 3 | Revoca y vuelve a conceder acceso | anchors reset en cliente → re-ingesta; idempotencia protege | reset anchor local |
| 4 | Día con pasos manual + Health | una fila/día; Health sobrescribe (§5 Tipo 2) | — |
| 5 | Valor inválido (negativo/futuro/rango absurdo) | rechaza ese item, procesa el resto | descarta y loguea |
| 6 | Cardio sin `distanceKm` (p.ej. fuerza en Apple Watch) | acepta; distancia null | mapea a `other` si no encaja |

---

## 7. Prerrequisitos de plataforma — BLOCKERS

- [ ] **Canonicalizar el enum de `source`.** Hoy hay 3 listas divergentes:
      DB `stepDataSource` (`apple_health…`), domain `StepDataSource` (`health_kit…`),
      domain `CardioDataSource` (otra). Unificar en **un enum** (recomiendo el de la
      DB: `apple_health`) y reusarlo en las 3 tablas. **Pre-requisito de todo lo demás.**
- [ ] **Migración `0068_healthkit_provenance.sql`:**
  - `weight_logs` += `source` (enum, default `manual`) + `external_id` (text, null)
    + índice **único** `(profile_id, source, external_id)` (parcial: `WHERE external_id IS NOT NULL`).
  - `cardio_logs`: promover `data_source` text → enum canónico; += `external_id`
    (text, null) + único `(profile_id, source, external_id)` parcial; opcional
    `avg_heart_rate`/`max_heart_rate` int.
  - `step_logs`: (opcional) promover el índice `(profile_id, logged_date)` a
    **único** para blindar el upsert ante carreras (hoy lo garantiza sólo el UC).
- [ ] **Zod:** `logWeightSchema` (+`source`,`externalId`), `logCardioSchema`
      (+`source`,`externalId`,`avg/maxHeartRate`) en `@verxion/shared`. `logStepsSchema`
      sólo necesita aceptar `dataSource`+`confidenceScore` (ya en tabla).
- [ ] **Dominio:** `Weight` y `CardioLog` += `source`/`externalId`; UCs idempotentes
      (`UpsertWeightUseCase`, `UpsertCardioUseCase` por `externalId`, espejo de
      `UpsertActivityStepsUseCase`).
- [ ] **Scope OAuth de escritura** para las rutas extendidas (ya existen como write;
      verificar tier `.write` en `auth/scopes.ts` + `mcp-server/utils/scopes.ts`).
- [ ] **OpenAPI:** anotar las respuestas extendidas en `routeInventory.ts` → parity test.

---

## 8. Decisiones abiertas — PREFERENCIAS (recomendar + confirmar)

1. **Per-métrica vs. batch `/health/sync`** — **recomiendo:** v1 reusa las 3 rutas
   (menos backend; pasos ya idempotente). Batch como mejora posterior si el volumen
   de sync lo pide. *(abierto)*
2. **Conflicto pasos manual↔Health** — **recomiendo:** Health gana el día, sella
   `dataSource`. Opcional guard por `confidenceScore`. *(abierto)*
3. **Dedup blando cardio cross-source (web manual vs Health)** — **recomiendo:** v1
   no fusiona, muestra ambas con badge. Heurística por ventana de tiempo = futuro.
   *(abierto)*
4. **`source` en los read-models de lectura** — **recomiendo:** añadir `source`
   (aditivo) a los read-models de peso/pasos/cardio para pintar badge "vía Apple
   Health". *(abierto)*
5. **HR en cardio** — **recomiendo:** añadir `avg/maxHeartRate` opcionales a
   `cardio_logs` ahora (baratos, útiles para display). *(abierto)*

---

## 9. Checklist de implementación (plataforma)

- [ ] Canonicalizar enum `source` (blocker §7).
- [ ] Migración `0068`: `weight_logs` (+source,+externalId,+único), `cardio_logs`
      (dataSource→enum,+externalId,+único,+HR), `step_logs` (índice único opcional).
- [ ] Zod `logWeightSchema`/`logCardioSchema` extendidos; index export.
- [ ] Dominio `Weight`/`CardioLog` +source/externalId; `UpsertWeightUseCase`/`UpsertCardioUseCase`.
- [ ] Rutas idempotentes (`/weight`, `/cardio` dedup por externalId; `/steps/upsert` ya).
- [ ] `routeInventory.ts` + parity test; contract test de idempotencia/duplicado.
- [ ] (Decisión §8.4) `source` en read-models de lectura.

---

## Swap-in checklist (nativo, cuando aterrice)

1. Ampliar `IHealthPort` con lectura de samples + `pullChanges(anchor)` (delta).
2. `HealthKitRepository` real con `@kingstinct/react-native-healthkit`
   (`queryQuantitySamplesWithAnchor`, `queryWorkoutSamples`); normalizar unidades;
   mapear `HKWorkoutActivityType`→`cardioActivityType`.
3. `SyncHealthToPlatformUseCase`: delta → `/steps/upsert` + `/weight` + `/cardio`
   (vía `HttpHealthSyncRepository implements IHealthSyncPort`); persistir anchor en
   ephemeral storage **vía DI** (no `AsyncStorage` directo — ver convención DI).
4. Sin cambios en pantallas de lectura; sólo badge de `source` si se aprueba §8.4.
</content>
