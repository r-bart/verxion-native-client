# Handoff — **Progreso** y todas sus subpáginas (verxion-native)

> Estado: **alta fidelidad, final**. Estos archivos son **referencias de diseño en HTML/React
> (Babel in-browser)** — muestran aspecto y comportamiento deseados; **no son código de producción**.
> La tarea es recrearlos en `verxion-native` (Expo SDK 55, React Native, NativeWind v4,
> react-native-reusables, `lucide-react-native`, tokens de `design-tokens.json`).
>
> Calendario congelado del prototipo: **hoy = Martes 2 jun 2026**. Todas las series y fechas
> cuelgan de ahí.

---

## 0 · Principio rector — cliente de SOLO LECTURA

La app nativa es un **visor**. **No se escribe nada desde el cliente** (ni comida, ni peso/agua/
pasos, ni planes, ni ejercicios). **Toda creación/edición la hace el agente vía MCP.** En Progreso
y sus detalles, cualquier superficie que parezca "edición" es:

- **Estado de vista, no dato de dominio** (reordenar/ocultar secciones de Resumen, elegir periodo,
  conmutar cinta↔carrete) → compatible con read-only, persiste en local.
- O un **handoff al agente** ("Pídeselo al agente", "pide una progresión nueva") — **nunca** un
  botón que escribe.
- O **exportar una vista** (Compartir).

No añadir botones de crear / registrar / añadir / editar-dato.

---

## 1 · Mapa de pantallas

| # | Pantalla | Archivo | Cores |
|---|---|---|---|
| **★** | **Progreso (madre)** — shell de 3 lentes | `Verxion Native - Progreso.html` | `progreso-tabs.jsx`, `progreso-historial.jsx`, `progreso-core.jsx`, `progreso-series.jsx` |
| 1 | **Detalle de medida** — al tocar peso/cintura/perímetro/pasos/cardio | `Verxion Native - Detalle de medida.html` | inline + `progreso-series.jsx`, `progreso-core.jsx` |
| 2 | **Detalle de ejercicio** — al tocar un PR / la fuerza | `Verxion Native - Detalle de ejercicio.html` | `ejercicio-core.jsx`, `exercises-data.jsx` |
| 3 | **Compartir** — los 3 momentos nativos de Progreso | `Verxion Native - Compartir triunfo (spike).html` | `share-progreso.jsx`, `share-cards.jsx`, `design-canvas.jsx` |

**Navegación entre ellas** (router `nav.jsx`, helper `vxNav(destino, params)`):
- Resumen/Métricas → `vxNav(VX.MEDIDA, { metric })` · `vxNav(VX.DETALLE, { ejercicio: slug })` ·
  `vxNav(VX.ENTRENO, …)` · `vxNav(VX.NUTRICION, …)`.
- Cinta/Carrete: un hito-PR → `vxNav(VX.DETALLE, { ejercicio: slug })`.
- Detalle de medida: back → `vxNav(VX.PROGRESO, { tab: "metricas" })`.
- Cada pantalla lee sus params de la URL con `vxReadParams([...])` y los Tweaks reflejan el estado.

**En la nevera (no son comportamiento activo):** `Verxion Native - Progreso (exploración héroes).html`
y `Concepto - Versiones (Progreso).md` — el concepto "versiones de ti", que hoy madura como las
**etapas** dentro del Historial.

---

## 2 · Fuente de datos y **cálculo de la FUERZA (e1RM)**

El cliente lee vía API/MCP. **No hay composición corporal (% graso / masa magra) — no usarla.**

**Dominios con dato real o derivable:**
- **Cuerpo:** Peso (báscula, registrado en *Hoy*), Perímetros (Cintura = referencia · Cadera · Brazo).
- **Actividad:** Pasos, Cardio **en tiempo** (min/sem — NO frecuencia cardiaca).
- **Entreno:** Volumen (tonelaje), **Fuerza = índice e1RM**, Sesiones, Adherencia a rutina, PRs.
- **Nutrición:** Adherencia, kcal, Proteína, Días en objetivo.

### 2.1 — Cómo se calcula la fuerza (la lógica que pediste documentar)

