# Handoff: Entreno (verxion-native)

## Overview

**Entreno** es el eje de entrenamiento de la app nativa *verxion* (visor iOS, dark, acento lava `#FF6262`). Cubre todo el ciclo de fuerza del usuario: su **rutina activa** y biblioteca de rutinas, el **plan de cada día**, el **arranque y registro de la sesión**, el **historial de sesiones** completadas y el **detalle por ejercicio**.

Principio rector del producto (CRÍTICO): **la app nativa es un cliente de SOLO LECTURA**. No se loguea ni se escribe nada desde este cliente. Toda creación/edición (rutinas, días, ejercicios, registros de sesión) la hace el **agente verxion vía MCP**. En la UI, cualquier superficie de "edición" se enmarca como una **petición al agente** ("Pídeselo al agente", "Cambia este día con el agente", "Corrige con el agente") que **navega a la pantalla del Agente**, nunca como un botón que escribe. La única excepción son tres micro-escrituras fuera de Entreno (peso/agua/pasos), que no aplican aquí.

## About the design files

Los archivos de este bundle son **referencias de diseño construidas en HTML/React (JSX vía Babel en el navegador)** — prototipos que muestran el aspecto y el comportamiento buscados, **no código de producción para copiar tal cual**. La tarea es **recrear estos diseños en el entorno real del codebase** (`verxion-native`: Expo SDK 55, React Native, NativeWind v4, react-native-reusables, `lucide-react-native`) usando sus patrones y librerías. Donde el prototipo usa CSS web (glass con `backdrop-filter`, gradientes radiales, `position: sticky`), tradúcelo al equivalente nativo (BlurView, gradientes, headers nativos).

## Fidelity

**Alta fidelidad (hifi).** Colores, tipografías, espaciados, radios, estados y microinteracciones son finales y están tomados del design system de verxion. Recréalos pixel-perfect con la librería de componentes del codebase. Las medidas y tokens de abajo son los valores reales.

> Nota sobre las capturas: se generaron con un capturador DOM que a veces **no pinta el interior de las tarjetas "glass"** (cabeceras con `backdrop-filter`) — se ven huecos. Es un artefacto del capturador, **no del diseño**; en navegador real todo se renderiza. Para ver el estado real, abre los `.html` directamente.

---

## Arquitectura de navegación

La app es un visor de pantallas; cada pantalla es un archivo HTML propio. La navegación se hace con `vxNav(file, params)` (ver `nav.jsx`), que hace `location.href` con query params que fijan el estado de llegada (`vxReadParams`). En el codebase real esto se mapea a un **stack navigator** (las pantallas de detalle se *pushean*; la tab bar es la chrome persistente).

**Rutas (de `nav.jsx`) relevantes a Entreno:**

| Constante | Archivo | Rol |
|---|---|---|
| `ENTRENO` | Verxion Native - Entreno.html | Landing con 3 segmentos |
| `RUTINAS` | Verxion Native - Rutinas.html | Todas las rutinas (biblioteca) |
| `RUTINA` | Verxion Native - Detalle de rutina.html | Detalle de una rutina |
| `DIA` | Verxion Native - Detalle de día de entreno.html | Detalle de un día (solo lectura) |
| `PRESCRIPCION` | Verxion Native - Prescripción del día.html | La sesión de HOY (con "Empezar") |
| `SESION` | Verxion Native - Sesión en marcha.html | Sesión en vivo |
| `SESION_DET` | Verxion Native - Detalle de sesión.html | Informe de una sesión completada |
| `SESIONES` | Verxion Native - Historial de sesiones.html | Log completo de sesiones |
| `DETALLE` | Verxion Native - Detalle de ejercicio.html | Detalle de un ejercicio |
| `AGENTE` | Verxion Native - Agente.html | Chat del agente (destino de toda "edición") |

**Grafo de navegación (Entreno):**

