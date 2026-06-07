# Handoff: **Nutrición** (verxion-native)

## Overview
Toda la vertical de **Nutrición** del cliente nativo de verxion: la dieta que el agente ha
armado, el día como **espina de comidas**, el **diario** (historial + analítica de adherencia),
la **biblioteca de alimentos y recetas**, y todas las pantallas de detalle que cuelgan de ahí.

Es el espejo nutricional de la vertical de **Entreno** (rutinas → sesiones → ejercicios). La
estructura es deliberadamente paralela: donde Entreno tiene *Rutina → Día → Ejercicio* y
*Sesión → Detalle de sesión*, Nutrición tiene *Dieta → Comida → Alimento* y *Plan del día →
Día del diario*.

| Pantalla | La pregunta que responde | Espejo en Entreno |
|---|---|---|
| **Nutrición** (landing, 3 segmentos) | *¿Qué como hoy y cómo voy?* | landing de Entreno |
| **Dietas** | *¿Qué planes tengo?* | Todas las rutinas |
| **Detalle de dieta** | *¿De qué va este plan?* | Detalle de rutina |
| **Detalle de comida** | *¿Qué lleva esta comida?* | Detalle de día de entreno |
| **Detalle de alimento** | *¿Qué aporta este alimento/receta?* | Detalle de ejercicio |
| **Plan de comidas del día** | *¿Qué toca comer hoy, comida a comida?* | Prescripción del día |
| **Detalle de día del diario** | *¿Cómo cerré ese día?* | Detalle de sesión |

El landing **Nutrición** tiene tres segmentos en un control segmentado:

| Segmento | Contenido |
|---|---|
| **Plan** | Dieta activa al frente: objetivos del día (anillo kcal + macros), hidratación, atajo al plan |
| **Diario** | Analítica de adherencia (gráfica + KPIs) + feed de días registrados agrupado por fase |
| **Alimentos** | Biblioteca buscable/filtrable de alimentos + recetas |

## About the Design Files
Los archivos de este bundle son **referencias de diseño hechas en HTML/React (Babel
in-browser)** — prototipos que muestran el aspecto y el comportamiento deseados, **no código de
producción para copiar tal cual**. La tarea es **recrear estos diseños en el entorno real de
`verxion-native`** (Expo SDK 55, React Native, NativeWind v4, react-native-reusables) usando sus
patrones y librerías establecidos (`lucide-react-native` para iconos, los tokens de
`design-tokens.json`, navegación de stack nativa).

Los prototipos usan React 18 + Babel standalone dentro de un marco iOS simulado (`ios-frame.jsx`).
El layout es **single-column, full-bleed, gutter de 16px**, seccionado por labels `UPPERCASE` en
Geist Mono — exactamente el patrón del resto de la app nativa.

## Fidelity
**Alta fidelidad (hifi).** Colores, tipografía, espaciado, interacciones y copy son finales y
están anclados al design system de verxion. Recrear pixel-perfect con las librerías del codebase.

## ⚠️ Principio rector: cliente de SOLO LECTURA
Esta app es un **visor**. **No se escribe nada desde el cliente** — ni comida, ni peso/agua/pasos,
ni planes. **Toda creación/edición la hace el agente vía MCP.** En Nutrición, cualquier superficie
que parezca "edición" se enmarca como **petición al agente**, nunca como un botón que escribe:

- "**Pídele a verxion una dieta nueva**" (Dietas), "**Cambia esta comida con el agente**"
  (Detalle de comida), "**te lo meto en una comida…**" — son CTAs que abren al agente, no formularios.
- Los **swaps** ("Cambio del agente") son lectura de algo que el agente ya hizo, no una acción del usuario.
- **No** hay botones de crear/registrar/añadir comida. **No** se edita una ficha de alimento a mano.

## Fuente de datos (qué es real)
La app **lee** (vía API/MCP) lo que el agente ha planificado y lo que la API ha calculado. Dos
módulos de datos son la **única fuente de verdad** y alimentan TODAS las pantallas (incluida la
pantalla **Hoy**, que reusa `vxExpandMeals`):