La "fuerza" **no se saca de diferenciales de peso bruto entre series** (un `82,5 × 8` y un `85 × 5`
no son comparables en crudo). Se **normaliza cada serie a una 1RM estimada (e1RM)** y se mide el
**% de cambio de ese e1RM**.

**Paso 1 — por serie → e1RM.** Fórmula estándar de **Epley**:

```
e1RM = peso × (1 + reps / 30)
```

> Alternativa equivalente, **Brzycki**: `e1RM = peso × 36 / (37 − reps)`. Elegir una y fijarla.
> El prototipo está sembrado con **Epley** — verificable en `exercises-data.jsx`:
> `82,5 kg × 8 → 104,5` (`e1rmPeak: 104` ✓) · `140 kg × 6 → 168` (`e1rmPeak: 168` ✓).

**Paso 2 — por ejercicio → mejor e1RM.** Se toma el **e1RM tope** (récord) de cada movimiento, y la
**curva** del Detalle de ejercicio es ese e1RM a lo largo de las sesiones. Para lastrados
(dominadas) se suma el peso corporal a la carga antes de estimar.

**Paso 3 — índice de fuerza global → % vs referencia.** El **"Fuerza · +9 %"** del Resumen/Métricas
es la **media de los e1RM de los básicos** (sentadilla, banca, peso muerto, dominada lastrada)
**indexada al inicio del ciclo**:

```
índice = mean( e1RM_actual[lift] / e1RM_inicioCiclo[lift] ) − 1     // +9 % = 9 % más fuerte que al empezar la etapa
```

- El **número grande** usa la **media de los `key` lifts** (representa "fuerza global").
- El **chip de detalle** ("sentadilla") atribuye el mayor salto a un lift ancla.
- El **delta absoluto** ("+8 kg de e1RM en 14 semanas") vive en el Detalle de ejercicio (`e1rmDelta`).

> ⚠️ **El índice de fuerza NO es una de las series continuas** de `VX_PROG_SERIES` (allí están peso,
> perímetros, volumen, adherencias, proteína, pasos, cardio). Hoy es un **valor derivado** que pinta
> el cliente como dato ya cocinado. En producción **lo computa la plataforma/agente** (es justo el
> tipo de métrica que justifica un **endpoint ad-hoc**) y la app **solo lo lee** — coherente con el
> principio read-only.

### 2.2 — Capa de series compartida (`progreso-series.jsx`)

`VX_PROG_SERIES` es el registro de **métricas continuas** que alimenta a la vez **Métricas** (madre) y
**Detalle de medida**. Cada métrica declara: `goodDown` (si bajar es bueno), `goal?`, `unit`, `dec`
(decimales), `color`/`css` (par hex JS + token CSS), `now` (valor de hoy, fijo), y `win` (el **cambio**
hoy−pasado por periodo). De ahí `vxWindow(key, period)` deriva todo lo que la UI necesita:

```
vxWindow(key, period) → { now, first, delta, deltaStr, good, spark, chart, min, max, unit, dec, color, css, goal, goodDown }
```

- Periodos: `VX_PERIOD_DAYS = { semana:7, mes:30, trim:90, sem6:182, ano:365 }`.
- `deltaStr` ya viene formateado es-ES con signo (`−1,2 kg`, `+2,5 cm`) o **"estable"** si el cambio
  redondeado es 0.
- Objetivos definidos: **peso 79 · proteína 180 · pasos 10.000** (kcal media 2.250 en Métricas). Las
  métricas sin `goal` (cintura, cadera, brazo, cardio, adherencias, volumen) **no** pintan línea de
  objetivo y su 4º KPI es **"media"**, no "objetivo".

---

## 3 · Pantalla madre — shell de 3 lentes (`Verxion Native - Progreso.html`)

Una pantalla bajo un **segmentado de 3 pestañas** (`HSelector`, thumb deslizante). **Regla de oro:
una pregunta por lente** — el contenido se elige para responder *esa* pregunta, no para repetir las
mismas métricas tres veces.

| Lente | Pregunta | Forma | Personalizable |
|---|---|---|---|
| **Resumen** | ¿Voy bien? | Pila de secciones por dominio | **Sí** (reordena/oculta) |
| **Métricas** | ¿Qué dicen los datos? | Inventario por dominio | No (pero expandible) |
| **Historial** | ¿De dónde vengo? | Cinta multi-carril / Carrete | No (pero conmutable) |

