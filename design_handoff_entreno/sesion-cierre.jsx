// sesion-cierre.jsx — Hoja de cierre de sesión.
// Flujo: feedback (cualitativo + cuantitativo) → "generando…" → informe (API).
// El informe lo "genera" el agente/API; aquí lo mostramos condensado.

const scoreColor = (v) => (v == null ? "rgba(255,255,255,0.4)" : v >= 7 ? "#5FE39A" : v >= 5 ? "#FFB900" : "#FF4757");

// 1-10 scale of tappable dots
function ScaleField({ name, hint, value, onPick }) {
  return (
    <div className="s-scale">
      <div className="s-scale__head">
        <span className="s-scale__name">{name}</span>
        <span className="s-scale__hint">{value != null ? `${value} / 10` : hint}</span>
      </div>
      <div className="s-scale__dots">
        {Array.from({ length: 10 }).map((_, i) => {
          const v = i + 1;
          const on = value != null && v <= value;
          return (
            <div key={v}
              className={"s-scale__dot" + (on ? " is-on" : "")}
              style={on ? { background: scoreColor(value), borderColor: scoreColor(value) } : null}
              onClick={() => onPick(v)}>
              {v}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CloseSheet({ model, onDismiss, onFinish }) {
  const { useState, useEffect } = React;
  const [phase, setPhase] = useState("feedback"); // feedback | generando | informe
  const [effort, setEffort] = useState(8);
  const [quality, setQuality] = useState(7);
  const [pump, setPump] = useState(9);

  useEffect(() => {
    if (phase !== "generando") return;
    const id = setTimeout(() => setPhase("informe"), 1900);
    return () => clearTimeout(id);
  }, [phase]);

  return (
    <div className="s-sheet">
      <div className="s-sheet__scrim" onClick={onDismiss} />
      <div className="s-sheet__panel">
        <div className="s-sheet__grab" />
        {phase === "feedback" && <FeedbackForm
          effort={effort} quality={quality} pump={pump}
          setEffort={setEffort} setQuality={setQuality} setPump={setPump}
          onGenerate={() => setPhase("generando")} onDismiss={onDismiss} />}
        {phase === "generando" && <Generando />}
        {phase === "informe" && <Informe scores={{ effort, quality, pump }} onDone={onFinish || onDismiss} />}
      </div>
    </div>
  );
}

function FeedbackForm({ effort, quality, pump, setEffort, setQuality, setPump, onGenerate }) {
  return (
    <>
      <div className="s-sheet__scroll">
        <span className="s-fb__eyebrow"><span className="s-live__dot" style={{ animation: "none" }} /> Sesión completada</span>
        <div className="s-fb__title">¿Cómo fue el entreno?</div>
        <div className="s-fb__sub">Tu lectura afina el siguiente plan. El agente ya tiene los números — esto es lo que él no puede medir.</div>

        <div className="s-fb__strip">
          <div className="s-fb__stat"><b>54<em>m</em></b><span>Duración</span></div>
          <div className="s-fb__stat"><b>6.4<em>t</em></b><span>Volumen</span></div>
          <div className="s-fb__stat"><b>24</b><span>Series</span></div>
          <div className="s-fb__stat"><b>1</b><span>PR</span></div>
        </div>

        <ScaleField name="Esfuerzo" hint="¿cuánto exigió?" value={effort} onPick={setEffort} />
        <ScaleField name="Calidad" hint="¿buena técnica?" value={quality} onPick={setQuality} />
        <ScaleField name="Pump" hint="¿buena congestión?" value={pump} onPick={setPump} />

        <div className="s-note">
          <span className="s-note__k">Nota para el agente · opcional</span>
          Hombro derecho algo cargado en el press. La 4ª serie fue al fallo.
        </div>
      </div>
      <div className="s-sheet__foot">
        <button className="s-btn s-btn--primary s-btn--full" onClick={onGenerate}>
          <SIcon.bolt size={16} /> Entregar
        </button>
      </div>
    </>
  );
}

function Generando() {
  return (
    <div className="s-gen">
      <div style={{ position: "relative", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="s-gen__ring" style={{ position: "absolute", inset: 0 }} />
        <img className="s-gen__iso" src="assets/verxion-isotype.png" alt="" />
      </div>
      <div>
        <div className="s-gen__t">Generando tu informe</div>
        <div className="s-gen__d">El agente analiza volumen, sobrecarga y distribución muscular de la sesión.</div>
      </div>
    </div>
  );
}

function Informe({ scores, onDone }) {
  const tiles = [
    { v: "6.4", u: "t", l: "Volumen", icon: SIcon.dumbbell, color: "--vx-health", bg: "var(--vx-health-bg)" },
    { v: "54", u: "m", l: "Duración", icon: SIcon.clock, color: "--vx-insight", bg: "var(--vx-insight-bg)" },
    { v: "24", u: "", l: "Series", icon: SIcon.layers, color: "--vx-positive", bg: "var(--vx-lava-bg)" },
    { v: "182", u: "", l: "Reps", icon: SIcon.repeat, color: "--vx-neutral", bg: "var(--vx-neutral-bg)" },
    { v: "100", u: "kg", l: "Peak", icon: SIcon.trophy, color: "--vx-health", bg: "var(--vx-health-bg)" },
    { v: "2.1", u: "", l: "RIR medio", icon: SIcon.target, color: "--vx-body", bg: "var(--vx-body-bg)" },
  ];
  const muscles = [
    { name: "Pecho", vol: "2.9t", pct: 46 },
    { name: "Hombros", vol: "2.1t", pct: 33 },
    { name: "Tríceps", vol: "1.4t", pct: 21 },
  ];
  const assess = [
    { l: "Esfuerzo", v: scores.effort },
    { l: "Calidad", v: scores.quality },
    { l: "Pump", v: scores.pump },
  ];
  return (
    <>
      <div className="s-sheet__scroll">
        <span className="s-fb__eyebrow"><SIcon.check size={12} /> Informe generado</span>
        <div className="s-fb__title">Empuje · Fuerza A</div>
        <div className="s-fb__sub" style={{ marginBottom: 4 }}>Martes · 2 jun · PPL Hipertrofia</div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
          <span className="s-rep__class" style={{ color: "#5FE39A", background: "rgba(46,204,113,0.13)" }}>
            <SIcon.star size={12} /> Plan perfecto
          </span>
          <span className="s-rep__classmeta">100% completado</span>
        </div>

        <div className="s-rep__grid">
          {tiles.map((tl) => (
            <div className="s-tile" key={tl.l}>
              <div className="s-tile__top">
                <div className="s-tile__bubble" style={{ background: tl.bg, color: `var(${tl.color})` }}>
                  <tl.icon size={17} />
                </div>
              </div>
              <div>
                <div className="s-tile__v">{tl.v}{tl.u && <em>{tl.u}</em>}</div>
                <div className="s-tile__l">{tl.l}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="s-rep__h"><SIcon.star size={16} /><span>Tu valoración</span></div>
        <div className="s-assess">
          {assess.map((a) => (
            <div className="s-assess__c" key={a.l}>
              <div className="s-assess__v" style={{ color: scoreColor(a.v) }}>{a.v}</div>
              <div className="s-assess__u">/10</div>
              <div className="s-assess__l">{a.l}</div>
            </div>
          ))}
        </div>

        <div className="s-rep__h"><SIcon.activity size={16} /><span>Grupos musculares</span></div>
        <div className="s-musc">
          {muscles.map((m) => (
            <div className="s-musc__row" key={m.name}>
              <div className="s-musc__top">
                <span className="s-musc__name">{m.name}</span>
                <span className="s-musc__vol">{m.vol}</span>
              </div>
              <div className="s-musc__bar"><span style={{ width: m.pct + "%" }} /></div>
            </div>
          ))}
        </div>

        <div className="s-sync" style={{ marginTop: 18 }}>
          <img className="s-sync__iso" src="assets/verxion-isotype.png" alt="" />
          <div className="s-sync__t">Guardado en tu progreso. Pídele al agente el <b>plan de la próxima</b>.</div>
        </div>
      </div>
      <div className="s-sheet__foot">
        <button className="s-btn s-btn--primary s-btn--full" onClick={onDone}>
          <SIcon.check size={16} /> Listo
        </button>
      </div>
    </>
  );
}

Object.assign(window, { CloseSheet, FeedbackForm, Generando, Informe, ScaleField, scoreColor });
