# "Progreso" — contrato entregado, mapeo con el handoff, gaps y plan de build

> **Qué es este doc.** Backend ya entregó el namespace curado `/api/v1/progress`
> (tag `Progress`, 4 read-models). Este fichero NO es un spec para implementar
> desde cero: es (1) el contrato tal como llegó, (2) su cruce 1:1 con el handoff
> de diseño, (3) los gaps que devolvemos a backend en el mismo round que el fix
> de `period`/`metric`, y (4) el plan para reemplazar el módulo `progress` legacy
> del native y construir presentation.
>
> - Contrato: `verxion-platform/contracts/{develop,staging}.openapi.json` —
>   los 4 schemas son **idénticos en develop y staging** (estable).
> - Handoff: `docs/progreso/handoff_progreso/HANDOFF - Progreso y subpáginas.md`
>   (+ 14 screenshots). Calendario congelado del proto: **hoy = Mar 2 jun 2026**.
> - Principio rector (heredado): **cliente de solo lectura**. Toda edición es
>   handoff al agente; lo "editable" (reordenar Resumen, periodo, cinta↔carrete)
>   es **estado de vista local**, no dato de dominio.
> - Fuente de verdad en drift: la **API** (`api-is-source-of-truth-on-drift`).
>   Donde el contrato no llega al diseño, lo marcamos como gap (§5), no lo
>   inventamos en cliente.

---

## 1. Endpoints entregados (tag `Progress`)

```
GET /api/v1/progress                      → 200 { data: ProgressOverview }
GET /api/v1/progress/history              → 200 { data: ProgressHistory }
GET /api/v1/progress/measure/{metric}     → 200 { data: ProgressMeasureDetail }
GET /api/v1/progress/exercise/{slug}      → 200 { data: ProgressExerciseDetail }
```

- **Params declarados:** solo `metric` (path) y `slug` (path), ambos `string`.
- **Sin declarar (gap G):** no hay `?period=` en `/progress` ni en
  `/progress/measure/{metric}`, ni `?metric=` (e1rm|volumen) en
  `/progress/exercise/{slug}` — pese a que los read-models devuelven esos campos.
  **Es el fix que backend ya tiene en marcha.**
- **Catálogo de `{metric}`** (enum del contrato `ProgressMeasureDetail.metric`,
  idéntico a `metrics[].key` y `window.key`): `peso · waist · hips · chest ·
  shoulders · neck · bicep_right · bicep_left · forearm_right · forearm_left ·
  thigh_right · thigh_left · calf_right · calf_left · pasos · cardio` (cuerpo +
  actividad). Los 13 perímetros son `MeasurementType.rawValue` (inglés, cada lado
  independiente) y reemplazaron a los antiguos `cintura/cadera/brazo`. Las
  métricas de entreno/nutrición del inventario **no** tienen detalle de medida:
  deep-linkean a Entreno / Nutrición.
- **`{slug}`** se alcanza desde `strengthPr.slug`, `prMarks[].slug` e hitos PR.

---

## 2. Response shapes (authoritative TS — tal como llegaron)

> Estas interfaces son el destino de `domain/progress/models/`. Reemplazan por
> completo a los modelos legacy actuales (ver §6).

