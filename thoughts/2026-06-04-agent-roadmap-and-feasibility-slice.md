# Thought — Roadmap del agente + Feasibility slice de Generative UI (para abordar mañana)

**Fecha:** 2026-06-03 (para trabajar el 2026-06-04)
**Estado:** Roadmap acordado, pre-código
**Contexto:** Verxion Native Client (Expo 56, NativeWind v4, react-native-reusables, Clean Architecture + DDD)
**Precede:** `thoughts/2026-06-03-agent-section-generative-ui-byok.md` (arquitectura del agente: A2UI + BYOK + harness client-side)

---

## Decisión central: orden risk-first, agente temprano

Se descartó el orden conservador "lecturas primero". Razón ganadora: **risk-first**, no
vistosidad. El único desconocido real del proyecto es **¿se puede hacer Generative UI en Expo?**
Todo lo demás (auth, settings, HealthKit, pantallas de lectura) es camino conocido. Por tanto
se ataca el desconocido primero, con el mínimo coste, para validar la tesis del producto pronto.

Dos argumentos que reordenaron todo (del usuario):
1. **Las lecturas ya las da el MCP remoto de Verxion** (`get_streaks`, `get_personal_records`,
   `get_progression_journey`…). BYOK-Claude las llama directo (Messages API soporta MCP connectors
   remotos) → **no hay que construir UseCases de lectura para que el agente lea**. Las pantallas
   dejan de ser prerequisito del agente; son "el resto".
2. **Build-in-public:** Auth → BYOK → HealthKit → Agente es un arco de 4 "wow" demoables (estado
   del arte). Y ser **de los primeros** en generative UI en Expo = moat + contenido.

### Caveat que se disolvió
"Construir el agente sin mockup" era falso: **los componentes del catálogo SÍ tienen mockup**
(MetricCard, ChartCard… viven en Today/Progress). Lo único sin mockup es el *chrome* del chat.
→ Se extrae una **librería de componentes de los mockups** (react-native-reusables + NativeWind),
que es **compartida**: catálogo A2UI del agente ahora + composición de las pantallas después. Cero
desperdicio.

---

## Roadmap acordado

| Fase | Qué |
|---|---|
| 1 ✅ | Auth (hecho: social Google + Apple + app shell) |
| 2 | Settings + BYOK (key en `expo-secure-store`) |
| 3 | HealthKit (`LogX` UCs + levanta custom dev client) |
| **4a** | **Feasibility slice** — stream Anthropic → render 1-2 componentes A2UI en vivo. Responde "¿se puede?" |
| 4b | Librería de componentes desde mockups (react-native-reusables + NativeWind) = catálogo |
| 4c | Agente completo (harness + lee vía MCP remoto + escribe vía `LogX`) |
| 5 | Pantallas de lectura (recomponen la librería) + modales micro-write (fallback no-key/offline) |
| 6 | Tier local (cabalga el setup nativo de la fase 3) |

Nota de escrituras (de la discusión previa): los `LogWeight/Water/Steps` UseCases se construyen en
la Fase 3 (HealthKit es el alimentador primario). HealthKit = fuente de verdad para pasos/peso/agua
(device-measured) → fluye a Verxion. Agente y modales reusan los mismos UCs. Regla de autoridad +
dedupe pendiente de definir (HealthKit autoritativo para lo que cubre; idempotencia por fecha/métrica).

---

## MAÑANA: Fase 4a — Feasibility slice

**Objetivo:** responder con el mínimo coste *"¿se puede hacer generative UI en Expo?"*. Validar el
**mecanismo de render** antes de extraer las ~30 componentes de los mockups. Fino primero, grueso
después — **no es spike desechable**: es la semilla del renderer que se queda.

### Lo que hay que demostrar
Stream de Anthropic (BYOK) → parsear `a2ui_operations` incrementales → mapear `node.type` → pintar
**1-2 componentes RN reales** (p.ej. un MetricCard) que **crecen/actualizan en vivo** según llega el
stream, **sin jank**.

### Por qué es bajo riesgo de fondo (lectura de viabilidad)
El mecanismo está probado por partes:
- **Streaming** en Expo → `expo/fetch` da `ReadableStream`. (RN no tiene CORS → llamada directa a Anthropic.)
- **JSON→componente RN** → `switch (node.type)`; React reconcilia deltas.
- **Output estructurado fiable** de Claude → `a2ui_operations` como tool schema (Claude es bueno aquí).

El desconocido real **no es "¿se puede?"** sino **UX/perf**: render incremental de árboles parciales,
estados intermedios, animaciones. Y que **inventas los patrones** (AG-UI/A2UI son web-first; no hay
copy-paste para RN).

### Alcance mínimo de la slice (a definir mañana al detalle)
1. **Contrato `a2ui_operations`** (subset): `create_surface` → `update_components` → `update_data_model`.
   Decidir el shape mínimo de `UIComponentNode` (type, props, children, dataBindings).
2. **Renderer** `A2UISurfaceRenderer`: consume las ops, mantiene el árbol, re-render en deltas.
   Empezar con 1-2 tipos (`MetricCard`, quizá `Text`/`Stack`).
3. **Setup de streaming**: cliente Anthropic vía `expo/fetch`, key desde `expo-secure-store`
   (de momento puede ser una key pegada a mano para la slice), parse SSE incremental.
4. **Fuente del stream para la slice**: mock que emita `a2ui_operations` hardcodeadas troceadas, o
   directamente Claude con un prompt que fuerce las ops. Empezar por el mock para aislar el renderer
   del LLM; luego enchufar Claude real.

### Criterio de éxito
Un MetricCard (datos reales o mock) aparece y se actualiza en vivo mientras "llega" el stream, fluido
en device. Si va bien → todo lo demás es ejecución conocida. Si da jank → ahí está el problema a
resolver antes de invertir en el catálogo.

### Encaje en Clean Architecture (recordatorio)
```
domain/agent/        A2UIOperation, UIComponentNode, Surface (models); IAgentPort
application/agent/    RunAgentTurnUseCase (loop; tools = otros UCs vía container) — aún NO en 4a
infrastructure/
  repositories/       AnthropicAgentRepository (streaming expo/fetch, key secure-store, prompt caching)
presentation/agent/   A2UISurfaceRenderer (catalog renderers: type → componente RN)
```
En 4a basta con: el renderer + el repo de streaming + el contrato de ops. El harness completo
(`RunAgentTurnUseCase`, tool dispatch, MCP remoto) viene en 4c.

---

## Preguntas abiertas para resolver mañana
- ¿Mock-first o Claude-real desde el minuto uno en la slice? (recomendado: mock para aislar el renderer).
- Shape exacto del `UIComponentNode` mínimo.
- ¿Fixed schema vs dynamic schema en A2UI? (la slice puede ser fixed).
- Auth del MCP remoto (cómo autoriza BYOK-Claude contra la sesión Better Auth) — no bloquea 4a, sí 4c.
- Regla de autoridad/dedupe HealthKit vs agente vs manual (no bloquea 4a).
