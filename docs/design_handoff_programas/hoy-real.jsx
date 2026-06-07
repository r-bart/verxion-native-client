// hoy-real.jsx — la vista "Hoy" SINCRONIZADA con la implementación real
// (src/presentation/today/*). Read-only command centre del día:
//   TodayHeader (fecha + avatar) · DaySummary (anillo segmentado + 5 frentes)
//   · RoutineRow (rutina + adherencia) · [nota del agente, oculta] · DayTimeline
//   ("Tu día": espina con tarjetas expandibles por tipo).
// Datos del día desde comidas-data.jsx (misma fuente que Nutrición).

const { useState: useStateHR } = React;

// ── iconos línea que faltan en icons.jsx ──────────────────────
const RIcon = {
  pill:    (p) => <Svg {...p}><path d="M10.5 20.5a4.95 4.95 0 0 1-7-7l6-6a4.95 4.95 0 0 1 7 7l-6 6ZM8.5 8.5l7 7" /></Svg>,
  utensils:(p) => <Svg {...p}><path d="M4 3v6a2 2 0 0 0 2 2v10M6 3v8M9 3v6a2 2 0 0 1-2 2M18 3c-1.5 1-2 3-2 5s.5 3 2 3v10" /></Svg>,
  trendUp: (p) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" /></Svg>,
  chevronDown: (p) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>,
  chevronUp:   (p) => <Svg {...p}><path d="M6 15l6-6 6 6" /></Svg>,
  settings: (p) => <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" /></Svg>,
};

// ── formato es-ES (punto miles, coma decimales) ───────────────
const rInt = (n) => Math.round(n).toLocaleString("de-DE");
const rL = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// ── visuales por frente (= today/lib/fronts.tsx) ──────────────
const FRONT_VISUALS = {
  training:    { Icon: Icon.dumbbell,   color: "var(--lava)" },
  nutrition:   { Icon: RIcon.utensils,  color: "var(--nutri)" },     // coral, no se funde con el lava
  water:       { Icon: Icon.droplet,    color: "var(--vx-body)" },
  steps:       { Icon: Icon.footprints, color: "var(--vx-neutral)" },
  supplements: { Icon: RIcon.pill,      color: "var(--vx-insight)" },
};
const FRONT_HEALTH = "var(--vx-health)"; // tweak: color "salud" alternativo de Nutrición
const FRONT_LABEL = { training: "Entreno", nutrition: "Nutrición", water: "Agua", steps: "Pasos", supplements: "Suplementos" };
const STATUS_LABEL = { completed: "Completado", in_progress: "En curso", planned: "Pendiente", rest: "Descanso", missed: "Perdido" };

// valor compacto (= frontValueCompact): suelta el objetivo salvo en `count`
function frontValueCompact(f) {
  if (f.status) return STATUS_LABEL[f.status] || "—";
  if (f.current == null) return "—";
  if (f.unit === "kcal") return rInt(f.current) + " kcal";
  if (f.unit === "L") return rL(f.current) + " L";
  if (f.unit === "count") return f.target != null ? (f.current + " / " + f.target) : String(f.current);
  return rInt(f.current); // steps → solo el valor
}

