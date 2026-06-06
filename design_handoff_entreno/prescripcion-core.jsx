// prescripcion-core.jsx — Previsualización del día (la prescripción).
// El puente entre "Entreno" y "Sesión en marcha": antes de darle a empezar,
// ves lo que toca hoy — el plan que armó el agente, ejercicio a ejercicio.
// Read-only-first: el plan lo hizo el agente; aquí lo lees y, si quieres
// cambiarlo, se lo pides al agente (no se edita a mano). buildPrescripcion(t).

// ── iconos (lucide-style, stroke 2) sobre <Svg> de icons.jsx ──────────────
const PIcon = {
  play:    (p) => <Svg {...p}><path d="M7 4.5v15l13-7.5-13-7.5Z" /></Svg>,
  clock:   (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>,
  layers:  (p) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" /></Svg>,
  repeat:  (p) => <Svg {...p}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></Svg>,
  target:  (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  timer:   (p) => <Svg {...p}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6M12 5V2" /></Svg>,
  chevronDown: (p) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>,
  more:    (p) => <Svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  bolt:    (p) => <Svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" /></Svg>,
  swap:    (p) => <Svg {...p}><path d="M8 3L4 7l4 4M4 7h12M16 21l4-4-4-4M20 17H8" /></Svg>,
  message: (p) => <Svg {...p}><path d="M21 11.5a8.4 8.4 0 0 1-12 7.6L3 21l1.9-6A8.4 8.4 0 1 1 21 11.5Z" /></Svg>,
  rows:    (p) => <Svg {...p}><path d="M3 6.5h18M3 12h18M3 17.5h18" /></Svg>,
  trophy:  (p) => <Svg {...p}><path d="M6 4h12v3a6 6 0 0 1-12 0V4ZM6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 17h6M10 17v-2.3M14 17v-2.3M8 21h8" /></Svg>,
};

// ── tipo de día → color + tag + icono ─────────────────────────────────────
const P_DAY = {
  push: { color: "var(--vx-lava)",    bg: "var(--vx-lava-bg)",    tag: "Push", icon: Icon.dumbbell, glow: "rgba(255,98,98,0.30)" },
  pull: { color: "var(--vx-body)",    bg: "var(--vx-body-bg)",    tag: "Pull", icon: PIcon.rows,    glow: "rgba(0,210,255,0.26)" },
  legs: { color: "var(--vx-neutral)", bg: "var(--vx-neutral-bg)", tag: "Legs", icon: Icon.footprints, glow: "rgba(255,185,0,0.26)" },
};

// ── modelo de escenario ────────────────────────────────────────────────────
function buildPrescripcion(t) {
  const dia = t.dia || "push";
  const ajuste = t.ajuste !== false;   // el agente sugirió un cambio

  const PLANS = {
    push: {
      name: "Push A", focus: "Pecho · hombros · tríceps",
      ex: [
        { name: "Press banca",               muscle: "Pecho",       equip: "Barra",     sets: 4, reps: "6–8",   rir: 2, rest: "2:30", target: "82,5 kg", last: "80 kg × 8",   up: "+2,5", key: true },
        { name: "Press inclinado mancuerna",  muscle: "Pecho sup.",  equip: "Mancuerna", sets: 3, reps: "8–10",  rir: 2, rest: "2:00", target: "34 kg",   last: "32 kg × 9",   up: "+2" },
        { name: "Press militar",              muscle: "Hombro",      equip: "Barra",     sets: 4, reps: "8",     rir: 2, rest: "2:00", target: "55 kg",   last: "52,5 kg × 8", up: "+2,5" },
        { name: "Aperturas en polea",         muscle: "Pecho",       equip: "Polea",     sets: 3, reps: "12–15", rir: 1, rest: "1:30", target: "18 kg",   last: "16 kg × 14" },
        { name: "Elevaciones laterales",      muscle: "Deltoides",   equip: "Mancuerna", sets: 4, reps: "12–15", rir: 1, rest: "1:00", target: "12 kg",   last: "12 kg × 13" },
        { name: "Extensión tríceps polea",    muscle: "Tríceps",     equip: "Polea",     sets: 3, reps: "12",    rir: 2, rest: "1:30", target: "30 kg",   last: "27,5 kg × 12" },
      ],
      swap: { from: "Fondos lastrados", to: "Aperturas en polea", why: "Hombro derecho cargado tras el press. Cambio a un patrón más amable hoy." },
    },
    pull: {
      name: "Pull A", focus: "Espalda · bíceps · deltoides post.",
      ex: [
        { name: "Dominadas lastradas",        muscle: "Dorsal",      equip: "Peso corp.", sets: 4, reps: "6–8",   rir: 2, rest: "2:30", target: "+20 kg",  last: "+17,5 kg × 7", up: "+2,5", key: true },
        { name: "Remo con barra",             muscle: "Espalda",     equip: "Barra",      sets: 4, reps: "8–10",  rir: 2, rest: "2:00", target: "80 kg",   last: "77,5 kg × 9",  up: "+2,5" },
        { name: "Jalón al pecho",             muscle: "Dorsal",      equip: "Polea",      sets: 3, reps: "10–12", rir: 2, rest: "1:45", target: "65 kg",   last: "62,5 kg × 11" },
        { name: "Curl bíceps con barra",      muscle: "Bíceps",      equip: "Barra",      sets: 3, reps: "8–10",  rir: 1, rest: "1:30", target: "35 kg",   last: "32,5 kg × 10" },
        { name: "Curl martillo",              muscle: "Braquial",    equip: "Mancuerna",  sets: 3, reps: "12",    rir: 1, rest: "1:15", target: "16 kg",   last: "16 kg × 11" },
        { name: "Face pull",                  muscle: "Deltoides post.", equip: "Polea",  sets: 3, reps: "15",    rir: 2, rest: "1:00", target: "25 kg",   last: "22,5 kg × 15" },
      ],
      swap: { from: "Remo Pendlay", to: "Remo con barra", why: "Mantengo carga controlada esta semana — el Pendlay lo retomamos tras el deload." },
    },
    legs: {
      name: "Legs A", focus: "Cuádriceps · glúteo · core",
      ex: [
        { name: "Sentadilla",                 muscle: "Cuádriceps",  equip: "Barra",      sets: 4, reps: "5–7",   rir: 2, rest: "3:00", target: "142,5 kg", last: "140 kg × 6",  up: "+2,5", key: true },
        { name: "Peso muerto rumano",         muscle: "Femoral",     equip: "Barra",      sets: 3, reps: "8–10",  rir: 2, rest: "2:30", target: "122,5 kg", last: "120 kg × 9",  up: "+2,5" },
        { name: "Prensa inclinada",           muscle: "Cuádriceps",  equip: "Máquina",    sets: 3, reps: "10–12", rir: 2, rest: "2:00", target: "220 kg",   last: "210 kg × 11" },
        { name: "Curl femoral tumbado",       muscle: "Femoral",     equip: "Máquina",    sets: 3, reps: "12",    rir: 1, rest: "1:30", target: "55 kg",    last: "52,5 kg × 12" },
        { name: "Extensión de cuádriceps",    muscle: "Cuádriceps",  equip: "Máquina",    sets: 3, reps: "15",    rir: 1, rest: "1:15", target: "60 kg",    last: "57,5 kg × 14" },
        { name: "Elevación de gemelo",        muscle: "Gemelo",      equip: "Máquina",    sets: 4, reps: "12–15", rir: 1, rest: "1:00", target: "90 kg",    last: "85 kg × 15" },
      ],
      swap: { from: "Sentadilla frontal", to: "Sentadilla", why: "Volvemos a la trasera: tu técnica frontal aún pierde el torso a partir de la 3ª serie." },
    },
  };

  const plan = PLANS[dia];
  const cfg = P_DAY[dia];

  // resumen
  const totalSets = plan.ex.reduce((a, e) => a + e.sets, 0);
  const totalEx = plan.ex.length;
  const estMin = Math.round(totalSets * 2.6 + totalEx * 1.2);
  const volEst = dia === "legs" ? "9,2 t" : dia === "pull" ? "6,8 t" : "7,1 t";

  // nota del agente para el día
  const NOTE = {
    push: "Semana 3, sigues adelantado. Hoy el foco es el press banca — busca esas 82,5 kg limpias a RIR 2. El resto, técnica y congestión.",
    pull: "Subió tu volumen de tirón un 9 % vs. semana 2. Mantén la dominada estricta y deja medio depósito en el remo: el sábado buscamos PR.",
    legs: "Día clave de la semana. La sentadilla a 142,5 kg es PR de carga — calienta sin prisa y para si la barra se frena. RIR 2 de verdad.",
  };

  return {
    dia, cfg, ajuste,
    routine: "PPL Hipertrofia", week: 3, weeks: 6,
    plan, note: NOTE[dia],
    summary: { ex: totalEx, sets: totalSets, min: estMin, vol: volEst },
  };
}

// ── icon bubble ────────────────────────────────────────────────────────────
function PBubble({ color, bg, size = 44, glow, children }) {
  return (
    <span className="p-bubble" style={{ width: size, height: size, color, background: bg,
      boxShadow: glow ? `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 22px ${glow}` : undefined }}>
      {children}
    </span>
  );
}

// ── hero / cabecera del día ──────────────────────────────────────────────────
function PHero({ model }) {
  const { cfg, plan, routine, week, weeks, summary } = model;
  return (
    <div className="p-hero">
      <div className="p-hero__top">
        <div className="p-eyebrow" style={{ color: cfg.color }}>HOY · {cfg.tag.toUpperCase()}</div>
        <div className="p-hero__ctx"><PIcon.repeat size={12} /> {routine} · sem {week}/{weeks}</div>
      </div>
      <div className="p-hero__row">
        <PBubble color={cfg.color} bg={cfg.bg} size={52} glow={cfg.glow}>{cfg.icon({ size: 26 })}</PBubble>
        <div style={{ minWidth: 0 }}>
          <div className="p-hero__name">{plan.name}</div>
          <div className="p-hero__focus">{plan.focus}</div>
        </div>
      </div>
      <div className="p-hero__stats">
        <div className="p-stat"><PIcon.layers size={14} /><b>{summary.ex}</b><span>ejercicios</span></div>
        <div className="p-stat"><PIcon.repeat size={14} /><b>{summary.sets}</b><span>series</span></div>
        <div className="p-stat"><PIcon.clock size={14} /><b>~{summary.min}</b><span>min</span></div>
        <div className="p-stat"><PIcon.bolt size={14} /><b>{summary.vol}</b><span>vol. est.</span></div>
      </div>
    </div>
  );
}

// ── nota del agente (el "por qué" del día) ───────────────────────────────────
function PAgentNote({ msg }) {
  return (
    <div className="p-agent">
      <span className="p-agent__mark"><Isotype size={22} glow /></span>
      <div>
        <div className="p-agent__from">verxion · plan de hoy</div>
        <div className="p-agent__msg">{msg}</div>
      </div>
    </div>
  );
}

// ── tarjeta de ejercicio (la prescripción) ───────────────────────────────────
function PExCard({ ex, idx, cfg, swapped }) {
  return (
    <div className={"p-ex" + (ex.key ? " is-key" : "") + (swapped ? " is-swap" : "")}>
      <div className="p-ex__rail">
        <span className="p-ex__n" style={ex.key ? { color: cfg.color, borderColor: cfg.color } : null}>{idx}</span>
      </div>
      <div className="p-ex__body">
        <div className="p-ex__head">
          <div style={{ minWidth: 0 }}>
            <div className="p-ex__name">
              {ex.name}
              {ex.key && <span className="p-ex__keytag" style={{ color: cfg.color, background: cfg.bg }}>principal</span>}
            </div>
            <div className="p-ex__muscle">{ex.muscle} · {ex.equip}</div>
          </div>
          <div className="p-ex__target">
            <span>{ex.target}</span>
            <em>objetivo</em>
          </div>
        </div>

        {swapped && (
          <div className="p-ex__swapnote">
            <PIcon.swap size={12} /> El agente cambió <b>{swapped.from}</b> → {ex.name}
          </div>
        )}

        <div className="p-ex__rx">
          <span className="p-rx"><b>{ex.sets}</b>×{ex.reps}</span>
          <span className="p-rx p-rx--mut">RIR {ex.rir}</span>
          <span className="p-rx p-rx--mut"><PIcon.timer size={11} /> {ex.rest}</span>
          {ex.up && <span className="p-rx p-rx--up">↑ {ex.up}</span>}
        </div>
        <div className="p-ex__last">última · {ex.last}</div>
      </div>
    </div>
  );
}

// ── patrón recurrente: "ajustar con el agente" (la superficie de edición) ─────
function PAgentEdit({ label = "Ajustar este plan con el agente", hint = "El plan es de solo lectura — los cambios los hace verxion." }) {
  return (
    <button className="p-edit" onClick={() => vxNav(VX.AGENTE, { caso: "inicio" })}>
      <span className="p-edit__iso"><Isotype size={20} glow /></span>
      <div className="p-edit__body">
        <div className="p-edit__label">{label}</div>
        <div className="p-edit__hint">{hint}</div>
      </div>
      <span className="p-edit__c">›</span>
    </button>
  );
}

Object.assign(window, {
  PIcon, P_DAY, buildPrescripcion, PBubble, PHero, PAgentNote, PExCard, PAgentEdit,
});
