// plan-comidas-core.jsx — "Plan de comidas del día" (espejo de prescripcion-core).
// El puente entre "Nutrición" y comer: antes que nada, ves lo que toca hoy —
// la dieta que armó el agente, comida a comida, con sus alimentos y macros.
// Read-only-first: el plan lo hizo verxion; aquí lo lees y, si quieres cambiarlo,
// se lo pides al agente. buildPlanComidas(t). Usa comidas-data.jsx.

// ── iconos (lucide-style, stroke 2) sobre <Svg> de icons.jsx ────────────────
const CIcon = {
  sunrise:  (p) => <Svg {...p}><path d="M12 3v3M5.6 9.6l-1.4-1.4M18.4 9.6l1.4-1.4M3 16h2M19 16h2M8 16a4 4 0 0 1 8 0M2 20h20M7.5 12.5 12 8l4.5 4.5" /></Svg>,
  coffee:   (p) => <Svg {...p}><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9ZM17 10h2.5a2.5 2.5 0 0 1 0 5H17M8 2c-.5 1 .5 2 0 3M12 2c-.5 1 .5 2 0 3" /></Svg>,
  utensils: (p) => <Svg {...p}><path d="M4 3v6a2 2 0 0 0 2 2v10M6 3v8M9 3v6a2 2 0 0 1-2 2M18 3c-1.5 1-2 3-2 5s.5 3 2 3v10" /></Svg>,
  apple:    (p) => <Svg {...p}><path d="M12 7c-1.5-2-5-2.5-6.5-.5C3.5 9 4 14 6 17c1 1.5 2 2.5 3.2 2 .9-.4 1.7-.4 2.6 0 1.2.5 2.2-.5 3.2-2 1.3-2 1.9-4.7 1.4-7M12 7c0-2 1.2-3.4 3-4M12 7c-.3-1.4-1-2.3-2-3" /></Svg>,
  moon:     (p) => <Svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Svg>,
  pill:     (p) => <Svg {...p}><path d="M10.5 20.5a4.95 4.95 0 0 1-7-7l6-6a4.95 4.95 0 0 1 7 7l-6 6ZM8.5 8.5l7 7" /></Svg>,
  swap:     (p) => <Svg {...p}><path d="M8 3L4 7l4 4M4 7h12M16 21l4-4-4-4M20 17H8" /></Svg>,
  chef:     (p) => <Svg {...p}><path d="M7 21h10M6 16h12M8 16V9a4 4 0 1 1 5-3.9A3.5 3.5 0 1 1 16 9v7" /></Svg>,
  clock:    (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>,
  layers:   (p) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" /></Svg>,
  bolt:     (p) => <Svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" /></Svg>,
  repeat:   (p) => <Svg {...p}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></Svg>,
  target:   (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  droplet:  (p) => <Svg {...p}><path d="M12 2.7l5.3 6.6a6.7 6.7 0 1 1-10.6 0Z" /></Svg>,
  more:     (p) => <Svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
};
const C_MEAL_ICON = { sunrise: CIcon.sunrise, coffee: CIcon.coffee, utensils: CIcon.utensils, apple: CIcon.apple, moon: CIcon.moon };

// ── modelo ───────────────────────────────────────────────────────────────────
function buildPlanComidas(t) {
  const ajuste = t.ajuste !== false;                 // el agente sugirió un cambio
  const meals = vxExpandMeals();
  const supps = VX_SUPPS;
  const diet = VX_DIET;

  // totales del día (suma de comidas)
  const tot = ["kcal", "p", "c", "f"].reduce((o, k) => (o[k] = meals.reduce((a, m) => a + m[k], 0), o), {});

  const note = "Semana 3 de definición, vas en objetivo. El reparto de hoy carga la proteína en comida y cena (salmón y pollo) y deja los carbos alrededor del entreno. Mantén el déficit y bebe los 2,5 L.";

  return { ajuste, meals, supps, diet, tot,
    summary: { comidas: meals.length, kcal: tot.kcal, prot: tot.p, agua: diet.waterGoal },
    note };
}

// ── bubble ───────────────────────────────────────────────────────────────────
function CBubble({ color, bg, size = 44, glow, children }) {
  return (
    <span className="c-bubble" style={{ width: size, height: size, color, background: bg,
      boxShadow: glow ? `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 22px ${glow}` : undefined }}>
      {children}
    </span>
  );
}

// ── hero del día ──────────────────────────────────────────────────────────────
function CHero({ model }) {
  const { diet, summary } = model;
  return (
    <div className="c-hero">
      <div className="c-hero__top">
        <div className="c-eyebrow" style={{ color: "var(--vx-lava)" }}>HOY · DIETA</div>
        <div className="c-hero__ctx"><CIcon.repeat size={12} /> {diet.goal} · sem {diet.week}/{diet.weeks}</div>
      </div>
      <div className="c-hero__row">
        <CBubble color="var(--vx-lava)" bg="var(--vx-lava-bg)" size={52} glow="rgba(255,98,98,0.30)"><CIcon.utensils size={26} /></CBubble>
        <div style={{ minWidth: 0 }}>
          <div className="c-hero__name">{diet.name}</div>
          <div className="c-hero__focus">{diet.macroSplit}</div>
        </div>
      </div>
      <div className="c-hero__stats">
        <div className="c-stat"><CIcon.layers size={14} /><b>{summary.comidas}</b><span>comidas</span></div>
        <div className="c-stat"><CIcon.bolt size={14} /><b>{vxKcal(summary.kcal)}</b><span>kcal</span></div>
        <div className="c-stat"><CIcon.target size={14} /><b>{Math.round(summary.prot)}</b><span>g proteína</span></div>
        <div className="c-stat"><CIcon.droplet size={14} /><b>{summary.agua.toLocaleString("de-DE", { minimumFractionDigits: 1 })}</b><span>L agua</span></div>
      </div>
    </div>
  );
}

// ── nota del agente ───────────────────────────────────────────────────────────
function CAgentNote({ msg }) {
  return (
    <div className="c-agent">
      <span className="c-agent__mark"><Isotype size={22} glow /></span>
      <div>
        <div className="c-agent__from">verxion · plan de hoy</div>
        <div className="c-agent__msg">{msg}</div>
      </div>
    </div>
  );
}

// ── tarjeta de comida (la prescripción) ───────────────────────────────────────
const MACRO_COL = { p: "var(--vx-lava)", c: "var(--vx-body)", f: "var(--vx-neutral)" };
function CMealCard({ meal, idx, swapped }) {
  const Ico = C_MEAL_ICON[meal.icon] || CIcon.utensils;
  return (
    <div className={"c-meal" + (meal.key ? " is-key" : "") + (swapped ? " is-swap" : "")}>
      <div className="c-meal__head">
        <CBubble color="var(--vx-lava)" bg="var(--vx-lava-bg)" size={40}><Ico size={20} /></CBubble>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="c-meal__name">
            {meal.name}
            {meal.key && <span className="c-meal__keytag">principal</span>}
          </div>
          <div className="c-meal__time"><CIcon.clock size={11} /> {meal.time}</div>
        </div>
        <div className="c-meal__kcal">
          <span>{vxKcal(meal.kcal)}</span>
          <em>kcal</em>
        </div>
      </div>

      <div className="c-meal__macros">
        {[["p", "P"], ["c", "C"], ["f", "G"]].map(([k, lbl]) => (
          <span className="c-mq" key={k} style={{ color: MACRO_COL[k] }}>
            <b>{Math.round(meal[k])}</b>{lbl}
          </span>
        ))}
      </div>

      {swapped && (
        <div className="c-meal__swap">
          <CIcon.swap size={12} /> El agente cambió <b>{swapped.from}</b> · {swapped.why}
        </div>
      )}

      <div className="c-meal__foods">
        {meal.items.map((it, i) => (
          <div className="c-food" key={i}
            onClick={() => it.slug && vxNav(VX.ALIMENTO, { item: it.slug })}
            style={{ cursor: it.slug ? "pointer" : "default" }}>
            <span className="c-food__dot" style={{ background: MACRO_COL[it.lead] }} />
            <span className="c-food__name">{it.name}</span>
            <span className="c-food__qty">{it.qty}</span>
            <span className="c-food__kcal">{vxKcal(it.kcal)} kcal</span>
          </div>
        ))}
      </div>

      {meal.recipe && (
        <button className="c-meal__recipe" onClick={() => vxNav(VX.ALIMENTO, { item: meal.recipe })}>
          <CIcon.chef size={14} />
          <span>Ver receta · ingredientes y pasos</span>
          <span className="c-meal__recipe__c">›</span>
        </button>
      )}
    </div>
  );
}

// ── suplementos (tira compacta) ────────────────────────────────────────────────
function CSupps({ supps }) {
  return (
    <div className="c-supps">
      {supps.map((s) => (
        <div className="c-supp" key={s.id}>
          <CBubble color="var(--vx-insight)" bg="var(--vx-insight-bg)" size={34}><CIcon.pill size={16} /></CBubble>
          <div className="c-supp__body">
            <div className="c-supp__name">{s.name}</div>
            <div className="c-supp__time">{s.time}</div>
          </div>
          <span className="c-supp__tag">{s.tag}</span>
        </div>
      ))}
    </div>
  );
}

// ── superficie de edición read-only ────────────────────────────────────────────
function CAgentEdit({ label = "Ajustar esta dieta con el agente", hint = "El plan es de solo lectura — los cambios los hace verxion." }) {
  return (
    <button className="c-edit" onClick={() => vxNav(VX.AGENTE, { caso: "inicio" })}>
      <span className="c-edit__iso"><Isotype size={20} glow /></span>
      <div className="c-edit__body">
        <div className="c-edit__label">{label}</div>
        <div className="c-edit__hint">{hint}</div>
      </div>
      <span className="c-edit__c">›</span>
    </button>
  );
}

Object.assign(window, {
  CIcon, C_MEAL_ICON, buildPlanComidas, CBubble, CHero, CAgentNote, CMealCard, CSupps, CAgentEdit, MACRO_COL,
});