### `comidas-data.jsx` — el día + la biblioteca
- **`VX_DIET`** — objetivos del día: `Definición · 2.250 kcal`, 5 comidas, 180 g proteína,
  `kcalGoal 2250 · pGoal 180 · cGoal 240 · fGoal 70 · waterGoal 2.5 L`, semana 3 de 6, adherencia 78 (estado "on").
- **`VX_MEAL_SPECS`** — las **5 comidas** del plan como espina temporal, cada una con sus
  alimentos y ración. Sus macros se **suman desde los alimentos** (no son números sueltos), y el
  total cuadra a 2.250 kcal / 180 g proteína:
  | id | Comida | Hora | Notas |
  |---|---|---|---|
  | `desayuno` | Desayuno | 07:45 | Avena, claras, huevo, plátano |
  | `snack-am` | Media mañana | 11:00 | Yogur griego, arándanos, almendras |
  | `comida` | Comida | 13:30 | **comida clave** · receta `bowl-de-pollo-y-arroz` |
  | `pre` | Pre-entreno | 16:30 | **swap del agente**: tostada con miel → tortitas de arroz |
  | `cena` | Cena | 20:00 | receta `salmon-al-horno-con-patata` |
- **`VX_SUPPS`** — suplementos del día (Creatina+Omega-3 AM 08:00, Vitamina D PM 22:00).
- **`VX_FOOD_SPECS` → `VX_FOODS`** — catálogo de **20 alimentos** por grupo (Proteínas,
  Carbohidratos, Grasas, Verduras, Frutas, Lácteos). Cada uno: ración base, kcal/macros, `logs`
  (nº de veces usado), `fav`, `custom` ("Creado por ti"), `src` (BEDCA / Open Food Facts),
  categoría, micronutrientes sintéticos (`vxMicros`) y highlights de vitaminas.
- **`VX_RECIPE_SPECS` → `VX_RECIPES`** — **3 recetas** (alimentos compuestos: ingredientes +
  pasos): "Bowl de pollo y arroz" (verxion), "Salmón al horno con patata" (creado por ti),
  "Tortitas proteicas de avena" (creado por ti). `VX_LIBRARY = [...VX_FOODS, ...VX_RECIPES]`.
- **`VX_DIARY_WEEK`** — 7 días COMPLETADOS que terminan **ayer** (hoy = **Martes 2 jun**; el día
  en curso vive en el anillo, no aquí). Cada día: `kcal`, `p` (proteína), `adh` (adherencia %
  calculada por la API), `water`, `recap` (informe del agente) y, si lo hubo, el `swap` registrado.
  Esta MISMA lista alimenta la lista "Días recientes" **y** la gráfica semanal.
- **`VX_DIARY_ALL`** — historial completo: la dieta activa (3 semanas autoradas) + dietas
  archivadas (Volumen, Mantenimiento) generadas de forma procedural pero coherente con sus objetivos.

**Derivaciones (la app no inventa, deriva):** `vxExpandMeals()` suma cada comida desde sus
alimentos; `vxDeriveCF(kcal, p)` reparte carbos/grasa que **cuadran** las kcal del día a partir de
kcal+proteína reales; `vxSynthDiaryDay(spec)` sintetiza el desglose por comida de un día cerrado
escalando el plan base a los totales reales. **Adherencia, kcal y proteína vienen de la API**;
carbos/grasa por comida se derivan para que cuadre el total. Nada se escribe.

### `dietas-data.jsx` — el catálogo de dietas
- **`VX_DIETS`** — 3 dietas: `definicion-2250` (**activa**), `volumen-2900` (completada),
  `mantenimiento-2500` (completada). Cada una: objetivos, `macroSplit`, semana/semanas, adherencia,
  fechas, nota del agente, y su espina de comidas (`meals: "current"` para la activa → plan real;
  array ligero para las archivadas, sin desglose por alimento).