// ── modelo del día ────────────────────────────────────────────
function buildTodayModel(t) {
  const moment = t.moment || "night";                    // morning | afternoon | night
  const nowMin = { morning: 7 * 60 + 42, afternoon: 15 * 60 + 10, night: 22 * 60 + 18 }[moment];

  const meals = (typeof vxExpandMeals !== "undefined") ? vxExpandMeals() : [];
  const diet = (typeof VX_DIET !== "undefined") ? VX_DIET : { kcalGoal: 2250, pGoal: 180, waterGoal: 2.5 };
  const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };

  // cuántas comidas registradas / suplementos / métricas según el momento
  const mealsLogged = meals.filter((m) => nowMin >= toMin(m.time));
  const kcal = Math.round(mealsLogged.reduce((a, m) => a + m.kcal, 0));
  const prot = Math.round(mealsLogged.reduce((a, m) => a + m.p, 0));

  const byMoment = {
    morning:   { water: 0.6, steps: 2140,  suppsTaken: 1 },
    afternoon: { water: 1.5, steps: 8214,  suppsTaken: 2 },
    night:     { water: 2.5, steps: 11260, suppsTaken: 3 },
  }[moment];
  const suppsTotal = 3; // Creatina · Omega-3 (AM) + Vit. D (PM)
  const workoutDone = nowMin >= toMin("17:30");

  // ── fronts (orden canónico) ───────────────────────────────
  const kcalGoal = diet.kcalGoal, waterGoal = diet.waterGoal || 2.5, stepsGoal = 10000;
  const fronts = [
    { key: "training", status: workoutDone ? "completed" : "planned", current: null, target: null, unit: null,
      closed: workoutDone },
    { key: "nutrition", current: kcal, target: kcalGoal, unit: "kcal", status: null,
      closed: kcal >= kcalGoal * 0.92 },
    { key: "water", current: byMoment.water, target: waterGoal, unit: "L", status: null,
      closed: byMoment.water >= waterGoal },
    { key: "steps", current: byMoment.steps, target: stepsGoal, unit: "steps", status: null,
      closed: byMoment.steps >= stepsGoal },
    { key: "supplements", current: byMoment.suppsTaken, target: suppsTotal, unit: "count", status: null,
      closed: byMoment.suppsTaken >= suppsTotal },
  ];
  const ring = { completed: fronts.filter((f) => f.closed).length, total: fronts.length };

  // ── rutina activa ─────────────────────────────────────────
  const routine = { name: "PPL Hipertrofia", week: 3, totalWeeks: 6, adherenceScore: 86, adherenceMax: 100 };

  // ── nota del agente (cableada, oculta por defecto) ────────
  const agentMsg = {
    morning:   "Hoy toca Push A. Dormiste 7 h 40 m: buen día para buscar PR en press banca.",
    afternoon: "Vas en objetivo de macros. Te faltan 1,0 L de agua y 1.800 pasos para cerrar el día.",
    night:     "Gran día. Cerraste los cinco frentes y vas adelantado en la semana 3 de 6.",
  }[moment];

  // ── timeline (la espina) ──────────────────────────────────
  // Cada ítem con planMin: si now ≥ planMin → registrado (done, con hora).
  // Cena y suplemento PM son "sueltos" (sin hora fija): hasta registrarse van
  // a "Pendiente · sin hora"; al registrarse aparecen con su hora.
  const supps = (typeof VX_SUPPS !== "undefined") ? VX_SUPPS : [];
  const findMeal = (id) => meals.find((m) => m.id === id) || {};
  const raw = [
    { id: "weigh", planMin: toMin("07:20"), kind: "weight", title: "Báscula", subtitle: "Peso corporal", ref: "weight", loose: false },
    { id: "m-desayuno", planMin: toMin("07:45"), kind: "meal", mealId: "desayuno", loose: false },
    { id: "s-am", planMin: toMin("08:00"), kind: "supplement", suppId: "am", title: "Creatina · Omega-3", subtitle: "Suplementos · AM", ref: "supplement", loose: false },
    { id: "m-snack", planMin: toMin("11:00"), kind: "meal", mealId: "snack-am", loose: false },
    { id: "m-comida", planMin: toMin("13:30"), kind: "meal", mealId: "comida", loose: false },
    { id: "m-pre", planMin: toMin("16:30"), kind: "meal", mealId: "pre", loose: false },
    { id: "session", planMin: toMin("17:30"), kind: "session", title: "Push A · Pecho y hombros", subtitle: "Entreno · 7 ejercicios", ref: "session", loose: false },
    { id: "m-cena", planMin: toMin("20:00"), kind: "meal", mealId: "cena", loose: true },
    { id: "s-pm", planMin: toMin("22:00"), kind: "supplement", suppId: "pm", title: "Vitamina D", subtitle: "Suplementos · PM", ref: "supplement", loose: true },
  ];

  const fmtClock = (min) => String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0");
  const timeline = raw.map((e) => {
    const m = e.mealId ? findMeal(e.mealId) : null;
    const base = m
      ? { kind: "meal", title: m.name, subtitle: rInt(m.kcal) + " kcal · " + Math.round(m.p) + " g proteína", ref: "meal", mealId: e.mealId }
      : { kind: e.kind, title: e.title, subtitle: e.subtitle, ref: e.ref, suppId: e.suppId };
    const logged = nowMin >= e.planMin;
    let state, time;
    if (logged) {
      state = "done"; time = fmtClock(e.planMin);
    } else if (e.loose) {
      state = "upcoming"; time = null;                 // pendiente · sin hora
    } else {
      state = "upcoming"; time = fmtClock(e.planMin);
    }
    return { id: e.id, ...base, state, time, planMin: e.planMin };
  });

  return { moment, nowMin, dateLabel: "Martes, 2 de junio", ring, fronts, routine, agentMsg, timeline,
    detailFor: (id) => buildDetail(id, { meals, supps, diet }) };
}

