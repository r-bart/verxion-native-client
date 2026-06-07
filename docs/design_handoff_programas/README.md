# Handoff: Programas (verxion-native)

## Overview

**Programas** es la capa paraguas de la app nativa *verxion* (visor iOS, dark, acento lava `#FF6262`). Un **programa** agrega una **rutina** + una **dieta** bajo un **objetivo** común, con su **calendario semanal**, su **ventana temporal** y un read-model de **adherencia unificada** (entreno + dieta). Es el nivel por encima de Entreno y Nutrición: donde Rutinas y Dietas viven por separado, el programa las une y las puntúa juntas.

Esta entrega cubre lo **nuevo**: la **biblioteca de Programas**, el **detalle de programa**, y la **entrada desde Hoy** (un slot "qué sigo" polimórfico). Las pantallas de **Detalle de rutina** y **Detalle de dieta** se incluyen porque se abren *desde* el programa (con un "Volver" contextual), pero su especificación completa vive en sus propios handoffs (`design_handoff_entreno` y `design_handoff_nutricion`).

Principio rector del producto (CRÍTICO): **la app nativa es un cliente de SOLO LECTURA**. No se crea ni se edita nada desde este cliente. Crear/activar/pausar/duplicar un programa, o acoplarle una rutina/dieta, lo hace el **agente verxion vía MCP**. En la UI, cualquier superficie de "edición" se enmarca como una **petición al agente** ("Pídele a verxion…", "Acopla una rutina…", "Pídeselo a verxion") que **navega al chat del Agente**, nunca como un botón que escribe.

## About the design files

Los archivos son **referencias de diseño en HTML/React (JSX vía Babel en navegador)** — prototipos del aspecto y comportamiento buscados, **no código de producción**. La tarea es **recrearlos en el codebase real** (`verxion-native`: Expo SDK 55, React Native, NativeWind v4, react-native-reusables, `lucide-react-native`), traduciendo el CSS web (glass con `backdrop-filter`, gradientes radiales, `position: sticky`) a su equivalente nativo (BlurView, gradientes, headers de stack).

## Fidelity

**Alta fidelidad.** Colores, tipografías, espaciados, radios, estados y microinteracciones son finales y están tomados del design system de verxion. Las medidas y tokens son los valores reales.

> Nota sobre las capturas: el capturador DOM a veces **no pinta el interior de tarjetas "glass"** (cabeceras con `backdrop-filter`) ni el contenido por debajo del *fold* de una pantalla con scroll — es un artefacto del capturador, **no del diseño**. Para ver el estado real (incluido el calendario tintado y el acoplamiento del detalle), abre los `.html` directamente; el panel de **Tweaks** permite recorrer todos los estados.

---

## Arquitectura de navegación

Cada pantalla es un archivo HTML; la navegación usa `vxNav(file, params)` (`nav.jsx`) → `location.href` con query params que fijan el estado de llegada (`vxReadParams`). En el codebase real esto es un **stack navigator**; los params son props de ruta.

**Rutas nuevas (de `nav.jsx`):**

| Constante | Archivo | Rol |
|---|---|---|
| `PROGRAMAS` | Verxion Native - Programas.html | Biblioteca de programas (por estado) |
| `PROGRAMA` | Verxion Native - Detalle de programa.html | Detalle de un programa |

**Rutas relacionadas (preexistentes, tocadas para el "volver" contextual):**

| Constante | Archivo | Rol |
|---|---|---|
| `HOY` | Verxion Native - Hoy.html | Command-centre del día — **entrada a Programas** |
| `RUTINA` | Verxion Native - Detalle de rutina.html | Detalle de rutina (se abre desde el programa) |
| `DIETA` | Verxion Native - Detalle de dieta.html | Detalle de dieta (se abre desde el programa) |
| `AGENTE` | Verxion Native - Agente.html | Chat del agente (destino de toda "edición") |

**Grafo de navegación (Programas):**