- **`DZ_GOAL`** — objetivo → color/icono/etiqueta: definición=lava, volumen=body/cyan,
  mantenimiento=neutral/amber. **`DZ_STATE`** — activa=lava, borrador=insight, completada=verde (`--vx-up`).
- Helpers: `vxActiveDiet()`, `vxDietBySlug()`, `vxDietMeals(diet)`, `vxDietMeal(slug, mealId)`,
  `vxDietTotals(diet)` (totales del día + reparto de macros %).

> **Calendario del prototipo:** hoy = **Martes 2 jun 2026**. El diario va de "Lun 1 jun" hacia atrás.

---

## Pantalla 1 · NUTRICIÓN (landing) — `nutricion-core.jsx` + `nutricion-library.jsx`
**Entrada:** `Verxion Native - Nutrición.html`. Composición: `NutricionScreen({ t, onSelect })`
→ `buildNutricion(t)` construye el escenario; `NSelector` (control segmentado) + `body` por segmento.

### Header
- `padding: 58px 16px 4px`, sticky, con gradiente+blur. Título **"Nutrición"** (Geist Sans
  30px/700, `letter-spacing: -0.035em`). En el segmento **Plan** aparece a la derecha un botón
  circular (40px, glass) con icono `layers` → navega a **Dietas**.
- **Control segmentado** `.n-seg` (3px padding, radius 14, fondo `rgba(255,255,255,0.06)`): un
  `.n-seg__thumb` deslizante (radius 11, transición `left/width .22s`) + 3 botones Plan/Diario/
  Alimentos. Activo en lava (`--vx-lava`), inactivo `rgba(255,255,255,0.5)`. El thumb se posiciona
  con `left: calc(3px + idx * (100% - 6px) / 3)`.

### Segmento PLAN (ver `screenshots/01-nutricion-plan.png`)
1. **Hero de dieta** `.n-hero` (glass, radius 24): eyebrow "DIETA ACTIVA" + "por verxion ›",
   nombre **"Definición · 2.250 kcal"** (25px/700), chips de objetivo ("Definición", "5 comidas",
   "180 g proteína"), barra de semana (3 de 6 · "En objetivo"). Tappable → **Detalle de dieta**.
2. **Intake de hoy** `.n-intake` (fondo lava-tinte, borde lava): **anillo SVG** con kcal del día
   (2.250 grande / objetivo) + barras de macros (Proteína lava, Carbos body/cyan, Grasa neutral/
   amber) cada una `valor/objetivo g` con barra `.n-bar`. CTA "siguiente comida" → Plan de comidas.
3. **Hidratación** `.n-hydro`: vasos `.n-cup` (body/cyan cuando llenos), `2,4 / 2,5 L`.
4. **Atajo** "EL DÍA · TUS COMIDAS → Plan completo" → **Plan de comidas del día**.
5. **Nota del agente** `.n-agent` (opcional, tweak `agentPulse`): isotipo + mensaje en lava-tinte.

### Segmento DIARIO (ver `screenshots/02-nutricion-diario.png`) — `DiarioView`
1. **Cabecera de analítica** con **selector de periodo** (`7 días / 30 días / 3 meses`) y de
   **métrica** (`Adherencia / Kcal / Proteína`) en menú glass desplegable (`.n-rpick` + `.n-rmenu`).
2. **Tarjeta de gráfica** `.n-chartcard`: valor grande (p.ej. **93 %**), delta vs periodo anterior
   (chip verde `--vx-up` si sube), **gráfica de línea SVG** (`.n-chart__svg`, 150px) con línea de
   objetivo. Nota al pie con isotipo: "verxion calcula tu adherencia a partir de tu plan…".
3. **KPIs** `.n-kpis` (4 columnas con divisores): Adherencia · Días registrados (5/7) · Mejor día ·
   Kcal media. **Filtros** "Todas las dietas" + "Más reciente" (abren hojas).
