# Thought — Sección "Agente": Generative UI + BYOK en React Native

**Fecha:** 2026-06-03
**Estado:** Exploración de arquitectura (pre-código)
**Contexto:** Verxion Native Client (Expo 56, NativeWind v4, Clean Architecture + DDD, read-only + 3 micro-writes)

---

## La idea

Una sección principal "Agente" en el cliente que dé una experiencia tipo ChatGPT/Claude
pero **mejor**, porque esos agentes están limitados por un harness flojo. El agente dibuja
UI en tiempo real desde lo que el usuario pide (no describe una tabla: la muestra), usando
el design system propio. Crecerá con el tiempo; no tiene que ser perfecto de primeras.

Disparadores de la investigación:
- Artículo "Generative UI Is the New Frontend" (3 patrones + stack de protocolos).
- Referencias: json-render.dev, CopilotKit (demo RN).

---

## Conclusión central

**Arrancar: BYOK-direct + harness client-side + A2UI Declarative + prompt caching.**
Sin backend LLM. El tier local (modelo on-device) es fase 2.

---

## 1. El modelo local: techo de viabilidad

- **Gemma 14B: inviable** en iPhone (≈8 GB de pesos a 4-bit; iOS mata el proceso).
- **8B: borderline** (~4.5-5 GB RAM, solo gama alta, lento, throttling). No es base de UX.
- **Sí viable on-device:** Gemma 3 1B/4B, Llama 3.2 1B/3B, Phi-3.5-mini (4-bit, ~0.7-2.5 GB).
- **Runtimes RN:** `llama.rn` (llama.cpp, **soporta GBNF grammars** ← clave), `react-native-executorch`
  (Software Mansion), MLC LLM, Apple Foundation Models (iOS 26+, ~3B, fijo).
- **No bundlear el modelo** (App Store no acepta .ipa de GBs): descargar GGUF en primer arranque.
- Requiere **custom dev client + EAS** (nada de Expo Go).

## 2. "MCP en local" — ojo en iOS

- iOS **no permite fork de procesos** → **transporte stdio no existe**. "MCP local" en device se
  reduce a SDK con transport in-memory o, más simple, **registrar tools como funciones JS**.
- **Encaje con nuestra arquitectura:** las tools del agente **= nuestros Use Cases**. El loop
  resuelve una tool-call invocando `container.<uc>.execute()`. Respeta la regla de dependencias.
- MCP "de verdad" queda en el lado servidor (ya existe el MCP server `claude_ai_verxion`).

## 3. Generative UI — los 3 patrones mapeados a RN

> Los **protocolos** (MCP / AG-UI / A2UI) son portables a RN. La **librería cliente** de
> CopilotKit es React DOM y en gran parte NO sirve → adoptamos protocolos, escribimos el renderer.

| Patrón | En RN | Veredicto |
|---|---|---|
| **Controlled** | registry `toolName → <MetricCard/>`. Aplica el "token tax" (~400 tok/componente por turno). | ✅ Para los top 3-5 flujos pixel-perfect. |
| **Declarative (A2UI)** | agente emite `a2ui_operations` (create_surface → update_components → update_data_model); catálogo = definitions (Zod) + renderers RN. A2UI es JSON → "React, Svelte, Flutter, anything". Tokens planos al crecer. | ✅✅ **Default.** |
| **Open-ended (HTML/iframe)** | RN no tiene DOM/iframe; solo `react-native-webview` → adiós NativeWind/design system, sandbox distinto, jank. | ❌ Solo escape-hatch desechable. |

**Árbol de decisión:** Declarative por defecto → Controlled para lo que debe ser exacto → Open-ended nunca.

## 4. El insight unificador: el catálogo A2UI es UN solo contrato

```
   Tier SERVIDOR (Claude/ADK, AG-UI/SSE) ─┐
                                          ├─► a2ui_operations (JSON) ─► A2UISurfaceRenderer (RN)
   Tier LOCAL (Gemma 4B, GBNF grammar) ───┘     el catálogo es el contrato     node.type → componente
```

- El **catálogo** define los componentes permitidos + Zod de props.
- Del catálogo se **deriva una GBNF grammar** → el modelo local emite A2UI válido de forma fiable
  (constrained decoding resuelve el "el modelo elige el componente equivocado").
- **Un solo renderer** pinta ambos tiers. El usuario no sabe cuál respondió.