```ts
// GET /api/v1/progress
interface ProgressOverview {
  period: "semana" | "mes" | "trim" | "sem6" | "ano";
  metrics: ProgressMetric[];
  strengthPr: StrengthPr | null;
  setup: {
    routine:  "active" | "inactive_only" | "none";
    dietPlan: "active" | "inactive_only" | "none";
    program:  "active" | "inactive_only" | "none";
  };
  dataState: "full" | "fresh" | "empty";
}

interface ProgressMetric {
  key: string;            // catálogo NO enumerado en contrato — ver gap C
  now: number | null;
  first: number | null;
  delta: number | null;
  min: number | null;
  max: number | null;
  unit: string;
  dec: number;
  goodDown: boolean;
  goal: number | null;
  spark: number[];        // mini-sparkline; items sin tipo en el schema
}

interface StrengthPr {
  exerciseName: string;
  slug: string;
  bestWeightKg: number;
  reps: number | null;
  achievedAt: string;     // fecha — sin `format` en OpenAPI (gap H)
  deltaKg: number | null;
}

// GET /api/v1/progress/history
interface ProgressHistory {
  weeks: number;          // = 30 (H_N en el proto)
  series: {
    key: "peso" | "volumen" | "adherencia";
    unit: string;
    goodDown: boolean;
    points: { week: number; value: number | null }[];
  }[];
  bands: {
    label: string;
    kind: "routine" | "diet" | "program";
    fromWeek: number;
    toWeek: number;
    isMajor: boolean;
    // ⚠ FALTAN name + why — ver gap A
  }[];
  prMarks: {              // ⚠ solo hitos de tipo PR — ver gap B
    week: number;
    exerciseName: string;
    slug: string;
    bestWeightKg: number;
    reps: number | null;
  }[];
  dataState: "full" | "fresh" | "empty";
}

// GET /api/v1/progress/measure/{metric}
interface ProgressMeasureDetail {
  metric: string;
  unit: string;
  dec: number;
  goodDown: boolean;
  goal: number | null;
  period: "mes" | "trim" | "ano";         // = Mes / 3m / Año del PeriodPicker
  window: {                                // hero KPI (mismo shape que un metric)
    key: string;
    now: number | null;
    first: number | null;
    delta: number | null;
    min: number | null;
    max: number | null;
    unit: string;
    dec: number;
    goodDown: boolean;
    goal: number | null;
    spark: number[];
  };
  chart: { date: string; value: number }[];
  records: { date: string; value: number; deltaPrev: number | null }[];
}

// GET /api/v1/progress/exercise/{slug}
interface ProgressExerciseDetail {
  slug: string;
  name: string;
  part: string | null;
  category: string | null;
  metric: "e1rm" | "volumen";
  kpis: {
    prWeightKg: number | null;
    e1rmKg: number | null;
    bestVolumeT: number | null;
    logs: number;
  };
  curve: { session: number; value: number; date: string }[];
  e1rmDelta: number | null;
  volDelta: number | null;
  history: {
    date: string;
    topSetWeightKg: number;
    topSetReps: number;
    isPr: boolean;
    meta: string | null;       // "RIR 2 · vol 3,6" — server-localized free text
    value: number;
    deltaPct: number | null;
  }[];
  muscles: { name: string; role: string; pct: number }[];
  empty: boolean;              // true si logs === 0 → XEmptyProgress
}
```

---

## 3. Mapeo handoff → read-model (qué pinta cada cosa)

| Superficie del handoff | Read-model | Encaje |
|---|---|---|
| **Lente Resumen** (secciones por dominio reordenables) | `ProgressOverview.metrics[]` + `strengthPr` + `setup` + `dataState` | ✅ + gap C (índice fuerza) |
| **Lente Métricas** (inventario + drill-down) | `ProgressOverview.metrics[]` (mini) → expand a `/measure/{metric}` | ✅ + decisión §8.1 |
| **Lente Historial · Cinta/Carrete** | `ProgressHistory` (series/bands/prMarks/weeks) | ⚠ gaps A + B |
| **Detalle de medida** (6 métricas) | `ProgressMeasureDetail` | ✅ encaje casi perfecto |
| **Detalle de ejercicio · tab Progreso** | `ProgressExerciseDetail` | ✅ encaje perfecto |
| **Detalle de ejercicio · tab Cómo se hace** | — (librería de ejercicios) | ⚠ gap D (cross-módulo) |
| **Banner "Ciclo · Sem 3 de 6 · obj 79 kg"** | — (Programas / Hoy) | ⚠ gap F (cross-módulo) |
| **Compartir** (spike 9:16) | — (export de vista, render cliente) | ✅ sin endpoint, read-only |