4. **Feed de días** agrupado por **fase/dieta** (cabeceras `.n-phasehd` con rango + adherencia
   media): filas `.n-dday` (tappable → **Detalle de día del diario**) con fecha, nombre del día,
   barra de adherencia coloreada por clasificación, adherencia % + delta, gramos de proteína.
   Reveal progresivo al hacer scroll (`.n-feedend` con spinner).

### Segmento ALIMENTOS (ver `screenshots/03-nutricion-alimentos.png`) — `AlimentosView`
1. **Buscador** `.n-searchbar` ("Buscar alimento o receta").
2. **Quick chips** `.n-quick` (scroll horizontal): Todos · **Recetas** (con contador) · Favoritos ·
   Oficiales · Tuyos. El chip Recetas activo va en lava con glow.
3. **Barra de filtros** `.n-fbar`: "Filtros" (abre hoja con Tipo/Estado, `.n-fbtn__badge` cuenta
   activos) + "Recientes" (orden, abre hoja). Chips de filtro activo `.n-actchip` (limpiar).
4. **Lista** `.n-foodlist`: filas `.n-food` con bubble de inicial (color del macro dominante),
   nombre (+ badge "CUSTOM" insight o "RECETA" lava), meta (`kcal · ración · categoría`), y
   mini-barras de macros `.n-fmacro` (P/C/G) a la derecha. Tappable → **Detalle de alimento**.
   Estado vacío `.n-noresults` cuando no hay coincidencias.

### Estado de la dieta (tweak `dietState`)
- **active** — todo lo anterior. **fresh** ("Recién") — dieta nueva, invita a empezar. **empty**
  ("Sin dieta") — `.n-invite` / `.n-emptynote`: "Pídele a verxion tu primera dieta" con prompt de ejemplo.

### Tab bar `.n-tabbar`
Glass flotante (radius 32, blur), 4 tabs: Hoy · Entreno · **Nutrición** (activo, lava) · Progreso.
Persistente en todo el landing.

---

## Pantalla 2 · DIETAS — `dietas-core.jsx`
**Entrada:** `Verxion Native - Dietas.html`. `DietasScreen({ t })` → `buildDietas(t)`.
Ver `screenshots/04-dietas.png`.

- **Chrome** sticky: botón atrás (38px glass) + título centrado "Dietas".
- **Lead**: "3 dietas · Tu dieta activa y el archivo de planes que ya has completado."
- **Buscador** + barra de **orden** (`.dz-fbtn` "Recientes" → hoja de orden con 4 opciones:
  Recientes / Alfabético / Adherencia / Calorías; tweak `orden`).
- **EN CURSO** → **tarjeta grande** `.dz-card--active` de la dieta activa: eyebrow "DIETA ACTIVA"
  con punto vivo parpadeante, nombre, chip de objetivo, barra de semana, pie con `kcal/proteína`
  + adherencia (`↗ 92 % adh`). Tappable → **Detalle de dieta**.
- **ARCHIVO · COMPLETADAS** → filas `.dz-row` de las dietas terminadas (Volumen, Mantenimiento)
  con bubble de objetivo, nombre, "hasta [fecha]" y chip de adherencia verde. Tappable → Detalle.
- **Ask-agent** `.dz-ask` (borde discontinuo): "Pídele a verxion una dieta nueva — Las dietas las
  arma y activa el agente · describe tu objetivo y aparecerá aquí." Abre al agente.

---

## Pantalla 3 · DETALLE DE DIETA — `dieta-detalle-core.jsx`
**Entrada:** `Verxion Native - Detalle de dieta.html`. `buildDietaDetalle(t)` (tweak `dieta` =
slug). Espejo de "Detalle de rutina". Ver `screenshots/05-detalle-dieta.png`.

- **Chrome** con botón atrás + título (nombre corto) + botón "···" (menú "···" = acciones de
  lectura / pedir al agente).