```
TabBar: [Hoy] · Entreno · verxion · Nutrición · Progreso
        (no hay pestaña de Programas — el tab bar está lleno)

HOY (command-centre)
├─ Cabecera: botón "biblioteca" (icono capas, arriba dcha) ─────────────► PROGRAMAS
└─ Slot "qué sigo" (ActivePlan, bajo el anillo) — POLIMÓRFICO:
      · estado "programa"  → fila programa ──────────────────────────────► PROGRAMA (programa=<slug>, from=hoy)
      · estado "rutina"    → fila rutina ────────────────────────────────► RUTINA  (rutina=<slug>, from=hoy)
      · estado "dieta"     → fila dieta ─────────────────────────────────► DIETA   (dieta=<slug>, from=hoy)
      · estado "sueltas"   → dos filas (rutina + dieta) ─────────────────► RUTINA / DIETA (from=hoy)
      · estado "nada"      → "Aún sin plan activo" ──────────────────────► AGENTE (caso=inicio)

PROGRAMAS (biblioteca)
├─ Tarjeta de programa (activo/pausa/borrador) ─────────────────────────► PROGRAMA (programa=<slug>)
├─ Fila de programa (completados · archivo) ────────────────────────────► PROGRAMA (programa=<slug>)
├─ Buscador + hoja de Orden (Recientes / Alfabético / Adherencia)
├─ "Pídele a verxion un programa nuevo" (dashed) ───────────────────────► AGENTE (caso=inicio)
└─ Back ────────────────────────────────────────────────────────────────► HOY

PROGRAMA (detalle)
├─ Tarjeta de RUTINA acoplada ──────────────────────────────────────────► RUTINA (rutina=<slug>, from=programa, programa=<slug>)
├─ Tarjeta de DIETA acoplada ───────────────────────────────────────────► DIETA  (dieta=<slug>, from=programa, programa=<slug>)
├─ Slot acoplado vacío ("Sin rutina/dieta") ────────────────────────────► AGENTE (caso=inicio)
├─ "Activar / reanudar / repetir / ajustar… con el agente" (dashed) ────► AGENTE (caso=inicio)
└─ Back ──── from=hoy → HOY · si no → PROGRAMAS

RUTINA / DIETA (detalle)
└─ Back contextual (lee `from`):  from=hoy → HOY · from=programa → PROGRAMA(programa) · resto → RUTINAS/DIETAS
```

**Patrón de "back contextual" (importante):** el detalle de rutina y el de dieta se alcanzan desde ≥3 orígenes (su biblioteca, el programa, y Hoy). Al navegar se pasa `from` (+ `programa` cuando aplica); el botón Volver lo resuelve para regresar al origen exacto. En el codebase nativo esto lo da gratis el back del stack — el `from` es la solución web a que cada pantalla se carga "fresca".

---

## Pantallas

> Convención común: fondo `#0a0a0c` con blooms radiales lava/cian/morado muy difuminados; columna única, gutter 16px; tarjetas "glass". Las pantallas de detalle llevan **chrome superior** (botón atrás circular glass + título centrado + "···"/spacer) `position: sticky`. La tab bar solo aparece en Hoy.

### 1. Programas — biblioteca  ·  `Verxion Native - Programas.html`  ·  `programas-core.jsx`
**Propósito:** todos los programas que ha armado el agente, agrupados por estado. **Espejo de Rutinas/Dietas**, con un rasgo propio: cada tarjeta enseña el **acoplamiento** (la rutina y la dieta que une). Chrome (atrás→HOY, título "Programas", spacer). Lead "N programas". **Buscador** (nombre/objetivo/descripción) + **hoja de Orden** (Recientes / Alfabético / Adherencia).
- **Modo navegar** (sin búsqueda): agrupado — "En curso" (tarjeta grande del activo), "En pausa", "Borradores · verxion los está armando" (tarjeta dashed morada), "Archivo · completados" (filas compactas).
  - *Tarjeta grande*: eyebrow de estado (activo = punto lava "PROGRAMA ACTIVO" / borrador = isotipo "BORRADOR · verxion" / pausa = icono "EN PAUSA") + ventana corta ("6 sem"); bubble del **objetivo** (color/icono del sistema) + nombre (Sans 700, 21px) + chip de objetivo; **fila de acoplamiento** (icono enlace + chip de rutina + chip de dieta; "Sin rutina/dieta" en dashed si falta); pie: "Semana **3** de 6" + chip de estado **sin número** ("Vas adelantado") + barra de celdas de semana (hechas en lava; la en curso con relleno parcial por `weekFrac`) + "Entreno 86% · Dieta 92% · 84 unificado".
  - *Tarjeta borrador*: pie alternativo "Sin empezar · N semanas planeadas" + "Ver plan ›".
  - *Filas de archivo*: bubble de objetivo, nombre, objetivo·"hasta <fecha>", badge trofeo con score unificado, chevron.
- **Modo resultados** (con búsqueda): lista plana (tarjetas + filas) + contador "N resultados" o estado vacío "Sin resultados".
- Pie: superficie "Pídele a verxion un programa nuevo" (dashed, isotipo) → AGENTE.

Captura: `02-programas-lista.png`.