**Detalle por campo (lo que encaja a la perfección):**

- **Resumen / Métricas** ← `metrics[]`: `key, now, first, delta, min, max, unit,
  dec, goodDown, goal, spark` = exactamente el `vxWindow(key, period)` del proto.
  Los stats del drill (`máx · mín · objetivo`) salen de `min/max/goal`; el 4º KPI
  es "media" `(max+min)/2` cuando `goal == null`.
- **Cinta** ← `series[]` (peso/volumen/adherencia, `points` por semana) = los 3
  carriles `H_METRICS`. `weeks=30` = `H_N`. `bands[]` = las etapas `H_PHASES`
  (tinte de fondo + línea de cambio de fase en `isMajor`).
- **Detalle de medida** ← `window` (hero now/first/delta/min/max), `chart[]`
  (MChart), `records[]` (`deltaPrev` = delta vs semana previa, "=" si 0),
  `period` = Mes/3m/Año. Encaje 1:1.
- **Detalle de ejercicio (Progreso)** ← `kpis` (PR carga · e1RM · Mejor vol ·
  Registros), `curve[]` (ExChart s1…sN), `e1rmDelta`/`volDelta` ("+8 kg"/"+0,6 t"),
  `history[]` (XHistRow: `topSetWeightKg × topSetReps` + `isPr` + `meta` +
  `deltaPct`), `muscles[]` (Principal/Secundario/Estabilizador), `empty`.
  Confirmado contra screenshot 13: Press banca 104 kg e1RM, toggle e1RM/Volumen,
  KPI strip, curva s1…s8, historial "82,5 kg × 8 + PR + RIR 2 vol 3,6".

**Estados** (`dataState`): `empty` → `ProgEmpty` (sin segmentado, prompt al
agente) · `fresh` → `FreshBanner` + `HistorialSoon` · `full` → todo. Misma
semántica que Hoy/diet-dashboard (`diet-dashboard-state-semantics`).

---

## 4. Preguntas del review que el handoff YA resuelve

- **Catálogo de `metric`** → `peso` + 13 perímetros (`waist, hips, chest,
  shoulders, neck, bicep_right, bicep_left, forearm_right, forearm_left,
  thigh_right, thigh_left, calf_right, calf_left`) + `pasos, cardio`.
- **Valores de `period`** → coinciden con el contrato (medida `mes/trim/ano`;
  overview `semana/mes/trim/sem6/ano`).
- **Origen de `slug`** → `strengthPr.slug`, `prMarks[].slug`, hitos PR.
- **El índice e1RM lo computa backend, la app solo lo lee** (handoff §2.1 lo pedía
  como "endpoint ad-hoc") → coherente con `strengthPr` ya cocinado.

---

## 5. Gaps para backend (mismo round que el fix de `period`/`metric`)

> Orden de prioridad. A–D bloquean diseño; E–F son decisiones; G en marcha; H menor.