- **Hero** (glass lava-tinte si activa): eyebrow estado, nombre + chip objetivo + macroSplit, y
  **fila de 4 stats** con icono: `5 comidas · 2.250 kcal/día · 180 g proteína · 2,5 L agua`.
  Barra de semana (3 de 6 · "En objetivo") + meta "21 días registrados · 92 % adherencia".
- **EL DÍA · COMIDAS** (5 comidas en orden): espina de comidas. Cada fila (tappable → **Detalle
  de comida**) con bubble de icono, nombre, hora, kcal y chips de macros `P/C/G`. La **Comida**
  lleva badge "RECETA"; el **Pre-entreno** muestra el banner de swap "Cambio del agente" (body/cyan).
- La **nota del agente** del plan se muestra como bloque de texto (lectura).

---

## Pantalla 4 · DETALLE DE COMIDA — `comida-detalle-core.jsx`
**Entrada:** `Verxion Native - Detalle de comida.html`. `buildComida(t)` (tweaks `dieta`,
`comida`). Espejo de "Detalle de día de entreno". Ver `screenshots/06-detalle-comida.png`.

- **Chrome** atrás + título (nombre de la comida) + "···".
- **Hero**: eyebrow "COMIDA PRINCIPAL · Definición · 3/5", nombre + hora, **anillo kcal** (469) +
  barras de macros con `g` y `%` (Proteína 53 g · 46 %, Carbos 41 g · 35 %, Grasa 9 g · 18 %).
- **ALIMENTOS · en la receta del plan**: lista numerada de los alimentos (Pechuga de pollo,
  Arroz basmati, Brócoli, Aceite de oliva) con ración, kcal y mini-macros. Tappable → **Detalle
  de alimento**.
- **Ver receta · ingredientes y pasos** (si la comida tiene receta) → **Detalle de alimento** (receta).
- **Ask-agent**: "Cambia esta comida con el agente — El plan es de solo lectura · para sustituir
  un alimento o ajustar raciones, díselo a verxion."

---

## Pantalla 5 · DETALLE DE ALIMENTO (o RECETA) — `alimento-core.jsx`
**Entrada:** `Verxion Native - Detalle de alimento.html`. `buildAlimento(t)` (tweak `alimento` =
slug). Espejo de "Detalle de ejercicio". Ver `screenshots/07-detalle-alimento.png`.

