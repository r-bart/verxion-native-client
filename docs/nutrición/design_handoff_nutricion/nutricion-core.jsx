// nutricion-core.jsx — modelo + componentes del landing "Nutrición".
// Espejo de entreno-core: lidera la DIETA activa + "dónde vas hoy" (adherencia
// de kcal/macros), una nota del agente, y la ESPINA DE COMIDAS del día (el mapa
// cronológico de lo que toca comer — solo lectura). Vistas secundarias (Diario,
// Alimentos) viven en nutricion-library.jsx. buildNutricion(tweaks) → escenario.

// ── iconos (lucide-style, stroke 2) sobre <Svg> de icons.jsx ────────────────
const NIcon = {
  sunrise:  (p) => <Svg {...p}><path d="M12 3v3M5.6 9.6l-1.4-1.4M18.4 9.6l1.4-1.4M3 16h2M19 16h2M8 16a4 4 0 0 1 8 0M2 20h20M7.5 12.5 12 8l4.5 4.5" /></Svg>,
  coffee:   (p) => <Svg {...p}><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9ZM17 10h2.5a2.5 2.5 0 0 1 0 5H17M8 2c-.5 1 .5 2 0 3M12 2c-.5 1 .5 2 0 3" /></Svg>,
  utensils: (p) => <Svg {...p}><path d="M4 3v6a2 2 0 0 0 2 2v10M6 3v8M9 3v6a2 2 0 0 1-2 2M18 3c-1.5 1-2 3-2 5s.5 3 2 3v10" /></Svg>,
  apple:    (p) => <Svg {...p}><path d="M12 7c-1.5-2-5-2.5-6.5-.5C3.5 9 4 14 6 17c1 1.5 2 2.5 3.2 2 .9-.4 1.7-.4 2.6 0 1.2.5 2.2-.5 3.2-2 1.3-2 1.9-4.7 1.4-7M12 7c0-2 1.2-3.4 3-4M12 7c-.3-1.4-1-2.3-2-3" /></Svg>,
  moon:     (p) => <Svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Svg>,
  pill:     (p) => <Svg {...p}><path d="M10.5 20.5a4.95 4.95 0 0 1-7-7l6-6a4.95 4.95 0 0 1 7 7l-6 6ZM8.5 8.5l7 7" /></Svg>,
  trophy:   (p) => <Svg {...p}><path d="M6 4h12v3a6 6 0 0 1-12 0V4ZM6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 17h6M10 17v-2.3M14 17v-2.3M8 21h8" /></Svg>,
  trendUp:  (p) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" /></Svg>,
  target:   (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  repeat:   (p) => <Svg {...p}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></Svg>,
  bolt:     (p) => <Svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" /></Svg>,
  swap:     (p) => <Svg {...p}><path d="M8 3L4 7l4 4M4 7h12M16 21l4-4-4-4M20 17H8" /></Svg>,
  plus:     (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>,
  glass:    (p) => <Svg {...p}><path d="M6 3h12l-1.2 16.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 3ZM5.5 8.5h13" /></Svg>,
};
const MEAL_ICON = { sunrise: NIcon.sunrise, coffee: NIcon.coffee, utensils: NIcon.utensils, apple: NIcon.apple, moon: NIcon.moon };

// ── formato es-ES ────────────────────────────────────────────────────────────
const nInt = (n) => Number(Math.round(n)).toLocaleString("de-DE");
const nL = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// ── modelo de escenario ────────────────────────────────────────────────────
function buildNutricion(t) {
  const state = t.dietState || "active";          // active | fresh | empty
  const fresh = state === "fresh";
  const empty = state === "empty";
  const moment = fresh ? "morning" : (t.moment || "afternoon");   // morning | afternoon | night

  const diet = VX_DIET;
  const meals = vxExpandMeals();

  // ¿cuántas comidas hechas según el momento del día?
  const doneCount = fresh ? 0 : ({ morning: 1, afternoon: 3, night: 5 })[moment];
  const nowIdx = fresh ? 0 : (doneCount < meals.length ? doneCount : -1);
  const planMeals = meals.map((m, i) => ({
    ...m, status: i < doneCount ? "done" : i === nowIdx ? "now" : "up",
  }));

  // suplementos hechos según el momento
  const suppsDone = fresh ? 0 : ({ morning: 1, afternoon: 1, night: 2 })[moment];
  const supps = VX_SUPPS.map((s, i) => ({ ...s, kind: "supp", done: i < suppsDone }));

  // agua consumida (litros)
  const water = fresh ? 0.2 : ({ morning: 0.6, afternoon: 1.5, night: 2.5 })[moment];

  // consumido = suma de comidas hechas
  const done = planMeals.filter((m) => m.status === "done");
  const consumed = ["kcal", "p", "c", "f"].reduce((o, k) => (o[k] = done.reduce((a, m) => a + m[k], 0), o), {});

  // próxima comida (para la tarjeta de hoy)
  const nextMeal = planMeals.find((m) => m.status === "now") || null;

  // adherencia kcal → estado del tag
  const kcalFrac = consumed.kcal / diet.kcalGoal;
  const onTarget = kcalFrac >= 0.7;

  // construye eventos del timeline (comidas + suplementos) ordenados por hora
  const evs = [
    ...planMeals.map((m) => ({ ...m, kind: "meal" })),
    ...supps.map((s) => ({ ...s, status: s.done ? "done" : "up" })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  // nota del agente
  let agent;
  if (fresh) agent = "Nuevo día. Tu dieta de definición está lista: 5 comidas, 180 g de proteína. Empieza por el desayuno — yo voy llevando los macros.";
  else if (moment === "morning") agent = "Buen arranque. Te queda repartir 130 g de proteína en 4 comidas — la clave de hoy es no quedarte corto en la cena.";
  else if (moment === "afternoon") agent = "Buen reparto hasta ahora. Te quedan el pre-entreno y la cena, y 1,0 L de agua para cerrar: deja la proteína fuerte para el salmón.";
  else agent = "Día redondo. Cerraste las 2.250 kcal con 180 g de proteína clavados y la hidratación completa. Semana 3 en verde.";

  // macros de hoy (consumido / objetivo)
  const macros = [
    { ...VX_MACRO.p, v: consumed.p, t: diet.pGoal },
    { ...VX_MACRO.c, v: consumed.c, t: diet.cGoal },
    { ...VX_MACRO.f, v: consumed.f, t: diet.fGoal },
  ];

  // diario — días recientes (paralelo a Sesiones), derivado de la fuente única
  // VX_DIARY_WEEK: most-recent-first, delta = variación de adherencia vs el día previo.
  const maxK = 2400;
  const W = (typeof VX_DIARY_WEEK !== "undefined") ? VX_DIARY_WEEK : [];
  const diary = W.map((d, i) => ({
    ...d,
    delta: i > 0 ? d.adh - W[i - 1].adh : 0,
    frac: d.kcal / maxK,
    off: Math.abs(d.kcal - VX_DIET.kcalGoal),
  })).slice().reverse().slice(0, 6);

  return {
    state, fresh, empty, moment,
    segment: t.segment || "plan",
    weekViz: t.weekViz || "bar",
    rangePicker: t.rangePicker || "menu",
    agentPulse: t.agentPulse !== false,
    diet, meals: planMeals, supps, water, events: evs,
    consumed, macros, onTarget, nextMeal, doneCount, suppsDone,
    foods: (typeof VX_LIBRARY !== "undefined") ? VX_LIBRARY : ((typeof VX_FOODS !== "undefined") ? VX_FOODS : []),
    diary, agent,
  };
}

// ── bits ─────────────────────────────────────────────────────────────────────
function NBubble({ color, bg, size = 44, glow, children }) {
  return (
    <span className="n-bubble" style={{ width: size, height: size, color, background: bg,
      boxShadow: glow ? `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 22px ${glow}` : undefined }}>
      {children}
    </span>
  );
}

function NScoreChip({ score, state }) {
  return (
    <span className={"n-score is-" + state}>
      {state === "ahead" && <NIcon.trendUp size={12} />}
      {score}<em>/100</em>
    </span>
  );
}

// ── progreso semanal (barra / anillo) — idéntico patrón a Entreno ────────────
function NWeekBlock({ diet, viz }) {
  const { week, weeks, score, scoreState } = diet;
  const word = scoreState === "ahead" ? "Vas adelantado" : scoreState === "on" ? "En objetivo" : "Vas justo";
  if (viz === "ring") {
    const size = 78, sw = 8, r = (size - sw) / 2, c = size / 2, frac = week / weeks, len = 2 * Math.PI * r;
    return (
      <div className="n-week n-week--ring">
        <div className="n-ring" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={sw} />
            <circle cx={c} cy={c} r={r} fill="none" stroke="var(--vx-lava)" strokeWidth={sw} strokeLinecap="round"
              strokeDasharray={`${frac * len} ${len}`} style={{ filter: "drop-shadow(0 0 6px var(--vx-lava))" }} />
          </svg>
          <div className="n-ring__c"><b>{week}</b><em>/{weeks}</em></div>
        </div>
        <div className="n-week__side">
          <div className="n-week__lbl">Semana {week} de {weeks}</div>
          <div className="n-week__score"><NScoreChip score={score} state={scoreState} /><span>{word}</span></div>
        </div>
      </div>
    );
  }
  return (
    <div className="n-week">
      <div className="n-week__head">
        <span className="n-week__lbl">Semana <b>{week}</b> de {weeks}</span>
        <div className="n-week__score"><NScoreChip score={score} state={scoreState} /><span>{word}</span></div>
      </div>
      <div className="n-week__cells">
        {Array.from({ length: weeks }).map((_, i) => {
          const cls = i < week - 1 ? "is-done" : i === week - 1 ? "is-now" : "";
          return <span key={i} className={"n-week__cell " + cls} />;
        })}
      </div>
    </div>
  );
}

// ── hero de la dieta activa (centro de gravedad) ─────────────────────────────
// Tocable: abre el Detalle de dieta (espejo del RoutineHero de Entreno).
function DietHero({ model }) {
  const { diet, weekViz } = model;
  const slug = (typeof vxActiveDiet !== "undefined") ? vxActiveDiet().slug : "definicion-2250";
  return (
    <button className="n-hero n-hero--tap" onClick={() => vxNav(VX.DIETA, { dieta: slug })}>
      <div className="n-hero__top">
        <div className="n-eyebrow">DIETA ACTIVA</div>
        <div className="n-by"><Isotype size={14} glow /> por verxion <Icon.chevronRight size={14} style={{ color: "rgba(255,255,255,0.3)" }} /></div>
      </div>
      <div className="n-hero__name">{diet.name}</div>
      <div className="n-hero__meta">
        <span className="n-tag n-tag--goal"><NIcon.target size={12} /> {diet.goal}</span>
        <span className="n-hero__split"><NIcon.utensils size={12} /> {diet.macroSplit}</span>
      </div>
      <div className="n-hero__divider" />
      <NWeekBlock diet={diet} viz={weekViz} />
    </button>
  );
}

// ── anillo de kcal (consumido / objetivo), SEGMENTADO por macro ──────────────
// El arco se llena según las kcal consumidas sobre el objetivo y, dentro del
// relleno, se subdivide en proteína · carbos · grasa por su aporte calórico
// (4/4/9 kcal/g) con los colores canónicos de la app (igual que el donut de
// Detalle de alimento). Sobrepasar el objetivo capa el relleno al 100 %.
function KcalRing({ consumed, goal, size = 92, sw = 9 }) {
  const r = (size - sw) / 2, c = size / 2, len = 2 * Math.PI * r;
  const pK = consumed.p * 4, cK = consumed.c * 4, fK = consumed.f * 9;
  const macroTot = pK + cK + fK || 1;
  const fill = Math.max(0, Math.min(1, consumed.kcal / goal));   // fracción del aro rellena
  const segs = [
    { kc: pK, col: "var(--vx-lava)" },     // proteína
    { kc: cK, col: "var(--vx-body)" },     // carbos
    { kc: fK, col: "var(--vx-neutral)" },  // grasa
  ];
  const gap = consumed.kcal > 0 ? 2.5 : 0;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", display: "block" }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={sw} />
      {segs.map((s, i) => {
        const frac = (s.kc / macroTot) * fill;           // porción del aro de este macro
        const dash = Math.max(0, frac * len - gap);
        const el = frac > 0.004 ? (
          <circle key={i} cx={c} cy={c} r={r} fill="none" stroke={s.col} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={`${dash} ${len - dash}`} strokeDashoffset={-acc * len}
            style={{ filter: `drop-shadow(0 0 6px ${s.col})` }} />
        ) : null;
        acc += frac;
        return el;
      })}
    </svg>
  );
}

// ── "dónde vas hoy" — adherencia de kcal + macros + próxima comida ───────────
function TodayIntake({ model }) {
  const { consumed, diet, macros, onTarget, nextMeal, fresh } = model;
  const frac = consumed.kcal / diet.kcalGoal;
  const left = Math.max(0, diet.kcalGoal - consumed.kcal);
  const over = consumed.kcal > diet.kcalGoal;
  return (
    <div className="n-intake">
      <div className="n-intake__top">
        <div className="n-intake__ring" style={{ width: 92, height: 92 }}>
          <KcalRing consumed={consumed} goal={diet.kcalGoal} />
          <div className="n-intake__ringc">
            <span className="n-intake__num">{nInt(consumed.kcal)}</span>
            <span className="n-intake__den">/ {nInt(diet.kcalGoal)}</span>
          </div>
        </div>
        <div className="n-intake__side">
          <div className="n-intake__lbl">CONSUMIDO HOY</div>
          <div className={"n-intake__tag" + (over ? " is-over" : onTarget ? " is-on" : " is-low")}>
            {over ? `${nInt(consumed.kcal - diet.kcalGoal)} kcal de más` : `${nInt(left)} kcal restantes`}
          </div>
          <div className="n-intake__obj">Objetivo {nInt(diet.kcalGoal)} kcal · {model.doneCount} de {model.meals.length} comidas</div>
        </div>
      </div>
      <div className="n-macros">
        {macros.map((m) => {
          const mf = Math.min(1, m.v / m.t);
          return (
            <div className="n-macro" key={m.key}>
              <div className="n-macro__head">
                <span>{m.label}</span>
                <span>{nInt(m.v)}<em>/{m.t} g</em></span>
              </div>
              <div className="n-bar"><div className="n-bar__fill" style={{ width: (mf * 100) + "%", background: m.color, color: m.color }} /></div>
            </div>
          );
        })}
      </div>
      {nextMeal && (
        <button className="n-intake__next" onClick={() => vxNav(VX.COMIDA, { dieta: (typeof vxActiveDiet !== "undefined" ? vxActiveDiet().slug : "definicion-2250"), comida: nextMeal.id })}>
          <span className="n-intake__nextk">{fresh ? "EMPIEZA POR" : "AHORA TOCA"}</span>
          <span className="n-intake__nextt">{nextMeal.name} · {nextMeal.time}</span>
          <span className="n-intake__nextk2">{nInt(nextMeal.kcal)} kcal · {nInt(nextMeal.p)} g P</span>
          <Icon.chevronRight size={18} style={{ color: "rgba(255,255,255,0.35)", marginLeft: "auto" }} />
        </button>
      )}
    </div>
  );
}

// ── nota del agente ──────────────────────────────────────────────────────────
function NAgentNote({ msg }) {
  return (
    <div className="n-agent">
      <span className="n-agent__mark"><Isotype size={24} glow /></span>
      <div>
        <div className="n-agent__from">verxion</div>
        <div className="n-agent__msg">{msg}</div>
      </div>
    </div>
  );
}

// ── la espina de comidas del día (mapa cronológico, solo lectura) ────────────
function MealSpine({ model }) {
  const slug = (typeof vxActiveDiet !== "undefined") ? vxActiveDiet().slug : "definicion-2250";
  return (
    <div className="n-spine">
      {model.events.map((e, i) => {
        const isMeal = e.kind === "meal";
        const isSupp = e.kind === "supp";
        const Ico = isMeal ? (MEAL_ICON[e.icon] || NIcon.utensils) : NIcon.pill;
        const col = isSupp ? "var(--vx-insight)" : "var(--vx-lava)";
        const tappable = isMeal;
        return (
          <div className={"n-srow is-" + e.status + (isSupp ? " is-supp" : "")} key={i}
            onClick={tappable ? () => vxNav(VX.COMIDA, { dieta: slug, comida: e.id }) : undefined}
            style={tappable ? { cursor: "pointer" } : null}>
            <div className="n-srow__time">{e.time}</div>
            <div className="n-srow__rail">
              <span className="n-srow__node" style={e.status !== "up" ? { color: col } : null}>
                {e.status === "done" ? <Icon.check size={12} /> : <Ico size={12} />}
              </span>
            </div>
            {isSupp ? (
              <div className="n-srow__supp">
                <span className="n-srow__suppname">{e.name}</span>
                <span className="n-srow__supptag">{e.tag}</span>
              </div>
            ) : (
              <div className="n-srow__card">
                <div className="n-srow__head">
                  <span className="n-srow__name">{e.name}</span>
                  {e.key && <span className="n-srow__key">principal</span>}
                  {e.status === "now" && <span className="n-srow__badge">ahora</span>}
                </div>
                <div className="n-srow__macros">
                  <span className="n-srow__kcal">{nInt(e.kcal)} kcal</span>
                  <span className="n-srow__dot">·</span>
                  <span className="n-mq" style={{ color: "var(--vx-lava)" }}>{nInt(e.p)} P</span>
                  <span className="n-mq" style={{ color: "var(--vx-body)" }}>{nInt(e.c)} C</span>
                  <span className="n-mq" style={{ color: "var(--vx-neutral)" }}>{nInt(e.f)} G</span>
                </div>
                {e.swap && e.status !== "done" && (
                  <div className="n-srow__swap"><NIcon.swap size={10} /> Cambio del agente · antes <b>{e.swap.from}</b></div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── hidratación (el foco de agua que pidió el usuario) ───────────────────────
function HydrationCard({ model }) {
  const { water, diet } = model;
  const goal = diet.waterGoal, frac = Math.min(1, water / goal);
  const cups = 8, doneCups = Math.round(frac * cups);
  return (
    <div className="n-hydro">
      <NBubble color="var(--vx-body)" bg="var(--vx-body-bg)" size={40}><Icon.droplet size={19} /></NBubble>
      <div className="n-hydro__body">
        <div className="n-hydro__head">
          <span className="n-hydro__lbl">Hidratación</span>
          <span className="n-hydro__val">{nL(water)} <em>/ {nL(goal)} L</em></span>
        </div>
        <div className="n-hydro__cups">
          {Array.from({ length: cups }).map((_, i) => (
            <span key={i} className={"n-cup" + (i < doneCups ? " is-on" : "")} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── invitación / cold-start ──────────────────────────────────────────────────
function NEmptyInvite() {
  return (
    <div className="n-invite">
      <Isotype size={52} glow style={{ marginBottom: 4 }} />
      <div className="n-invite__title">Aún no tienes dieta activa</div>
      <div className="n-invite__body">
        Pídele a verxion que te diseñe una dieta y aparecerá aquí, comida a comida, lista para seguir cada día.
      </div>
      <div className="n-prompt" onClick={() => vxNav(VX.AGENTE, { caso: "inicio" })} style={{ cursor: "pointer" }}>
        <span className="n-prompt__c">›</span>
        Arma una dieta de definición de 2.250 kcal, 5 comidas
      </div>
    </div>
  );
}

// ── superficie de edición read-only: "ajustar con el agente" ─────────────────
function NAgentEdit({ label = "Ajustar esta dieta con el agente", hint = "El plan es de solo lectura — los cambios los hace verxion." }) {
  return (
    <button className="n-edit" onClick={() => vxNav(VX.AGENTE, { caso: "inicio" })}>
      <span className="n-edit__iso"><Isotype size={20} glow /></span>
      <div className="n-edit__body">
        <div className="n-edit__label">{label}</div>
        <div className="n-edit__hint">{hint}</div>
      </div>
      <span className="n-edit__c">›</span>
    </button>
  );
}

Object.assign(window, {
  NIcon, MEAL_ICON, nInt, nL, buildNutricion, NBubble, NScoreChip, NWeekBlock,
  DietHero, KcalRing, TodayIntake, NAgentNote, MealSpine, HydrationCard,
  NEmptyInvite, NAgentEdit,
});