// ── detalle perezoso por ítem (= TimelineItemCard) ────────────
function buildDetail(id, ctx) {
  const ALT = {
    "Avena": ["Pan integral 80 g", "Tortitas de avena"],
    "Arroz basmati": ["Patata 250 g", "Quinoa 90 g"],
    "Pechuga de pollo": ["Pavo 160 g", "Tofu firme 200 g"],
    "Salmón": ["Merluza 180 g", "Caballa 140 g"],
  };
  if (id === "weigh") {
    return { kind: "weight", value: "82,4 kg", caption: "−0,3 kg vs ayer · media 7 d 82,6 kg",
      rows: [{ label: "Ayer", value: "82,7 kg" }, { label: "Hace 7 días", value: "83,1 kg" }, { label: "Tendencia", value: "↘ −0,7 kg" }] };
  }
  if (id === "session") {
    return { kind: "session", name: "Push A · Pecho y hombros",
      stats: [["Duración", "58 min"], ["Volumen", "1.842 kg"], ["Series", "24"], ["Completado", "100%"]] };
  }
  if (id === "s-am") {
    return { kind: "supplement", items: [
      { name: "Creatina monohidrato", dose: "5 g", timing: "Mañana", taken: true },
      { name: "Omega-3", dose: "1 g", timing: "Con el desayuno", taken: true },
    ] };
  }
  if (id === "s-pm") {
    return { kind: "supplement", items: [
      { name: "Vitamina D3", dose: "2.000 UI", timing: "Noche", taken: false },
    ] };
  }
  // comidas
  const mealMap = { "m-desayuno": "desayuno", "m-snack": "snack-am", "m-comida": "comida", "m-pre": "pre", "m-cena": "cena" };
  const mealId = mealMap[id];
  if (mealId) {
    const m = ctx.meals.find((x) => x.id === mealId) || {};
    return { kind: "meal", name: m.name, window: m.time,
      calories: Math.round(m.kcal), protein: Math.round(m.p),
      items: (m.items || []).map((it) => ({ name: it.name, amount: it.qty, alternatives: ALT[it.name] || [] })),
      supplements: id === "m-desayuno" ? ["Omega-3"] : (id === "m-cena" ? ["Vitamina D3"] : []) };
  }
  return { kind: "note", title: "Sin detalle", body: "" };
}

// ════════════════════════════════════════════════════════════
//  componentes
// ════════════════════════════════════════════════════════════

// ── anillo segmentado (= SegmentedRing.tsx, sectores rellenos) ─
const SEG_RAD = Math.PI / 180;
function sectorPath(cx, cy, Ro, Ri, a0, a1, cr) {
  const pt = (r, d) => [cx + r * Math.cos(d * SEG_RAD), cy + r * Math.sin(d * SEG_RAD)];
  const gO = (cr / Ro) / SEG_RAD, gI = (cr / Ri) / SEG_RAD;
  const largeO = (a1 - a0 - 2 * gO) > 180 ? 1 : 0;
  const largeI = (a1 - a0 - 2 * gI) > 180 ? 1 : 0;
  let p = pt(Ro, a0 + gO), d = `M${p[0]} ${p[1]}`;
  p = pt(Ro, a1 - gO); d += `A${Ro} ${Ro} 0 ${largeO} 1 ${p[0]} ${p[1]}`;
  let c = pt(Ro, a1), e = pt(Ro - cr, a1); d += `Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
  e = pt(Ri + cr, a1); d += `L${e[0]} ${e[1]}`;
  c = pt(Ri, a1); e = pt(Ri, a1 - gI); d += `Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
  p = pt(Ri, a0 + gI); d += `A${Ri} ${Ri} 0 ${largeI} 0 ${p[0]} ${p[1]}`;
  c = pt(Ri, a0); e = pt(Ri + cr, a0); d += `Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
  e = pt(Ro - cr, a0); d += `L${e[0]} ${e[1]}`;
  c = pt(Ro, a0); e = pt(Ro, a0 + gO); d += `Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
  return d + "Z";
}
function SegmentedRing({ size, stroke, segments, gap = 7, children }) {
  const cx = size / 2, cy = size / 2, Ro = size / 2, Ri = size / 2 - stroke, cr = stroke * 0.22;
  const n = Math.max(1, segments.length), slot = 360 / n;
  return (
    <div className="t-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((s, i) => {
          const a0 = -90 + i * slot + gap / 2, a1 = -90 + i * slot + slot - gap / 2;
          return <path key={i} d={sectorPath(cx, cy, Ro, Ri, a0, a1, cr)} fill={s.color}
            opacity={s.filled ? 1 : 0.16} style={s.filled ? { filter: "drop-shadow(0 0 6px " + s.color + ")" } : null} />;
        })}
      </svg>
      <div className="t-ring__c">{children}</div>
    </div>
  );
}