- **Chrome** atrás + nombre + "···".
- **Hero**: bubble de inicial, nombre, chips (grupo "Proteínas", kcal/100, "Favorito"/"Creado por
  ti"), y **fuente** (`BEDCA · base oficial española` / `Open Food Facts` / `Creado por ti`).
- **Tabs** (control segmentado): **Nutrición** | **Ficha**.
- **Nutrición**: toggle **POR 100 g / RACIÓN**; **anillo kcal** (165) + macros con `g` y `%`;
  bloque "EN LA COMIDA" (en qué comida del plan aparece); **MICRONUTRIENTES** (Fibra, Azúcares,
  Sodio) + chips de vitaminas/highlights; **HISTORIAL DE CONSUMO** (Hoy / Ayer / … con ración y kcal).
- **Receta** (cuando el item es receta): ingredientes escalados + pasos numerados + descripción.

---

## Pantalla 6 · PLAN DE COMIDAS DEL DÍA — `plan-comidas-core.jsx`
**Entrada:** `Verxion Native - Plan de comidas del día.html`. `buildPlanComidas(t)`. Espejo de
"Prescripción del día" (el puente entre el landing y "comer"). Ver `screenshots/08-plan-comidas-dia.png`.

- **Chrome** atrás + "Comidas de hoy" + "···".
- **Hero** "HOY · DIETA": "Definición · 2.250 kcal · 180 g proteína" + **fila de 4 stats**
  (5 comidas · 2.250 kcal · 180 proteína · 2,5 agua).
- **Comidas del día** como **tarjetas expandibles**: cada una con bubble de icono, nombre, hora,
  kcal grande + chips de macros `P/C/G`; al expandir, la lista de alimentos con ración y kcal por
  alimento. La Comida y la Cena muestran su receta; el Pre-entreno su swap.
- **Footer pegajoso** con el **total del día**: `2.250 kcal · plan al 100 %` + macros `180/225/70`.
- Solo lectura: "el plan lo hizo verxion; aquí lo lees y, si quieres cambiarlo, se lo pides al agente".

---

## Pantalla 7 · DETALLE DE DÍA DEL DIARIO — `dia-diario-core.jsx`
**Entrada:** `Verxion Native - Detalle de día del diario.html`. `buildDiaDiario(t)` (tweak `dia` =
slug) → `vxDiaryDay(slug)` → `vxSynthDiaryDay`. Espejo del "Detalle de sesión". El informe
**persistido y de SOLO LECTURA** de un día de dieta ya cerrado. Ver `screenshots/09-detalle-dia-diario.png`.

- **Chrome** atrás + "Día del diario" + "···".
- **Hero** "DÍA REGISTRADO · Definición · 2.250 kcal": fecha grande ("Jueves · 28 may"),
  clasificación del día (chip por adherencia: **Día clavado** ≥95 verde / **En objetivo** ≥90 /
  **Día correcto** ≥82 amber / **Por debajo** rojo), y `kcal reales / objetivo`.
- **Tabs**: **Consumido** | **Macros del día**.
- **Consumido**: **anillo kcal real** (2.060) con delta vs objetivo ("190 kcal por debajo") +
  barras de macros reales `valor/objetivo g` con `%`. **KPIs**: adherencia (86 %), agua (1,9 L),
  comidas (5). **EL DÍA · COMIDAS**: desglose por comida con kcal y macros reales (escalados a los
  totales del día); las comidas con swap muestran el cambio que registró el agente.
- **Macros del día**: reparto proteína/carbos/grasa (% de kcal) + el **recap del agente** (informe
  del día). Si un día tiene PR/estrella, se marca. Corregir un registro = petición al agente.

---

## Interacciones & comportamiento
- **Navegación** (`nav.jsx`, `vxNav(VX.X)` = `location.href`): el prototipo navega entre páginas
  HTML. En el codebase → navegación de stack nativa (slide). Rutas:
  `NUTRICION · DIETAS · DIETA · COMIDA · ALIMENTO · PLAN_COMIDAS · DIA_DIARIO`. Parámetros (slug de
  dieta/comida/alimento/día) se pasan por query (`?dieta=…&comida=…`); `vxReadParams` los lee.
- **Control segmentado** (`NSelector`, tabs de detalle): thumb deslizante `left/width .22s
  cubic-bezier(0.2,0.8,0.2,1)`. El segmento activo se lee de tweak/estado; el body se monta según él.
- **Hojas modales** (`.n-sheet` / `.dz-sheet`): scrim `rgba(8,8,10,0.62)` + blur, slide-up
  `.26s`, grab handle, header + body scroll. Usadas para filtros, orden y selección de dieta.
- **Menús desplegables** (`.n-rmenu`): pop `.16s` con `transform-origin` según lado, backdrop click-out.
- **Selector de periodo / métrica** (Diario): cambia la serie de la gráfica y los labels del eje.
- **Reveal progresivo** del feed de Diario al hacer scroll (spinner `.n-feedspin`).
- **Toggle 100 g / ración** (Detalle de alimento): reescala kcal/macros/micros.
- **Tarjetas expandibles** (Plan de comidas, feed): abren/cierran su desglose con caret.
- **Hover/press**: cards añaden `var(--vx-border-2)` o borde lava; botones lava brillan a
  `--vx-lava-hover`; press `:active { opacity: 0.8 }` (espejo de `active:opacity-80` de NativeWind).
- **Animaciones** gateadas por `prefers-reduced-motion` (pulsos de "ahora", parpadeo del punto
  vivo, slide-ups, anillos). Sin bounce. Transiciones 140–260ms.

## State management
- **Datos**: todo deriva de `comidas-data.jsx` + `dietas-data.jsx` (cero estado de servidor en el
  prototipo). En producción son lecturas de API/MCP; las derivaciones (`vxExpandMeals`,
  `vxDeriveCF`, `vxSynthDiaryDay`, `vxDietTotals`) son **cliente**, puras y sin escritura.
- **Estado de vista** (local, no dato de dominio): segmento activo, filtros/orden de Alimentos,
  filtro/orden del Diario, hoja/menú abierto, periodo/métrica de la gráfica, toggle 100g/ración,
  tarjetas expandidas. Todo efímero salvo lo que el prototipo pasa por query para deep-link.
- **Tweaks** (solo prototipo, `tweaks-panel.jsx`): `dietState` (active/fresh/empty), `moment`
  (morning/afternoon/night), `segment` (plan/diario/alimentos), `weekViz` (bar/ring), `agentPulse`,
  `orden`. **No** existen en el codebase — son para explorar estados en el prototipo.

## Design tokens (anclados a `assets/colors_and_type.css`)
- **Acento lava** `--vx-lava` #FF6262 (+ `--vx-lava-hover`, `--vx-lava-press`, `--vx-lava-bg`
  tinte). Único acento de marca; CTAs, comida activa, badges de receta, segmento activo.