**Tweaks** (panel del prototipo; reflejan/permiten previsualizar estado):
- `tab`: resumen · metricas · historial
- `vista` (forma del Historial): cinta · carrete
- `dataState`: full · fresh (arranque) · empty (vacío)
- `metric`: métrica activa (para deep-links)

Layout: single-column, full-bleed, gutter 16px, `UPPERCASE` Geist Mono como labels de sección. Cabecera
sticky con título "Progreso" + el segmentado. Tab bar glass flotante (Hoy · Entreno · Nutrición · Progreso).

---

## 4 · Lente 1 · RESUMEN (`progreso-tabs.jsx → ResumenView`)

Respuesta glanceable a *"¿voy bien?"*, **arreglada por el propio usuario**. Cada dominio es una
**sección compacta** con titular + tendencia + micro-veredicto leído del propio dato.

### Decisiones de contenido
- **El peso NO es el héroe forzado.** En recomposición pesar igual puede ser progreso; el peso es
  **una sección más, degradable u ocultable**. La señal honesta de recomp son **perímetros**
  (cintura↓ + brazo↑) y **fuerza sostenida**.
- **Estructura única, no N layouts por objetivo.** Todos ven la misma pila reordenable; sólo cambia
  el orden/visibilidad que el usuario elige.

### Secciones disponibles (orden por defecto)
1. **perimetros** — `Cintura 81,5 cm` · −2,5 cm · sub "cadera 98,5 (−1,2)" · "brazo 39,2 (+0,4)" · `--vx-neutral`. Veredicto: "Cintura abajo, brazo arriba — tu mejor señal de recomposición".
2. **fuerza** — caption `e1RM · vs inicio de ciclo` · `+9 %` · chip "3 PRs" · sub "Banca 82,5 × 8", "Dominadas +20 × 7" · `--vx-lava`. → Entreno/sesiones.
3. **peso** — `82,4 kg` · −1,2 kg · sub "obj 79 · faltan 3,4 kg" · `--vx-body`. → Detalle de medida (peso).
4. **nutricion** — `92 %` adherencia · +2 % · sub "2.265 / 2.250 kcal" · `--vx-up`. → Nutrición/diario.
5. **cardio** — `95 min/sem` · +20 min · sub "3 sesiones/sem · 410 min en el ciclo" · `--vx-health`.
6. **pasos** *(oculto por defecto)* — `8.214` · `--vx-neutral`. → Detalle de medida (pasos).

> `R_HIDDEN_DEFAULT = ["pasos"]`. Cada sección: tarjeta glass (radius ~18, padding 15) con bubble
> 36px de color de dominio + label (Geist Sans 14/600) + micro-veredicto (Geist Mono ~10.5, opacity .5)
> + valor grande (Geist Sans ~27/700, `letter-spacing:-0.04em`, color de dominio) + chip de delta
> (verde `--vx-up` si la dirección es buena) + mini-sparkline (`MiniSpark`, ≤132px) + sub-chips.

### Modo Editar (reordenar/ocultar) — estado de vista
- Cabecera de la lista: label izq + botón **"Editar"/"Listo"** (lava) a la dcha.
- Al editar, la pila colapsa a **filas uniformes** `.t-erow` (estilo "Editar" de iOS):
  `[handle ⠿] [bubble 28px] [label] … [toggle ojo/ojo-tachado]`.
  - **Arrastrar el handle** reordena en vivo (pointer events; cruza el punto medio de cada fila; la
    fila activa se eleva con `.is-dragging`).
  - **Toggle del ojo** muestra/oculta la sección (la oculta del default es **"Pasos"**).
  - Botón **"Restablecer orden"** vuelve al default.
- **Persistencia local:** `vx_prog_resumen_order_v2` (array de ids) + `vx_prog_resumen_hidden_v2`
  (array de ids ocultos); al cargar se fusiona con el catálogo para tolerar ids nuevos.
- Estado: `order: string[]`, `hidden: Set<string>`, `editing: bool`, `dragId: string|null`.

---

## 5 · Lente 2 · MÉTRICAS (`progreso-tabs.jsx → MetricasView`)

