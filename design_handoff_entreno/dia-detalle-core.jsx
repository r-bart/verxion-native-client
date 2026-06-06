// dia-detalle-core.jsx — "Detalle de día de entreno": los metadatos del día
// dentro de su rutina + la lista de ejercicios (cada uno abre su detalle).
// Solo lee. Si el día es HOY aparece "Empezar sesión"; el resto es lectura.
// Cambiar el día es una petición al agente, no una edición a mano.

const DdIcon = {
  play:    (p) => <Svg {...p}><path d="M7 4.5v15l13-7.5-13-7.5Z" /></Svg>,
  repeat:  (p) => <Svg {...p}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></Svg>,
  layers:  (p) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" /></Svg>,
  clock:   (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>,
  timer:   (p) => <Svg {...p}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6M12 5V2" /></Svg>,
  bolt:    (p) => <Svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" /></Svg>,
  more:    (p) => <Svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
};

const DD_VOL = { push: "7,1 t", pull: "6,8 t", legs: "9,2 t" };

function DdBubble({ color, bg, size = 44, glow, children }) {
  return (
    <span className="dd-bubble" style={{ width: size, height: size, color, background: bg,
      boxShadow: glow ? `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 22px ${glow}` : undefined }}>{children}</span>
  );
}

// ── HERO del día ─────────────────────────────────────────────────────────────
function DdHero({ routine, day, idx }) {
  const { cfg, name, focus, dow, summary } = day;
  const trainingTotal = routine.days.filter((d) => (d.type || "") !== "rest").length;
  const dayNum = routine.days.slice(0, idx + 1).filter((d) => (d.type || "") !== "rest").length;
  const vol = DD_VOL[day.type] || "—";

  return (
    <div className="dd-hero">
      <div className="dd-hero__top">
        <span className="dd-eyebrow" style={{ color: cfg.color }}>
          {cfg.tag.toUpperCase()}
        </span>
        <span className="dd-hero__ctx"><DdIcon.repeat size={12} /> {routine.name} · día {dayNum}/{trainingTotal}</span>
      </div>
      <div className="dd-hero__row">
        <DdBubble color={cfg.color} bg={cfg.bg} size={52} glow={cfg.glow}>{cfg.icon({ size: 26 })}</DdBubble>
        <div style={{ minWidth: 0 }}>
          <div className="dd-hero__name">{name}</div>
          <div className="dd-hero__focus">{dow ? dow + " · " : ""}{focus}</div>
        </div>
      </div>
      <div className="dd-hero__stats">
        <div className="dd-stat"><DdIcon.layers size={14} /><b>{summary.ex}</b><span>ejercicios</span></div>
        <div className="dd-stat"><DdIcon.repeat size={14} /><b>{summary.sets}</b><span>series</span></div>
        <div className="dd-stat"><DdIcon.clock size={14} /><b>~{summary.min}</b><span>min</span></div>
        <div className="dd-stat"><DdIcon.bolt size={14} /><b>{vol}</b><span>vol. est.</span></div>
      </div>
    </div>
  );
}

// ── nota del agente (solo cuando es hoy) ─────────────────────────────────────
function DdAgentNote({ msg }) {
  return (
    <div className="dd-agent">
      <span className="dd-agent__mark"><Isotype size={22} glow /></span>
      <div>
        <div className="dd-agent__from">verxion · plan de hoy</div>
        <div className="dd-agent__msg">{msg}</div>
      </div>
    </div>
  );
}

// ── tarjeta de ejercicio ─────────────────────────────────────────────────────
function DdExCard({ ex, idx, cfg, origin }) {
  const slug = rdSlug(ex.name);
  return (
    <button className={"dd-ex" + (ex.key ? " is-key" : "")} onClick={() => vxNav(VX.DETALLE, { ejercicio: slug, origen: "dia", ...origin })}>
      <div className="dd-ex__rail">
        <span className="dd-ex__n" style={ex.key ? { color: cfg.color, borderColor: cfg.color } : null}>{idx}</span>
      </div>
      <div className="dd-ex__body">
        <div className="dd-ex__head">
          <div style={{ minWidth: 0 }}>
            <div className="dd-ex__name">
              {ex.name}
              {ex.key && <span className="dd-ex__keytag" style={{ color: cfg.color, background: cfg.bg }}>principal</span>}
            </div>
            <div className="dd-ex__muscle">{ex.muscle} · {ex.equip}</div>
          </div>
          <div className="dd-ex__target">
            <span>{ex.target}</span>
            <em>objetivo</em>
          </div>
        </div>
        <div className="dd-ex__rx">
          <span className="dd-rx"><b>{ex.sets}</b>×{ex.reps}</span>
          <span className="dd-rx dd-rx--mut">RIR {ex.rir}</span>
          <span className="dd-rx dd-rx--mut"><DdIcon.timer size={11} /> {ex.rest}</span>
          {ex.up && <span className="dd-rx dd-rx--up">↑ {ex.up}</span>}
        </div>
        <div className="dd-ex__last">última · {ex.last}</div>
      </div>
      <Icon.chevronRight size={16} style={{ color: "rgba(255,255,255,0.26)", flexShrink: 0, alignSelf: "center" }} />
    </button>
  );
}

// ── superficie "cambia este día con el agente" ───────────────────────────────
function DdAskAgent() {
  return (
    <button className="dd-ask" onClick={() => vxNav(VX.AGENTE, { caso: "inicio" })}>
      <span className="dd-ask__iso"><Isotype size={20} glow /></span>
      <div className="dd-ask__body">
        <div className="dd-ask__label">Cambia este día con el agente</div>
        <div className="dd-ask__hint">El plan es de solo lectura — para sustituir o reordenar ejercicios, díselo a verxion.</div>
      </div>
      <span className="dd-ask__c">›</span>
    </button>
  );
}

// ── pantalla ────────────────────────────────────────────────────────────────
function DiaDetalleScreen({ t }) {
  const routine = rdRoutineBySlug(t.rutina || "ppl-hipertrofia");
  const idx = Math.max(0, Math.min(routine.days.length - 1, parseInt(t.dia, 10) || 0));
  const day = rdResolveDay(routine, idx);

  // día de descanso → vista mínima
  if (day.isRest) {
    return (
      <div className="dd-screen">
        <div className="dd-scroll">
          <DdChrome routine={routine} title={day.name} />
          <div className="dd-pad">
            <div className="dd-rest">
              <DdBubble color={day.cfg.color} bg={day.cfg.bg} size={56} glow={day.cfg.glow}>{day.cfg.icon({ size: 28 })}</DdBubble>
              <div className="dd-rest__t">Día de descanso</div>
              <div className="dd-rest__d">{day.focus}. Sin ejercicios programados — recupera y vuelve mañana.</div>
            </div>
            <DdAskAgent />
          </div>
        </div>
      </div>
    );
  }

  const note = {
    push: "Día de empuje. El press banca es el ejercicio principal — busca 82,5 kg limpias a RIR 2. El resto, técnica y congestión.",
    pull: "Día de tirón. Mantén la dominada estricta y deja medio depósito en el remo: el sábado vamos a por PR.",
    legs: "Día clave de la semana. La sentadilla a 142,5 kg es PR de carga — calienta sin prisa y respeta el RIR 2.",
  }[day.type];

  return (
    <div className="dd-screen">
      <div className="dd-scroll">
        <DdChrome routine={routine} title={day.name} />
        <div className="dd-pad">
          <DdHero routine={routine} day={day} idx={idx} />

          <div className="dd-sec">
            <span className="dd-sec__k">El plan</span>
            <span className="dd-sec__count">{day.plan.ex.length} ejercicios · en orden</span>
            <span className="dd-sec__line" />
          </div>
          <div className="dd-list">
            {day.plan.ex.map((ex, i) => <DdExCard key={i} ex={ex} idx={i + 1} cfg={day.cfg} origin={{ rutina: routine.slug, dia: idx }} />)}
          </div>

          <DdAskAgent />
        </div>
      </div>
    </div>
  );
}

function DdChrome({ routine, title }) {
  return (
    <div className="dd-chrome">
      <button className="dd-chrome__btn" aria-label="Volver" onClick={() => vxNav(VX.RUTINA, { rutina: routine.slug })}><Icon.chevronLeft size={20} /></button>
      <div className="dd-chrome__title">{title}</div>
      <button className="dd-chrome__btn" aria-label="Más"><DdIcon.more size={20} /></button>
    </div>
  );
}

Object.assign(window, {
  DdIcon, DD_VOL, DdBubble, DdHero, DdAgentNote, DdExCard, DdAskAgent, DdChrome, DiaDetalleScreen,
});