- **Macros (vocabulario de toda la app):** Proteína = lava `--vx-lava` · Carbos = body/cyan
  `--vx-body` #00D2FF (`--vx-body-bg`) · Grasa = neutral/amber `--vx-neutral` #FFB900 (`--vx-neutral-bg`).
- **Semánticos:** **verde "al alza / en objetivo / hecho"** `--vx-up` #5FE39A (+ `--vx-up-2`
  #2ECC71, `--vx-up-tint`, `--vx-up-line`) — adherencia buena, días clavados, dietas completadas.
  `--good` = alias local de `--vx-up`. **rojo** `--vx-health` #FF4757 — días por debajo. **insight/
  morado** `--vx-insight` #9B59B6 (`--vx-insight-bg`) — suplementos y alimentos "Creado por ti".
- **Superficies:** screen `#050507`/`#0a0a0c` · card `#1C1C1E`. **Glass local:** `--glass-fill:
  rgba(255,255,255,0.06)`, `--glass-stroke: rgba(255,255,255,0.12)`, `--glass-hi: inset 0 1px 0 0
  rgba(255,255,255,0.20), inset 0 0 0 1px rgba(255,255,255,0.05)`.
- **Radial blooms** de fondo (lava + cyan + amber, blur ~50px) en el shell de cada pantalla.
- **Tipografía:** Geist Sans (UI, headlines, numerales grandes — `letter-spacing` −0.02…−0.05em) ·
  Geist Mono (body, labels `UPPERCASE` con tracking 0.06–0.12em).
- **Radios:** tarjetas/filas 14–16px · hero 20–24px · hojas 26px · inputs 14px · pills 9999px (botones).
- **Motion:** `--ease: cubic-bezier(0.2,0.8,0.2,1)`, 140–260ms, sin bounce; gateado por
  `prefers-reduced-motion`.

## Assets
- `assets/colors_and_type.css` — todos los tokens `--vx-*` (incluido el bloque `--vx-up` y los
  semánticos de macros). **La hoja canónica del design system vive en otro proyecto**; ésta es la
  copia que usa el prototipo.
- `assets/verxion-isotype.png` — isotipo lava, usado con `glow` en notas del agente y heroes
  (componente `Isotype` en `icons.jsx`). En el codebase usar el isotipo del brand system.
- **Iconos**: redibujados estilo **Lucide** (stroke 2, currentColor, sin relleno) como SVG inline
  sobre `<Svg>` de `icons.jsx`. En producción usar `lucide-react-native`. Nombres usados:
  sunrise, coffee, utensils, apple, moon, pill, droplet, flame, target, trophy, trendUp, repeat,
  swap, layers, bolt, chef, database, leaf, sparkle, star, search, sort, clock, more.