```
TabBar: Hoy · [Entreno] · Nutrición · Progreso

Entreno (landing)
├─ Cabecera: botón "biblioteca" (icono capas, arriba dcha) ──────────────► RUTINAS
├─ Segmento RUTINA
│   ├─ Tarjeta rutina activa (toda la tarjeta) ─────────────────────────► RUTINA (rutina=ppl-hipertrofia)
│   ├─ Próxima sesión (botón play) ─────────────────────────────────────► PRESCRIPCION (dia=<tipo>)
│   │     · si hay sesión en vivo: LiveSession / banner ─────────────────► SESION (estado=activa|pausada)
│   └─ Espina semanal (días):
│         · día "hoy" (now) ────────────────────────────────────────────► PRESCRIPCION (dia=<tipo>)
│         · día "en marcha" (live) ─────────────────────────────────────► SESION
│         · días hechos / futuros ──────────────────────────────────────► DIA (rutina, dia=<idx>)  [solo lectura]
├─ Segmento SESIONES
│   ├─ Filas de historial reciente ─────────────────────────────────────► SESION_DET (sesion=<slug>)
│   └─ "Ver todo" ───────────────────────────────────────────────────────► SESIONES
└─ Segmento EJERCICIOS
    └─ Filas de ejercicio ──────────────────────────────────────────────► DETALLE (ejercicio=<slug>)   [origen=ejercicios]

RUTINAS (lista)
└─ Tarjeta/fila de rutina ──────────────────────────────────────────────► RUTINA (rutina=<slug>)

RUTINA (detalle)
├─ Tarjetas de día:
│     · día "hoy" ──────────────────────────────────────────────────────► PRESCRIPCION (dia=<tipo>)
│     · resto de días ──────────────────────────────────────────────────► DIA (rutina, dia=<idx>)
├─ "Sesiones de este bloque" ───────────────────────────────────────────► SESIONES (rutina=<slug>)
├─ "Ajustar/activar… con el agente" ────────────────────────────────────► AGENTE (caso=inicio)
└─ Back ────────────────────────────────────────────────────────────────► RUTINAS

DIA (detalle, solo lectura)
├─ Tarjetas de ejercicio ───────────────────────────────────────────────► DETALLE (ejercicio, origen=dia, rutina, dia)
├─ "Cambia este día con el agente" ─────────────────────────────────────► AGENTE (caso=inicio)
└─ Back ────────────────────────────────────────────────────────────────► RUTINA (rutina=<slug>)

SESION_DET (detalle de sesión)
├─ Filas de ejercicio (desglose) ───────────────────────────────────────► DETALLE (ejercicio, origen=sesion, sesion=<slug>)
├─ "Corrige con el agente" ─────────────────────────────────────────────► AGENTE (caso=inicio)
└─ Back ────────────────────────────────────────────────────────────────► ENTRENO (segment=sesiones)

SESIONES (historial)
├─ Filas de sesión ─────────────────────────────────────────────────────► SESION_DET (sesion=<slug>)
└─ Back ────────────────────────────────────────────────────────────────► ENTRENO (segment=sesiones)

DETALLE (ejercicio)
└─ Back contextual (lee `origen`):  origen=dia → DIA · origen=sesion → SESION_DET · resto → ENTRENO (segment=ejercicios)

PRESCRIPCION (sesión de hoy)
├─ "Empezar sesión" ────────────────────────────────────────────────────► SESION (estado=activa)
├─ "Ajustar plan con el agente" ────────────────────────────────────────► AGENTE (caso=inicio)
└─ Back ────────────────────────────────────────────────────────────────► ENTRENO (segment=rutina)
```

**Patrón de "back contextual" (importante):** el detalle de ejercicio se abre desde 3 sitios. Al navegar se pasa `origen` + el contexto mínimo (`rutina`/`dia` ó `sesion`); el botón Volver lo resuelve para regresar al origen exacto. Reprodúcelo con el back nativo del stack (que ya preserva el origen) — el `origen` es la solución web a que cada pantalla se carga "fresca".

---

## Pantallas

> Convención común a todas: fondo `#0a0a0c` con blooms radiales lava/cian/morado muy difuminados; contenido en columna única, gutter 16px; tarjetas "glass" (ver tokens). Las pantallas de detalle llevan **chrome superior** (botón atrás circular glass + título centrado + a veces botón "···"/spacer) `position: sticky`. La tab bar (glass, flotante, radio 32px) solo aparece en el landing.

