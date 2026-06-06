// entreno-core.jsx — model + components for the "Entreno" (training) landing.
// buildEntreno(tweaks) → scenario data. Leads with the active routine + "where
// you are", a routine-week spine (the read-only map of the agent's plan), a
// next-session action, plus Sesiones + Ejercicios secondary views.

// ── extra line icons (lucide-style, stroke 2) not in icons.jsx ──────────
const EIcon = {
  play:    (p) => <Svg {...p}><path d="M7 4.5v15l13-7.5-13-7.5Z" /></Svg>,
  moon:    (p) => <Svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Svg>,
  target:  (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  trophy:  (p) => <Svg {...p}><path d="M6 4h12v3a6 6 0 0 1-12 0V4ZM6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 17h6M10 17v-2.3M14 17v-2.3M8 21h8" /></Svg>,
  trendUp: (p) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" /></Svg>,
  search:  (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Svg>,
  plus:    (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>,
  repeat:  (p) => <Svg {...p}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></Svg>,
  rows:    (p) => <Svg {...p}><path d="M3 6.5h18M3 12h18M3 17.5h18" /></Svg>,
  calendar:(p) => <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></Svg>,
  funnel:  (p) => <Svg {...p}><path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" /></Svg>,
  sort:    (p) => <Svg {...p}><path d="M7 4v16M7 20l-3-3M7 4l3 3M17 20V4M17 4l-3 3M17 20l3-3" /></Svg>,
  dot:     (p) => <Svg {...p}><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" /></Svg>,
};

// ── es-ES number formatting (dot thousands, comma decimals) ──────────────
const eInt = (n) => n.toLocaleString("de-DE");

// ── day-type → color + icon + tag (the visual vocabulary of the rotation) ─
const DAY_TYPE = {
  push: { color: "var(--vx-lava)",    bg: "var(--vx-lava-bg)",    tag: "Push", icon: Icon.dumbbell },
  pull: { color: "var(--vx-body)",    bg: "var(--vx-body-bg)",    tag: "Pull", icon: EIcon.rows },
  legs: { color: "var(--vx-neutral)", bg: "var(--vx-neutral-bg)", tag: "Legs", icon: Icon.footprints },
  rest: { color: "var(--vx-insight)", bg: "var(--vx-insight-bg)", tag: "Descanso", icon: EIcon.moon },
  core: { color: "var(--vx-insight)", bg: "var(--vx-insight-bg)", tag: "Core", icon: EIcon.target },
};

// ── scenario model ───────────────────────────────────────────────────────
function buildEntreno(t) {
  const state = t.routineState || "active";   // active | fresh | empty
  const fresh = state === "fresh";
  const empty = state === "empty";
  const live = (fresh || empty) ? "off" : (t.live || "off");   // off | active | paused
  const liveOn = live !== "off";
  const restToday = !fresh && !liveOn && t.nextDay === "rest";

  const week = [
    { day: "Lun", name: "Push A", focus: "Pecho y hombros",        type: "push", ex: 7, sets: 24, est: "~62 min" },
    { day: "Mar", name: "Pull A", focus: "Espalda y bíceps",       type: "pull", ex: 6, sets: 22, est: "~58 min" },
    { day: "Mié", name: "Legs A", focus: "Cuádriceps y core",      type: "legs", ex: 7, sets: 23, est: "~65 min" },
    { day: "Jue", name: "Push B", focus: "Hombros y tríceps",      type: "push", ex: 6, sets: 21, est: "~55 min" },
    { day: "Vie", name: "Pull B", focus: "Dorsal y trapecio",      type: "pull", ex: 6, sets: 20, est: "~54 min" },
    { day: "Sáb", name: "Legs B", focus: "Femoral y glúteo",       type: "legs", ex: 7, sets: 24, est: "~66 min" },
    { day: "Dom", name: "Descanso", focus: "Movilidad opcional · 10 min", type: "rest" },
  ];

  // "where you are" in the weekly rotation
  const todayIdx = fresh ? 0 : (restToday ? 6 : 2);
  const spine = week.map((d, i) => ({
    ...d,
    status: i < todayIdx ? "done" : i === todayIdx ? (liveOn ? "live" : "now") : "up",
  }));

  const today = week[todayIdx];
  const next = today.type === "rest"
    ? { kind: "rest", eyebrow: "HOY · DESCANSO", title: "Hoy recuperas",
        sub: "Movilidad opcional · 10 min", tomorrow: "Mañana: Push A · Pecho y hombros" }
    : { kind: "workout", type: today.type,
        eyebrow: fresh ? "EMPIEZA AQUÍ" : "HOY TOCA",
        title: today.name + " · " + today.focus,
        sub: today.ex + " ejercicios · " + today.sets + " series · " + today.est };

  const routine = {
    name: "PPL Hipertrofia",
    goal: "Hipertrofia",
    split: "Push · Pull · Legs",
    week: fresh ? 1 : 3,
    weeks: 6,
    score: 86,
    scoreState: "ahead",                 // ahead | on | behind
    done: fresh ? 0 : 14,
    planned: 36,
  };

  // live session data
  const liveData = {
    name: "Legs A · Cuádriceps y core",
    base: 1458,            // 24:18 elapsed
    done: 4, total: 7,
    paused: live === "paused",
    ex: "Sentadilla", set: 3, sets: 4,
    target: "82,5 kg × 8–10 · RIR 2", last: "80 kg × 8",
  };

  // agent note copy
  let agent;
  if (fresh) agent = "Tu rutina está lista. Empezamos por Push A — busca técnica limpia esta semana, ya subiremos carga.";
  else if (liveOn) agent = "Vas 4 de 7 en Legs A. Si la última serie de sentadilla salió limpia, sube a 82,5 kg y mantén RIR 2.";
  else if (restToday) agent = "Descanso programado. Cerraste las seis sesiones de la semana — recupera bien y volvemos el lunes.";
  else agent = "Semana 3: tu volumen subió un 8 %. Hoy toca Legs A — mantén la sentadilla en 4×8 y busca PR el sábado.";

  // sesiones — recent completed sessions (newest first)
  const maxVol = 1980;
  const sessions = [
    { date: "Sáb 31", name: "Legs B", type: "legs", vol: 1980, dur: "66m", delta: 4, prs: 1 },
    { date: "Vie 30", name: "Pull B", type: "pull", vol: 1620, dur: "54m", delta: -2, prs: 0 },
    { date: "Jue 29", name: "Push B", type: "push", vol: 1740, dur: "55m", delta: 6, prs: 1 },
    { date: "Mié 28", name: "Legs A", type: "legs", vol: 1890, dur: "64m", delta: 3, prs: 0 },
    { date: "Mar 27", name: "Pull A", type: "pull", vol: 1580, dur: "57m", delta: 1, prs: 0 },
    { date: "Lun 26", name: "Push A", type: "push", vol: 1842, dur: "58m", delta: 8, prs: 2 },
  ].map((s) => ({ ...s, frac: s.vol / maxVol }));

  // ejercicios — library (catálogo único compartido con el detalle)
  const exercises = (typeof VX_EXERCISES !== "undefined") ? VX_EXERCISES : [];

  return {
    state, fresh, empty, restToday,
    live, liveOn, liveData, banner: !!t.banner,
    segment: t.segment || "rutina",
    weekViz: t.weekViz || "bar",
    agentPulse: t.agentPulse !== false,
    routine, spine, next, today, agent, sessions, exercises,
  };
}

// ── small bits ────────────────────────────────────────────────────────────
function EBubble({ color, bg, size = 44, children }) {
  return <span className="e-bubble" style={{ width: size, height: size, color, background: bg }}>{children}</span>;
}

function ScoreChip({ score, state }) {
  return (
    <span className={"e-score is-" + state}>
      {state === "ahead" && <EIcon.trendUp size={12} />}
      {score}<em>/100</em>
    </span>
  );
}

// ── week-progress visualizations ────────────────────────────────────────────
function WeekBlock({ routine, viz }) {
  const { week, weeks, score, scoreState } = routine;
  const stateWord = scoreState === "ahead" ? "Vas adelantado" : scoreState === "on" ? "En objetivo" : "Vas justo";

  if (viz === "ring") {
    const size = 78, sw = 8, r = (size - sw) / 2, c = size / 2, frac = week / weeks;
    const len = 2 * Math.PI * r;
    return (
      <div className="e-week e-week--ring">
        <div className="e-ring" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={sw} />
            <circle cx={c} cy={c} r={r} fill="none" stroke="var(--vx-lava)" strokeWidth={sw} strokeLinecap="round"
              strokeDasharray={`${frac * len} ${len}`} style={{ filter: "drop-shadow(0 0 6px var(--vx-lava))" }} />
          </svg>
          <div className="e-ring__c"><b>{week}</b><em>/{weeks}</em></div>
        </div>
        <div className="e-week__side">
          <div className="e-week__lbl">Semana {week} de {weeks}</div>
          <div className="e-week__score"><ScoreChip score={score} state={scoreState} /><span>{stateWord}</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="e-week">
      <div className="e-week__head">
        <span className="e-week__lbl">Semana <b>{week}</b> de {weeks}</span>
        <div className="e-week__score"><ScoreChip score={score} state={scoreState} /><span>{stateWord}</span></div>
      </div>
      <div className="e-week__cells">
        {Array.from({ length: weeks }).map((_, i) => {
          const cls = i < week - 1 ? "is-done" : i === week - 1 ? "is-now" : "";
          return <span key={i} className={"e-week__cell " + cls} />;
        })}
      </div>
    </div>
  );
}

// ── routine hero (the centerpiece) ──────────────────────────────────────────
function RoutineHero({ model }) {
  const { routine, weekViz } = model;
  return (
    <div className="e-hero">
      <div className="e-hero__top">
        <div className="e-eyebrow">RUTINA ACTIVA</div>
        <div className="e-by"><Isotype size={14} glow /> por verxion</div>
      </div>
      <div className="e-hero__name">{routine.name}</div>
      <div className="e-hero__meta">
        <span className="e-tag e-tag--goal"><EIcon.target size={12} /> {routine.goal}</span>
        <span className="e-hero__split"><EIcon.repeat size={12} /> {routine.split}</span>
      </div>
      <div className="e-hero__divider" />
      <WeekBlock routine={routine} viz={weekViz} />
    </div>
  );
}

// ── next session (the one action) ───────────────────────────────────────────
function NextSession({ model }) {
  const { next } = model;
  const isRest = next.kind === "rest";
  const cfg = isRest ? DAY_TYPE.rest : DAY_TYPE[next.type];
  return (
    <div className={"e-next" + (isRest ? " e-next--rest" : "")}>
      <EBubble color={cfg.color} bg={cfg.bg} size={46}>{cfg.icon({ size: 22 })}</EBubble>
      <div className="e-next__body">
        <div className="e-next__k" style={{ color: cfg.color }}>{next.eyebrow}</div>
        <div className="e-next__t">{next.title}</div>
        <div className="e-next__d">{next.sub}</div>
        {isRest && next.tomorrow && <div className="e-next__tm">{next.tomorrow}</div>}
      </div>
      {isRest
        ? <Icon.chevronRight size={20} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
        : <button className="e-next__go" aria-label="Empezar sesión" onClick={() => vxNav(VX.PRESCRIPCION, { dia: next.type })}><EIcon.play size={17} /></button>}
    </div>
  );
}

// ── the week spine (read-only map of the rotation) ──────────────────────────
function Spine({ model }) {
  return (
    <div className="e-spine">
      {model.spine.map((d, i) => {
        const cfg = DAY_TYPE[d.type];
        const isRest = d.type === "rest";
        const tappable = d.status === "now" || d.status === "live";
        const onTap = d.status === "live"
          ? () => vxNav(VX.SESION, { estado: "activa" })
          : d.status === "now" && !isRest
          ? () => vxNav(VX.PRESCRIPCION, { dia: d.type })
          : null;
        return (
          <div className={"e-srow is-" + d.status} key={i}
            onClick={onTap || undefined} style={onTap ? { cursor: "pointer" } : null}>
            <div className="e-srow__day">{d.day}</div>
            <div className="e-srow__rail">
              <span className="e-srow__node" style={d.status !== "up" ? { color: cfg.color } : null}>
                {d.status === "done" ? <Icon.check size={12} /> : cfg.icon({ size: 12 })}
              </span>
            </div>
            <div className="e-srow__card">
              <div className="e-srow__head">
                <span className="e-srow__name">{isRest ? "Descanso" : d.name}</span>
                {!isRest && <span className="e-srow__split" style={{ color: cfg.color, background: cfg.bg }}>{cfg.tag}</span>}
                {d.status === "now" && <span className="e-srow__badge">hoy</span>}
                {d.status === "live" && <span className="e-srow__badge is-live"><span className="e-livedot" /> en marcha</span>}
              </div>
              <div className="e-srow__sub">
                {isRest ? d.focus : <>{d.focus} · {d.ex} ejercicios</>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── agent note ──────────────────────────────────────────────────────────────
function AgentNote({ msg }) {
  return (
    <div className="e-agent">
      <span className="e-agent__mark"><Isotype size={24} glow /></span>
      <div>
        <div className="e-agent__from">verxion</div>
        <div className="e-agent__msg">{msg}</div>
      </div>
    </div>
  );
}

// ── live session (replaces NextSession when a workout is in progress) ────────
function LiveTimer({ base, paused }) {
  const { useState, useEffect } = React;
  const [s, setS] = useState(base);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setS((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [paused]);
  const m = Math.floor(s / 60), sec = s % 60;
  return <>{m}:{String(sec).padStart(2, "0")}</>;
}

function LiveSession({ model }) {
  const d = model.liveData;
  const paused = d.paused;
  return (
    <div className={"e-live" + (paused ? " is-paused" : "")}>
      <div className="e-live__top">
        <span className="e-livedot" />
        <span className="e-live__eye">{paused ? "PAUSADA" : "EN MARCHA"}</span>
        <span className="e-live__timer"><LiveTimer base={d.base} paused={paused} /></span>
      </div>
      <div className="e-live__name">{d.name}</div>
      <div className="e-live__cells">
        {Array.from({ length: d.total }).map((_, i) => (
          <span key={i} className={"e-live__cell" + (i < d.done ? " is-done" : i === d.done ? " is-now" : "")} />
        ))}
      </div>
      <div className="e-live__prog">{d.done} de {d.total} ejercicios</div>

      <div className="e-live__set">
        <div className="e-live__setrow">
          <span className="e-live__lbl">Ahora</span>
          <span className="e-live__ex">{d.ex}</span>
          <span className="e-live__setn">Serie {d.set}/{d.sets}</span>
        </div>
        <div className="e-live__setrow">
          <span className="e-live__lbl">Objetivo</span>
          <span className="e-live__chip">{d.target}</span>
        </div>
        <div className="e-live__setrow">
          <span className="e-live__lbl">Última</span>
          <span className="e-live__last">{d.last}</span>
        </div>
      </div>

      <div className="e-live__cta">
        <button className="e-live__btn" onClick={() => vxNav(VX.SESION, { estado: paused ? "pausada" : "activa" })}><EIcon.play size={15} /> {paused ? "Reanudar" : "Continuar"}</button>
        {!paused && <button className="e-live__btn e-live__btn--ghost">Pausar</button>}
      </div>
    </div>
  );
}

// ── floating session banner (persistent resume handle, cross-segment) ───────
function FloatingBanner({ model }) {
  const d = model.liveData;
  const paused = d.paused;
  return (
    <div className={"e-banner" + (paused ? " is-paused" : "")}
      onClick={() => vxNav(VX.SESION, { estado: paused ? "pausada" : "activa" })} style={{ cursor: "pointer" }}>
      <span className="e-livedot" />
      <span className="e-banner__name">{d.name}</span>
      <span className="e-banner__timer"><LiveTimer base={d.base} paused={paused} /></span>
      <span className="e-banner__chip">{d.done}/{d.total}</span>
      <Icon.chevronRight size={16} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
    </div>
  );
}

// ── empty / cold-start invite ───────────────────────────────────────────────
function EmptyInvite() {
  return (
    <div className="e-invite">
      <Isotype size={52} glow style={{ marginBottom: 4 }} />
      <div className="e-invite__title">Aún no tienes rutina activa</div>
      <div className="e-invite__body">
        Pídele a verxion que te arme una rutina y aparecerá aquí, lista para seguir día a día.
      </div>
      <div className="e-prompt">
        <span className="e-prompt__c">›</span>
        Arma una rutina PPL de hipertrofia, 6 días
      </div>
    </div>
  );
}

// ── SESIONES view ───────────────────────────────────────────────────────────
function SessionsView({ model }) {
  const { sessions, routine, empty } = model;
  if (empty) {
    return (
      <div className="e-emptynote">
        <EBubble color="var(--vx-fg-3)" bg="rgba(255,255,255,0.06)" size={48}><Icon.flame size={22} /></EBubble>
        <div className="e-emptynote__t">Sin sesiones todavía</div>
        <div className="e-emptynote__d">Cuando completes un entreno, tu historial aparecerá aquí.</div>
      </div>
    );
  }
  return (
    <>
      <div className="e-sumrow">
        <div className="e-sum"><b>{routine.done}</b><span>sesiones</span></div>
        <div className="e-sum"><b>32,1<em>t</em></b><span>volumen total</span></div>
        <div className="e-sum"><b>+8<em>%</em></b><span>vs semana 2</span></div>
      </div>
      <div className="e-section">Historial reciente</div>
      <div className="e-sessions">
        {sessions.map((s, i) => {
          const cfg = DAY_TYPE[s.type];
          return (
            <div className="e-sess" key={i}>
              <div className="e-sess__date">{s.date}</div>
              <EBubble color={cfg.color} bg={cfg.bg} size={34}>{cfg.icon({ size: 16 })}</EBubble>
              <div className="e-sess__body">
                <div className="e-sess__name">
                  {s.name}
                  {s.prs > 0 && <span className="e-sess__pr"><EIcon.trophy size={10} /> {s.prs} PR</span>}
                </div>
                <div className="e-sess__bar"><span style={{ width: Math.max(6, s.frac * 100) + "%", background: cfg.color }} /></div>
              </div>
              <div className="e-sess__meta">
                <div className="e-sess__vol">{eInt(s.vol)} <em>kg</em></div>
                <div className={"e-sess__delta " + (s.delta >= 0 ? "is-up" : "is-down")}>{s.delta >= 0 ? "+" : ""}{s.delta}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── EJERCICIOS view — búsqueda + filtro + orden ──────────────────────────────
const EX_FILTER_DEFAULT = { q: "", groups: [], equips: [], tipo: "all", estado: "all", sort: "recientes" };
const EX_SORTS = [
  { id: "recientes", label: "Recientes", hint: "Lo último que entrenaste primero" },
  { id: "usados",    label: "Más usados", hint: "Por número de registros" },
  { id: "az",        label: "Alfabético", hint: "De la A a la Z" },
  { id: "grupo",     label: "Grupo muscular", hint: "Agrupados por zona" },
];
const EX_TIPOS = [{ id: "all", label: "Todos" }, { id: "pre", label: "Predefinidos" }, { id: "custom", label: "Personalizados" }];
const EX_ESTADOS = [{ id: "all", label: "Todos" }, { id: "done", label: "Hechos" }, { id: "todo", label: "Sin hacer" }];

function exFilterCount(f) {
  return f.groups.length + f.equips.length + (f.tipo !== "all" ? 1 : 0) + (f.estado !== "all" ? 1 : 0);
}
function exFilterSort(list, f) {
  const groupOrder = (typeof VX_GROUPS !== "undefined") ? VX_GROUPS : [];
  let r = list.filter((ex) => {
    if (f.q) {
      const q = f.q.toLowerCase();
      if (![ex.name, ex.target, ex.group].some((s) => (s || "").toLowerCase().includes(q))) return false;
    }
    if (f.groups.length && !f.groups.includes(ex.group)) return false;
    if (f.equips.length && !f.equips.includes(ex.equip)) return false;
    if (f.tipo === "pre" && ex.custom) return false;
    if (f.tipo === "custom" && !ex.custom) return false;
    if (f.estado === "done" && !ex.done) return false;
    if (f.estado === "todo" && ex.done) return false;
    return true;
  });
  const az = (a, b) => a.name.localeCompare(b.name, "es");
  r = r.slice().sort((a, b) => {
    if (f.sort === "az") return az(a, b);
    if (f.sort === "usados") return (b.logs - a.logs) || az(a, b);
    if (f.sort === "grupo") return (groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group)) || az(a, b);
    const al = a.lastDays == null ? 1e9 : a.lastDays, bl = b.lastDays == null ? 1e9 : b.lastDays;
    return (al - bl) || az(a, b);
  });
  return r;
}

function toggleIn(arr, v) { return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]; }

function ExercisesView({ model, f, setF, onOpenFilter, onOpenSort }) {
  const list = exFilterSort(model.exercises, f);
  const nFilters = exFilterCount(f);
  const sortLabel = (EX_SORTS.find((s) => s.id === f.sort) || EX_SORTS[0]).label;
  const total = model.exercises.length;

  // chips activos (removibles)
  const active = [];
  f.groups.forEach((g) => active.push({ k: "g:" + g, label: g, off: () => setF({ groups: f.groups.filter((x) => x !== g) }) }));
  f.equips.forEach((e) => active.push({ k: "e:" + e, label: e, off: () => setF({ equips: f.equips.filter((x) => x !== e) }) }));
  if (f.tipo !== "all") active.push({ k: "t", label: EX_TIPOS.find((x) => x.id === f.tipo).label, off: () => setF({ tipo: "all" }) });
  if (f.estado !== "all") active.push({ k: "s", label: EX_ESTADOS.find((x) => x.id === f.estado).label, off: () => setF({ estado: "all" }) });

  return (
    <>
      <div className="e-searchbar">
        <EIcon.search size={16} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
        <input className="e-searchbar__in" placeholder="Buscar ejercicio" value={f.q}
          onChange={(e) => setF({ q: e.target.value })} />
        {f.q && <button className="e-searchbar__x" aria-label="Limpiar" onClick={() => setF({ q: "" })}><Icon.x size={14} /></button>}
      </div>

      <div className="e-fbar">
        <button className={"e-fbtn" + (nFilters ? " is-on" : "")} onClick={onOpenFilter}>
          <EIcon.funnel size={15} /> Filtros
          {nFilters > 0 && <span className="e-fbtn__badge">{nFilters}</span>}
        </button>
        <button className="e-fbtn" onClick={onOpenSort}>
          <EIcon.sort size={15} /> {sortLabel}
        </button>
      </div>

      {active.length > 0 && (
        <div className="e-actchips">
          {active.map((a) => (
            <button key={a.k} className="e-actchip" onClick={a.off}>
              {a.label} <Icon.x size={11} />
            </button>
          ))}
          <button className="e-actchip e-actchip--clear" onClick={() => setF({ groups: [], equips: [], tipo: "all", estado: "all" })}>Limpiar</button>
        </div>
      )}

      <div className="e-section">{list.length} {list.length === 1 ? "ejercicio" : "ejercicios"}{list.length !== total ? ` · de ${total}` : ""}</div>

      {list.length === 0 ? (
        <div className="e-noresults">
          <EIcon.search size={26} style={{ color: "rgba(255,255,255,0.3)" }} />
          <div className="e-noresults__t">Sin resultados</div>
          <div className="e-noresults__b">Prueba a quitar algún filtro o cambiar la búsqueda.</div>
        </div>
      ) : (
        <div className="e-exlist">
          {list.map((ex) => {
            const cfg = DAY_TYPE[ex.part] || DAY_TYPE.push;
            return (
              <div className={"e-ex" + (ex.done ? "" : " is-todo")} key={ex.slug}
                onClick={() => vxNav(VX.DETALLE, { ejercicio: ex.slug })} style={{ cursor: "pointer" }}>
                <EBubble color={cfg.color} bg={cfg.bg} size={38}>{cfg.icon({ size: 18 })}</EBubble>
                <div className="e-ex__body">
                  <div className="e-ex__name">{ex.name}</div>
                  <div className="e-ex__meta">
                    {ex.target} · {ex.equip}
                    {ex.custom && <span className="e-ex__cust">Personalizado</span>}
                  </div>
                </div>
                <div className="e-ex__right">
                  {ex.pr
                    ? <div className="e-ex__pr"><EIcon.trophy size={10} /> {ex.pr}</div>
                    : ex.done
                    ? <div className="e-ex__logs">{ex.logs}×</div>
                    : <div className="e-ex__nodata">Sin registrar</div>}
                  <Icon.chevronRight size={16} style={{ color: "rgba(255,255,255,0.28)" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ── sheets (bottom modals) ────────────────────────────────────────────────────
function SheetShell({ title, onClose, children, foot }) {
  return (
    <div className="e-scrim" onClick={onClose}>
      <div className="e-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="e-sheet__grab" />
        <div className="e-sheet__head">
          <span className="e-sheet__title">{title}</span>
          <button className="e-sheet__close" aria-label="Cerrar" onClick={onClose}><Icon.x size={18} /></button>
        </div>
        <div className="e-sheet__body">{children}</div>
        {foot}
      </div>
    </div>
  );
}

function ChipGroup({ options, selected, onToggle }) {
  return (
    <div className="e-fchips">
      {options.map((o) => (
        <button key={o} className={"e-fchip" + (selected.includes(o) ? " is-on" : "")} onClick={() => onToggle(o)}>
          {selected.includes(o) && <Icon.check size={12} />} {o}
        </button>
      ))}
    </div>
  );
}

function SegRow({ options, value, onChange }) {
  return (
    <div className="e-seg2">
      {options.map((o) => (
        <button key={o.id} className={"e-seg2__b" + (o.id === value ? " is-on" : "")} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

function FilterSheet({ f, setF, count, onClose }) {
  const nActive = exFilterCount(f);
  return (
    <SheetShell title="Filtros" onClose={onClose}
      foot={
        <div className="e-sheet__foot">
          {nActive > 0 && (
            <button className="e-sheet__clear" onClick={() => setF({ groups: [], equips: [], tipo: "all", estado: "all" })}>Limpiar todo</button>
          )}
          <button className="e-sheet__cta" onClick={onClose}>Ver {count} {count === 1 ? "ejercicio" : "ejercicios"}</button>
        </div>
      }>
      <div className="e-sheet__sec">
        <div className="e-sheet__seclbl">Grupo muscular</div>
        <ChipGroup options={VX_GROUPS} selected={f.groups} onToggle={(g) => setF({ groups: toggleIn(f.groups, g) })} />
      </div>
      <div className="e-sheet__sec">
        <div className="e-sheet__seclbl">Equipamiento</div>
        <ChipGroup options={VX_EQUIPS} selected={f.equips} onToggle={(e) => setF({ equips: toggleIn(f.equips, e) })} />
      </div>
      <div className="e-sheet__sec">
        <div className="e-sheet__seclbl">Tipo</div>
        <SegRow options={EX_TIPOS} value={f.tipo} onChange={(v) => setF({ tipo: v })} />
      </div>
      <div className="e-sheet__sec">
        <div className="e-sheet__seclbl">Estado</div>
        <SegRow options={EX_ESTADOS} value={f.estado} onChange={(v) => setF({ estado: v })} />
      </div>
    </SheetShell>
  );
}

function SortSheet({ f, setF, onClose }) {
  return (
    <SheetShell title="Ordenar por" onClose={onClose}>
      <div className="e-sortlist">
        {EX_SORTS.map((s) => (
          <button key={s.id} className={"e-sortrow" + (s.id === f.sort ? " is-on" : "")}
            onClick={() => { setF({ sort: s.id }); onClose(); }}>
            <div>
              <div className="e-sortrow__l">{s.label}</div>
              <div className="e-sortrow__h">{s.hint}</div>
            </div>
            {s.id === f.sort && <span className="e-sortrow__c"><Icon.check size={16} /></span>}
          </button>
        ))}
      </div>
    </SheetShell>
  );
}

// ── segmented selector ──────────────────────────────────────────────────────
const SEGMENTS = [
  { id: "rutina", label: "Rutina" },
  { id: "sesiones", label: "Sesiones" },
  { id: "ejercicios", label: "Ejercicios" },
];

function Selector({ active, onSelect }) {
  const idx = Math.max(0, SEGMENTS.findIndex((s) => s.id === active));
  return (
    <div className="e-seg">
      <div className="e-seg__thumb" style={{ left: `calc(3px + ${idx} * (100% - 6px) / 3)`, width: "calc((100% - 6px) / 3)" }} />
      {SEGMENTS.map((s) => (
        <button key={s.id} className={"e-seg__btn" + (s.id === active ? " is-on" : "")} onClick={() => onSelect(s.id)}>
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ── tab bar ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "hoy", label: "Hoy", icon: Icon.flame },
  { id: "entreno", label: "Entreno", icon: Icon.dumbbell },
  { id: "nutricion", label: "Nutrición", icon: Icon.leaf },
  { id: "progreso", label: "Progreso", icon: Icon.lineChart },
];

function TabBar({ active = "entreno" }) {
  const dest = { hoy: VX.HOY, entreno: VX.ENTRENO };
  return (
    <div className="e-tabbar">
      {TABS.map((tb) => (
        <div key={tb.id} className={"e-tab" + (tb.id === active ? " is-active" : "")}
          onClick={() => dest[tb.id] && tb.id !== active ? vxNav(dest[tb.id]) : undefined}
          style={{ cursor: dest[tb.id] && tb.id !== active ? "pointer" : "default" }}>
          <span className="e-tab__icon">{tb.icon({ size: 23 })}</span>
          <span className="e-tab__label">{tb.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── screen composition ──────────────────────────────────────────────────────
function EntrenoScreen({ t, onSelect }) {
  const model = buildEntreno(t);
  const { segment, empty, liveOn } = model;
  const showBanner = liveOn && (segment !== "rutina" || model.banner);

  const [f, setFRaw] = React.useState(EX_FILTER_DEFAULT);
  const [sheet, setSheet] = React.useState(null); // 'filtros' | 'orden' | null
  const setF = (patch) => setFRaw((prev) => ({ ...prev, ...patch }));

  let body;
  if (segment === "sesiones") {
    body = <div className="e-pad"><SessionsView model={model} /></div>;
  } else if (segment === "ejercicios") {
    body = <div className="e-pad"><ExercisesView model={model} f={f} setF={setF}
      onOpenFilter={() => setSheet("filtros")} onOpenSort={() => setSheet("orden")} /></div>;
  } else if (empty) {
    body = (
      <div className="e-pad">
        <EmptyInvite />
      </div>
    );
  } else {
    body = (
      <div className="e-pad">
        <RoutineHero model={model} />
        {liveOn ? <LiveSession model={model} /> : <NextSession model={model} />}
        {model.agentPulse && <AgentNote msg={model.agent} />}
        <div className="e-section e-section--sp">La semana · tu rotación</div>
        <Spine model={model} />
      </div>
    );
  }

  return (
    <div className="e-screen">
      <div className={"e-scroll" + (showBanner ? " e-scroll--banner" : "")}>
        <div className="e-head">
          <div className="e-title">Entreno</div>
          <Selector active={segment} onSelect={onSelect} />
        </div>
        {body}
      </div>
      {showBanner && <FloatingBanner model={model} />}
      <TabBar active="entreno" />
      {sheet === "filtros" && <FilterSheet f={f} setF={setF} count={exFilterSort(model.exercises, f).length} onClose={() => setSheet(null)} />}
      {sheet === "orden" && <SortSheet f={f} setF={setF} onClose={() => setSheet(null)} />}
    </div>
  );
}

Object.assign(window, {
  buildEntreno, EIcon, EBubble, ScoreChip, WeekBlock, RoutineHero,
  NextSession, LiveTimer, LiveSession, FloatingBanner, Spine, AgentNote,
  EmptyInvite, SessionsView, ExercisesView, Selector, TabBar, EntrenoScreen,
  exFilterSort, exFilterCount, FilterSheet, SortSheet, SheetShell,
});
