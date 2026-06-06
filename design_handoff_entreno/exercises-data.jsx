// exercises-data.jsx — catálogo ÚNICO de ejercicios.
// Fuente de verdad compartida por la library de Entreno (lista + filtro + orden)
// y el detalle de ejercicio. Es lo que el agente ha definido/registrado; la app
// solo lee. Cada ejercicio sintetiza su curva + historial desde un pico (e1RM /
// volumen), salvo los que traen overrides. logs===0 → "sin hacer" (sin datos).

// ── taxonomía de filtros ────────────────────────────────────────────────────
const VX_GROUPS = ["Pecho", "Espalda", "Pierna", "Hombro", "Brazo", "Core"];
const VX_EQUIPS = ["Barra", "Mancuerna", "Polea", "Máquina", "Peso corporal"];

// part → color/icono (mismo vocabulario que DAY_TYPE de entreno-core)
const VX_PART = {
  push: { color: "var(--vx-lava)",    bg: "var(--vx-lava-bg)",    glow: "rgba(255,98,98,0.30)" },
  pull: { color: "var(--vx-body)",    bg: "var(--vx-body-bg)",    glow: "rgba(0,210,255,0.26)" },
  legs: { color: "var(--vx-neutral)", bg: "var(--vx-neutral-bg)", glow: "rgba(255,185,0,0.26)" },
  core: { color: "var(--vx-insight)", bg: "var(--vx-insight-bg)", glow: "rgba(168,85,247,0.26)" },
};