// ── header: fecha + acceso a programas + avatar de ajustes ────
function TodayHeader({ dateLabel }) {
  return (
    <div className="t-header">
      <div className="t-header__date">{dateLabel}</div>
      <div className="t-headtools">
        <button className="t-headbtn" aria-label="Tus programas" title="Tus programas"
          onClick={() => (typeof vxNav !== "undefined") && vxNav(window.VX.PROGRAMAS)}>
          <Icon.layers size={19} />
        </button>
        <div className="t-avatar" onClick={() => (typeof vxNav !== "undefined") && vxNav(window.VX.AGENTE, { caso: "ajustes" })} title="Ajustes">
          <span>AL</span>
        </div>
      </div>
    </div>
  );
}

// ── slot "qué sigo" — POLIMÓRFICO ─────────────────────────────
// Resuelve los estados reales: programa (rutina+dieta) · solo rutina ·
// solo dieta · rutina+dieta sueltas (sin programa) · sin plan. Ocupa el
// sitio de la antigua RoutineRow (bajo el anillo). Solo lee: unir/crear
// es del agente.

// fila genérica reutilizada por todos los estados
function PlanRow({ bubbleColor, bubbleBg, icon, name, sub, week, chip, onClick }) {
  return (
    <div className="t-planrow" onClick={onClick}>
      <span className="t-planrow__bubble" style={{ color: bubbleColor, background: bubbleBg }}>{icon}</span>
      <div className="t-planrow__body">
        <span className="t-planrow__name">{name}</span>
        {sub && <span className="t-planrow__sub">{sub}</span>}
      </div>
      <div className="t-planrow__right">
        {chip}
        {week && <span className="t-planrow__week">{week}</span>}
        <Icon.chevronRight size={18} style={{ color: "var(--g-ink3)" }} />
      </div>
    </div>
  );
}
function UpChip({ score, max }) {
  return <span className="t-chip t-chip--up"><RIcon.trendUp size={12} /> {score}{max != null && <em>/{max}</em>}</span>;
}

// datos de display del plan (prototipo — coherentes con los catálogos)
const PLAN_ROUTINE = { slug: "ppl-hipertrofia", name: "PPL Hipertrofia", sub: "Push · Pull · Legs", week: 3, weeks: 6, score: 86 };
const PLAN_DIET = { slug: "definicion-2250", name: "Definición", sub: "2.250 kcal · 180 g proteína", score: 92 };

function PlanRoutineRow({ bare }) {
  return (
    <PlanRow
      bubbleColor="var(--lava)" bubbleBg="var(--lava-bg)" icon={<Icon.dumbbell size={19} />}
      name={PLAN_ROUTINE.name} sub={PLAN_ROUTINE.sub}
      chip={<UpChip score={PLAN_ROUTINE.score} max={100} />}
      onClick={() => vxNav(window.VX.RUTINA, { rutina: PLAN_ROUTINE.slug, from: "hoy" })} />
  );
}
function PlanDietRow({ bare }) {
  return (
    <PlanRow
      bubbleColor="var(--nutri)" bubbleBg="rgba(255,138,76,0.14)" icon={<RIcon.utensils size={19} />}
      name={PLAN_DIET.name} sub={PLAN_DIET.sub}
      chip={<UpChip score={PLAN_DIET.score} max={100} />}
      onClick={() => vxNav(window.VX.DIETA, { dieta: PLAN_DIET.slug, from: "hoy" })} />
  );
}

