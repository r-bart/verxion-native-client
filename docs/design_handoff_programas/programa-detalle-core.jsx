// programa-detalle-core.jsx — "Detalle de programa": los metadatos del contenedor
// que armó el agente, la adherencia UNIFICADA (entreno + dieta) y el acoplamiento.
// Las tarjetas de rutina/dieta abren su detalle llevando from=programa, para que el
// "volver" regrese aquí. Solo lee: activar/pausar/ajustar es petición al agente.
// Usa programas-data.jsx + rutinas-data.jsx + dietas-data.jsx.

const PgdIcon = {
  target:   (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  calendar: (p) => <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></Svg>,
  layers:   (p) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" /></Svg>,
  clock:    (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>,
  link:     (p) => <Svg {...p}><path d="M9 12a3 3 0 0 1 3-3h3a3 3 0 0 1 0 6h-1M15 12a3 3 0 0 1-3 3H9a3 3 0 0 1 0-6h1" /></Svg>,
  dumbbell: (p) => <Svg {...p}><path d="M6.5 6.5l11 11M3 9l3-3M18 21l3-3M6 18l-3-3M21 6l-3-3M14.5 9.5l-5 5" /></Svg>,
  utensils: (p) => <Svg {...p}><path d="M4 3v6a2 2 0 0 0 2 2v10M6 3v8M9 3v6a2 2 0 0 1-2 2M18 3c-1.5 1-2 3-2 5s.5 3 2 3v10" /></Svg>,
  trendUp:  (p) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" /></Svg>,
  shield:   (p) => <Svg {...p}><path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" /></Svg>,
  more:     (p) => <Svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
};

// color del estado de adherencia
function pgdStateColor(state) {
  return state === "ahead" ? "var(--vx-up)" : state === "behind" ? "var(--vx-health)" : "var(--vx-neutral)";
}

function PgdBubble({ color, bg, size = 52, glow, children }) {
  return (
    <span className="pgd-bubble" style={{ width: size, height: size, color, background: bg,
      boxShadow: glow ? `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 22px ${glow}` : undefined }}>{children}</span>
  );
}

// aplica los tweaks de demo sobre el programa base ("auto" = sin override, respeta
// el estado real del programa al navegar desde la lista)
function buildProgramaDetalle(t) {
  const base = pgProgramBySlug((t && t.programa) || "recomp-primavera");
  const p = { ...base, adherence: base.adherence ? { ...base.adherence } : null };
  if (t && t.estado && t.estado !== "auto") p.state = t.estado;
  if (t && t.ventana && t.ventana !== "auto") p.durationType = t.ventana;
  // dieta acoplada on/off
  if (t && t.sinDieta) p.dietSlug = null;
  // fase de adherencia
  if (p.adherence && t && t.fase && t.fase !== "auto") {
    p.adherence.phase = t.fase;
    if (t.fase === "cold_start") p.adherence.confidence = "low";
    else if (t.fase === "baseline_building") p.adherence.confidence = "medium";
    else p.adherence.confidence = "high";
  }
  // sin dieta → la adherencia unificada cae al solo-entreno
  if (p.adherence && !p.dietSlug) {
    p.adherence = { ...p.adherence, unifiedScore: p.adherence.training.score, diet: null };
  }
  // borrador → sin adherencia (aún no hay datos)
  if (p.state === "draft") p.adherence = null;
  return p;
}

// ── HERO ──────────────────────────────────────────────────────────────────────
function PgdHero({ program }) {
  const cfg = pgGoalCfg(program.goal), st = PG_STATE[program.state];
  const isDraft = program.state === "draft";
  const isActive = program.state === "active";
  const isPaused = program.state === "paused";
  const isCompleted = program.state === "completed";
  const coupleN = (program.routineSlug ? 1 : 0) + (program.dietSlug ? 1 : 0);
  const ctx = isDraft ? "Creado " + program.created
    : isCompleted ? "Finalizado · " + program.finished
    : isPaused ? "En pausa"
    : "Actualizado · " + program.updated;

  return (
    <div className={"pgd-hero pgd-hero--" + program.state}>
      <div className="pgd-hero__top">
        <span className="pgd-eyebrow" style={{ color: st.color }}>
          {isDraft && <Isotype size={12} glow />}
          {isActive && <span className="pgd-livedot" />}
          {st.short}
        </span>
        <span className="pgd-hero__ctx">{ctx}</span>
      </div>

      <div className="pgd-hero__row">
        <PgdBubble color={cfg.color} bg={cfg.bg} size={52} glow={cfg.glow}>{cfg.icon({ size: 26 })}</PgdBubble>
        <div style={{ minWidth: 0 }}>
          <div className="pgd-hero__name">{program.name}</div>
          <div className="pgd-hero__tags">
            <span className="pgd-tag" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.color + "55" }}><PgdIcon.target size={11} /> {cfg.tag}</span>
          </div>
        </div>
      </div>

      <div className="pgd-hero__desc">{program.description}</div>

      <div className="pgd-hero__stats">
        <div className="pgd-stat"><PgdIcon.calendar size={14} /><b>{pgTrainingDays(program)}</b><span>días/sem</span></div>
        <div className="pgd-stat"><PgdIcon.clock size={14} /><b>{pgWindowShort(program)}</b><span>{program.durationType === "indefinite" ? "duración" : "ventana"}</span></div>
        <div className="pgd-stat"><PgdIcon.link size={14} /><b>{coupleN}<em>/2</em></b><span>acoplado</span></div>
      </div>
      {program.durationType === "date_range" && (
        <div className="pgd-hero__window"><PgdIcon.calendar size={12} /> {pgWindow(program)}</div>
      )}
    </div>
  );
}