## 5. BYOK reescribe la arquitectura (lo que cambió la conversación)

"API key" = **BYOK** (key del usuario), no nuestra key embebida (eso sí sería anti-patrón).

- El tier servidor existía **solo** para custodiar la key. Con BYOK → llamadas **directas a Claude
  desde el dispositivo** → **cero backend LLM**.
- El **harness corre client-side en JS y aun así es fuerte**, porque razona Claude (key del usuario),
  no un 4B. El harness es solo el loop; vive en `application`.

```
Reasoning = Claude vía key del usuario (fuerte)
Harness   = loop client-side en RunAgentTurnUseCase
Tools     = Use Cases existentes (leer Verxion + 3 writes)
Gen UI    = catálogo A2UI
Backend LLM = NINGUNO  (el backend Verxion sigue siendo solo API de datos)
```

- **Posicionamiento build-in-public:** "tu key llama a Anthropic directamente, nosotros nunca la vemos".
- **RN no tiene CORS** (no hay navegador) → `expo/fetch` va directo a la API de Anthropic;
  el header `anthropic-dangerous-direct-browser-access` no hace falta.

### Seguridad BYOK
- `expo-secure-store` (Keychain). Nunca AsyncStorage, nunca en el bundle, nunca en logs.
- **Redactar la key en telemetría** (PostHog está conectado: que no entre en ningún evento/breadcrumb/crash).
- **Validar al pegarla** (llamada barata) antes de guardar.
- Acceso a la key = concern de infraestructura (`AnthropicAgentRepository` la lee; el UC nunca la ve).

### Coste → refuerza Declarative + prompt caching
- Con BYOK **el usuario paga cada token** → el "token tax" de Controlled sale de su bolsillo →
  razón de más para A2UI Declarative (tokens planos).
- **Prompt caching** del system prompt + tool defs + catálogo (estables entre turnos) → cache hit →
  factura del usuario baja ~90% en tokens cacheados. No es opcional.

## 6. Tier local: cuándo sigue valiendo (fase 2)

Con BYOK-direct ya no es "ahorrar servidor", sino: **offline**, **privacidad total**, **latencia cero**
en intents triviales sin gastar tokens. Mismo catálogo, mismo renderer. BYOK-Claude = smart path;
local = fast/free path.

## 7. Restricción read-only respetada

Componentes A2UI interactivos mandan un *action* de vuelta → el agente decide qué renderizar
("zero click handlers"). Las actions que **leen** fluyen libres; las que **mutan** solo pueden caer
en los 3 micro-writes (peso/agua/pasos) o **deep-link a la plataforma**. El renderer enruta la action
al Use Case vía `useDI` → regla de dependencias intacta.

---

## Encaje en Clean Architecture

```
domain/agent/        A2UIOperation, UIComponentNode, Surface, ToolCall (models)
                     CatalogContract  ← definitions + Zod (fuente de la GBNF grammar)
                     IAgentPort
application/agent/   RunAgentTurnUseCase  (loop + tool dispatch a otros UCs vía container)
infrastructure/
  repositories/      AnthropicAgentRepository  → streaming expo/fetch, key desde secure-store, prompt caching
                     LocalAgentRepository      → llama.rn + GBNF derivada del catálogo  (fase 2)
presentation/agent/  A2UISurfaceRenderer (catalog renderers: type → componente RN del design system)
                     ChatScreen
app/(tabs)/agent/    index.tsx (3-5 líneas)
```

---

## Próximo paso propuesto (spike, sin dependencias externas salvo la key)

1. `CatalogContract` con 3-4 definitions (MetricCard, ChartCard, …) + Zod.
2. `A2UISurfaceRenderer` en RN que consume `a2ui_operations` y pinta con el design system.
3. `AnthropicAgentRepository` con streaming (`expo/fetch`), key desde secure-store, prompt caching.
4. `RunAgentTurnUseCase` (loop + tool dispatch a UCs).

Alternativa previa: validar primero **qué componentes del design system entran en el catálogo V1**
antes de escribir código.

---

## Decisiones abiertas

- iPhone mínimo soportado (define si el tier local 4B es realista).
- ¿Solo Anthropic en BYOK o multi-proveedor (Anthropic/OpenAI/Google)?
- Catálogo V1: qué componentes del design system.
- Fixed schema vs dynamic schema en A2UI (el agente rellena data vs un LLM secundario escribe el árbol).