### 2. Detalle de programa  ·  `Verxion Native - Detalle de programa.html`  ·  `programa-detalle-core.jsx`
**Propósito:** los metadatos del contenedor + la **adherencia unificada** + el **acoplamiento**. Chrome (atrás→HOY si `from=hoy`, si no→PROGRAMAS; título = nombre; "···"). De arriba abajo:
- *Hero*: eyebrow de estado, contexto ("Actualizado · Hoy" / "Finalizado · …" / "En pausa" / "Creado …"), bubble del objetivo + nombre (Sans 700, 23px) + chip de objetivo; **descripción**; fila de **3 stats** (días/sem · ventana(sem)/duración · acoplado **N/2**); chip de **ventana temporal** ("13 may 2026 – 24 jun 2026" o "Indefinido").
  - **`días/sem` = días de entreno reales del calendario** (`pgTrainingDays`, no un campo aparte) — así casa siempre con el desglose de "La semana".
- *Adherencia unificada* (solo si hay datos): **anillo** con el `unifiedExecutionScore` (84/100, color por estado), chip de estado ("Vas adelantado"), **fase** (`Arranque en frío` / `Construyendo base` / `Seguimiento activo`) + **confianza** (baja/media/alta), una línea de *hint* por fase, y **dos sub-barras** (Entreno lava `14/36 sesiones` · Dieta cian `19/21 días`). Sin dieta acoplada → la barra de Dieta es "—" y el score unificado cae al de solo-entreno.
- *Nota del agente* (tarjeta lava + isotipo): "sobre tu programa" (o "por qué este programa" en borrador).
- *La semana* (sección + contador `pgWeekSummary` → "5 entrenos · 1 recarga · 1 descanso"): **calendario Lun–Dom de celdas tintadas** (heatmap): entreno = celda tinte lava, recarga = tinte ámbar, a medida = tinte cian, **descanso = celda hueca/hundida** (dashed, con guion). Leyenda con swatches (el descanso como **anillo hueco**, no relleno). *(Decisión de diseño: celdas tintadas en vez de "bola con glow" — el glow se reserva como efecto emisivo único del sistema; ver TODOs.)*
- *Lo que acopla* (sección "Toca para ver el detalle"): **tarjeta de RUTINA** (bubble del tipo, "Rutina", nombre, "split · sem 3/6 · 86% adh.", chevron → RUTINA con `from=programa`) y **tarjeta de DIETA** (bubble del objetivo, "Dieta", nombre, "2.250 kcal · 180 g P · sem 3/6", chevron → DIETA con `from=programa`). Si falta una: **slot vacío** dashed ("Sin rutina/dieta acoplada", "+") → AGENTE.
- *"Activar / reanudar / repetir / ajustar… con el agente"* (dashed, isotipo) → AGENTE. El copy varía por estado (borrador incompleto → "Acopla una rutina o dieta para activarlo").

Captura: `03-detalle-programa.png` (mitad superior).

### 3. Entrada desde Hoy — slot "qué sigo" (ActivePlan)  ·  `Verxion Native - Hoy.html`  ·  `hoy-real.jsx`
**Propósito:** la entrada a Programas vive en **Hoy**, no en una pestaña (el tab bar de 5 está lleno). Dos accesos:
- **Botón "biblioteca"** (icono capas, en la cabecera de Hoy, junto al avatar) → **PROGRAMAS**. Espeja el patrón de Entreno/Nutrición (su botón de capas abre Rutinas/Dietas).
- **Slot `ActivePlan`** (ocupa el sitio donde antes salía la rutina, **bajo el anillo del día**): es **polimórfico** — pinta lo que el usuario realmente tiene:

| Estado | Qué pinta | Navega a |
|---|---|---|
| **programa** | eyebrow "PROGRAMA ACTIVO · SEM 3/6" + fila: bubble objetivo · nombre · sub "PPL Hipertrofia · Definición" · chip score **unificado** (84/100) | PROGRAMA (from=hoy) |
| **rutina** (sin dieta) | eyebrow "RUTINA · SEMANA 3/6" + fila: dumbbell · "PPL Hipertrofia" · "Push · Pull · Legs" · chip 86/100 | RUTINA (from=hoy) |
| **dieta** (sin rutina) | eyebrow "DIETA ACTIVA" + fila: utensils coral · "Definición" · "2.250 kcal · 180 g proteína" · chip 92/100 | DIETA (from=hoy) |
| **sueltas** (rutina + dieta sin unir) | eyebrow "TU PLAN" + **dos filas** apiladas + pista "Sin unir en un programa · pídeselo a verxion" | RUTINA / DIETA (from=hoy) |
| **nada** | eyebrow "TU PLAN" + "Aún sin plan activo · pídeselo a verxion" | AGENTE |