El **inventario completo**, agrupado por dominio, browsable. Único sitio donde inspeccionas
**cualquier** métrica a fondo sin cambiar de dominio. Crece según se añaden endpoints.

**Grupos** (`T_GROUPS`):
- **Cuerpo** (nota "siempre"): Peso · Cintura · Cadera · Brazo.
- **Entrenamiento** (→ Entreno/sesiones): Volumen · Fuerza · e1RM · Sesiones · Adher. rutina.
- **Nutrición** (→ Nutrición/diario): Adherencia · kcal media · Proteína · Días cumplidos.
- **Actividad** (nota "independiente"): Pasos · Racha activa · Cardio.

Cabecera de grupo: label (Geist Sans 12/600) + chip de nota + "ver detalle ›" opcional (lava). Grid
2-col de `.t-mcard`: bubble 30px + (delta o tag) + caret ⌄ + valor (~21/700) + label + mini-sparkline.

**Drill-down en sitio:** cada tarjeta es un **botón tap-para-expandir** (borde lava + fondo lava 6 %
+ caret 180°). **Bajo el grupo** aparece `.t-mexp`: cabecera (bubble + label + valor grande + delta),
**gráfica de verdad** (`MExpChart` — área + línea + **línea de objetivo** punteada verde cuando aplica)
y stats `máx · mín · objetivo`/`periodo`. **Una abierta a la vez** (`exp: "grupo/label" | null`).

---

## 6 · Lente 3 · HISTORIAL (`progreso-historial.jsx`) — *detallado*

*"El progreso en forma de tiempo."* Dos formas conmutables en pantalla (`HVistaToggle`, también Tweak
`vista`): **La cinta** (default) y **El carrete**. Eje temporal común: **30 semanas** (`H_N`), muestreo
semanal, terminando en hoy (Mar 2 jun 2026). Anclados los extremos a los valores canónicos del resto
de la app (peso 82,4 · volumen 32,1 · adherencia 92).

### 6.0 — Datos del histórico (compartidos por cinta y carrete)

**Tres dominios** (`H_METRICS`), cada uno con su serie de 30 puntos:

| Clave | Label | Serie | Unidad | Color | `goodDown` | Verbo entonces / hoy |
|---|---|---|---|---|---|---|
| `peso` | Peso | `H_PESO` | kg | `--vx-body` | sí | Pesabas / Pesas |
| `volumen` | Volumen | `H_VOL` | t | `--vx-lava` | no | Movías / Mueves |
| `adherencia` | Adherencia | `H_ADH` | % | `--vx-up` | no | Cumplías / Cumples |

> El peso sube en volumen y baja en corte; volumen sube de forma sostenida; adherencia oscila alta.
> Cada serie lleva un par `color:"#hex"` + `cssColor:"var(--vx-…)"` — **intencional**: el hex es para
> el contexto JS (gradientes/strokes computados) donde `var()` no siempre resuelve; el token es para
> CSS. No "arreglar" a un solo valor.

**Etapas / proto-versiones** (`H_PHASES`) — el agente reescribió el plan en la semana **18** (`H_SWITCH`):

| Etapa | Rango | Color | `name` (el alma) | `why` (la intención) |
|---|---|---|---|---|
| **Volumen** | sem 0–18 | `--vx-neutral` | *Fuerza de invierno* | Construir base de músculo y fuerza antes de definir. |
| **Definición** | sem 18–29 | `--vx-lava` | *Verano ligero y fuerte* | Bajar grasa sin ceder la fuerza ganada. |

> `name` = el handle que le cuentas a un amigo; `why` = la intención que relees cuando flaqueas. Es la
> **semilla del concepto "versiones de ti"** (ver `Concepto - Versiones (Progreso).md`).

**Hitos clavados** (`H_MILESTONES`, curados, cross-dominio). Tipos (`H_MTYPE`): `pr` (trofeo, amber) ·
`plan` (etiqueta, lava) · `peso` (báscula, cyan):