### A — `ProgressHistory.bands[]` sin `name` + `why` (BLOQUEA Carrete + PhaseSummary)
El contrato da `label, kind, fromWeek, toWeek, isMajor`. El alma del concepto
"versiones de ti" son `name` ("Fuerza de invierno") y `why` ("Construir base de
músculo antes de definir"). Sin ellos, las cabeceras de capítulo del **Carrete**
y el `PhaseSummary` de la **Cinta** quedan sin texto.
**Pedir:** añadir `name: string` y `why: string` a cada `band`.

### B — Hitos / timeline del Carrete — ❌ DESCARTADO (2026-06-08)
**Decisión del producto:** los **hitos** (milestones) se eliminan. El concepto es
flaky, aporta poco valor ahora mismo y arriesga tiempo. Se quitó el **Carrete**
entero (`CarreteView`), el toggle Cinta/Carrete y las piezas de hito de la Cinta
(JumpChips "Saltar a" + chip de PR en el readout). La lente **Historial = solo la
Cinta** (carriles scrubeables + focus-mode + PhaseSummary).

**NO implementar `milestones[]` en backend.** El spec dedicado se borró. `prMarks[]`
sigue en el contrato (no se toca), pero el cliente **ya no lo renderiza**. Si en el
futuro se retoman los hitos, este es el punto de partida (git history del Carrete +
el shape que se barajó: `{ week, date, type, title, sub, isMajor, slug }`).

### C — Sección "Fuerza" del Resumen pide más que `strengthPr` (BLOQUEA Resumen)
La captura 01 muestra **"+9 %"** (índice e1RM vs inicio de ciclo) + chip
**"3 PRs"** + 2 sub-PRs (Banca, Dominadas). `strengthPr` da **un solo** PR +
`deltaKg` — ni el índice global ni el conteo.
**Confirmar:** ¿el "+9 %" llega como un `metrics[].key === "fuerza"` (now = índice)?
¿De dónde sale el conteo "3 PRs" y la lista de sub-PRs? Si es metric, basta con
documentar la key; si no, ampliar `strengthPr` a `{ indexPct, prCount, top: [...] }`.

### D — Tab "Cómo se hace" del ejercicio no está en `ProgressExerciseDetail`
Necesita descripción + pasos numerados + media. El read-model solo trae
`category`/`part`. Es contenido de **librería de ejercicios**
(`docs/training-exercise-library-spec.md`).
**Confirmar:** endpoint fuente (¿`/api/v1/...exercise library...`?) y que el
`slug` case entre Progreso y la librería (mismo identificador).

### E — Resolución del chart en drill-down de Métricas (decisión, no bloqueo)
El expand pide "gráfica de verdad" con línea de objetivo. `metrics[].spark[]` es
mini; `min/max/goal` ya cubren los stats. **Recomendación:** al expandir, fetch a
`/measure/{metric}` (chart de mayor resolución) en vez de inflar `spark`.

### F — Banner "Ciclo · Definición · Sem 3 de 6 · obj 79 kg" es cross-módulo
`setup` solo dice active/inactive/none; la semana X-de-Y y el objetivo son de
**Programas/Hoy** (`programas-module-spec`, slot de Hoy). **No** esperarlo de
progress: reusar el dato ya disponible.

### G — `?period=` / `?metric=` sin declarar (EN MARCHA)
Necesario para: selector de periodo de Resumen/Métricas, `period` de Detalle de
medida, y toggle e1RM↔volumen del ejercicio. Es el fix que backend ya hace.

### H — Formatos de fecha (menor)
`achievedAt`, `curve[].date`, `chart[].date`, `records[].date`, `history[].date`
van como `string` sin `format`. Confirmar `date` vs `date-time`. Relevante por el
`hermes-intl-gap-jest-masks` (formatear en cliente es-ES; verificar en simulador).

---

## 6. Impacto en el native — reemplazar el módulo `progress` legacy

El `src/{domain,application,infrastructure}/progress` actual es **legacy**: hace
fan-out a `/analytics/aggregated`, `/streaks`, `/week-view`, `/trends/*`,
`/exercises/*`, `/sessions/*` y compone a mano. El batch nuevo elimina esa
composición. **Se reemplaza entero**, no se extiende.

| Pieza | Legacy (hoy) | Nuevo (este batch) |
|---|---|---|
| `domain/progress/models/Progress.ts` | ~14 interfaces analytics | 4 read-models (§2) |
| `domain/progress/ports/IProgressPort.ts` | **11 métodos** | **4 métodos** |
| `application/progress/*UseCase.ts` | 11 UCs | 4 UCs |
| `infrastructure/repositories/HttpProgressRepository.ts` | fan-out + mapeo | 4 GET directos (shapes ya cuadran) |
| `presentation/progress/*` | **vacío** | a construir (3 lentes + 2 subpáginas + share) |
| `app/(tabs)/progress.tsx` | `ComingSoonScreen` | render `ProgressScreen` |

**Port nuevo:**
```ts
interface IProgressPort {
  getOverview(period?: ProgressPeriod): Promise<ProgressOverview>;
  getHistory(): Promise<ProgressHistory>;
  getMeasure(metric: string, period?: MeasurePeriod): Promise<ProgressMeasureDetail>;
  getExerciseDetail(slug: string, metric?: "e1rm" | "volumen"): Promise<ProgressExerciseDetail>;
}
```
(los params opcionales quedan listos para cuando aterrice el fix G; hasta
entonces se omiten y backend devuelve su default.)

**4 UCs:** `GetProgressOverviewUseCase`, `GetProgressHistoryUseCase`,
`GetProgressMeasureUseCase`, `GetProgressExerciseDetailUseCase`.

---

## 7. Plan de ejecución

1. **Devolver §5.A–D + confirmar E/F a backend** (un solo round con el fix G).
2. **`contractDrift.test.ts`** que fije los 4 read-models contra el OpenAPI
   (convención `api-spec-convention`).
3. **Reemplazar módulo legacy** domain→application→infra contra los 4 endpoints
   (con `Fixture*Repository` sembrado con los datos del proto: hoy = Mar 2 jun
   2026, peso 82,4 · volumen 32,1 · adherencia 92).
4. **Construir presentation** (UI-first contra fixture, swap a HTTP = 1 línea DI):
   - `ProgressScreen` (shell + segmentado 3 lentes) → `ResumenView` /
     `MetricasView` / `HistorialView` (`CintaView` ⇄ `CarreteView`).
   - Subpáginas: `MeasureDetailScreen`, `ExerciseDetailScreen` (tabs Progreso /
     Cómo se hace — la 2ª contra librería de ejercicios, gap D).
   - Share spike (render cliente, sin endpoint).
   - Estado de vista local: `vx_prog_resumen_order_v2` / `_hidden_v2` (reorden
     Resumen), `vista` cinta/carrete — vía storage efímero del container
     (`crosscutting-via-di-convention`), nunca import directo.
5. Gateo de animaciones (cinta scrub, playhead, glow) por `useReducedMotion`
   (`reanimated` en `useEffect`/worklets, nunca en render body).

---

## 8. Decisiones (cerradas con backend — 2026-06-07)

> Contrato CERRADO. `?period=`/`?metric=`/`?today=` (gap G), `bands.name`+`why`
> (gap A, `why` nullable) y `ProgressExerciseDetail.id` (gap D) **ya están vivos
> en develop**. La fundación native (domain+application+infra+contractDrift) está
> construida y verde. Falta solo presentation.

1. **Card "Fuerza":** opción A — `strengthPr` PR único, **sin** índice global ni
   conteo. Redibujar el hero con el PR. B (`indexPct`/`prCount`/`top[]`) es
   fast-follow si el card se siente flojo. *(resuelto)*
2. **Drill-down de Métricas:** fetch `/measure/{metric}` al expandir (no inflar
   `spark`). *(resuelto)*
3. **Hitos del Carrete:** `prMarks` es PR-only; derivar los `plan` de
   `bands[].isMajor`; los de peso quedan fuera de v1 (no derivables). *(resuelto)*
4. **Narrativa de etapas:** `name` = título de capítulo, `why` = subtítulo
   (si `null`, solo título). Definitivo, sin lenguaje "temporal". *(resuelto)*
5. **Guía de ejercicio:** tab "Cómo se hace" → `GET /api/v1/exercises/{id}`
   usando el `id` del read-model; media `gifUrl` si viene, placeholder si null.
   *(resuelto)*

---

## 9. Swap-in checklist (native, por endpoint)

1. `Http*Repository implements I*Port` → `apiClient.get("/progress…", {…})`,
   mapeo directo (shapes ya cuadran con §2).
2. `infrastructure/di/container.ts`: cambia `Fixture*Repository` por el HTTP;
   borra la fixture.
3. Sin cambios en presentation — screen/hook/keys son agnósticos de fuente.
