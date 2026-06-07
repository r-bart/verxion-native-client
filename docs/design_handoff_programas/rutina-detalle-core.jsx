// rutina-detalle-core.jsx — "Detalle de rutina": los metadatos del bloque que
// armó el agente + la rotación de días (cada uno abre su detalle). Solo lee:
// ajustar la rutina es una petición al agente, no una edición a mano.

const RtIcon = {
  target:   (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  repeat:   (p) => <Svg {...p}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></Svg>,
  calendar: (p) => <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></Svg>,
  layers:   (p) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" /></Svg>,
  clock:    (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>,
  bolt:     (p) => <Svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" /></Svg>,
  trendUp:  (p) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" /></Svg>,
  check2:   (p) => <Svg {...p}><path d="M20 6L9 17l-5-5" /></Svg>,
  more:     (p) => <Svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
};

function RtScoreChip({ state }) {
  const cls = { ahead: "ahead", on: "on", behind: "behind" }[state] || "on";
  const word = state === "ahead" ? "Vas adelantado" : state === "behind" ? "Vas justo" : "En objetivo";
  return (
    <span className={"rt-score is-" + cls}>
      {state === "ahead" && <RtIcon.trendUp size={11} />}
      {word}
    </span>
  );
}

function RtBubble({ color, bg, size = 44, glow, children }) {
  return (
    <span className="rt-bubble" style={{ width: size, height: size, color, background: bg,
      boxShadow: glow ? `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 22px ${glow}` : undefined }}>{children}</span>
  );
}

// estado por día de la rotación, según el estado de la rutina
function rtDayStatus(routine, idx, isRest) {
  if (isRest) return "rest";
  if (routine.state === "completed") return "done";
  if (routine.state === "active") {
    if (idx < routine.todayIdx) return "done";
    if (idx === routine.todayIdx) return "now";
    return "up";
  }
  return "up"; // draft / paused
}

// ── HERO ─────────────────────────────────────────────────────────────────────
function RtHero({ routine }) {
  const st = RD_STATE[routine.state];
  const type = rdHeroType(routine);
  const cfg = RD_DAY[type];
  const isDraft = routine.state === "draft";
  const isActive = routine.state === "active";
  const isPaused = routine.state === "paused";
  const isCompleted = routine.state === "completed";
  const adherence = Math.round((routine.done / routine.planned) * 100);
  const ctx = isDraft ? routine.created
    : isCompleted ? "Finalizada · " + routine.finished
    : isPaused ? "En pausa · " + routine.pausedOn
    : "Última: " + routine.lastTrained;

  return (
    <div className={"rt-hero rt-hero--" + routine.state}>
      <div className="rt-hero__top">
        <span className="rt-eyebrow" style={{ color: st.color }}>
          {isDraft && <Isotype size={12} glow />}
          {isActive && <span className="rt-livedot" />}
          {st.short}
        </span>
        <span className="rt-hero__ctx">{ctx}</span>
      </div>

      <div className="rt-hero__row">
        <RtBubble color={cfg.color} bg={cfg.bg} size={52} glow={cfg.glow}>{cfg.icon({ size: 26 })}</RtBubble>
        <div style={{ minWidth: 0 }}>
          <div className="rt-hero__name">{routine.name}</div>
          <div className="rt-hero__tags">
            <span className="rt-tag"><RtIcon.target size={11} /> {routine.goal}</span>
          </div>
        </div>
      </div>

      <div className="rt-hero__stats">
        <div className="rt-stat"><RtIcon.calendar size={14} /><b>{routine.perWeek}</b><span>días/sem</span></div>
        <div className="rt-stat"><RtIcon.layers size={14} /><b>{routine.weeks}</b><span>semanas</span></div>
        {isDraft
          ? <div className="rt-stat"><RtIcon.bolt size={14} /><b>{routine.planned}</b><span>sesiones</span></div>
          : <div className="rt-stat"><RtIcon.check2 size={14} /><b>{adherence}<em>%</em></b><span>adherencia</span></div>}
        <div className="rt-stat"><RtIcon.bolt size={14} /><b>{routine.volTotal || "—"}</b><span>volumen</span></div>
      </div>

      {!isDraft && (
        <div className="rt-prog">
          <div className="rt-prog__head">
            <span className="rt-prog__lbl">{isCompleted ? "Completada" : "Semana"} <b>{isCompleted ? "" : routine.week}</b>{isCompleted ? "" : " de " + routine.weeks}</span>
            {!isCompleted && <RtScoreChip state={routine.scoreState} />}
          </div>
          <div className="rt-cells">
            {Array.from({ length: routine.weeks }).map((_, i) => {
              const cls = isCompleted ? "is-done" : i < routine.week - 1 ? "is-done" : i === routine.week - 1 ? "is-now" : "";
              const frac = (isActive && typeof routine.weekFrac === "number" && routine.weekFrac > 0 && routine.weekFrac < 1) ? routine.weekFrac : null;
              return (
                <span key={i} className={"rt-cell " + cls}>
                  {cls === "is-now" && frac != null && <span className="rt-cell__fill" style={{ width: Math.max(8, frac * 100) + "%" }} />}
                </span>
              );
            })}
          </div>
          <div className="rt-prog__meta">{routine.done} de {routine.planned} sesiones · <span style={{ color: "var(--vx-up)" }}>+{routine.volTrend}% volumen</span></div>
        </div>
      )}
    </div>
  );
}

// ── nota del agente ───────────────────────────────────────────────────────────
function RtAgentNote({ routine }) {
  const isDraft = routine.state === "draft";
  return (
    <div className="rt-agent">
      <span className="rt-agent__mark"><Isotype size={22} glow /></span>
      <div>
        <div className="rt-agent__from">verxion · {isDraft ? "por qué esta rutina" : "sobre tu bloque"}</div>
        <div className="rt-agent__msg">{routine.note}</div>
      </div>
    </div>
  );
}

// ── tarjeta de día (abre el detalle de día) ────────────────────────────────────
function RtDayCard({ routine, day, idx }) {
  const r = rdResolveDay(routine, idx);
  const status = rtDayStatus(routine, idx, r.isRest);
  const isToday = status === "now";
  const tappable = !r.isRest;
  const onTap = !tappable ? undefined
    : isToday ? () => vxNav(VX.PRESCRIPCION, { dia: r.type })
    : () => vxNav(VX.DIA, { rutina: routine.slug, dia: idx });

  return (
    <button className={"rt-day is-" + status} onClick={onTap} disabled={!tappable}>
      <span className="rt-day__node" style={{ color: r.cfg.color, background: r.cfg.bg, borderColor: status === "done" ? r.cfg.color : undefined }}>
        {status === "done" ? <RtIcon.check2 size={15} /> : r.cfg.icon({ size: 17 })}
      </span>
      <div className="rt-day__body">
        <div className="rt-day__head">
          <span className="rt-day__dow">{r.dow}</span>
          <span className="rt-day__name">{r.name}</span>
          {!r.isRest && <span className="rt-day__type" style={{ color: r.cfg.color, background: r.cfg.bg }}>{r.cfg.tag}</span>}
          {isToday && <span className="rt-day__today">hoy</span>}
        </div>
        <div className="rt-day__focus">{r.focus}</div>
        {!r.isRest && (
          <div className="rt-day__meta">
            <span>{r.summary.ex} ejercicios</span>
            <span className="rt-dot">·</span>
            <span>{r.summary.sets} series</span>
            <span className="rt-dot">·</span>
            <span>{r.est || "~" + r.summary.min + " min"}</span>
          </div>
        )}
      </div>
      {tappable && <Icon.chevronRight size={16} style={{ color: "rgba(255,255,255,0.28)", flexShrink: 0, alignSelf: "center" }} />}
    </button>
  );
}

// ── superficie de "pídeselo al agente" ──────────────────────────────────────
function RtAskAgent({ routine }) {
  const isDraft = routine.state === "draft";
  const isPaused = routine.state === "paused";
  const isCompleted = routine.state === "completed";
  const label = isDraft ? "Pídele a verxion que active esta rutina"
    : isPaused ? "Pídele a verxion que la reanude"
    : isCompleted ? "Pídele a verxion que la repita o la ajuste"
    : "Ajusta esta rutina con el agente";
  const hint = isDraft ? "Es un borrador — el agente la pone en marcha cuando se lo dices."
    : "La rutina es de solo lectura. Los cambios los hace verxion vía chat.";
  return (
    <button className="rt-ask" onClick={() => vxNav(VX.AGENTE, { caso: "inicio" })}>
      <span className="rt-ask__iso"><Isotype size={20} glow /></span>
      <div className="rt-ask__body">
        <div className="rt-ask__label">{label}</div>
        <div className="rt-ask__hint">{hint}</div>
      </div>
      <span className="rt-ask__c">›</span>
    </button>
  );
}

// ── pantalla ────────────────────────────────────────────────────────────────
function RutinaDetalleScreen({ t }) {
  const routine = rdRoutineBySlug(t.rutina || "ppl-hipertrofia");
  const trainingDays = routine.days.filter((d) => (d.type || "") !== "rest").length;
  // si se llega desde un programa, "volver" regresa al programa, no a Rutinas
  const fromP = (typeof vxReadParams === "function") ? vxReadParams(["from", "programa"]) : {};
  const back = fromP.from === "hoy"
    ? () => vxNav(VX.HOY)
    : fromP.from === "programa"
    ? () => vxNav(VX.PROGRAMA, { programa: fromP.programa })
    : () => vxNav(VX.RUTINAS);

  return (
    <div className="rt-screen">
      <div className="rt-scroll">
        <div className="rt-chrome">
          <button className="rt-chrome__btn" aria-label="Volver" onClick={back}><Icon.chevronLeft size={20} /></button>
          <div className="rt-chrome__title">{routine.name}</div>
          <button className="rt-chrome__btn" aria-label="Más"><RtIcon.more size={20} /></button>
        </div>

        <div className="rt-pad">
          <RtHero routine={routine} />

          <div className="rt-sec">
            <span className="rt-sec__k">La rotación</span>
            <span className="rt-sec__count">{trainingDays} días de entreno · {routine.perWeek === 6 ? "1 descanso" : "semana de " + routine.days.length}</span>
            <span className="rt-sec__line" />
          </div>

          <div className="rt-days">
            {routine.days.map((d, i) => <RtDayCard key={i} routine={routine} day={d} idx={i} />)}
          </div>

          <button className="rt-seslink" onClick={() => vxNav(VX.SESIONES, { rutina: routine.slug })}>
            <span className="rt-seslink__l"><RtIcon.layers size={15} /> Sesiones de este bloque</span>
            <span className="rt-seslink__r">{routine.done} <Icon.chevronRight size={15} /></span>
          </button>

          <RtAskAgent routine={routine} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  RtIcon, RtScoreChip, RtBubble, rtDayStatus, RtHero, RtAgentNote, RtDayCard, RtAskAgent, RutinaDetalleScreen,
});