function ActivePlan({ plan, model }) {
  const state = plan || "programa";

  // PROGRAMA — rutina + dieta unidas
  if (state === "programa" && typeof pgActiveProgram !== "undefined") {
    const p = pgActiveProgram();
    const cfg = pgGoalCfg(p.goal);
    const unified = p.adherence ? p.adherence.unifiedScore : null;
    return (
      <div className="t-plan">
        <div className="t-plan__eyebrow is-active"><span className="t-plan__livedot" /> {`Programa activo · Sem ${p.week}/${p.weeks}`}</div>
        <PlanRow
          bubbleColor={cfg.color} bubbleBg={cfg.bg} icon={cfg.icon({ size: 20 })}
          name={p.name} sub={PLAN_ROUTINE.name + " · " + PLAN_DIET.name}
          chip={unified != null ? <UpChip score={unified} max={100} /> : null}
          onClick={() => vxNav(window.VX.PROGRAMA, { programa: p.slug, from: "hoy" })} />
      </div>
    );
  }

  // SOLO RUTINA
  if (state === "rutina") {
    return (
      <div className="t-plan">
        <div className="t-plan__eyebrow">{`Rutina · Semana ${PLAN_ROUTINE.week} / ${PLAN_ROUTINE.weeks}`}</div>
        <PlanRoutineRow />
      </div>
    );
  }

  // SOLO DIETA
  if (state === "dieta") {
    return (
      <div className="t-plan">
        <div className="t-plan__eyebrow">Dieta activa</div>
        <PlanDietRow />
      </div>
    );
  }

  // RUTINA + DIETA SUELTAS (sin programa)
  if (state === "sueltas") {
    return (
      <div className="t-plan">
        <div className="t-plan__eyebrow">Tu plan</div>
        <div className="t-plan__stack">
          <PlanRoutineRow bare />
          <PlanDietRow bare />
        </div>
        <div className="t-plan__hint"><Isotype size={13} glow /> <span>Sin unir en un programa · <b>pídeselo a verxion</b></span></div>
      </div>
    );
  }

  // SIN PLAN
  return (
    <div className="t-plan">
      <div className="t-plan__eyebrow">Tu plan</div>
      <PlanRow
        bubbleColor="var(--g-ink3)" bubbleBg="var(--g-fill2)" icon={<Icon.sparkles size={18} />}
        name="Aún sin plan activo" sub="Pídele a verxion una rutina, una dieta o un programa"
        onClick={() => vxNav(window.VX.AGENTE, { caso: "inicio" })} />
    </div>
  );
}

