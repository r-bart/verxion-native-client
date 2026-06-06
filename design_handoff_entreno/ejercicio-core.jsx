// ejercicio-core.jsx — Detalle de ejercicio (historial + progresión).
// Lo que ves al tocar un ejercicio en la biblioteca. La recompensa del modelo
// read-only-first: toda la historia de un movimiento — curva de e1RM, PRs,
// cada serie registrada por el agente en el tiempo. buildEjercicio(t).

// ── iconos (lucide-style, stroke 2) sobre <Svg> de icons.jsx ──────────────
const XIcon = {
  trophy:  (p) => <Svg {...p}><path d="M6 4h12v3a6 6 0 0 1-12 0V4ZM6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 17h6M10 17v-2.3M14 17v-2.3M8 21h8" /></Svg>,
  trendUp: (p) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" /></Svg>,
  bolt:    (p) => <Svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" /></Svg>,
  layers:  (p) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" /></Svg>,
  clock:   (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>,
  more:    (p) => <Svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  message: (p) => <Svg {...p}><path d="M21 11.5a8.4 8.4 0 0 1-12 7.6L3 21l1.9-6A8.4 8.4 0 1 1 21 11.5Z" /></Svg>,
  info:    (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5v.5" /></Svg>,
  rows:    (p) => <Svg {...p}><path d="M3 6.5h18M3 12h18M3 17.5h18" /></Svg>,
  target:  (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  play:    (p) => <Svg {...p}><path d="M7 4.5v15l13-7.5-13-7.5Z" /></Svg>,
  dumbbell:(p) => <Svg {...p}><path d="M6.5 6.5l11 11M3 9l3-3M18 21l3-3M6 18l-3-3M21 6l-3-3M14.5 9.5l-5 5" /></Svg>,
  footprints:(p) => <Svg {...p}><path d="M4 16v-2a2 2 0 1 1 4 0v2c0 2-.5 3-2 3s-2-1-2-3ZM16 14v-2a2 2 0 1 1 4 0v2c0 2-.5 3-2 3s-2-1-2-3ZM5 9c0-2 .5-4 2-4s1.5 2 1 4M19 7c0-2-.5-4-2-4" /></Svg>,
  check:   (p) => <Svg {...p}><path d="M20 6L9 17l-5-5" /></Svg>,
};


const xNum = (n) => Number(n).toLocaleString("de-DE");

// part → icono (mismo lenguaje visual que la library)
const XPartIcon = { push: XIcon.dumbbell, pull: XIcon.rows, legs: XIcon.footprints, core: XIcon.target };

// ── modelo de escenario — lee del catálogo único ────────────────────────────
function buildEjercicio(t) {
  const slug = t.ejercicio || "press-banca";
  const metrica = t.metrica || "e1rm";   // e1rm | volumen
  const tab = t.tab || "progreso";       // progreso | guia
  const c = (typeof vxExerciseBySlug !== "undefined") ? vxExerciseBySlug(slug) : null;

  const ex = {
    ...c,
    color: c.pal.color, bg: c.pal.bg, glow: c.pal.glow,
    icon: XPartIcon[c.part] || XIcon.dumbbell,
    cat: c.cat + " · " + c.group,
    since: c.since ? "hace " + c.since : null,
  };

  const hasData = !!c.series && c.logs > 0;
  const points = hasData ? c.series[metrica] : [];
  const unit = metrica === "e1rm" ? " kg" : " t";
  const bigVal = metrica === "e1rm" ? c.e1rm : c.bestVol;
  const bigLbl = metrica === "e1rm" ? "e1RM estimado · récord" : "Mejor volumen · sesión";
  const bigDelta = metrica === "e1rm" ? c.e1rmDelta : c.volDelta;

  return { slug, metrica, tab, ex, hasData, points, unit, bigVal, bigLbl, bigDelta };
}

// ── chart de progresión (área + línea, último punto destacado) ───────────────
function ExChart({ points, unit, color = "var(--lava)" }) {
  const W = 360, H = 152;
  const padL = 6, padR = 50, padT = 18, padB = 26;
  const n = points.length;
  const vals = points.map((p) => p.v);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const span = hi - lo || 1;
  lo -= span * 0.3; hi += span * 0.22;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const X = (i) => padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const Y = (v) => padT + plotH - ((v - lo) / (hi - lo)) * plotH;

  const pts = points.map((p, i) => [X(i), Y(p.v)]);
  const line = "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
  const area = `M${X(0).toFixed(1)},${(padT + plotH).toFixed(1)} L`
    + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L")
    + ` L${X(n - 1).toFixed(1)},${(padT + plotH).toFixed(1)} Z`;
  const last = pts[n - 1];
  const lastVal = points[n - 1].v;
  const grid = [0, 0.5, 1].map((f) => padT + plotH * f);
  const gid = "xg-" + Math.round(Math.random() * 1e6);

  return (
    <svg className="x-chart__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.34" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {grid.map((y, i) => (
        <line key={i} x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 2px 6px ${color})` }} />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === n - 1 ? 0 : 2.4} fill="#0a0a0c" stroke={color} strokeWidth="2" />
      ))}
      {/* punto final destacado */}
      <circle cx={last[0]} cy={last[1]} r="9" fill={color} fillOpacity="0.18" />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill={color} stroke="#0a0a0c" strokeWidth="2" />
      <text x={Math.min(last[0] + 10, W - 4)} y={last[1] + 4} textAnchor="end" x2={W}
        fill="#fff" style={{ font: "700 15px var(--vx-font-sans)" }}>
        {xNum(lastVal)}{unit}
      </text>
      {/* etiquetas x */}
      {points.map((p, i) => (
        <text key={i} x={X(i)} y={H - 7} textAnchor="middle"
          fill="rgba(255,255,255,0.34)" style={{ font: "500 9px var(--vx-font-mono)" }}>{p.l}</text>
      ))}
    </svg>
  );
}

// ── icon bubble ──────────────────────────────────────────────────────────────
function XBubble({ color, bg, size = 52, glow, children }) {
  return (
    <span className="x-bubble" style={{ width: size, height: size, color, background: bg,
      boxShadow: glow ? `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 22px ${glow}` : undefined }}>
      {children}
    </span>
  );
}

// ── hero ──────────────────────────────────────────────────────────────────────
function XHero({ model }) {
  const { ex } = model;
  return (
    <div className="x-hero">
      <XBubble color={ex.color} bg={ex.bg} size={54} glow={ex.glow}>{ex.icon({ size: 27 })}</XBubble>
      <div style={{ minWidth: 0 }}>
        <div className="x-hero__name">{ex.name}</div>
        <div className="x-hero__tags">
          <span className="x-tag">{ex.target}</span>
          <span className="x-tag">{ex.equip}</span>
        </div>
        <div className="x-hero__cat">{ex.cat}</div>
      </div>
    </div>
  );
}

// ── KPI strip ──────────────────────────────────────────────────────────────────
function XKpis({ ex }) {
  return (
    <div className="x-kpis">
      <div className="x-kpi"><div className={"x-kpi__v" + (ex.pr ? " x-kpi__v--pr" : "")}>{ex.pr ? <><XIcon.trophy size={13} /> {ex.pr}</> : "—"}</div><div className="x-kpi__l">PR carga</div></div>
      <div className="x-kpi"><div className="x-kpi__v">{ex.e1rm}</div><div className="x-kpi__l">e1RM</div></div>
      <div className="x-kpi"><div className="x-kpi__v">{ex.bestVol}</div><div className="x-kpi__l">Mejor vol</div></div>
      <div className="x-kpi"><div className="x-kpi__v">{ex.logs}</div><div className="x-kpi__l">Registros</div></div>
    </div>
  );
}

// ── fila de historial ────────────────────────────────────────────────────────
function XHistRow({ h, metrica }) {
  const val = metrica === "e1rm" ? h.e1rm : h.vol;
  return (
    <div className="x-hrow">
      <div className="x-hrow__date">{h.date}</div>
      <div className="x-hrow__body">
        <div className="x-hrow__top">
          {h.top}
          {h.pr && <span className="x-hrow__pr"><XIcon.trophy size={9} /> PR</span>}
        </div>
        <div className="x-hrow__meta">RIR {h.rir} · {metrica === "e1rm" ? "vol " + h.vol : "e1RM " + h.e1rm}</div>
      </div>
      <div className="x-hrow__right">
        <div className="x-hrow__val">{val}</div>
        <div className={"x-hrow__delta is-" + (h.delta >= 0 ? "up" : "down")}>{h.delta >= 0 ? "+" : ""}{h.delta}%</div>
      </div>
    </div>
  );
}

// ── músculos trabajados ──────────────────────────────────────────────────────
function XMuscles({ ex }) {
  return (
    <div className="x-musc">
      {ex.muscles.map((m) => (
        <div className="x-musc__row" key={m.name}>
          <div className="x-musc__top">
            <span className="x-musc__name">{m.name}</span>
            <span className="x-musc__role">{m.role}</span>
          </div>
          <div className="x-musc__bar"><span style={{ width: m.pct + "%", background: ex.color, opacity: m.pct === 100 ? 1 : 0.5 }} /></div>
        </div>
      ))}
    </div>
  );
}

// ── nota del agente + handoff de edición ──────────────────────────────────────
function XAgentNote({ msg }) {
  return (
    <div className="x-agent">
      <span className="x-agent__mark"><Isotype size={22} glow /></span>
      <div>
        <div className="x-agent__from">verxion · lectura</div>
        <div className="x-agent__msg">{msg}</div>
      </div>
    </div>
  );
}

function XAgentEdit() {
  return (
    <button className="x-edit">
      <span className="x-edit__iso"><Isotype size={20} glow /></span>
      <div className="x-edit__body">
        <div className="x-edit__label">Pídeselo al agente</div>
        <div className="x-edit__hint">Métela en tu rutina, cámbiala o pide una progresión nueva.</div>
      </div>
      <span className="x-edit__c">›</span>
    </button>
  );
}

// ── tabs: Progreso / Cómo se hace ─────────────────────────────────────────────
function XTabs({ tab, onTab }) {
  const T = [{ id: "progreso", label: "Progreso" }, { id: "guia", label: "Cómo se hace" }];
  const idx = Math.max(0, T.findIndex((x) => x.id === tab));
  return (
    <div className="x-tabs">
      <div className="x-tabs__thumb" style={{ left: `calc(3px + ${idx} * (100% - 6px) / 2)` }} />
      {T.map((x) => (
        <button key={x.id} className={"x-tabs__b" + (x.id === tab ? " is-on" : "")} onClick={() => onTab(x.id)}>{x.label}</button>
      ))}
    </div>
  );
}

// ── animación / demostración (placeholder de medios) ──────────────────────────
function XAnim({ ex }) {
  return (
    <div className="x-anim" style={{ background: `radial-gradient(120% 80% at 50% 0%, ${ex.bg}, rgba(255,255,255,0.02))` }}>
      <span className="x-anim__bubble" style={{ color: ex.color, background: ex.bg,
        boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 28px ${ex.glow}` }}>{ex.icon({ size: 40 })}</span>
      <span className="x-anim__tag"><XIcon.play size={11} /> Animación · demostración</span>
    </div>
  );
}

// ── descripción ────────────────────────────────────────────────────────────────
function XDesc({ ex }) {
  return (
    <div className="x-card x-desc">
      <div className="x-desc__chips">
        <span className="x-chip2">{ex.cat.split(" · ")[0]}</span>
        <span className="x-chip2">{ex.group}</span>
        <span className="x-chip2">{ex.equip}</span>
        {ex.custom && <span className="x-chip2 x-chip2--cust">Personalizado</span>}
      </div>
      <p className="x-desc__p">{ex.desc}</p>
    </div>
  );
}

// ── pasos de ejecución ─────────────────────────────────────────────────────────
function XSteps({ ex }) {
  return (
    <div className="x-card x-steps">
      {(ex.pasos || []).map((p, i) => (
        <div className="x-step" key={i}>
          <span className="x-step__n" style={{ color: ex.color, borderColor: ex.color }}>{i + 1}</span>
          <span className="x-step__t">{p}</span>
        </div>
      ))}
    </div>
  );
}

// ── estado vacío de progreso (ejercicio sin registrar) ────────────────────────
function XEmptyProgress({ ex }) {
  return (
    <div className="x-empty">
      <span className="x-empty__iso"><Isotype size={30} glow /></span>
      <div className="x-empty__t">Aún sin registros</div>
      <div className="x-empty__b">No has entrenado {ex.name.toLowerCase()} todavía. En cuanto lo registres con el agente, aquí verás tu curva y tu historial.</div>
    </div>
  );
}

Object.assign(window, {
  XIcon, xNum, XPartIcon, buildEjercicio, ExChart, XBubble, XHero, XKpis, XHistRow,
  XMuscles, XAgentNote, XAgentEdit, XTabs, XAnim, XDesc, XSteps, XEmptyProgress,
});
