// dieta-detalle-core.jsx — "Detalle de dieta": los metadatos del plan que armó el
// agente + la espina de comidas del día (cada comida abre su detalle). Espejo del
// "Detalle de rutina". Solo lee: ajustar la dieta es una petición al agente.
// buildDietaDetalle(t). Usa dietas-data.jsx + comidas-data.jsx.

const DtIcon = {
  target:   (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  repeat:   (p) => <Svg {...p}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></Svg>,
  calendar: (p) => <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></Svg>,
  layers:   (p) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" /></Svg>,
  bolt:     (p) => <Svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" /></Svg>,
  utensils: (p) => <Svg {...p}><path d="M4 3v6a2 2 0 0 0 2 2v10M6 3v8M9 3v6a2 2 0 0 1-2 2M18 3c-1.5 1-2 3-2 5s.5 3 2 3v10" /></Svg>,
  droplet:  (p) => <Svg {...p}><path d="M12 2.7l5.3 6.6a6.7 6.7 0 1 1-10.6 0Z" /></Svg>,
  trendUp:  (p) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" /></Svg>,
  check2:   (p) => <Svg {...p}><path d="M20 6L9 17l-5-5" /></Svg>,
  swap:     (p) => <Svg {...p}><path d="M8 3L4 7l4 4M4 7h12M16 21l4-4-4-4M20 17H8" /></Svg>,
  clock:    (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>,
  more:     (p) => <Svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
};
const DT_MACRO_COL = { p: "var(--vx-lava)", c: "var(--vx-body)", f: "var(--vx-neutral)" };
const dtN = (n) => Number(Math.round(n)).toLocaleString("de-DE");
const dtL = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function buildDietaDetalle(t) {
  const slug = t.dieta || (typeof vxActiveDiet !== "undefined" ? vxActiveDiet().slug : "definicion-2250");
  const diet = vxDietBySlug(slug);
  const { meals, tot, macros } = vxDietTotals(diet);
  return { diet, meals, tot, macros, cfg: vxDietCfg(diet), st: DZ_STATE[diet.state] };
}

function DtBubble({ color, bg, size = 44, glow, children }) {
  return (
    <span className="dt-bubble" style={{ width: size, height: size, color, background: bg,
      boxShadow: glow ? `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 22px ${glow}` : undefined }}>{children}</span>
  );
}

function DtScoreChip({ state }) {
  const cls = { ahead: "ahead", on: "on", behind: "behind" }[state] || "on";
  const word = state === "ahead" ? "Vas adelantado" : state === "behind" ? "Vas justo" : "En objetivo";
  return (
    <span className={"dt-score is-" + cls}>
      {state === "ahead" && <DtIcon.trendUp size={11} />}
      {word}
    </span>
  );
}

// ── HERO ─────────────────────────────────────────────────────────────────────
function DtHero({ model }) {
  const { diet, cfg, st, tot } = model;
  const isActive = diet.state === "active";
  const isCompleted = diet.state === "completed";
  const ctx = isCompleted ? "Finalizada · " + diet.finished : "Última: " + diet.lastDay;
  return (
    <div className={"dt-hero dt-hero--" + diet.state}>
      <div className="dt-hero__top">
        <span className="dt-eyebrow" style={{ color: st.color }}>
          {isActive && <span className="dt-livedot" />}
          {st.short}
        </span>
        <span className="dt-hero__ctx">{ctx}</span>
      </div>

      <div className="dt-hero__row">
        <DtBubble color={cfg.color} bg={cfg.bg} size={52} glow={cfg.glow}>{cfg.icon({ size: 26 })}</DtBubble>
        <div style={{ minWidth: 0 }}>
          <div className="dt-hero__name">{diet.name}</div>
          <div className="dt-hero__tags">
            <span className="dt-tag" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.color + "55" }}><DtIcon.target size={11} /> {cfg.tag}</span>
            <span className="dt-hero__split"><DtIcon.utensils size={11} /> {diet.macroSplit}</span>
          </div>
        </div>
      </div>

      <div className="dt-hero__stats">
        <div className="dt-stat"><DtIcon.utensils size={14} /><b>{model.meals.length}</b><span>comidas</span></div>
        <div className="dt-stat"><DtIcon.bolt size={14} /><b>{dtN(tot.kcal)}</b><span>kcal/día</span></div>
        <div className="dt-stat"><DtIcon.target size={14} /><b>{dtN(tot.p)}</b><span>g proteína</span></div>
        <div className="dt-stat"><DtIcon.droplet size={14} /><b>{dtL(diet.waterGoal)}</b><span>L agua</span></div>
      </div>

      <div className="dt-prog">
        <div className="dt-prog__head">
          <span className="dt-prog__lbl">{isCompleted ? "Completada" : "Semana"} <b>{isCompleted ? "" : diet.week}</b>{isCompleted ? "" : " de " + diet.weeks}</span>
          {!isCompleted && <DtScoreChip state={diet.scoreState} />}
        </div>
        <div className="dt-cells">
          {Array.from({ length: diet.weeks }).map((_, i) => {
            const cls = isCompleted ? "is-done" : i < diet.week - 1 ? "is-done" : i === diet.week - 1 ? "is-now" : "";
            return <span key={i} className={"dt-cell " + cls} />;
          })}
        </div>
        <div className="dt-prog__meta">{diet.days} días registrados · <span style={{ color: "var(--vx-up)" }}>{diet.adherence}% adherencia</span></div>
      </div>
    </div>
  );
}