// ── resumen del día: anillo + 5 frentes ───────────────────────
function DaySummary({ model, nutriColor }) {
  const { ring, fronts } = model;
  const colorOf = (key) => key === "nutrition" ? nutriColor : FRONT_VISUALS[key].color;
  const segments = fronts.map((f) => ({ color: colorOf(f.key), filled: f.closed }));
  return (
    <div className="t-summary">
      <SegmentedRing size={158} stroke={19} segments={segments} gap={7}>
        <span className="t-ring__num">{ring.completed}<em>/{ring.total}</em></span>
      </SegmentedRing>
      <div className="t-fronts">
        {fronts.map((f) => {
          const { Icon: FIcon } = FRONT_VISUALS[f.key];
          return (
            <div className="t-front" key={f.key}>
              <FIcon size={18} style={{ color: colorOf(f.key) }} />
              <span className="t-front__val">{frontValueCompact(f)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── fila de rutina ────────────────────────────────────────────
function RoutineRow({ routine }) {
  return (
    <div className="t-routine">
      <div className="t-section">{`Rutina · Semana ${routine.week} / ${routine.totalWeeks}`}</div>
      <div className="t-routine__row">
        <Icon.dumbbell size={18} style={{ color: "var(--lava)" }} />
        <span className="t-routine__name">{routine.name}</span>
        {routine.adherenceScore != null && (
          <span className="t-chip t-chip--up">
            <RIcon.trendUp size={12} /> {routine.adherenceScore} <em>/{routine.adherenceMax}</em>
          </span>
        )}
      </div>
    </div>
  );
}

// ── nota del agente (oculta por defecto) ──────────────────────
function AgentNote({ message }) {
  return (
    <div className="t-agent">
      <span className="t-agent__mark"><Isotype size={22} glow /></span>
      <div className="t-agent__body">
        <div className="t-agent__from">verxion</div>
        <div className="t-agent__msg">{message}</div>
      </div>
    </div>
  );
}

// ── tarjetas de detalle por tipo (= TimelineItemCard) ─────────
function StatPill({ children }) { return <span className="t-pill">{children}</span>; }
function Eyebrow({ children }) { return <span className="t-eyebrow">{children}</span>; }

function MealCard({ d }) {
  return (
    <div className="t-dc" style={{ gap: 12 }}>
      <div className="t-pills">
        {d.window != null && <StatPill>{d.window}</StatPill>}
        {d.calories != null && <StatPill>{rInt(d.calories)} kcal</StatPill>}
        {d.protein != null && <StatPill>{d.protein} g prot</StatPill>}
      </div>
      <div className="t-dc" style={{ gap: 8 }}>
        {d.items.map((it, i) => (
          <div className="t-dc" style={{ gap: 2 }} key={i}>
            <div className="t-line"><span className="t-line__name">{it.name}</span><span className="t-line__val">{it.amount}</span></div>
            {it.alternatives.length > 0 && <span className="t-alt">Alternativas: {it.alternatives.join(" · ")}</span>}
          </div>
        ))}
      </div>
      {d.supplements.length > 0 && (
        <div className="t-dc" style={{ gap: 4 }}>
          <Eyebrow>Suplementos</Eyebrow>
          <span className="t-sub">{d.supplements.join(" · ")}</span>
        </div>
      )}
    </div>
  );
}
function SessionCard({ d }) {
  return (
    <div className="t-stats">
      {d.stats.map(([label, value], i) => (
        <div className="t-stat" key={i}><Eyebrow>{label}</Eyebrow><span className="t-stat__v">{value}</span></div>
      ))}
    </div>
  );
}
function SupplementCard({ d }) {
  return (
    <div className="t-dc" style={{ gap: 9 }}>
      {d.items.map((s, i) => (
        <div className="t-srow" key={i}>
          <span className={"t-sbox" + (s.taken ? " is-on" : "")}>{s.taken && <Icon.check size={11} />}</span>
          <span className="t-srow__name">{s.name}</span>
          <span className="t-srow__dose">{s.dose}{s.timing != null ? " · " + s.timing : ""}</span>
        </div>
      ))}
    </div>
  );
}
function MetricCard({ d }) {
  return (
    <div className="t-dc" style={{ gap: 10 }}>
      <div className="t-dc" style={{ gap: 2 }}>
        <span className="t-metric__v">{d.value}</span>
        {d.caption != null && <span className="t-sub">{d.caption}</span>}
      </div>
      {d.rows && d.rows.length > 0 && (
        <div className="t-dc" style={{ gap: 6 }}>
          {d.rows.map((r, i) => (
            <div className="t-mrow" key={i}><span className="t-mrow__l">{r.label}</span><span className="t-mrow__v">{r.value}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}
function DetailBody({ d }) {
  if (d.kind === "meal") return <MealCard d={d} />;
  if (d.kind === "session") return <SessionCard d={d} />;
  if (d.kind === "supplement") return <SupplementCard d={d} />;
  return <MetricCard d={d} />;
}

// ── timeline "Tu día" ─────────────────────────────────────────
const KIND_ICON = { weight: Icon.scale, meal: RIcon.utensils, supplement: RIcon.pill, session: Icon.dumbbell, workout: Icon.dumbbell };

function TLNode({ state }) {
  const done = state === "done", live = state === "in_progress";
  const filled = done || live;
  return (
    <span className={"t-node" + (filled ? " is-filled" : "")}>
      {done && <Icon.check size={11} />}
      {live && <span className="t-node__dot" />}
    </span>
  );
}

function DayTimeline({ model }) {
  const [openId, setOpenId] = useStateHR(null);
  const timed = model.timeline.filter((e) => e.time != null);
  const untimed = model.timeline.filter((e) => e.time == null);
  const firstUpcoming = timed.findIndex((e) => e.state === "upcoming");

  const Row = ({ e, first, last }) => {
    const Ico = KIND_ICON[e.kind] || Icon.flame;
    const expandable = !!e.ref;
    const open = openId === e.id;
    const dim = e.state === "upcoming" || e.state === "rest";
    return (
      <div className={"t-row" + (expandable ? " is-click" : "")} onClick={expandable ? () => setOpenId(open ? null : e.id) : undefined}>
        <span className="t-time">{e.time || ""}</span>
        <span className="t-spine">
          <span className="t-spine__line" style={{ top: first ? "50%" : 0, bottom: last ? "auto" : 0, height: last ? "50%" : "auto" }} />
          <TLNode state={e.state} />
        </span>
        <div className="t-content" style={{ opacity: dim ? 0.7 : 1 }}>
          <div className="t-content__head">
            <Ico size={15} style={{ color: "var(--g-ink2)", marginTop: 1, flexShrink: 0 }} />
            <div className="t-content__txt">
              <span className="t-title">{e.title}</span>
              {e.subtitle && <span className="t-sub">{e.subtitle}</span>}
            </div>
            {expandable && (open ? <RIcon.chevronUp size={16} style={{ color: "var(--g-ink3)", flexShrink: 0 }} />
                                 : <RIcon.chevronDown size={16} style={{ color: "var(--g-ink3)", flexShrink: 0 }} />)}
          </div>
          {open && expandable && (
            <div className="t-card"><DetailBody d={model.detailFor(e.id)} /></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="t-tl">
      <div className="t-section">Tu día</div>
      <div>
        {timed.map((e, i) => (
          <React.Fragment key={e.id}>
            {i === firstUpcoming && (
              <div className="t-now">
                <span />
                <span className="t-now__node"><span className="t-now__dot" /></span>
                <div className="t-now__body"><span className="t-now__k">Ahora</span><span className="t-now__line" /></div>
              </div>
            )}
            <Row e={e} first={i === 0} last={i === timed.length - 1} />
          </React.Fragment>
        ))}
        {untimed.length > 0 && (
          <React.Fragment>
            <div className="t-pending"><span className="t-pending__k">Pendiente · sin hora</span><span className="t-pending__line" /></div>
            {untimed.map((e, i) => <Row key={e.id} e={e} first={i === 0} last={i === untimed.length - 1} />)}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

// ── tab bar (Hoy activo) ──────────────────────────────────────
const RT_TABS = [
  { id: "today", label: "Hoy", icon: (p) => <Icon.flame {...p} /> },
  { id: "training", label: "Entreno", icon: (p) => <Icon.dumbbell {...p} /> },
  { id: "verxion", center: true },
  { id: "nutrition", label: "Nutrición", icon: (p) => <Icon.leaf {...p} /> },
  { id: "progress", label: "Progreso", icon: (p) => <Icon.lineChart {...p} /> },
];
function RTabBar() {
  const dest = { training: window.VX.ENTRENO, nutrition: window.VX.NUTRICION, progress: window.VX.PROGRESO };
  return (
    <div className="t-tabbar">
      {RT_TABS.map((tb) => tb.center ? (
        <div key="c" className="t-tab t-tab--center" style={{ cursor: "pointer" }} onClick={() => vxNav(window.VX.AGENTE, { caso: "inicio" })}>
          <span className="t-tab__icon"><Isotype size={36} /></span>
          <span className="t-tab__label t-tab__label--c">verxion</span>
        </div>
      ) : (
        <div key={tb.id} className={"t-tab" + (tb.id === "today" ? " is-active" : "")}
          onClick={() => dest[tb.id] ? vxNav(dest[tb.id]) : undefined}
          style={{ cursor: tb.id === "today" ? "default" : "pointer" }}>
          <span className="t-tab__icon">{tb.icon({ size: 25 })}</span>
          <span className="t-tab__label">{tb.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── la pantalla ───────────────────────────────────────────────
function HoyToday({ t }) {
  const model = buildTodayModel(t);
  const nutriColor = (t.nutriColor === "health") ? FRONT_HEALTH : FRONT_VISUALS.nutrition.color;
  const showAgent = t.agentNote === true;
  const night = model.moment === "night";
  return (
    <div className={"t-screen" + (night ? " is-night" : "")}>
      <div className="t-scroll">
        <TodayHeader dateLabel={model.dateLabel} />
        <DaySummary model={model} nutriColor={nutriColor} />
        <div className="t-divider" />
        <ActivePlan plan={t.plan} model={model} />
        <div className="t-divider" />
        <DayTimeline model={model} />
      </div>
      <RTabBar />
    </div>
  );
}

Object.assign(window, { HoyToday, ActivePlan, buildTodayModel, SegmentedRing, DaySummary, RoutineRow, DayTimeline, RTabBar });