- **Sin fotos, sin ilustraciones, sin emoji.** Los anillos/gráficas son SVG generados.

## Screenshots (`screenshots/`)
Capturas de referencia de alta fidelidad (marco iOS del prototipo):
- `01-nutricion-plan.png` — landing, segmento **Plan** (hero de dieta + intake + macros + hidratación).
- `02-nutricion-diario.png` — landing, segmento **Diario** (analítica de adherencia + KPIs + feed).
- `03-nutricion-alimentos.png` — landing, segmento **Alimentos** (buscador + chips + lista de alimentos).
- `04-dietas.png` — **Dietas**: activa + archivo + ask-agent.
- `05-detalle-dieta.png` — **Detalle de dieta**: stats + espina de comidas (con receta y swap).
- `06-detalle-comida.png` — **Detalle de comida**: anillo + alimentos + ver receta + ask-agent.
- `07-detalle-alimento.png` — **Detalle de alimento**: tab Nutrición, anillo + micros + historial.
- `08-plan-comidas-dia.png` — **Plan de comidas del día**: comidas expandibles + total pegajoso.
- `09-detalle-dia-diario.png` — **Detalle de día del diario**: informe persistido de un día cerrado.

## Files (en este bundle)
**Pantallas (entradas HTML):**
- `Verxion Native - Nutrición.html` — landing de 3 segmentos. **Entrada principal.**
- `Verxion Native - Dietas.html` · `Verxion Native - Detalle de dieta.html`
- `Verxion Native - Detalle de comida.html` · `Verxion Native - Detalle de alimento.html`
- `Verxion Native - Plan de comidas del día.html` · `Verxion Native - Detalle de día del diario.html`

**Core (modelo + componentes por pantalla):**
- `nutricion-core.jsx` — modelo del landing + hero/intake/hidratación/espina/nota del agente.
- `nutricion-library.jsx` — `DiarioView` + `AlimentosView` + hojas + `NSelector` + tab bar + `NutricionScreen`.
- `dietas-core.jsx` — biblioteca de dietas por estado.
- `dieta-detalle-core.jsx` — metadatos de dieta + espina de comidas.
- `comida-detalle-core.jsx` — metadatos de comida + alimentos.
- `alimento-core.jsx` — ficha de alimento / receta.
- `plan-comidas-core.jsx` — el plan del día comida a comida.
- `dia-diario-core.jsx` — informe persistido de un día cerrado.

**Datos (fuente de verdad — leer primero):**
- `comidas-data.jsx` — el día (`VX_DIET`, `VX_MEAL_SPECS`, `VX_SUPPS`, `VX_DIARY_*`) + biblioteca
  (`VX_FOODS`, `VX_RECIPES`, `VX_LIBRARY`) + derivaciones.
- `dietas-data.jsx` — catálogo de dietas (`VX_DIETS`, `DZ_GOAL`, `DZ_STATE`) + helpers.

**Soporte / infra del prototipo (NO son parte del producto):**
- `ios-frame.jsx` — marco iOS (bezel + status bar). Solo prototipo.
- `tweaks-panel.jsx` — panel de tweaks. Solo prototipo.
- `nav.jsx` — navegación por `location.href` + `vxReadParams`. En el codebase → stack nativo.
- `icons.jsx` — `<Svg>`, set de iconos estilo Lucide, `Isotype`, `Wordmark`.
- `assets/colors_and_type.css`, `assets/verxion-isotype.png`.

> **Nota técnica:** los prototipos cargan los `.jsx` vía `<script type="text/babel" src=...>`.
> Cada archivo exporta sus componentes/datos a `window` al final (el scope no se comparte entre
> scripts Babel). Orden de carga: `ios-frame → icons → tweaks-panel → nav → comidas-data →
> dietas-data → [core de la pantalla]`.

> **Relacionado (no incluido aquí):** la variante `nutri` de `share-cards.jsx` ("Día de dieta")
> genera un asset de compartir de un día de dieta — vive con los assets de **Compartir**, no en
> este bundle.
