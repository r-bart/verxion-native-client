// sesion-core.jsx — Visor en vivo de la sesión en marcha.
// La app es el ESPEJO: el agente (ChatGPT/Claude) registra cada serie,
// la pantalla refleja el estado. Sin campos de input — read-only-first.
// buildSession(t) → modelo según el estado (activa/descanso/pausada/…).

// ── iconos de sesión (lucide-style, stroke 2) sobre <Svg> de icons.jsx ──
const SIcon = {
  chevronDown: (p) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>,
  more:        (p) => <Svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  play:    (p) => <Svg {...p}><path d="M7 4.5v15l13-7.5-13-7.5Z" /></Svg>,
  pause:   (p) => <Svg {...p}><path d="M8 5v14M16 5v14" /></Svg>,
  check:   (p) => <Svg {...p}><path d="M20 6L9 17l-5-5" /></Svg>,
  flag:    (p) => <Svg {...p}><path d="M4 21V4M4 4h13l-2 4 2 4H4" /></Svg>,
  timer:   (p) => <Svg {...p}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6M12 5V2" /></Svg>,
  message: (p) => <Svg {...p}><path d="M21 11.5a8.4 8.4 0 0 1-12 7.6L3 21l1.9-6A8.4 8.4 0 1 1 21 11.5Z" /></Svg>,
  bolt:    (p) => <Svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" /></Svg>,
  trophy:  (p) => <Svg {...p}><path d="M6 4h12v3a6 6 0 0 1-12 0V4ZM6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 17h6M10 17v-2.3M14 17v-2.3M8 21h8" /></Svg>,
  star:    (p) => <Svg {...p}><path d="M12 3l2.6 5.6L21 9.3l-4.5 4.3 1.1 6.4L12 17l-5.6 3 1.1-6.4L3 9.3l6.4-.7L12 3Z" /></Svg>,
  activity:(p) => <Svg {...p}><path d="M22 12h-4l-3 8-6-16-3 8H2" /></Svg>,
  target:  (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  layers:  (p) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" /></Svg>,
  repeat:  (p) => <Svg {...p}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></Svg>,
  clock:   (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>,
  dumbbell:(p) => <Svg {...p}><path d="M6.5 6.5l11 11M3 9l3-3M18 21l3-3M6 18l-3-3M21 6l-3-3M14.5 9.5l-5 5" /></Svg>,
  weight:  (p) => <Svg {...p}><circle cx="12" cy="5" r="3" /><path d="M6.5 9h11l2.2 11.2a1 1 0 0 1-1 1.2H5.3a1 1 0 0 1-1-1.2L6.5 9Z" /></Svg>,
};

const eNum = (n) => n.toLocaleString("de-DE");

// ── live ticking timer ──────────────────────────────────────────────────
function STimer({ base, paused, render }) {
  const { useState, useEffect } = React;
  const [s, setS] = useState(base);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setS((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [paused]);
  return render(s);
}
const fmtClock = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

// ── scenario model ─────────────────────────────────────────────────────────
function buildSession(t) {
  const estado = t.estado || "activa";
  const paused = estado === "pausada";

  const current = {
    name: "Press militar con barra",
    target: "Hombros",
    setType: null,
    planned: 4,
    // series ya registradas por el agente
    sets: [
      { n: 1, w: "50kg", reps: 8, rir: 3, vol: "400kg", delta: "+2.5", deltaDir: "up" },
      { n: 2, w: "52.5kg", reps: 8, rir: 2, vol: "420kg", delta: "+2.5", deltaDir: "up" },
    ],
    guide: {
      set: 3,
      target: { weight: "52.5kg", reps: "8", rir: 2 },
      last: "50kg × 8 · RIR 2",
    },
    rest: { elapsed: 84, target: 120 }, // 1:24 de 2:00
  };

  // ── el ejercicio en curso cambia de forma según el estado ──
  let now;
  if (estado === "ultima") {
    now = {
      ...current,
      sets: [...current.sets, { n: 3, w: "52.5kg", reps: 8, rir: 1, vol: "420kg", delta: "=", deltaDir: "flat", isNew: true }],
      guide: { set: 4, last: "50kg × 7 · RIR 0", target: { weight: "52.5kg", reps: "8+", rir: 0 }, finisher: true },
    };
  } else if (estado === "completado") {
    now = {
      ...current, done: true,
      sets: [
        ...current.sets,
        { n: 3, w: "52.5kg", reps: 8, rir: 1, vol: "420kg", delta: "=", deltaDir: "flat" },
        { n: 4, w: "52.5kg", reps: 7, rir: 0, vol: "367kg", delta: "+2.5", deltaDir: "up", isNew: true },
      ],
      overload: { dir: "up", label: "↑ Progresado", detail: "+8% volumen vs. última" },
      nextName: "Elevaciones laterales",
    };
  } else {
    // activa, descanso, pausada, cierre → 2 series hechas, va a por la 3ª
    now = { ...current, sets: current.sets.map((s, i) => i === 1 ? { ...s, isNew: estado === "activa" } : s) };
  }

  // KPIs en vivo (suben en 'completado')
  const kpis = estado === "completado"
    ? { vol: "6.0t", sets: 10, reps: 72, prog: "3/3" }
    : { vol: "5.8t", sets: 9, reps: 64, prog: "2/3" };

  const done = [
    { name: "Press de banca", target: "Pecho", setsTxt: "4 series", vol: "3.1t", peak: "100kg", overload: "up", overloadTxt: "↑ Progresado", last: "4 × 97.5kg", pr: "PR e1RM" },
    { name: "Press inclinado mancuerna", target: "Pecho", setsTxt: "3 series", vol: "1.8t", peak: "34kg", overload: "flat", overloadTxt: "= Mantenido", last: "3 × 34kg" },
  ];

  const pending = [
    { name: "Elevaciones laterales", target: "Hombros", planned: "4 × 12 · RIR 1", action: { kind: "body", label: "↑ Reps" } },
    { name: "Extensión tríceps en polea", target: "Tríceps", planned: "3 × 12 · RIR 2", action: { kind: "flat", label: "→ Mantener" } },
    { name: "Face pull", target: "Hombros · post.", planned: "3 × 15 · RIR 2", action: null },
  ];

  // progreso de ejercicios
  const totalEx = 6;
  const completedEx = estado === "completado" ? 3 : 2;
  const pct = Math.round((completedEx / totalEx) * 100) + (estado === "completado" ? 0 : 8); // 41 / 50
  const pctShown = estado === "completado" ? 50 : 41;

  return {
    estado, paused,
    session: { name: "Empuje · Fuerza A", routine: "PPL · Hipertrofia", day: "Empuje A", base: 2538 },
    now, done, pending, kpis,
    progress: { completedEx, totalEx, pct: pctShown },
    sync: estado === "completado"
      ? { msg: "El agente cerró ", b: "Press militar", ago: "ahora" }
      : estado === "ultima"
      ? { msg: "El agente registró la ", b: "serie 3", ago: "hace 6s" }
      : { msg: "El agente registró la ", b: "serie 2", ago: "hace 12s" },
  };
}

// ── header / meta block ─────────────────────────────────────────────────────
function SessHeader({ model }) {
  const { session, progress, paused } = model;
  return (
    <div>
      <div className="s-head__name">{session.name}</div>
      <div className="s-head__sub">
        <SIcon.repeat size={13} /> {session.routine} · {session.day}
      </div>
      <div className="s-head__row">
        <div>
          <span className="s-timer__k">Tiempo</span>
          <div className="s-timer">
            <STimer base={session.base} paused={paused} render={fmtClock} />
          </div>
        </div>
        <div className="s-prog">
          <div className="s-prog__big">{progress.completedEx}<em>/{progress.totalEx}</em> ejercicios</div>
          <div className="s-prog__pct">{progress.pct}% completado</div>
        </div>
      </div>
      <div className="s-bar"><span style={{ width: progress.pct + "%" }} /></div>
      <SyncLine sync={model.sync} paused={paused} />
    </div>
  );
}

function SyncLine({ sync, paused }) {
  return (
    <div className="s-sync">
      <img className="s-sync__iso" src="assets/verxion-isotype.png" alt="" />
      <div className="s-sync__t">{sync.msg}<b>{sync.b}</b>{paused ? " · sesión en pausa" : ""}</div>
      <div className="s-sync__ago">{paused ? "—" : sync.ago}</div>
    </div>
  );
}

// ── KPI strip ───────────────────────────────────────────────────────────────
function KpiStrip({ kpis }) {
  return (
    <div className="s-kpis">
      <div className="s-kpi"><div className="s-kpi__v">{kpis.vol}</div><div className="s-kpi__l">Volumen</div></div>
      <div className="s-kpi"><div className="s-kpi__v">{kpis.sets}</div><div className="s-kpi__l">Series</div></div>
      <div className="s-kpi"><div className="s-kpi__v">{kpis.reps}</div><div className="s-kpi__l">Reps</div></div>
      <div className="s-kpi"><div className={"s-kpi__v " + (kpis.prog === "3/3" ? "is-good" : "")}>{kpis.prog}</div><div className="s-kpi__l">Progres.</div></div>
    </div>
  );
}

// ── current exercise (focal) ────────────────────────────────────────────────
function CurrentExercise({ model }) {
  const { now, estado, paused } = model;
  const isDone = !!now.done;
  return (
    <div className={"s-now" + (isDone ? " s-now--done" : "")}>
      <div className="s-now__head">
        <div style={{ minWidth: 0 }}>
          <div className="s-now__name">{now.name}</div>
          <div className="s-now__meta">{now.target}</div>
        </div>
        {isDone ? (
          <span className="s-now__status is-done"><SIcon.check size={11} /> Completado</span>
        ) : (
          <span className="s-now__status">
            <span className="s-live__dot" /> {paused ? "En curso" : "Activo"}
          </span>
        )}
      </div>

      {/* set table */}
      <div className="s-tbl">
        <div className="s-tbl__h">
          <span>Set</span><span className="s-tc--c">Peso</span><span className="s-tc--c">Reps</span>
          <span className="s-tc--c">RIR</span><span className="s-tc--r">Vol</span><span className="s-tc--r">▲</span>
        </div>
        {now.sets.map((s) => (
          <div key={s.n} className={"s-tbl__r" + (s.isNew ? " is-new" : "")}>
            <div className="s-tc">{s.n}</div>
            <div className="s-tc s-tc--c">{s.w}</div>
            <div className="s-tc s-tc--c">{s.reps}</div>
            <div className="s-tc s-tc--mut s-tc--c">{s.rir}</div>
            <div className="s-tc s-tc--mut s-tc--r">{s.vol}</div>
            <div className={"s-tc__delta is-" + s.deltaDir}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* done → overload badge + next */}
      {isDone && (
        <>
          <span className="s-done-badge"><SIcon.bolt size={12} /> {now.overload.label} · {now.overload.detail}</span>
          <div className="s-guide__hint" style={{ marginTop: 13 }}>
            <SIcon.chevronDown size={13} style={{ transform: "rotate(-90deg)" }} />
            Siguiente: <b>{now.nextName}</b>
          </div>
        </>
      )}

      {/* descanso module (prominent) */}
      {estado === "descanso" && <RestModule rest={now.rest} />}

      {/* next-set guide (oculto en 'completado' y 'pausada') */}
      {!isDone && !paused && (
        <NextGuide guide={now.guide} compactRest={estado === "activa" || estado === "ultima"} rest={now.rest} />
      )}

      {/* pausada hint */}
      {paused && (
        <div className="s-guide__hint" style={{ marginTop: 14 }}>
          <SIcon.pause size={13} />
          Pausado en la <b>serie {now.guide.set}/{now.planned}</b>. Reanuda cuando vuelvas.
        </div>
      )}
    </div>
  );
}

// rest module — discreet by default, big in 'descanso'
function RestModule({ rest }) {
  const left = rest.target - rest.elapsed;
  const m = Math.floor(left / 60), s = left % 60;
  const pct = Math.min(100, (rest.elapsed / rest.target) * 100);
  return (
    <div className="s-rest s-rest--big">
      <div className="s-rest__row">
        <div className="s-rest__icon"><SIcon.timer size={16} /></div>
        <div className="s-rest__body">
          <div className="s-rest__k">Descanso entre series</div>
          <div className="s-rest__sub">Objetivo 2:00 · siguiente serie en breve</div>
        </div>
        <div className="s-rest__time">{m}:{String(s).padStart(2, "0")}<em> rest.</em></div>
      </div>
      <div className="s-rest__track"><span style={{ width: pct + "%" }} /></div>
    </div>
  );
}

// next-set guide — Objetivo · RIR · Última
function NextGuide({ guide, compactRest, rest }) {
  return (
    <div className={"s-guide" + (guide.finisher ? " s-guide--last" : "")}>
      <div className="s-guide__top">
        <span className="s-guide__k">Siguiente</span>
        <span className="s-guide__set">Serie {guide.set}/4</span>
        {guide.finisher && <span className="s-guide__last-tag">Última serie</span>}
      </div>
      <div className="s-guide__rows">
        <div className="s-guide__row">
          <span className="s-guide__lbl">Objetivo</span>
          <span className="s-guide__target">
            {guide.target.weight} <em>×</em> {guide.target.reps} <em>· RIR {guide.target.rir}</em>
          </span>
        </div>
        <div className="s-guide__row">
          <span className="s-guide__lbl">Última</span>
          <span className="s-guide__last">{guide.last}</span>
        </div>
      </div>
      <div className="s-guide__hint">
        {guide.finisher
          ? <><SIcon.bolt size={13} /> Vacía el tanque. El agente <b>registra la serie</b> cuando termines.</>
          : <><SIcon.message size={13} /> Díselo al agente y la <b>serie aparece aquí</b> al instante.</>}
      </div>
      {compactRest && !guide.finisher && (
        <div className="s-rest" style={{ marginTop: 12 }}>
          <div className="s-rest__icon"><SIcon.timer size={15} /></div>
          <div className="s-rest__body">
            <div className="s-rest__k">Descanso</div>
            <div className="s-rest__sub">desde la última serie</div>
          </div>
          <div className="s-rest__time" style={{ fontSize: 18 }}>
            {Math.floor(rest.elapsed / 60)}:{String(rest.elapsed % 60).padStart(2, "0")}
          </div>
        </div>
      )}
    </div>
  );
}

// ── exercise rows (pending / completed) ─────────────────────────────────────
function DoneRow({ ex, idx }) {
  return (
    <div className="s-row s-row--done">
      <div className="s-row__node"><SIcon.check size={13} /></div>
      <div className="s-row__body">
        <div className="s-row__name">{ex.name}</div>
        <div className="s-row__meta">
          {ex.target} · {ex.setsTxt}
          {ex.pr && <span className="s-pr"><SIcon.trophy size={9} /> {ex.pr}</span>}
        </div>
      </div>
      <div className="s-row__right">
        <div className="s-row__vol">{ex.vol} <em>vol</em></div>
        <span className={"s-badge is-" + ex.overload}>{ex.overloadTxt}</span>
      </div>
    </div>
  );
}

function PendingRow({ ex, idx }) {
  return (
    <div className="s-row s-row--pending">
      <div className="s-row__node">{idx}</div>
      <div className="s-row__body">
        <div className="s-row__name">{ex.name}</div>
        <div className="s-row__meta">{ex.target} · {ex.planned}</div>
      </div>
      <div className="s-row__right">
        {ex.action && <span className={"s-badge is-" + (ex.action.kind === "body" ? "body" : ex.action.kind)}>{ex.action.label}</span>}
      </div>
    </div>
  );
}

// ── section header ──────────────────────────────────────────────────────────
function Section({ k, count }) {
  return (
    <div className="s-section">
      <span className="s-section__k">{k}</span>
      {count != null && <span className="s-section__count">{count}</span>}
      <span className="s-section__line" />
    </div>
  );
}

Object.assign(window, {
  SIcon, STimer, fmtClock, eNum, buildSession,
  SessHeader, SyncLine, KpiStrip, CurrentExercise, RestModule, NextGuide,
  DoneRow, PendingRow, Section,
});