| Semana | Tipo | Título | Sub | Enlace |
|---|---|---|---|---|
| 2 | plan | Empezó tu bloque de volumen | el agente armó tu rutina PPL | — |
| 8 | pr | PR · Sentadilla 130 kg | 5 reps · RIR 2 | sentadilla |
| 13 | peso | Cruzaste los 83 kg | subiendo masa (↑) | — |
| **18** | plan | **Nuevo ciclo · Definición** `major` | 2.250 kcal · PPL 6 días | — |
| 22 | pr | PR · Dominadas +20 kg | 7 reps · fuerza relativa | dominadas-lastradas |
| 26 | peso | Cruzaste los 83 kg | ahora bajando grasa (↓) | — |
| 28 | pr | PR · Sentadilla 140 kg | 6 reps · +10 kg en el ciclo | sentadilla |
| 29 | pr | PR · Press banca 82,5 kg | 8 reps · hace 2 días | press-banca |

El hito de la semana 18 es **`major`** (cambio de etapa): se pinta con anillo extra en la cinta y badge
**"nueva etapa"** en el carrete.

---

### 6.A — LA CINTA (`CintaView`)

**Desagrega los 3 dominios sobre un eje de tiempo común y los hace scrubeables a la vez.** Dos modos
internos: **overview** (default, multi-carril) y **foco** (un dominio ampliado).

#### Overview (multi-carril) — lo que ves al entrar
Composición, de arriba a abajo:

1. **`ReadoutAll`** — la tarjeta-lectura **cross-dominio**. Eyebrow **"TU YO DE HOY"** (o **"TU YO DE
   ENTONCES"** si el scrub no está en el extremo) + fecha. Debajo, los **3 dominios a la vez** en el
   instante del scrub: label en color + valor + (si no es hoy) delta **vs hoy** (verde/rojo según
   `goodDown`). Cierra con chip de **etapa** y, si el scrub cae en un hito, chip del **hito**.
2. **`Lanes`** → tres **`Lane`** apilados (Peso · Volumen · Adherencia). Cada carril: cabecera
   (nombre en color + valor en el punto del scrub + botón **⤢ enfocar**) y **mini-curva SVG 56px** con
   tinte de etapa de fondo + línea punteada del cambio de fase (sem 18). **Un único playhead blanco
   compartido** cruza los tres a la vez.
3. **Hint** ("Arrastra para viajar · amplía un dominio para verlo en grande").
4. **`JumpChips`** — "Saltar a": un chip por hito (icono de tipo + fecha); al pulsar, `setScrub(ms.i)`.
5. **`PhaseSummary`** — la etapa donde cae el scrub: chip de etapa + rango de fechas + `name` + `why`
   + 3 stats (**Δ peso en la etapa · nº hitos · duración en semanas**).
6. **`ShareCTA`** — "Comparte tu progreso" → spike con `variante: "ciclo"`.

**Scrub (interacción):** `onPointerDown`/`onPointerMove` sobre `.h-lanes` capturan el puntero;
`idxFromClient(x)` = `round( clamp((x − left)/width, 0, 1) × (H_N−1) )`. Arrastrar mueve el índice
`scrub` (0…29), compartido por los 3 carriles y el readout. Estado inicial: `scrub = H_N−1` (hoy).

#### Modo foco (un dominio ampliado)
Tap en **⤢** de un carril (`onFocus(metricKey)`; `stopPropagation` para no scrubear). Cambia a:

1. Botón **"‹ Todos los dominios"** (vuelve al overview, `setFocus(null)`).
2. **`Readout`** individual del dominio: "TU YO DE HOY/ENTONCES" + verbo (`Pesabas`/`Pesas`…) + valor
   grande en color + (si no es hoy) "hoy {valor} · ±diff" con flecha. Chips de etapa + hito.
3. **`Ribbon`** — la cinta **grande** (1000×150): área con gradiente + línea con glow, **bandas de
   etapa** de fondo, línea de cambio de fase, **hitos clavados** (círculo en la curva + tallo hasta la
   base; el `major` con anillo; **tap en un hito** lo selecciona), **playhead blanco** con punto en la
   curva, y eje de meses en HTML (posiciones `[0,6,12,18,24,29]`). Mismo gesto de scrub que el overview.
4. **Hint**, **`JumpChips`**, **`PhaseSummary`** (igual que overview).

> El scrub **se conserva** al entrar/salir de foco (estado en `CintaView`). `focus = null | clave`.

---

### 6.B — EL CARRETE (`CarreteView`)

**Espina vertical de hitos, agrupada por ETAPA** (capítulos). Los hitos se listan **recientes arriba**
(`H_MILESTONES` invertido); al cambiar de fase se intercala una **cabecera de capítulo**.

- **Capítulo `.h-chapter`** (uno por etapa): chip de etapa (color + tinte) + **rango de fechas**
  (`inicio – hoy` si es la actual) + **`name`** (Geist Sans) + **`why`**. Es el marco narrativo —
  el concepto "versiones" hecho visible.
- **Fila de hito `.h-rrow`**: raíl izquierdo con **nodo** (bubble de color/icono del tipo) y, a la
  derecha, una **tarjeta tap-para-expandir** `.h-rrow__card`:
  - Cabecera: **título** (sin el prefijo "PR · ") + badge **"nueva etapa"** si es `major`.
  - Línea: `fecha · etapa {label}`.
  - Sub: el `sub` del hito.
  - **Caret ⌄** (rota al abrir).
- **Expansión `.h-rexp`** (`ReelExpand`): eyebrow **"Tu yo de {fecha}"** + **snapshot de los 3
  dominios** en ese punto (peso/volumen/adherencia) y, **si el hito es un PR con `slug`**, botón
  **"ver ejercicio ›"** → `vxNav(VX.DETALLE, { ejercicio: slug })`.
- Cierra con **`ShareCTA`**.

> La fila `major` (sem 18 · "Nuevo ciclo · Definición") lleva `.is-major` (acento + anillo en el nodo)
> y el badge "nueva etapa" — es el pivote entre los dos capítulos.

---

## 7 · Subpágina · DETALLE DE MEDIDA (`Verxion Native - Detalle de medida.html`)

La historia completa de **una** medida. Se abre al tocar peso/perímetro/pasos/cardio en
Resumen o Métricas. **6 métricas** (`MD`): peso · cintura · cadera · brazo · pasos · cardio. Lee de
`VX_PROG_SERIES` vía `vxWindow`. Params/Tweaks: `metric` (cuál) + `period` (**Mes / 3 m / Año**).

Composición (de arriba a abajo):
1. **Chrome** — back (`‹` → `VX.PROGRESO {tab:"metricas"}`) + título de la medida.
2. **Hero** — bubble de color de dominio + nombre + subtítulo ("Perímetro · cintura", etc.).
3. **Tarjeta de gráfica** `.m-chartcard`: valor grande **"Hoy"** en color (+ "· faltan X" si hay goal)
   + **`Delta`** del periodo + **`PeriodPicker`**; y la **gráfica `MChart`** (área + línea + último
   punto destacado con halo). Si la métrica tiene `goal`: **línea de objetivo punteada verde**
   (`var(--vx-up)`, `strokeOpacity .55`) con etiqueta **"obj {valor}"** anclada al borde derecho
   (dentro del viewBox — ojo al `padR`, ya corregido). Eje x: **inicio · mitad · hoy**.
4. **KPI strip** (4): **cambio · máx · mín · objetivo** — y si no hay goal, el 4º es **"media"**
   (`(máx+mín)/2`).
5. **Registros** — muestreo **semanal**, **últimas 8 semanas**, recientes arriba: fecha ("Hoy" la
   primera) + barra proporcional + valor + **delta vs la semana previa** (verde/rojo según `goodDown`,
   **"="** si el cambio redondeado es 0).
6. **Nota read-only** — "Solo lectura. Tus medidas las registra verxion — pídeselo al agente para
   anotar una nueva." (con candado).

---

## 8 · Subpágina · DETALLE DE EJERCICIO (`Verxion Native - Detalle de ejercicio.html`)

La recompensa del modelo read-only-first: **toda la historia de un movimiento**. `buildEjercicio(t)`
lee del **catálogo único** `exercises-data.jsx` (`vxExerciseBySlug`). Params/Tweaks: `ejercicio`
(slug, default `press-banca`), `metrica` (**e1rm | volumen**), `tab` (**progreso | guia**).

- **Hero** (`XHero`): bubble de color de la parte (push/pull/legs/core) + nombre + tags
  (**target** · **equip**) + categoría ("Compuesto · Pecho").
- **KPI strip** (`XKpis`): **PR carga** (con trofeo) · **e1RM** · **Mejor vol** · **Registros**.
- **Tabs** (`XTabs`): **Progreso** / **Cómo se hace**.

**Tab Progreso:**
- Toggle de métrica **e1RM ↔ volumen**. Valor grande = récord (e1RM o mejor volumen) + `e1rmDelta`/
  `volDelta` ("+8 kg", "+0,6 t").
- **`ExChart`**: área + línea, **último punto destacado** con su valor, grid suave, etiquetas x por
  sesión (s1…s5). La curva e1RM se sintetiza (`vxSynth`) desde `e1rmPeak`/`volPeak` del spec.
- **Historial** (`XHistRow`): por sesión → fecha + **serie tope** ("82,5 kg × 8") + badge **PR** +
  meta ("RIR 2 · vol 3,6") + valor de la métrica activa + **delta %** vs la sesión previa.
- **Músculos** (`XMuscles`): barras por músculo con rol (Principal/Secundario/Estabilizador).
- **Nota del agente** (`XAgentNote`, "verxion · lectura") + **handoff de edición** (`XAgentEdit`,
  "Pídeselo al agente — métela en tu rutina, cámbiala o pide una progresión nueva"). **No escribe.**
- **Estado vacío** (`XEmptyProgress`) si el ejercicio tiene `logs === 0`: "Aún sin registros…".

**Tab Cómo se hace:**
- **`XAnim`** — placeholder de medios (animación/demostración; en producción, vídeo o lottie).
- **`XDesc`** — chips (categoría · grupo · equip · **Personalizado** si `custom`) + descripción.
- **`XSteps`** — pasos numerados de ejecución.

---

## 9 · Subpágina · COMPARTIR (`Verxion Native - Compartir triunfo (spike).html`)

Tres momentos **nativos de Progreso**, cada uno en las direcciones visuales del sistema
(**Glass / Lava / Terminal** + **Máscara** knockout para el hero). Story 9:16. **Solo lectura** —
es exportar una vista. `share-progreso.jsx`:

1. **Cierre de etapa · "tu nueva verxion"** (`variant:"ciclo"`) — buque insignia. Badge de versión +
   el *why* + tabla cross-dominio **antes→ahora** (peso/cintura/volumen/fuerza) + hitos del ciclo.
2. **Antes vs ahora · trayectoria** (`variant:"trayectoria"`) — la transformación cross-dominio.
3. **Un punto en el tiempo** (`variant:"momento"`) — "Tu yo de {fecha}" (el `Readout` del scrub hecho
   asset).

> El `ShareCTA` de la cinta/carrete y de Resumen navega aquí con `variante:"ciclo"`.
> Requiere `design-canvas.jsx` en la raíz (es el lienzo del spike).

---

## 10 · Estados (las 3 lentes)

`dataState` (Tweak / param): **full** (todo lo anterior) · **fresh** (arranque) · **empty** (vacío).

- **empty** (`ProgEmpty`) — primer arranque, **sin segmentado**: isotipo + "Tu trayectoria empieza
  aquí" + 3 pasos (1: pídele un objetivo al agente · 2: registra peso/medidas en *Hoy* · 3: vuelve) +
  **prompt de ejemplo al agente** ("› Fíjame un objetivo de definición a 79 kg en 8 semanas").
  Read-only: **no hay botón de crear**, la acción la hace el agente.
- **fresh** (`FreshBanner` arriba de cada lente) — "Llevas pocos días · verxion necesita ~2 semanas de
  registros para leer tendencias con confianza". En Historial, en vez de cinta/carrete, **`HistorialSoon`**:
  "Tu historia se está escribiendo".
- **full** — comportamiento completo descrito arriba.

---

## 11 · Design tokens (anclados a `assets/colors_and_type.css`)

- **Acento lava** `--vx-lava` #FF6262 (+ `-hover`/`-press`/`-bg`). Único acento de marca.
- **Semánticos de dominio:** body/cyan `--vx-body` #00D2FF · neutral/amber `--vx-neutral` #FFB900 ·
  health/red `--vx-health` #FF4757 (cardio) · **al-alza/verde** `--vx-up` #5FE39A (+ `--vx-up-2`
  #2ECC71, `--vx-up-tint`, `--vx-up-line`) = semántico de "adelantado / al alza / en objetivo / hecho"
  en toda la app. `--good` es alias local de `--vx-up`.
- **Insight/morado** `--vx-insight` #9B59B6 (= `rgba(155,89,182,…)`). En Progreso solo persiste en
  blooms/acento de detalle; **no usar el viejo `168,85,247`**.
- **Superficies:** screen #000 · app-bg #0A0A0A · card #1C1C1E. Glass local: `--glass-fill
  rgba(255,255,255,.06)`, `--glass-stroke rgba(255,255,255,.12)`, `--glass-hi` (inset hairline).
- **Tipografía:** Geist Sans (UI, headlines, numerales grandes, `letter-spacing` −0.02…−0.05em) ·
  Geist Mono (body + labels `UPPERCASE` con tracking 0.06–0.12em).
- **Radios:** tarjetas 16–18 · hero/sheets 22–26 · inputs 14 · pills 9999. **Motion:** 140–220ms,
  `cubic-bezier(0.2,0.8,0.2,1)`, sin bounce; animaciones gateadas por `prefers-reduced-motion`.
- **Color en charts:** SVG `stroke`/`stopColor` usan **token** (`var(--vx-…)`) salvo el par hex JS del
  histórico (§6.0). La **línea de objetivo** verde = `var(--vx-up)` + `strokeOpacity` (sin literal
  `rgba(95,227,154,…)`).
- Iconos: `lucide-react-native` (en el prototipo, SVG inline estilo Lucide, stroke 2, `currentColor`).
  **Sin fotos, sin ilustraciones, sin emoji.**

---

## 12 · Contratos de datos / endpoints (resumen para backend)

| Dato | Forma | Notas |
|---|---|---|
| Métricas continuas | serie temporal por `{ key, goodDown, goal?, unit, dec }` + valor `now` | peso, perímetros, volumen, adherencias, proteína, pasos, cardio. Ventanas: 7/30/90/182/365 d. |
| **Índice de fuerza (e1RM)** | **derivado** — `mean(e1RM_actual/e1RM_inicioCiclo)−1` sobre básicos | **endpoint ad-hoc.** e1RM por serie = Epley `peso×(1+reps/30)`. Lo computa la plataforma; la app **solo lee**. |
| e1RM por ejercicio | curva por sesión + récord + `e1rmDelta` | catálogo de ejercicios (`vxExerciseBySlug`). |
| Etapas (fases) | `{ from, to, label, name, why }` | proto-versiones; el agente las define al reescribir el plan. |
| Hitos | `{ semana, tipo(pr|plan|peso), título, sub, slug? }` | curados, cross-dominio. |
| Estado de vista (Resumen) | `order[]` + `hidden[]` en local | **no es dato de dominio**; persistencia cliente. |

---

## 13 · Archivos

**Madre:**
- `Verxion Native - Progreso.html` — shell de 3 lentes + Tweaks + router. **Entrada.**
- `progreso-tabs.jsx` — `ResumenView` (secciones reordenables) + `MetricasView` (drill-down).
- `progreso-historial.jsx` — `CintaView` + `CarreteView` + datos del histórico (`H_*`).
- `progreso-core.jsx` — piezas compartidas (`PIcon`, `PBubble`, `Delta`, `PeriodPicker`, charts, tab bar).
- `progreso-series.jsx` — `VX_PROG_SERIES` + `vxWindow` + periodos (compartido con Detalle de medida).
- `progreso-components.css` — CSS de las piezas de core.

**Subpáginas:**
- `Verxion Native - Detalle de medida.html` — inline + `progreso-series/core`.
- `Verxion Native - Detalle de ejercicio.html` + `ejercicio-core.jsx` + `exercises-data.jsx`.
- `Verxion Native - Compartir triunfo (spike).html` + `share-progreso.jsx` + `share-cards.jsx` + `design-canvas.jsx`.

**Infra del prototipo:** `icons.jsx`, `nav.jsx`, `ios-frame.jsx`, `tweaks-panel.jsx`,
`assets/colors_and_type.css`. **Contexto:** `Concepto - Versiones (Progreso).md`.

> Los prototipos cargan los `.jsx` vía `<script type="text/babel" src=...>`; cada archivo exporta sus
> componentes a `window` al final (scope no compartido entre scripts Babel). React 18 + Babel standalone
> dentro de `ios-frame.jsx`.