Regla de diseño: cuando hay **programa**, el slot muestra **solo** el programa (la rutina ya no se duplica) — la rutina y la dieta se ven dentro del detalle. El estado "sueltas" no tiene botón de "unir": es una petición al agente (coherente con solo-lectura).

Capturas: `01-hoy-slot-programa.png` (estado programa), `04-hoy-slot-estados.png` (estado sueltas). El resto de estados se recorren con el Tweak "Plan activo · slot de Hoy" (o `?plan=rutina|dieta|sueltas|nada`).

### Pantallas alcanzadas desde el programa (spec completa en sus handoffs)
- **Detalle de rutina** (`rutina-detalle-core.jsx`) — ver `design_handoff_entreno`. Aquí solo se tocó el **back contextual** (`from=hoy`→HOY, `from=programa`→PROGRAMA).
- **Detalle de dieta** (`dieta-detalle-core.jsx`) — ver `design_handoff_nutricion`. Idem back contextual.

---

## Interacciones y comportamiento

- **Transiciones:** cortas y secas — `200ms cubic-bezier(0.2, 0.8, 0.2, 1)`, sin bounce. Hover en tarjetas: ring `--vx-border-2`. Press: `opacity: 0.8/0.85`. Sin escalados.
- **Hoja de Orden:** scrim `rgba(8,8,10,0.62)` + blur; panel `#131316`, radio `26px 26px 0 0`, "grab" 38×4px, entra `translateY(100%)→0` `.26s`.
- **Celdas de semana (lista):** la celda de la semana en curso se rellena parcialmente por `weekFrac` (p. ej. miércoles ≈ 3/7), con glow lava y pulso suave; completados = todas llenas.
- **Anillo de adherencia (detalle):** SVG con `strokeDashoffset` animado (`.5s`), color por estado (`ahead`=`--vx-up`, `on`=`--vx-neutral`, `behind`=`--vx-health`).
- **Calendario semanal (detalle):** **celdas tintadas** (heatmap), descanso hueco. Sin glow por celda. Leyenda derivada de los tipos presentes.
- **Animaciones gateadas:** punto "vivo", pulsos y glows usan `@media (prefers-reduced-motion: no-preference)`.
- **Superficies de "edición" = navegación al agente:** activar/pausar/reanudar/repetir/ajustar/acoplar/nuevo programa → `vxNav(AGENTE, { caso: "inicio" })`.

## State management (por pantalla)

Estado **derivado de datos de solo lectura** (catálogos) + estado de llegada vía params.

- **Programas (lista):** `q` (búsqueda), `sort` (recientes|nombre|adherencia), hoja (orden|null); modo navegar↔resultados derivado de si hay búsqueda/orden activos.
- **Detalle de programa:** `programa` (slug) + `from` (hoy|programa|…) para el back. El resto de Tweaks (`estado`, `fase`, `ventana`, `sinDieta`) son **solo de demo** para recorrer estados — con `"auto"` respetan el dato real del programa; en producción no existen (el estado lo da la API).
- **Hoy / ActivePlan:** `plan` (programa|rutina|dieta|sueltas|nada) — en el prototipo es un Tweak; en producción **se deriva** de qué tiene el usuario (programa activo · rutina sola · dieta sola · ambas sin unir · nada).

## Contratos de datos (fuentes únicas)

- **`programas-data.jsx`** → **`VX_PROGRAMS`** (catálogo de programas). Por programa: `slug, name, description, goal, routineSlug, dietSlug, durationType(date_range|indefinite), startDate, endDate, perWeek, weeks, week, weekFrac, state(active|draft|paused|completed), weeklySchedule[7]∈(training|rest|refeed|custom), created/updated/finished, adherence, note`. **`adherence`** (read-model `ProgramAdherence`): `{ unifiedScore, state(ahead|on|behind), phase(cold_start|baseline_building|active_tracking), confidence(low|medium|high), training{score,done,planned}, diet{score,done,planned} }` (o `null` en borradores).
  - **`PG_GOAL`** (10 `ProgramGoal`): `muscle_gain, fat_loss, strength, endurance, maintenance, recomp, general_fitness, athletic_performance, rehabilitation, health` → castellano + color/icono del sistema.
  - **`PG_SLOT`** (tipos de día): `training/rest/refeed/custom` → label + color + tinte de celda (`fill`/`fillLine`).
  - **`PG_STATE`** (estado de programa) · **`PG_PHASE`** (fase de adherencia + hint) · **`PG_CONF`** (confianza).
  - Helpers: `pgProgramBySlug`, `pgActiveProgram`, `pgGoalCfg`, `pgWindow`, `pgWindowShort`, `pgWeekSummary`, `pgTrainingDays`, `pgRoutine`/`pgDiet` (resuelven el acoplamiento contra los catálogos de rutinas/dietas), `pgScoreWord`.
  - **Acoplamiento:** `routineSlug` → `RD_ROUTINES` (`rutinas-data.jsx`); `dietSlug` → `VX_DIETS` (`dietas-data.jsx`). Mantén esa correspondencia de slugs en la API real.