### 1. Entreno — landing  ·  `Verxion Native - Entreno.html`  ·  `entreno-core.jsx`
**Propósito:** centro del eje. Cabecera "Entreno" (Geist Sans 700, 30px, `-0.035em`) + **botón biblioteca** (40×40 glass, icono "capas", arriba dcha → RUTINAS). Debajo, un **selector segmentado** (pill, 3 opciones: Rutina · Sesiones · Ejercicios) con thumb deslizante (transición `left/width .22s`).

- **Segmento RUTINA** (cockpit del día):
  - *Hero de rutina activa* (tarjeta glass, radio 24px, tappable→RUTINA): eyebrow "RUTINA ACTIVA" (mono 10px, tracking `.12em`, lava) + chevron; nombre (Sans 700, 25px); chip de objetivo (`Hipertrofia`, lava sobre `--vx-lava-bg`); divisor; **bloque de semana**: "Semana **3** de 6" + chip de estado **sin número** ("Vas adelantado" verde / "En objetivo" ámbar / "Vas justo" rojo) + barra de 6 celdas (semanas hechas en lava; la semana en curso **parcialmente rellena** según el día de la semana — ver más abajo).
  - *Próxima sesión* (tarjeta lava translúcida): bubble con icono del tipo de día, eyebrow "HOY TOCA", título "Legs A · Cuádriceps y core", subinfo "7 ejercicios · 23 series · ~65 min", botón play (44px, lava, glow) → PRESCRIPCION. Variante **descanso** (morado) y variante **sesión en vivo** (timer corriendo, "Continuar/Pausar").
  - *Nota del agente* (opcional, toggle): tarjeta lava translúcida con isotipo + mensaje.
  - *Espina semanal* ("La semana · tu rotación"): timeline vertical de 7 días; cada fila = nodo (hecho=lava con check; hoy=anillo lava pulsante; futuro=gris) + tarjeta con nombre del día, chip de tipo (Push/Pull/Legs/Descanso) y "N ejercicios". Días tappables (ver grafo).
  - Estados: **fresh** (rutina recién creada, semana 1) y **empty** (sin rutina → invitación con prompt que navega al agente).
- **Segmento SESIONES:** fila resumen de 3 stats (sesiones · volumen de bloque · +% vs semana previa) + "Historial reciente" con enlace **"Ver todo"** → SESIONES. Lista de 6 filas (fecha, bubble de tipo, nombre + chip PR, barra de volumen, volumen en t + delta%), tappables → SESION_DET.
- **Segmento EJERCICIOS:** biblioteca con **buscador** + **Filtros** (hoja inferior: grupo muscular, equipamiento, tipo, estado) + **orden** (hoja) + chips activos removibles. Lista de ejercicios (bubble, nombre, músculo·equipo, PR/registros/"sin registrar"), tappables → DETALLE.

Capturas: `01-entreno-rutina.png`, `01-02-entreno.png` (sesiones), `02-02-entreno.png` (ejercicios).

### 2. Todas las rutinas  ·  `Verxion Native - Rutinas.html`  ·  `rutinas-core.jsx`
**Propósito:** biblioteca de rutinas que ha armado el agente. Chrome (atrás→ENTRENO·rutina, título "Rutinas", spacer). Lead "N rutinas". **Buscador** (nombre/objetivo/split) + **Filtros** (hoja: Estado = Activa/Completada · Objetivo) + **orden** (hoja: Más reciente/Alfabético/Adherencia).
- **Modo navegar** (sin filtros): agrupado por estado — "En curso" (tarjeta grande de la activa) y "Archivo · completadas" (filas compactas). La tarjeta grande: eyebrow de estado, días/sem, nombre, chip de objetivo, "Semana X de Y" + chip de estado, barra de semanas (con relleno parcial de la semana en curso), "14/36 sesiones · 39% adherencia · +8% vol". Filas de archivo: bubble, nombre, objetivo·fecha fin, `44/48` (sesiones hechas/planeadas), chevron.
- **Modo resultados** (con búsqueda/filtro): lista plana de tarjetas + contador "N resultados · de M" o estado vacío "Sin resultados".
- Pie: superficie "Pídele a verxion una rutina nueva" (dashed) → AGENTE.