// ── ADHERENCIA UNIFICADA (read-model: score + fase + confianza) ───────────────
function PgdRing({ score, color }) {
  const r = 34, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, score)) / 100);
  return (
    <svg className="pgd-ring" width="86" height="86" viewBox="0 0 86 86">
      <circle cx="43" cy="43" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
      <circle cx="43" cy="43" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 43 43)" style={{ transition: "stroke-dashoffset .5s cubic-bezier(0.2,0.8,0.2,1)" }} />
      <text x="43" y="40" textAnchor="middle" className="pgd-ring__num">{score}</text>
      <text x="43" y="55" textAnchor="middle" className="pgd-ring__den">/ 100</text>
    </svg>
  );
}

function PgdSubBar({ icon, label, score, color, sub }) {
  return (
    <div className="pgd-subbar">
      <div className="pgd-subbar__head">
        <span className="pgd-subbar__lbl" style={{ color }}>{icon} {label}</span>
        <span className="pgd-subbar__val">{score == null ? "—" : score + "%"}</span>
      </div>
      <div className="pgd-track"><div className="pgd-track__fill" style={{ width: (score || 0) + "%", background: color }} /></div>
      {sub && <div className="pgd-subbar__sub">{sub}</div>}
    </div>
  );
}

function PgdAdherence({ program }) {
  const adh = program.adherence;
  if (!adh) return null;
  const color = pgdStateColor(adh.state);
  const phase = PG_PHASE[adh.phase] || PG_PHASE.active_tracking;
  const hasDiet = !!program.dietSlug && adh.diet;
  return (
    <div className="pgd-adh">
      <div className="pgd-adh__top">
        <PgdRing score={adh.unifiedScore} color={color} />
        <div className="pgd-adh__id">
          <div className="pgd-adh__k">Adherencia unificada</div>
          <span className="pgd-adh__chip" style={{ color, background: color === "var(--vx-up)" ? "var(--vx-up-tint)" : "rgba(255,255,255,0.06)", borderColor: color === "var(--vx-up)" ? "var(--vx-up-line)" : "rgba(255,255,255,0.14)" }}>
            {adh.state === "ahead" && <PgdIcon.trendUp size={11} />} {pgScoreWord(adh.state)}
          </span>
          <div className="pgd-adh__phase">
            <span className="pgd-phasepill">{phase.label}</span>
            <span className="pgd-phasepill pgd-phasepill--mut"><PgdIcon.shield size={10} /> {PG_CONF[adh.confidence]}</span>
          </div>
        </div>
      </div>
      <div className="pgd-adh__hint">{phase.hint}</div>
      <div className="pgd-adh__bars">
        <PgdSubBar icon={<PgdIcon.dumbbell size={12} />} label="Entreno" score={adh.training.score} color="var(--vx-lava)"
          sub={`${adh.training.done}/${adh.training.planned} sesiones`} />
        {hasDiet ? (
          <PgdSubBar icon={<PgdIcon.utensils size={12} />} label="Dieta" score={adh.diet.score} color="var(--vx-body)"
            sub={`${adh.diet.done}/${adh.diet.planned} días`} />
        ) : (
          <div className="pgd-subbar pgd-subbar--empty">
            <div className="pgd-subbar__head">
              <span className="pgd-subbar__lbl" style={{ color: "rgba(255,255,255,0.5)" }}><PgdIcon.utensils size={12} /> Dieta</span>
              <span className="pgd-subbar__val">—</span>
            </div>
            <div className="pgd-subbar__sub">Sin dieta acoplada · solo cuenta el entreno</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── nota del agente ────────────────────────────────────────────────────────────
function PgdAgentNote({ program }) {
  const isDraft = program.state === "draft";
  return (
    <div className="pgd-agent">
      <span className="pgd-agent__mark"><Isotype size={22} glow /></span>
      <div>
        <div className="pgd-agent__from">verxion · {isDraft ? "por qué este programa" : "sobre tu programa"}</div>
        <div className="pgd-agent__msg">{program.note}</div>
      </div>
    </div>
  );
}

// ── calendario semanal (weeklySchedule, Lun–Dom) ───────────────────────────────
function PgdSchedule({ program }) {
  const sched = program.weeklySchedule || [];
  const used = [];
  sched.forEach((s) => { if (!used.includes(s)) used.push(s); });
  return (
    <div className="pgd-sched">
      <div className="pgd-week">
        {sched.map((type, i) => {
          const cfg = PG_SLOT[type] || PG_SLOT.custom;
          const isRest = type === "rest";
          return (
            <div key={i} className="pgd-daycol">
              <span className="pgd-daycol__dow">{PG_DOW[i]}</span>
              <span className={"pgd-daycol__cell" + (isRest ? " is-rest" : "")}
                style={isRest ? undefined : { background: cfg.fill, borderColor: cfg.fillLine }}>
                {isRest ? <span className="pgd-daycol__rest" /> : null}
              </span>
            </div>
          );
        })}
      </div>
      <div className="pgd-legend">
        {used.map((type) => {
          const cfg = PG_SLOT[type];
          const isRest = type === "rest";
          return (
            <span key={type} className="pgd-legenditem">
              <span className={"pgd-legenddot" + (isRest ? " is-hollow" : "")} style={isRest ? undefined : { background: cfg.color }} /> {cfg.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── tarjetas de acoplamiento (abren el detalle de rutina / dieta) ──────────────
function PgdRoutineCard({ program }) {
  const r = pgRoutine(program);
  if (!r) return <PgdEmptyCouple kind="routine" />;
  const type = rdHeroType(r), cfg = RD_DAY[type];
  const open = () => vxNav(VX.RUTINA, { rutina: r.slug, from: "programa", programa: program.slug });
  return (
    <button className="pgd-couple" onClick={open}>
      <PgdBubble color={cfg.color} bg={cfg.bg} size={44} glow={cfg.glow}>{cfg.icon({ size: 21 })}</PgdBubble>
      <div className="pgd-couple__body">
        <div className="pgd-couple__k"><PgdIcon.dumbbell size={11} /> Rutina</div>
        <div className="pgd-couple__name">{r.name}</div>
        <div className="pgd-couple__meta">{r.split} · {r.state === "completed" ? r.weeks + " sem" : "sem " + r.week + "/" + r.weeks} · {r.score}% adh.</div>
      </div>
      <Icon.chevronRight size={18} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0, alignSelf: "center" }} />
    </button>
  );
}

function PgdDietCard({ program }) {
  const d = pgDiet(program);
  if (!d) return <PgdEmptyCouple kind="diet" />;
  const cfg = (typeof DZ_GOAL !== "undefined" && DZ_GOAL[d.goal]) || { color: "var(--vx-body)", bg: "var(--vx-body-bg)", glow: "rgba(0,210,255,0.26)", icon: PgdIcon.utensils };
  const open = () => vxNav(VX.DIETA, { dieta: d.slug, from: "programa", programa: program.slug });
  return (
    <button className="pgd-couple" onClick={open}>
      <PgdBubble color={cfg.color} bg={cfg.bg} size={44} glow={cfg.glow}>{cfg.icon({ size: 21 })}</PgdBubble>
      <div className="pgd-couple__body">
        <div className="pgd-couple__k"><PgdIcon.utensils size={11} /> Dieta</div>
        <div className="pgd-couple__name">{d.name.split(" · ")[0]}</div>
        <div className="pgd-couple__meta">{d.kcalGoal.toLocaleString("de-DE")} kcal · {d.pGoal} g P · {d.state === "completed" ? d.weeks + " sem" : "sem " + d.week + "/" + d.weeks}</div>
      </div>
      <Icon.chevronRight size={18} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0, alignSelf: "center" }} />
    </button>
  );
}

function PgdEmptyCouple({ kind }) {
  const isDiet = kind === "diet";
  return (
    <button className="pgd-couple pgd-couple--empty" onClick={() => vxNav(VX.AGENTE, { caso: "inicio" })}>
      <span className="pgd-couple__slot">{isDiet ? <PgdIcon.utensils size={20} /> : <PgdIcon.dumbbell size={20} />}</span>
      <div className="pgd-couple__body">
        <div className="pgd-couple__k">{isDiet ? "Dieta" : "Rutina"}</div>
        <div className="pgd-couple__name pgd-couple__name--mut">Sin {isDiet ? "dieta" : "rutina"} acoplada</div>
        <div className="pgd-couple__meta">Pídele a verxion que acople una y aparecerá aquí.</div>
      </div>
      <span className="pgd-couple__add">+</span>
    </button>
  );
}

// ── superficie de "pídeselo al agente" ──────────────────────────────────────────
function PgdAskAgent({ program }) {
  const isDraft = program.state === "draft";
  const isPaused = program.state === "paused";
  const isCompleted = program.state === "completed";
  const incomplete = !program.routineSlug && !program.dietSlug;
  const label = isDraft
    ? (incomplete ? "Acopla una rutina o dieta para activarlo" : "Pídele a verxion que active este programa")
    : isPaused ? "Pídele a verxion que lo reanude"
    : isCompleted ? "Pídele a verxion que lo repita o lo ajuste"
    : "Ajusta este programa con el agente";
  const hint = isDraft
    ? (incomplete ? "Un programa necesita al menos una rutina o una dieta antes de ponerse en marcha." : "Es un borrador — el agente lo pone en marcha cuando se lo dices.")
    : "El programa es de solo lectura. Activar, pausar o reajustar lo hace verxion vía chat.";
  return (
    <button className="pgd-ask" onClick={() => vxNav(VX.AGENTE, { caso: "inicio" })}>
      <span className="pgd-ask__iso"><Isotype size={20} glow /></span>
      <div className="pgd-ask__body">
        <div className="pgd-ask__label">{label}</div>
        <div className="pgd-ask__hint">{hint}</div>
      </div>
      <span className="pgd-ask__c">›</span>
    </button>
  );
}

// ── pantalla ────────────────────────────────────────────────────────────────────
function ProgramaDetalleScreen({ t }) {
  const program = buildProgramaDetalle(t);
  const back = (t && t.from === "hoy") ? () => vxNav(VX.HOY) : () => vxNav(VX.PROGRAMAS);

  return (
    <div className="pgd-screen">
      <div className="pgd-scroll">
        <div className="pgd-chrome">
          <button className="pgd-chrome__btn" aria-label="Volver" onClick={back}><Icon.chevronLeft size={20} /></button>
          <div className="pgd-chrome__title">{program.name}</div>
          <button className="pgd-chrome__btn" aria-label="Más"><PgdIcon.more size={20} /></button>
        </div>

        <div className="pgd-pad">
          <PgdHero program={program} />

          {program.adherence && <PgdAdherence program={program} />}

          <PgdAgentNote program={program} />

          <div className="pgd-sec">
            <span className="pgd-sec__k">La semana</span>
            <span className="pgd-sec__count">{pgWeekSummary(program.weeklySchedule)}</span>
            <span className="pgd-sec__line" />
          </div>
          <PgdSchedule program={program} />

          <div className="pgd-sec pgd-sec--sp">
            <span className="pgd-sec__k">Lo que acopla</span>
            <span className="pgd-sec__count">Toca para ver el detalle</span>
            <span className="pgd-sec__line" />
          </div>
          <div className="pgd-couples">
            <PgdRoutineCard program={program} />
            <PgdDietCard program={program} />
          </div>

          <PgdAskAgent program={program} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  PgdIcon, pgdStateColor, PgdBubble, buildProgramaDetalle, PgdHero, PgdRing, PgdSubBar,
  PgdAdherence, PgdAgentNote, PgdSchedule, PgdRoutineCard, PgdDietCard, PgdEmptyCouple,
  PgdAskAgent, ProgramaDetalleScreen,
});
