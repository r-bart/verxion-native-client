// comida-detalle-core.jsx — "Detalle de comida": los metadatos de UNA comida del
// plan + la lista de sus alimentos (cada uno abre su detalle). Espejo del
// "Detalle de día de entreno". Solo lee: cambiar la comida es una petición al
// agente. buildComida(t) lee dieta+comida de comidas-data/dietas-data.

const CmIcon = {
  clock:    (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>,
  repeat:   (p) => <Svg {...p}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></Svg>,
  layers:   (p) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" /></Svg>,
  bolt:     (p) => <Svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" /></Svg>,
  target:   (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  swap:     (p) => <Svg {...p}><path d="M8 3L4 7l4 4M4 7h12M16 21l4-4-4-4M20 17H8" /></Svg>,
  chef:     (p) => <Svg {...p}><path d="M7 21h10M6 16h12M8 16V9a4 4 0 1 1 5-3.9A3.5 3.5 0 1 1 16 9v7" /></Svg>,
  more:     (p) => <Svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
};
const CM_MACRO_COL = { p: "var(--vx-lava)", c: "var(--vx-body)", f: "var(--vx-neutral)" };
const cmN = (n) => Number(Math.round(n)).toLocaleString("de-DE");

function buildComida(t) {
  const dietSlug = t.dieta || (typeof vxActiveDiet !== "undefined" ? vxActiveDiet().slug : "definicion-2250");
  const { diet, meal, idx, total } = vxDietMeal(dietSlug, t.comida || "comida");
  const pK = meal.p * 4, cK = meal.c * 4, fK = meal.f * 9, mT = pK + cK + fK || 1;
  const macros = [
    { key: "p", label: "Proteína", g: meal.p, kc: pK, pct: Math.round(pK / mT * 100) },
    { key: "c", label: "Carbos",   g: meal.c, kc: cK, pct: Math.round(cK / mT * 100) },
    { key: "f", label: "Grasa",    g: meal.f, kc: fK, pct: Math.round(fK / mT * 100) },
  ];
  return { diet, meal, idx, total, macros, active: diet.state === "active" };
}

function CmBubble({ color, bg, size = 44, glow, children }) {
  return (
    <span className="cm-bubble" style={{ width: size, height: size, color, background: bg,
      boxShadow: glow ? `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 22px ${glow}` : undefined }}>{children}</span>
  );
}

// anillo de macros de la comida (proteína · carbos · grasa por aporte calórico)
function CmRing({ macros, size = 70, sw = 8 }) {
  const r = (size - sw) / 2, c = size / 2, len = 2 * Math.PI * r;
  const mT = macros.reduce((a, m) => a + m.kc, 0) || 1, gap = 2.5;
  const cols = { p: "var(--vx-lava)", c: "var(--vx-body)", f: "var(--vx-neutral)" };
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", display: "block" }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={sw} />
      {macros.map((m) => {
        const frac = m.kc / mT, dash = Math.max(0, frac * len - gap), col = cols[m.key];
        const el = frac > 0.004 ? (
          <circle key={m.key} cx={c} cy={c} r={r} fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={`${dash} ${len - dash}`} strokeDashoffset={-acc * len}
            style={{ filter: `drop-shadow(0 0 5px ${col})` }} />
        ) : null;
        acc += frac;
        return el;
      })}
    </svg>
  );
}

// ── HERO de la comida ─────────────────────────────────────────────────────────
function CmHero({ model }) {
  const { diet, meal, idx, total, macros } = model;
  const Ico = (typeof DZ_MEAL_ICON !== "undefined" && DZ_MEAL_ICON[meal.icon]) || CmIcon.layers;
  return (
    <div className="cm-hero">
      <div className="cm-hero__top">
        <span className="cm-eyebrow" style={{ color: "var(--vx-lava)" }}>
          {meal.key ? "COMIDA PRINCIPAL" : "COMIDA " + (idx + 1)}
        </span>
        <span className="cm-hero__ctx"><CmIcon.repeat size={12} /> {diet.name.split(" · ")[0]} · {idx + 1}/{total}</span>
      </div>
      <div className="cm-hero__row">
        <CmBubble color="var(--vx-lava)" bg="var(--vx-lava-bg)" size={52} glow="rgba(255,98,98,0.30)"><Ico size={26} /></CmBubble>
        <div style={{ minWidth: 0 }}>
          <div className="cm-hero__name">{meal.name}</div>
          <div className="cm-hero__time"><CmIcon.clock size={12} /> {meal.time}</div>
        </div>
      </div>
      <div className="cm-hero__intake">
        <div className="cm-hero__ring" style={{ width: 70, height: 70 }}>
          <CmRing macros={macros} />
          <div className="cm-hero__ringc"><b>{cmN(meal.kcal)}</b><em>kcal</em></div>
        </div>
        <div className="cm-hero__macros">
          {macros.map((m) => (
            <div className="cm-macro" key={m.key}>
              <div className="cm-macro__head">
                <span style={{ color: CM_MACRO_COL[m.key] }}>{m.label}</span>
                <span>{cmN(m.g)}<em>g · {m.pct}%</em></span>
              </div>
              <div className="cm-bar"><div className="cm-bar__fill" style={{ width: m.pct + "%", background: CM_MACRO_COL[m.key], color: CM_MACRO_COL[m.key] }} /></div>
            </div>
          ))}
        </div>
      </div>
      {meal.swap && (
        <div className="cm-hero__swap">
          <CmIcon.swap size={13} /> El agente cambió <b>{meal.swap.from}</b> · {meal.swap.why}
        </div>
      )}
    </div>
  );
}

// ── fila de alimento (abre el detalle de alimento) ───────────────────────────
function CmFood({ it, idx }) {
  return (
    <button className="cm-food" onClick={() => it.slug && vxNav(VX.ALIMENTO, { item: it.slug })} disabled={!it.slug}>
      <span className="cm-food__n">{idx}</span>
      <span className="cm-food__dot" style={{ background: CM_MACRO_COL[it.lead] }} />
      <div className="cm-food__body">
        <div className="cm-food__name">{it.name}</div>
        <div className="cm-food__macros">
          <span style={{ color: "var(--vx-lava)" }}>{cmN(it.p)} P</span>
          <span style={{ color: "var(--vx-body)" }}>{cmN(it.c)} C</span>
          <span style={{ color: "var(--vx-neutral)" }}>{cmN(it.f)} G</span>
        </div>
      </div>
      <div className="cm-food__right">
        <span className="cm-food__qty">{it.qty}</span>
        <span className="cm-food__kcal">{cmN(it.kcal)} kcal</span>
      </div>
      <Icon.chevronRight size={16} style={{ color: "rgba(255,255,255,0.26)", flexShrink: 0, alignSelf: "center" }} />
    </button>
  );
}

function CmAskAgent() {
  return (
    <button className="cm-ask" onClick={() => vxNav(VX.AGENTE, { caso: "inicio" })}>
      <span className="cm-ask__iso"><Isotype size={20} glow /></span>
      <div className="cm-ask__body">
        <div className="cm-ask__label">Cambia esta comida con el agente</div>
        <div className="cm-ask__hint">El plan es de solo lectura — para sustituir un alimento o ajustar raciones, díselo a verxion.</div>
      </div>
      <span className="cm-ask__c">›</span>
    </button>
  );
}

// ── pantalla ────────────────────────────────────────────────────────────────
function ComidaDetalleScreen({ t }) {
  const model = buildComida(t);
  const { diet, meal, active } = model;
  return (
    <div className="cm-screen">
      <div className="cm-scroll">
        <div className="cm-chrome">
          <button className="cm-chrome__btn" aria-label="Volver" onClick={() => vxNav(VX.DIETA, { dieta: diet.slug })}><Icon.chevronLeft size={20} /></button>
          <div className="cm-chrome__title">{meal.name}</div>
          <button className="cm-chrome__btn" aria-label="Más"><CmIcon.more size={20} /></button>
        </div>

        <div className="cm-pad">
          <CmHero model={model} />

          {active && meal.items.length > 0 ? (
            <>
              <div className="cm-sec">
                <span className="cm-sec__k">Alimentos</span>
                <span className="cm-sec__count">{meal.items.length} · en la ración del plan</span>
                <span className="cm-sec__line" />
              </div>
              <div className="cm-list">
                {meal.items.map((it, i) => <CmFood key={i} it={it} idx={i + 1} />)}
              </div>
              {meal.recipe && (
                <button className="cm-recipe" onClick={() => vxNav(VX.ALIMENTO, { item: meal.recipe })}>
                  <CmIcon.chef size={15} />
                  <span>Ver receta · ingredientes y pasos</span>
                  <span className="cm-recipe__c">›</span>
                </button>
              )}
            </>
          ) : (
            <div className="cm-archived">
              <CmIcon.layers size={22} />
              <div className="cm-archived__t">Plan archivado</div>
              <div className="cm-archived__d">Esta comida pertenece a una dieta cerrada. Conservamos sus macros, pero no el desglose por alimento.</div>
            </div>
          )}

          <CmAskAgent />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  CmIcon, CM_MACRO_COL, cmN, buildComida, CmBubble, CmRing, CmHero, CmFood, CmAskAgent, ComidaDetalleScreen,
});