Captura: `03-todas-las-rutinas.png`.

### 3. Detalle de rutina  ·  `Verxion Native - Detalle de rutina.html`  ·  `rutina-detalle-core.jsx`
**Propósito:** metadatos del bloque + su rotación de días. Chrome (atrás→RUTINAS, título = nombre, "···"). 
- *Hero*: eyebrow de estado (activa con punto lava / completada), contexto (última fecha / "Finalizada · …"), bubble + nombre (Sans 700, 26px) + chip de objetivo. Fila de **4 stats** (días/sem · semanas · adherencia% · volumen) separados por hairlines. **Bloque de progreso**: "Semana 3 de 6" + chip de estado (palabra) + barra de semanas (relleno parcial de la en curso) + "14 de 36 sesiones · +8% volumen". (Para completada: "Completada", todas las celdas llenas, sin chip de estado.)
- *Rotación* ("La rotación · N días de entreno · 1 descanso"): lista de tarjetas de día. Cada una: nodo de tipo (hecho=check; hoy=resaltado), día de la semana, nombre, chip de tipo, badge "hoy", foco, meta "N ejercicios · N series · ~X min", chevron. Días de descanso no tappables. Hoy→PRESCRIPCION; resto→DIA.
- *"Sesiones de este bloque"* (fila glass, contador = sesiones hechas) → SESIONES filtrado por `rutina`.
- *"Ajustar/activar… con el agente"* (dashed) → AGENTE.

Captura: `04-detalle-de-rutina.png`.

### 4. Detalle de día de entreno  ·  `Verxion Native - Detalle de día de entreno.html`  ·  `dia-detalle-core.jsx`
**Propósito:** vista **de solo lectura** del plan de cualquier día (no es la pantalla de "empezar"; eso es Prescripción). Chrome (atrás→RUTINA, título = nombre del día, "···").
- *Hero*: eyebrow de tipo (PUSH/PULL/LEGS), contexto "PPL Hipertrofia · día 3/6", bubble + nombre (Sans 700, 27px) + foco ("Mié · Cuádriceps · glúteo · core"), fila de 4 stats (ejercicios · series · ~min · vol. est.).
- *Lista de ejercicios* ("El plan · N ejercicios · en orden"): tarjetas numeradas con nombre (+ chip "principal" si key), músculo·equipo, fila de "píldoras" (`4×6–8`, `RIR 2`, `⏱ 3:00`, `↑ +2,5` en verde), "última · 140 kg × 6", chevron → DETALLE (`origen=dia`).
- *"Cambia este día con el agente"* (dashed) → AGENTE.
- Variante **descanso**: tarjeta centrada "Día de descanso" sin ejercicios.

Captura: `05-detalle-de-dia.png`.

### 5. Detalle de sesión  ·  `Verxion Native - Detalle de sesión.html`  ·  `sesion-detalle-core.jsx`
**Propósito:** el **informe persistido** de una sesión completada (la versión de solo lectura del informe de cierre + el desglose por ejercicio). Chrome (atrás→ENTRENO·sesiones, título "Sesión", "···").
- *Hero*: eyebrow "✦ SESIÓN COMPLETADA", contexto rutina, bubble + nombre ("Push A") + fecha larga ("Lunes · 26 may"), chips "Plan perfecto" (verde) · "100% completado" · "2 PRs" (ámbar).
- *Recap del agente* (tarjeta lava): texto.
- *Tiles* (grid 3×2): Volumen (t) · Duración (m) · Series · Reps · Peak (kg) · RIR medio, cada uno con bubble de color.
- *Ejercicios · N* (desglose, series reales): por ejercicio — nombre (+ chip PR), músculo·equipo·prescripción, y la fila de **series** (`1 82,5 × 8`, `2 82,5 × 7`, … con la serie PR resaltada en color y trofeo). Tappable → DETALLE (`origen=sesion`).
- *Tu valoración*: 3 medidores (Esfuerzo/Calidad/Pump, /10, color por valor) + nota cualitativa entre comillas.
- *Grupos musculares*: barras por grupo (volumen t · %).
- *"¿Algún dato mal? Corrígelo con el agente"* (dashed) → AGENTE.