// ── nota del agente ───────────────────────────────────────────────────────────
function DtAgentNote({ diet }) {
  return (
    <div className="dt-agent">
      <span className="dt-agent__mark"><Isotype size={22} glow /></span>
      <div>
        <div className="dt-agent__from">verxion · {diet.state === "completed" ? "sobre esta dieta" : "sobre tu plan"}</div>
        <div className="dt-agent__msg">{diet.note}</div>
      </div>
    </div>
  );
}

// ── tarjeta de comida (abre el detalle de comida) ─────────────────────────────
function DtMealCard({ diet, meal, idx }) {
  const Ico = (typeof DZ_MEAL_ICON !== "undefined" && DZ_MEAL_ICON[meal.icon]) || DtIcon.utensils;
  return (
    <button className={"dt-meal" + (meal.key ? " is-key" : "")} onClick={() => vxNav(VX.COMIDA, { dieta: diet.slug, comida: meal.id })}>
      <DtBubble color="var(--vx-lava)" bg="var(--vx-lava-bg)" size={40}><Ico size={20} /></DtBubble>
      <div className="dt-meal__body">
        <div className="dt-meal__head">
          <span className="dt-meal__name">{meal.name}</span>
          {meal.key && <span className="dt-meal__keytag">principal</span>}
          <span className="dt-meal__time"><DtIcon.clock size={10} /> {meal.time}</span>
        </div>
        <div className="dt-meal__macros">
          <span className="dt-meal__kcal">{dtN(meal.kcal)} kcal</span>
          <span className="dt-dot">·</span>
          {[["p", "P"], ["c", "C"], ["f", "G"]].map(([k, lbl]) => (
            <span className="dt-mq" key={k} style={{ color: DT_MACRO_COL[k] }}>{dtN(meal[k])}{lbl}</span>
          ))}
        </div>
        {meal.swap && <div className="dt-meal__swap"><DtIcon.swap size={10} /> Cambio del agente · antes <b>{meal.swap.from}</b></div>}
      </div>
      <Icon.chevronRight size={16} style={{ color: "rgba(255,255,255,0.28)", flexShrink: 0, alignSelf: "center" }} />
    </button>
  );
}

// ── superficie "pídeselo al agente" ──────────────────────────────────────────
function DtAskAgent({ diet }) {
  const isCompleted = diet.state === "completed";
  const label = isCompleted ? "Pídele a verxion que la repita o la ajuste" : "Ajusta esta dieta con el agente";
  const hint = isCompleted ? "Está cerrada — el agente puede reactivarla o usarla de base."
    : "La dieta es de solo lectura. Los cambios los hace verxion vía chat.";
  return (
    <button className="dt-ask" onClick={() => vxNav(VX.AGENTE, { caso: "inicio" })}>
      <span className="dt-ask__iso"><Isotype size={20} glow /></span>
      <div className="dt-ask__body">
        <div className="dt-ask__label">{label}</div>
        <div className="dt-ask__hint">{hint}</div>
      </div>
      <span className="dt-ask__c">›</span>
    </button>
  );
}

// ── pantalla ────────────────────────────────────────────────────────────────
function DietaDetalleScreen({ t }) {
  const model = buildDietaDetalle(t);
  const { diet, meals } = model;
  return (
    <div className="dt-screen">
      <div className="dt-scroll">
        <div className="dt-chrome">
          <button className="dt-chrome__btn" aria-label="Volver" onClick={() => vxNav(VX.DIETAS)}><Icon.chevronLeft size={20} /></button>
          <div className="dt-chrome__title">{diet.name.split(" · ")[0]}</div>
          <button className="dt-chrome__btn" aria-label="Más"><DtIcon.more size={20} /></button>
        </div>

        <div className="dt-pad">
          <DtHero model={model} />

          <div className="dt-sec">
            <span className="dt-sec__k">El día · comidas</span>
            <span className="dt-sec__count">{meals.length} comidas · en orden</span>
            <span className="dt-sec__line" />
          </div>
          <div className="dt-meals">
            {meals.map((m, i) => <DtMealCard key={m.id} diet={diet} meal={m} idx={i} />)}
          </div>

          <button className="dt-diarylink" onClick={() => vxNav(VX.NUTRICION, { segment: "diario", dieta: diet.slug })}>
            <span className="dt-diarylink__l"><DtIcon.layers size={15} /> Días de esta dieta</span>
            <span className="dt-diarylink__r">{diet.days} <Icon.chevronRight size={15} /></span>
          </button>

          <DtAskAgent diet={diet} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  DtIcon, DT_MACRO_COL, dtN, dtL, buildDietaDetalle, DtBubble, DtScoreChip,
  DtHero, DtAgentNote, DtMealCard, DtAskAgent, DietaDetalleScreen,
});