const VX_DOW = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const VX_MON = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function vxFmtDate(d) { return `${VX_DOW[d.getDay()]} ${d.getDate()} ${VX_MON[d.getMonth()]}`; }
function vxKg(n) { return Number(n).toLocaleString("de-DE") + " kg"; }
function vxSlug(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// curva normalizada (8 sesiones, sube con leve ondulación, termina en el pico)
const VX_CURVE = [0, 0.12, 0.05, 0.30, 0.52, 0.43, 0.74, 1];

function vxParseTop(top) {
  const m = top.match(/([+]?)([\d.,]+)\s*kg\s*[×x]\s*(\d+)/i);
  if (!m) return { prefix: "", w: 0, reps: 8 };
  return { prefix: m[1] || "", w: parseFloat(m[2].replace(",", ".")), reps: parseInt(m[3], 10) };
}

// sintetiza series {e1rm, volumen} + history desde el spec
function vxSynth(spec) {
  if (!spec.logs) return { series: null, history: [], e1rmDelta: null, volDelta: null };

  const eLo = spec.e1rmPeak * 0.92, vLo = spec.volPeak * 0.84;
  const e1rm = VX_CURVE.map((f, i) => ({ l: "s" + (i + 1), v: Math.round(eLo + f * (spec.e1rmPeak - eLo)) }));
  const volumen = VX_CURVE.map((f, i) => ({ l: "s" + (i + 1), v: +(vLo + f * (spec.volPeak - vLo)).toFixed(1) }));

  // history: 6 más recientes (s8 → s3), semanal hacia atrás desde el ancla
  const top0 = vxParseTop(spec.top);
  const inc = 2.5;
  const anchor = new Date(2026, 5, spec.lastDays != null ? 2 - 0 : 2);
  const base = new Date(2026, 5, 2);
  base.setDate(base.getDate() - (spec.lastDays || 2));
  const deltas = [spec.pr ? 3 : 2, 2, -1, 3, 2, -2];
  const history = [];
  for (let i = 0; i < 6; i++) {
    const si = 7 - i; // índice en series (s8..s3)
    const d = new Date(base); d.setDate(base.getDate() - i * 7);
    const w = +(top0.w - i * inc).toFixed(1);
    const reps = top0.reps + ((i % 2) ? -1 : 0) + (i === 3 ? 1 : 0);
    history.push({
      date: vxFmtDate(d),
      top: `${top0.prefix}${vxKg(w)} × ${Math.max(3, reps)}`,
      e1rm: vxKg(e1rm[si].v),
      vol: volumen[si].v.toFixed(1).replace(".", ",") + " t",
      rir: (i % 3 === 2) ? 1 : 2,
      delta: deltas[i],
      pr: i === 0 && !!spec.pr,
    });
  }
  return {
    series: { e1rm, volumen },
    history,
    e1rmDelta: "+" + (spec.e1rmPeak - e1rm[0].v) + " kg",
    volDelta: "+" + (spec.volPeak - volumen[0].v).toFixed(1).replace(".", ",") + " t",
  };
}

// ── specs (terso) → se expanden a objetos completos ───────────────────────────
const VX_SPECS = [
  { name: "Press banca", group: "Pecho", target: "Pecho", equip: "Barra", part: "push",
    logs: 18, lastDays: 2, pr: "82,5 kg", e1rmPeak: 104, volPeak: 3.6, since: "14 sem", top: "82,5 kg × 8",
    muscles: [["Pectoral mayor", 100, "Principal"], ["Deltoides anterior", 55, "Secundario"], ["Tríceps", 40, "Secundario"]],
    desc: "El empuje horizontal de referencia. Construye fuerza y masa en pecho, con apoyo de hombro y tríceps.",
    pasos: ["Túmbate con los omóplatos retraídos y los pies firmes en el suelo.", "Agarra la barra algo más ancho que los hombros y sácala del soporte.", "Baja controlando hasta rozar el esternón, codos a unos 45°.", "Empuja hasta extender los codos sin bloquear de golpe."],
    note: "Tu press subió 8 kg de e1RM en 14 semanas — progresión sólida y lineal. Mantén RIR 2 y subimos 2,5 kg cuando claves 3×8 limpias." },

  { name: "Press inclinado mancuerna", group: "Pecho", target: "Pecho superior", equip: "Mancuerna", part: "push",
    logs: 12, lastDays: 9, pr: null, e1rmPeak: 74, volPeak: 2.4, since: "10 sem", top: "34 kg × 9",
    muscles: [["Pectoral superior", 100, "Principal"], ["Deltoides anterior", 60, "Secundario"], ["Tríceps", 35, "Secundario"]],
    desc: "Inclinación de 30° para cargar el pecho superior con un rango de movimiento amplio y libre.",
    pasos: ["Ajusta el banco a unos 30°.", "Sube las mancuernas y colócalas a la altura del pecho.", "Baja controlando hasta sentir estiramiento.", "Empuja juntando ligeramente arriba."] },

  { name: "Aperturas en polea", group: "Pecho", target: "Pecho", equip: "Polea", part: "push",
    logs: 6, lastDays: 16, pr: null, e1rmPeak: 0, volPeak: 1.1, since: "5 sem", top: "18 kg × 14",
    muscles: [["Pectoral mayor", 100, "Principal"], ["Deltoides anterior", 30, "Secundario"]],
    desc: "Aislamiento de pecho con tensión constante. Ideal para congestión al final del empuje.",
    pasos: ["Coloca las poleas a la altura de los hombros.", "Da un paso al frente con el pecho alto.", "Junta las manos describiendo un arco amplio.", "Vuelve despacio sin perder tensión."] },

  { name: "Press militar", group: "Hombro", target: "Hombro", equip: "Barra", part: "push",
    logs: 11, lastDays: 4, pr: "55 kg", e1rmPeak: 70, volPeak: 2.1, since: "12 sem", top: "55 kg × 8",
    muscles: [["Deltoides anterior", 100, "Principal"], ["Deltoides lateral", 55, "Secundario"], ["Tríceps", 45, "Secundario"]],
    desc: "Empuje vertical de pie. El mejor constructor de hombro y fuerza de tronco en bloque.",
    pasos: ["Barra a la altura de las clavículas, manos algo más anchas que los hombros.", "Aprieta glúteo y abdomen para fijar el tronco.", "Empuja vertical pasando la cabeza hacia atrás.", "Bloquea arriba con la barra sobre el centro."] },

  { name: "Elevaciones laterales", group: "Hombro", target: "Deltoides lateral", equip: "Mancuerna", part: "push",
    logs: 8, lastDays: 4, pr: null, e1rmPeak: 0, volPeak: 0.9, since: "8 sem", top: "12 kg × 13",
    muscles: [["Deltoides lateral", 100, "Principal"], ["Trapecio", 25, "Secundario"]],
    desc: "Aislamiento del deltoides lateral para ganar anchura de hombros.",
    pasos: ["De pie, mancuernas a los lados con un codo ligeramente flexionado.", "Sube hasta la altura de los hombros guiando con los codos.", "Pausa breve arriba.", "Baja controlando sin balanceo."] },

  { name: "Face pull", group: "Hombro", target: "Deltoides posterior", equip: "Polea", part: "pull",
    logs: 5, lastDays: 11, pr: null, e1rmPeak: 0, volPeak: 1.2, since: "5 sem", top: "25 kg × 15",
    muscles: [["Deltoides posterior", 100, "Principal"], ["Trapecio", 50, "Secundario"], ["Rotadores", 40, "Secundario"]],
    desc: "Salud de hombro y deltoides posterior. Compensa todo el volumen de empuje.",
    pasos: ["Polea a la altura de la cara con cuerda.", "Tira llevando las manos hacia las orejas.", "Abre al final rotando hacia fuera.", "Vuelve despacio."] },

  { name: "Dominadas lastradas", group: "Espalda", target: "Dorsal", equip: "Peso corporal", part: "pull",
    logs: 15, lastDays: 5, pr: "+20 kg", e1rmPeak: 38, volPeak: 2.8, since: "13 sem", top: "+20 kg × 7",
    muscles: [["Dorsal ancho", 100, "Principal"], ["Bíceps", 50, "Secundario"], ["Romboides", 45, "Secundario"]],
    desc: "El rey del tirón vertical. Añade lastre para progresar en fuerza relativa.",
    pasos: ["Cuelga con agarre algo más ancho que los hombros.", "Inicia bajando las escápulas.", "Tira llevando el pecho a la barra.", "Baja con control hasta extender."],
    note: "Tu dominada con lastre llegó a +20 kg — fuerza relativa excelente. Mantén la ejecución estricta antes de subir lastre." },

  { name: "Remo con barra", group: "Espalda", target: "Espalda", equip: "Barra", part: "pull",
    logs: 14, lastDays: 5, pr: null, e1rmPeak: 100, volPeak: 3.2, since: "11 sem", top: "80 kg × 9",
    muscles: [["Dorsal ancho", 100, "Principal"], ["Romboides", 65, "Secundario"], ["Bíceps", 40, "Secundario"]],
    desc: "Tirón horizontal pesado para construir grosor de espalda.",
    pasos: ["Cadera atrás, tronco a unos 45°, espalda neutra.", "Agarra la barra a la anchura de los hombros.", "Tira hacia el ombligo juntando escápulas.", "Baja controlando sin redondear."] },

  { name: "Jalón al pecho", group: "Espalda", target: "Dorsal", equip: "Polea", part: "pull",
    logs: 7, lastDays: 12, pr: null, e1rmPeak: 0, volPeak: 2.0, since: "6 sem", top: "65 kg × 11",
    muscles: [["Dorsal ancho", 100, "Principal"], ["Bíceps", 45, "Secundario"], ["Redondo mayor", 40, "Secundario"]],
    desc: "Tirón vertical en máquina. Alternativa graduable a la dominada.",
    pasos: ["Sujeta la barra ancha y fija las piernas.", "Pecho alto, baja las escápulas.", "Tira la barra hacia la clavícula.", "Sube controlando con estiramiento."] },

  { name: "Curl de bíceps", group: "Brazo", target: "Bíceps", equip: "Mancuerna", part: "pull",
    logs: 9, lastDays: 8, pr: null, e1rmPeak: 0, volPeak: 1.1, since: "9 sem", top: "16 kg × 11",
    muscles: [["Bíceps braquial", 100, "Principal"], ["Braquial", 45, "Secundario"]],
    desc: "Aislamiento clásico de bíceps con mancuernas, supinando al subir.",
    pasos: ["De pie, mancuernas a los lados, palmas al frente.", "Flexiona el codo sin mover el hombro.", "Aprieta arriba.", "Baja despacio hasta extender."] },

  { name: "Extensión de tríceps en polea", group: "Brazo", target: "Tríceps", equip: "Polea", part: "push",
    logs: 10, lastDays: 8, pr: null, e1rmPeak: 0, volPeak: 1.3, since: "9 sem", top: "30 kg × 12",
    muscles: [["Tríceps braquial", 100, "Principal"]],
    desc: "Aislamiento de tríceps con tensión constante en polea alta.",
    pasos: ["Polea alta con barra o cuerda.", "Codos pegados al cuerpo.", "Extiende hasta abajo.", "Sube controlando sin abrir los codos."] },

  { name: "Sentadilla", group: "Pierna", target: "Cuádriceps", equip: "Barra", part: "legs",
    logs: 16, lastDays: 6, pr: "140 kg", e1rmPeak: 168, volPeak: 9.2, since: "12 sem", top: "140 kg × 6",
    muscles: [["Cuádriceps", 100, "Principal"], ["Glúteo mayor", 70, "Secundario"], ["Femoral", 45, "Secundario"], ["Core", 35, "Estabilizador"]],
    desc: "El ejercicio rey de pierna. Fuerza y masa de cuádriceps y glúteo con gran demanda de tronco.",
    pasos: ["Barra sobre el trapecio, pies a la anchura de los hombros.", "Inspira y aprieta el abdomen.", "Baja con la cadera atrás hasta romper la paralela.", "Sube empujando el suelo con todo el pie."],
    note: "12 kg de e1RM en 12 semanas — la sentadilla es tu mejor palanca ahora mismo. Calienta sin prisa y respeta el RIR 2." },

  { name: "Peso muerto rumano", group: "Pierna", target: "Femoral", equip: "Barra", part: "legs",
    logs: 13, lastDays: 6, pr: "120 kg", e1rmPeak: 146, volPeak: 6.4, since: "11 sem", top: "120 kg × 9",
    muscles: [["Femoral", 100, "Principal"], ["Glúteo mayor", 70, "Secundario"], ["Erectores", 50, "Secundario"]],
    desc: "Bisagra de cadera para femoral y glúteo, con énfasis en el estiramiento.",
    pasos: ["De pie con la barra pegada a los muslos.", "Lleva la cadera atrás manteniendo la espalda neutra.", "Baja hasta media espinilla notando el femoral.", "Sube empujando la cadera al frente."] },

  { name: "Prensa inclinada", group: "Pierna", target: "Cuádriceps", equip: "Máquina", part: "legs",
    logs: 5, lastDays: 20, pr: null, e1rmPeak: 0, volPeak: 7.5, since: "5 sem", top: "210 kg × 11",
    muscles: [["Cuádriceps", 100, "Principal"], ["Glúteo mayor", 55, "Secundario"]],
    desc: "Empuje de pierna en máquina. Mucho volumen de cuádriceps con baja demanda técnica.",
    pasos: ["Apoya la espalda completa en el respaldo.", "Pies a la anchura de los hombros en la plataforma.", "Baja flexionando hasta unos 90°.", "Empuja sin bloquear las rodillas."] },

  { name: "Hip thrust", group: "Pierna", target: "Glúteo", equip: "Barra", part: "legs", custom: true,
    logs: 3, lastDays: 13, pr: null, e1rmPeak: 0, volPeak: 5.2, since: "3 sem", top: "100 kg × 12",
    muscles: [["Glúteo mayor", 100, "Principal"], ["Femoral", 50, "Secundario"]],
    desc: "Extensión de cadera para glúteo. Ejercicio personalizado que añadiste a tu rutina.",
    pasos: ["Espalda apoyada en un banco, barra sobre la cadera.", "Pies firmes a la anchura de la cadera.", "Empuja la cadera arriba hasta alinear el tronco.", "Aprieta el glúteo arriba y baja con control."] },

  { name: "Plancha", group: "Core", target: "Core", equip: "Peso corporal", part: "core",
    logs: 0, lastDays: null, pr: null, e1rmPeak: 0, volPeak: 0, since: null, top: null,
    muscles: [["Recto abdominal", 100, "Principal"], ["Transverso", 70, "Secundario"], ["Oblicuos", 50, "Secundario"]],
    desc: "Isométrico de core para estabilidad de tronco. Aún no lo has registrado.",
    pasos: ["Apóyate en antebrazos y puntas de los pies.", "Alinea cabeza, cadera y talones.", "Aprieta abdomen y glúteo.", "Mantén respirando de forma constante."] },

  { name: "Curl nórdico", group: "Pierna", target: "Femoral", equip: "Peso corporal", part: "legs", custom: true,
    logs: 0, lastDays: null, pr: null, e1rmPeak: 0, volPeak: 0, since: null, top: null,
    muscles: [["Femoral", 100, "Principal"], ["Gemelo", 30, "Estabilizador"]],
    desc: "Excéntrico brutal de femoral. Ejercicio personalizado, aún sin registrar.",
    pasos: ["Arrodíllate con los tobillos fijados.", "Baja el tronco lo más lento posible.", "Frena con el femoral hasta donde aguantes.", "Empuja con las manos para volver."] },
];

// expande specs → catálogo completo
const VX_EXERCISES = VX_SPECS.map((s) => {
  const synth = vxSynth(s);
  return {
    ...s,
    slug: vxSlug(s.name),
    custom: !!s.custom,
    done: s.logs > 0,
    target: s.target || s.group,
    cat: s.muscles.length > 1 ? "Compuesto" : "Aislamiento",
    pal: VX_PART[s.part] || VX_PART.push,
    muscles: s.muscles.map(([name, pct, role]) => ({ name, pct, role })),
    e1rm: s.e1rmPeak ? vxKg(s.e1rmPeak) : "—",
    bestVol: s.volPeak ? s.volPeak.toFixed(1).replace(".", ",") + " t" : "—",
    ...synth,
  };
});

const VX_BY_SLUG = Object.fromEntries(VX_EXERCISES.map((e) => [e.slug, e]));
function vxExerciseBySlug(slug) { return VX_BY_SLUG[slug] || VX_EXERCISES[0]; }

Object.assign(window, {
  VX_GROUPS, VX_EQUIPS, VX_PART, VX_EXERCISES, VX_BY_SLUG, vxExerciseBySlug, vxSlug, vxKg,
});