Captura: `06-detalle-de-sesion.png`.

### 6. Historial de sesiones  ·  `Verxion Native - Historial de sesiones.html`  ·  `sesiones-historial-core.jsx`
**Propósito:** log completo de entrenos, **agrupado por bloque (rutina)**. Chrome (atrás→ENTRENO·sesiones, título "Historial de sesiones", spacer). Lead "N sesiones".
- Barra: **select de rutina** (glass, icono capas + nombre + chevron, abre hoja: Todas las rutinas / cada rutina) + **orden** (hoja: Más reciente / Más antiguo / Volumen / Duración).
- **Agrupado por rutina** (orden por fecha): sección por bloque con nombre + chip de estado + rango de fechas + tonelaje total; debajo, filas de sesión (fecha + mes, bubble de tipo, nombre + chip PR, barra de volumen, volumen t + duración, chevron) → SESION_DET. Con orden Volumen/Duración pasa a lista plana sin agrupar.
- Datos: 27 sesiones en 3 bloques (PPL Hipertrofia · may, PPL base · feb, Iniciación · dic), con progresión de cargas entre bloques.

Captura: `07-historial-de-sesiones.png`.

### Pantallas adyacentes del flujo (preexistentes, incluidas para contexto)
- **7. Prescripción del día** (`Verxion Native - Prescripción del día.html`, `prescripcion-core.jsx`): la **sesión de HOY**. Hero del día + stats, nota del agente con el "porqué", lista de ejercicios prescrita (puede incluir un swap sugerido por el agente), barra fija **"Empezar sesión"** → SESION. Captura `08-prescripcion-del-dia.png`.
- **8. Sesión en marcha** (`Verxion Native - Sesión en marcha.html`, `sesion-core.jsx`, `sesion-cierre.jsx`, `sesion.css`): registro en vivo serie a serie (lo lleva el agente) y **hoja de cierre** (feedback cualitativo → "generando…" → informe). Captura `09-sesion-en-marcha.png`.
- **9. Detalle de ejercicio** (`Verxion Native - Detalle de ejercicio.html`, `ejercicio-core.jsx`): historia de un movimiento (curva e1RM/volumen, historial, músculos, pasos, nota del agente) + back contextual. Captura `10-detalle-de-ejercicio.png`.

---

## Interacciones y comportamiento

- **Transiciones:** cortas y secas — `200ms cubic-bezier(0.2, 0.8, 0.2, 1)`, sin bounce. Hover en tarjetas: ring `--vx-border-2`. Press: `opacity: 0.8` (espejo de `active:opacity-80` de NativeWind). Sin escalados.
- **Selector segmentado:** thumb absoluto que desliza (`left`/`width` `.22s`).
- **Hojas inferiores (sheets):** scrim `rgba(8,8,10,0.62)` + blur 6px; panel `#131316`, radio `26px 26px 0 0`, "grab" 38×4px, entra con `translateY(100%)→0` `.26s`. Usadas para Filtros/Orden/Select de rutina.
- **Relleno parcial de la semana en curso:** la celda de la semana activa se rellena proporcionalmente al **día de la semana** (`weekFrac`, p. ej. miércoles = 3/7 ≈ 43%), con glow lava y pulso suave. Es un `<span>` posicionado dentro de la celda-pista.
- **Animaciones gateadas:** los pulsos/glow usan `@media (prefers-reduced-motion: no-preference)`.
- **Estados vacíos:** Entreno tiene "sin rutina" (invitación) y "sin sesiones". La lista de rutinas y el historial asumen cuenta con datos (modelan un usuario activo) — añadir estados vacíos propios queda como TODO.
- **Superficies de "edición" = navegación al agente:** todas (ajustar rutina / activar / reanudar / cambiar día / corregir sesión / nueva rutina / cold-start) hacen `vxNav(AGENTE, { caso: "inicio" })`. Reprodúcelo abriendo el chat del agente con el composer en cold-start.

## State management (por pantalla)

Casi todo el estado es **derivado de datos de solo lectura** (catálogos) + el estado de llegada vía params. En el codebase, los params equivalen a props de ruta y los datos a respuestas de la API.

