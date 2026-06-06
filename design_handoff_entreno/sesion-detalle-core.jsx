// sesion-detalle-core.jsx — "Detalle de sesión": el informe persistido de un
// entreno ya completado, reabierto desde el historial. Es la versión de SOLO
// LECTURA del informe del cierre + el desglose por ejercicio (series reales).
// Corregir un registro es petición al agente, nunca edición a mano.

const SdIcon = {
  dumbbell: (p) => <Svg {...p}><path d="M6.5 6.5l11 11M3 9l3-3M18 21l3-3M6 18l-3-3M21 6l-3-3M14.5 9.5l-5 5" /></Svg>,
  rows:    (p) => <Svg {...p}><path d="M3 6.5h18M3 12h18M3 17.5h18" /></Svg>,
  footprints: (p) => <Svg {...p}><path d="M4 16v-2a2 2 0 1 1 4 0v2c0 2-.5 3-2 3s-2-1-2-3ZM16 14v-2a2 2 0 1 1 4 0v2c0 2-.5 3-2 3s-2-1-2-3ZM5 9c0-2 .5-4 2-4s1.5 2 1 4M19 7c0-2-.5-4-2-4" /></Svg>,
  clock:   (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>,
  layers:  (p) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" /></Svg>,
  repeat:  (p) => <Svg {...p}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></Svg>,
  bolt:    (p) => <Svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" /></Svg>,
  target:  (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  trophy:  (p) => <Svg {...p}><path d="M6 4h12v3a6 6 0 0 1-12 0V4ZM6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 17h6M10 17v-2.3M14 17v-2.3M8 21h8" /></Svg>,
  star:    (p) => <Svg {...p}><path d="M12 3l2.6 6.3L21 10l-5 4.2L17.5 21 12 17.3 6.5 21 8 14.2 3 10l6.4-.7L12 3Z" /></Svg>,
  activity:(p) => <Svg {...p}><path d="M3 12h4l3 8 4-16 3 8h4" /></Svg>,
  trendUp: (p) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" /></Svg>,
  more:    (p) => <Svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
};

const SD_DAY = {
  push: { color: "var(--vx-lava)",    bg: "var(--vx-lava-bg)",    glow: "rgba(255,98,98,0.30)", tag: "Push", icon: SdIcon.dumbbell },
  pull: { color: "var(--vx-body)",    bg: "var(--vx-body-bg)",    glow: "rgba(0,210,255,0.26)", tag: "Pull", icon: SdIcon.rows },
  legs: { color: "var(--vx-neutral)", bg: "var(--vx-neutral-bg)", glow: "rgba(255,185,0,0.26)", tag: "Legs", icon: SdIcon.footprints },
};

const sdScoreColor = (v) => (v == null ? "rgba(255,255,255,0.4)" : v >= 7 ? "var(--vx-up)" : v >= 5 ? "var(--vx-neutral)" : "var(--vx-health)");

function SdBubble({ color, bg, size = 44, glow, children }) {
  return (
    <span className="sd-bubble" style={{ width: size, height: size, color, background: bg,
      boxShadow: glow ? `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 22px ${glow}` : undefined }}>{children}</span>
  );
}

// ── HERO ─────────────────────────────────────────────────────────────────────
function SdHero({ s, cfg }) {
  return (
    <div className="sd-hero">
      <div className="sd-hero__top">
        <span className="sd-eyebrow" style={{ color: cfg.color }}><SdIcon.star size={11} /> SESIÓN COMPLETADA</span>
        <span className="sd-hero__ctx"><SdIcon.repeat size={12} /> PPL Hipertrofia</span>
      </div>
      <div className="sd-hero__row">
        <SdBubble color={cfg.color} bg={cfg.bg} size={52} glow={cfg.glow}>{cfg.icon({ size: 26 })}</SdBubble>
        <div style={{ minWidth: 0 }}>
          <div className="sd-hero__name">{s.name}</div>
          <div className="sd-hero__date">{s.dateLong}</div>
        </div>
      </div>
      <div className="sd-hero__class">
        <span className="sd-class" style={{ color: "var(--vx-up)", background: "var(--vx-up-tint)", borderColor: "var(--vx-up-line)" }}>
          <SdIcon.star size={12} /> {s.completion === 100 ? "Plan perfecto" : "Plan seguido"}
        </span>
        <span className="sd-class__meta">{s.completion}% completado</span>
        {s.prs > 0 && <span className="sd-prtag"><SdIcon.trophy size={11} /> {s.prs} {s.prs === 1 ? "PR" : "PRs"}</span>}
      </div>
    </div>
  );
}

// ── agent recap ───────────────────────────────────────────────────────────────
function SdRecap({ msg }) {
  return (
    <div className="sd-recap">
      <span className="sd-recap__mark"><Isotype size={22} glow /></span>
      <div>
        <div className="sd-recap__from">verxion · informe</div>
        <div className="sd-recap__msg">{msg}</div>
      </div>
    </div>
  );
}

// ── tiles de resumen ───────────────────────────────────────────────────────────
function SdTiles({ s }) {
  const tiles = [
    { v: sdNum(s.volT), u: "t", l: "Volumen", icon: SdIcon.dumbbell, color: "var(--vx-health)", bg: "var(--vx-health-bg)" },
    { v: s.durMin, u: "m", l: "Duración", icon: SdIcon.clock, color: "var(--vx-insight)", bg: "var(--vx-insight-bg)" },
    { v: s.series, u: "", l: "Series", icon: SdIcon.layers, color: "var(--vx-lava)", bg: "var(--vx-lava-bg)" },
    { v: s.reps, u: "", l: "Reps", icon: SdIcon.repeat, color: "var(--vx-neutral)", bg: "var(--vx-neutral-bg)" },
    { v: sdNum(s.peak), u: "kg", l: "Peak", icon: SdIcon.trophy, color: "var(--vx-health)", bg: "var(--vx-health-bg)" },
    { v: sdNum(s.rir), u: "", l: "RIR medio", icon: SdIcon.target, color: "var(--vx-body)", bg: "var(--vx-body-bg)" },
  ];
  return (
    <div className="sd-tiles">
      {tiles.map((t) => (
        <div className="sd-tile" key={t.l}>
          <span className="sd-tile__bubble" style={{ background: t.bg, color: t.color }}>{t.icon({ size: 16 })}</span>
          <div className="sd-tile__v">{t.v}{t.u && <em>{t.u}</em>}</div>
          <div className="sd-tile__l">{t.l}</div>
        </div>
      ))}
    </div>
  );
}

// ── desglose por ejercicio (series reales) ─────────────────────────────────────
function SdExercise({ ex, cfg, origin }) {
  return (
    <button className={"sd-ex" + (ex.hasPR ? " is-pr" : "")} onClick={() => vxNav(VX.DETALLE, { ejercicio: ex.slug, origen: "sesion", ...origin })}>
      <div className="sd-ex__head">
        <div style={{ minWidth: 0 }}>
          <div className="sd-ex__name">
            {ex.name}
            {ex.hasPR && <span className="sd-ex__pr"><SdIcon.trophy size={10} /> PR</span>}
          </div>
          <div className="sd-ex__muscle">{ex.muscle} · {ex.equip} · {ex.prescrip}</div>
        </div>
        <Icon.chevronRight size={15} style={{ color: "rgba(255,255,255,0.26)", flexShrink: 0, alignSelf: "center" }} />
      </div>
      <div className="sd-ex__sets">
        {ex.sets.map((st, i) => (
          <span key={i} className={"sd-set" + (st.pr ? " is-pr" : "")} style={st.pr ? { color: cfg.color, borderColor: cfg.color } : null}>
            <em>{i + 1}</em> {st.disp}{st.pr && <SdIcon.trophy size={9} style={{ marginLeft: 3 }} />}
          </span>
        ))}
      </div>
    </button>
  );
}

// ── valoración (lo que el agente no mide) ──────────────────────────────────────
function SdAssess({ scores }) {
  const items = [{ l: "Esfuerzo", v: scores.effort }, { l: "Calidad", v: scores.quality }, { l: "Pump", v: scores.pump }];
  return (
    <div className="sd-assess">
      {items.map((a) => (
        <div className="sd-assess__c" key={a.l}>
          <div className="sd-assess__v" style={{ color: sdScoreColor(a.v) }}>{a.v}<em>/10</em></div>
          <div className="sd-assess__l">{a.l}</div>
        </div>
      ))}
    </div>
  );
}

// ── grupos musculares ───────────────────────────────────────────────────────────
function SdMuscles({ muscles }) {
  return (
    <div className="sd-musc">
      {muscles.map((m) => (
        <div className="sd-musc__row" key={m.name}>
          <div className="sd-musc__top">
            <span className="sd-musc__name">{m.name}</span>
            <span className="sd-musc__vol">{sdNum(m.volT)} t · {m.pct}%</span>
          </div>
          <div className="sd-musc__bar"><span style={{ width: m.pct + "%" }} /></div>
        </div>
      ))}
    </div>
  );
}

// ── nota del usuario + corregir con el agente ──────────────────────────────────
function SdUserNote({ note }) {
  return (
    <div className="sd-usernote">
      <div className="sd-usernote__k">Tu nota al cerrar</div>
      <div className="sd-usernote__t">“{note}”</div>
    </div>
  );
}
function SdAskAgent() {
  return (
    <button className="sd-ask" onClick={() => vxNav(VX.AGENTE, { caso: "inicio" })}>
      <span className="sd-ask__iso"><Isotype size={20} glow /></span>
      <div className="sd-ask__body">
        <div className="sd-ask__label">¿Algún dato mal? Corrígelo con el agente</div>
        <div className="sd-ask__hint">El registro es de solo lectura — dile a verxion qué ajustar y lo corrige.</div>
      </div>
      <span className="sd-ask__c">›</span>
    </button>
  );
}

function SdSection({ icon, children }) {
  return (
    <div className="sd-sec">
      <span className="sd-sec__ic">{icon}</span>
      <span className="sd-sec__k">{children}</span>
      <span className="sd-sec__line" />
    </div>
  );
}

// ── pantalla ────────────────────────────────────────────────────────────────
function SesionDetalleScreen({ t }) {
  const s = vxSessionBySlug(t.sesion || (VX_SESSIONS[0] && VX_SESSIONS[0].slug));
  const cfg = SD_DAY[s.type] || SD_DAY.push;
  return (
    <div className="sd-screen">
      <div className="sd-scroll">
        <div className="sd-chrome">
          <button className="sd-chrome__btn" aria-label="Volver" onClick={() => vxNav(VX.ENTRENO, { segment: "sesiones" })}><Icon.chevronLeft size={20} /></button>
          <div className="sd-chrome__title">Sesión</div>
          <button className="sd-chrome__btn" aria-label="Más"><SdIcon.more size={20} /></button>
        </div>

        <div className="sd-pad">
          <SdHero s={s} cfg={cfg} />
          <SdRecap msg={s.recap} />
          <SdTiles s={s} />

          <SdSection icon={<SdIcon.layers size={15} />}>Ejercicios · {s.exercises.length}</SdSection>
          <div className="sd-exlist">
            {s.exercises.map((ex, i) => <SdExercise key={i} ex={ex} cfg={cfg} origin={{ sesion: s.slug }} />)}
          </div>

          <SdSection icon={<SdIcon.star size={15} />}>Tu valoración</SdSection>
          <SdAssess scores={s.scores} />
          {s.note && <SdUserNote note={s.note} />}

          <SdSection icon={<SdIcon.activity size={15} />}>Grupos musculares</SdSection>
          <SdMuscles muscles={s.muscles} />

          <SdAskAgent />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  SdIcon, SD_DAY, sdScoreColor, SdBubble, SdHero, SdRecap, SdTiles, SdExercise,
  SdAssess, SdMuscles, SdUserNote, SdAskAgent, SdSection, SesionDetalleScreen,
});