- **`rutinas-data.jsx`** (`RD_ROUTINES`, `rdRoutineBySlug`, `rdHeroType`, `RD_DAY`) — ver `design_handoff_entreno`.
- **`dietas-data.jsx`** (`VX_DIETS`, `vxDietBySlug`, `DZ_GOAL`) — ver `design_handoff_nutricion`.
- **`comidas-data.jsx`** — verdad del día de nutrición; lo usa Hoy (`vxExpandMeals`) y el detalle de dieta. Ver `design_handoff_nutricion`.

## Design tokens

Definidos en `assets/colors_and_type.css` (variables `--vx-*`). Relevantes aquí:
- **Lava** `--vx-lava` **#FF6262** (acento/primario; `--vx-lava-bg` translúcido).
- **"Al alza / en objetivo" (verde)** `--vx-up` **#5FE39A** (`--vx-up-2` #2ECC71, `--vx-up-tint`, `--vx-up-line`) — usado en el chip de score unificado y el estado "ahead". (No usar literales nuevos; usar tokens.)
- **Objetivos / tipos de día:** body/cian `--vx-body` #00D2FF, neutral/ámbar `--vx-neutral` #FFB900, health/rojo `--vx-health` #FF4757, insight/morado `--vx-insight` #9B59B6 — cada una con su `*-bg` para bubbles y su tinte para las celdas del calendario.
- **Glass, tipografía (Geist Sans UI + Geist Mono body), radios (pill/16/24/26), espaciado e iconos (Lucide):** ver el bloque equivalente en `design_handoff_entreno` (idénticos).

## Assets
- `assets/colors_and_type.css` — todos los tokens.
- `assets/verxion-isotype.png` (+ `.svg`) — isotipo lava con glow (heroes, notas del agente, eyebrow de borrador). En producción usar el isotipo del brand system.
- Iconos: redibujados estilo Lucide (en `icons.jsx` + sets locales `PgIcon`/`PgdIcon`); en producción usar `lucide-react-native`.

## Files (en este bundle)
**HTML (pantallas):** Programas, Detalle de programa, Hoy (entrada), Detalle de rutina, Detalle de dieta.
**Lógica/datos (JSX):** `nav.jsx`, `icons.jsx`, `ios-frame.jsx`, `tweaks-panel.jsx`; `programas-core.jsx`, `programa-detalle-core.jsx`, `hoy-real.jsx`, `rutina-detalle-core.jsx`, `dieta-detalle-core.jsx`; datos: `programas-data.jsx`, `rutinas-data.jsx`, `dietas-data.jsx`, `comidas-data.jsx`. **CSS:** `assets/colors_and_type.css`.
**Capturas:** `screenshots/01-hoy-slot-programa.png`, `02-programas-lista.png`, `03-detalle-programa.png`, `04-hoy-slot-estados.png`.

> Cada `.html` carga React + Babel y sus `*.jsx` por `<script>`. Para verlo: abre el `.html` en un navegador (sirve la carpeta para que carguen los assets relativos). El panel de **Tweaks** (esquina) recorre los estados de cada pantalla.

## TODOs / pendientes anotados
- **Entrada:** se resolvió como banner/slot en Hoy + botón de capas → biblioteca. Si más adelante se quiere, valorar accesos secundarios desde Entreno/Nutrición ("este entreno/dieta pertenece a tu programa →").
- **`ActivePlan` en producción:** el estado del slot debe **derivarse** de los datos reales del usuario (programa activo / rutina sola / dieta sola / ambas sueltas / nada), no de un Tweak.
- **Calendario tintado:** se eligió heatmap (celdas tintadas, descanso hueco) sobre la variante "bola con glow" para no diluir el efecto emisivo, reservado a la CTA lava. Mantener esa disciplina al recrear.
- **Tokens:** portar el bloque `--vx-up` (y este patrón de programa) a la hoja **canónica** del design system, que vive en otro proyecto de solo-lectura.
- **`perWeek`** quedó como campo informativo; el hero ya calcula "días/sem" desde `weeklySchedule` (`pgTrainingDays`). En la API, derivarlo del calendario para evitar deriva.