- **Entreno:** `segment` (rutina|sesiones|ejercicios), estado de rutina (active|fresh|empty), estado de sesión en vivo (off|active|paused), filtro de ejercicios (q, grupos, equipos, tipo, estado, sort), hoja abierta (filtros|orden|null).
- **Rutinas:** filtro (q, states[], goals[], sort), hoja (filtros|orden|null); modo navegar↔resultados derivado de si hay filtro activo.
- **Detalle de rutina / día / sesión:** solo el id de llegada (`rutina`/`dia`/`sesion`) → resuelven el objeto del catálogo. Sin estado mutable.
- **Historial:** `routine` (slug|all), `sort`, hoja (rutina|orden|null).
- **Detalle de ejercicio:** `ejercicio`, `metrica`, `tab`, + `origen`/contexto para el back.

## Contratos de datos (fuentes únicas)

Estos módulos son los "contratos" a mapear contra la API real (`verxion-platform`). Cada uno es la **verdad** de su dominio; la app solo lee.

- **`rutinas-data.jsx`** → `RD_ROUTINES` (catálogo de rutinas). Por rutina: `slug, name, state(active|completed), goal, split, perWeek, week, weeks, done, planned, score, scoreState(ahead|on|behind), volTotal, volTrend, created, finished/lastTrained, dayOfWeek, weekFrac, note, days[]`. Cada `day`: `{ dow, name, plan(id), est }` ó `{ type:"rest" }`. **`RD_PLANS`** = plantillas de día por id (`push-a`,`pull-a`,`legs-a`,`push-b`,`pull-b`,`legs-b`), cada una `{ type, focus, ex[] }`; cada ejercicio prescrito: `{ name, muscle, equip, sets, reps, rir, rest, target, last, up?, key? }`. Helpers: `rdRoutineBySlug`, `rdResolveDay`, `rdDaySummary`, `rdHeroType`, `rdSlug`, `RD_DAY` (tipo→color/icono/tag), `RD_STATE`.
- **`sesiones-data.jsx`** → `VX_SESSIONS_ALL` (27 sesiones, 3 bloques) y `VX_SESSIONS` (6 recientes). Por sesión: `slug, date, dateLong, mon, name, type, plan, week, scale, dur, durMin, delta, prs, rir, completion, scores{effort,quality,pump}, note, recap, routine, routineName, routineState, blockRange` + **sintetizados** `exercises[]` (cada uno `{name, muscle, equip, slug, prescrip, key, sets[{disp,w,reps,pr}], hasPR, top}`), `muscles[]` ({name,volT,pct}), `volT, series, reps, peak, frac`. Las **series reales** se sintetizan desde el plan del día con un factor `scale` por bloque (progresión). Helpers: `vxSessionBySlug`, `sdRoutineGroups(list, asc)`, `sdHistoryRoutines`.
- **`exercises-data.jsx`** → `VX_EXERCISES` (catálogo de ejercicios para la biblioteca y el detalle): `{ slug, name, group, target, equip, part, custom, done, logs, pr, muscles[], desc, pasos[], series/history sintetizados, e1rm, bestVol, … }`. Filtros: `VX_GROUPS`, `VX_EQUIPS`. Helpers: `vxExerciseBySlug`, `vxSlug`, `vxKg`, `VX_PART`.

> Nota: los slugs de ejercicio del plan deben casar con `exercises-data` para enlazar al detalle. Mantén esa correspondencia en la API.

## Design tokens

Definidos en `assets/colors_and_type.css` (variables `--vx-*`). Valores clave:

**Color**
- Acento / primario (lava): `--vx-lava` **#FF6262** (hover `--vx-lava-hover`, bg translúcido `--vx-lava-bg`). Glow CTA: `0 0 32px rgba(255,98,98,.35)`.
- Semántico "al alza / hecho / en objetivo" (verde): `--vx-up` **#5FE39A**, `--vx-up-2` #2ECC71, `--vx-up-tint` `rgba(46,204,113,.13)`, `--vx-up-line` `rgba(46,204,113,.28)`. (No usar literales nuevos; usar tokens.)
- Métricas: body/cian `--vx-body` #00D2FF, neutral/ámbar `--vx-neutral` #FFB900, health/rojo `--vx-health` #FF4757, insight/morado `--vx-insight` #9B59B6 — cada una con su `*-bg` translúcido para bubbles.
- Superficies: pantalla `#050507`, screen-bg `#0a0a0c`, card `#1C1C1E`/glass; borde normal `#27272A` (`--vx-border`), hairline `rgba(255,255,255,0.08)`.
- Texto: `#FAFAFA → #D4D4D8 → #8E8E93 → #636366`.
- **Chip de estado de bloque** (`scoreState`): ahead → texto `--vx-up` sobre `--vx-up-tint`/`--vx-up-line` + flecha ↗ + "Vas adelantado"; on → `--vx-neutral`/`--vx-neutral-bg` + "En objetivo"; behind → `--vx-health`/`--vx-health-bg` + "Vas justo". **Sin número.**

**Glass (canónico)**
`background: rgba(255,255,255,0.06)`, `backdrop-filter: blur(30px) saturate(150%)`, `border: 1px solid rgba(255,255,255,0.12)`, inset hairline `inset 0 1px 0 0 rgba(255,255,255,0.20), inset 0 0 0 1px rgba(255,255,255,0.05)`, sombra `0 14px 38px rgba(0,0,0,0.32)`. (En RN: BlurView + borde + sombra.)

**Tipografía** (dos familias Geist)
- **Geist Sans** (`--vx-font-sans`): UI, titulares, números grandes. Titular de pantalla 30/1.05/700/`-0.035em`; nombre hero 25–27/700/`-0.03em`; números de stat 17–19/700/`-0.03em`.
- **Geist Mono** (`--vx-font-mono`): **body por defecto**, labels, datos. Labels de sección 10–11px UPPER, tracking `.08–.12em`. Body 12.5/1.5.

**Radios:** botones = pill (9999px); inputs 14px; tarjetas 16–24px; hojas 26px. **Espaciado:** gutter 16px; gap entre tarjetas 8–14px; padding tarjeta 13–18px. **Iconos:** Lucide (stroke 2, currentColor), tamaños 11–16 (chips/inline), 20 (default/chrome), 22–26 (hero). En RN usar `lucide-react-native`.

## Assets
- `assets/colors_and_type.css` — todos los tokens (incluido el bloque `--vx-up`).
- `assets/verxion-isotype.png` (+ `.svg`) — isotipo lava, usado con glow en heroes/notas del agente. En el codebase usar el isotipo del brand system.
- Iconos: redibujados estilo Lucide; en producción usar `lucide-react-native`.

## Files (en este bundle)
**HTML (pantallas):** Entreno, Rutinas, Detalle de rutina, Detalle de día de entreno, Detalle de sesión, Historial de sesiones, Prescripción del día, Sesión en marcha, Detalle de ejercicio.
**Lógica/datos (JSX):** `nav.jsx`, `icons.jsx`, `ios-frame.jsx`, `tweaks-panel.jsx`; `entreno-core.jsx`, `rutinas-core.jsx`, `rutina-detalle-core.jsx`, `dia-detalle-core.jsx`, `sesion-detalle-core.jsx`, `sesiones-historial-core.jsx`, `prescripcion-core.jsx`, `sesion-core.jsx`, `sesion-cierre.jsx`, `ejercicio-core.jsx`; datos: `rutinas-data.jsx`, `sesiones-data.jsx`, `exercises-data.jsx`. **CSS:** `assets/colors_and_type.css`, `sesion.css`.
**Capturas:** `screenshots/01..10`.

> Cada `.html` carga React + Babel y sus `*.jsx` por `<script>`. Para verlo: abre el `.html` en un navegador (sirve la carpeta para que carguen los assets relativos). El panel de **Tweaks** (esquina) permite togglear estados/variantes de cada pantalla.

## TODOs / pendientes anotados
- Portar el bloque de tokens `--vx-up` a la hoja **canónica** del design system (vive en otro proyecto).
- Estados vacíos propios para la lista de rutinas y el historial (hoy asumen datos).
- Migrar al token `--vx-up` las pantallas que aún usan el literal verde (Onboarding, Estado Vacío, Entreno-sesion.css), si se recrean.
