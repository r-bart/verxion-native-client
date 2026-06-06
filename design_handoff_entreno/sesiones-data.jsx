// sesiones-data.jsx — catálogo ÚNICO de sesiones registradas (lo que el agente
// ya ha guardado de cada entreno completado). Fuente de verdad compartida por:
//   · el historial reciente del segmento "Sesiones" (Entreno)
//   · el "Detalle de sesión" (informe persistido + desglose por ejercicio)
// La app SOLO LEE. Corregir un registro es petición al agente, no edición a mano.
// Las series reales se SINTETIZAN desde el plan del día (RD_PLANS) — así el
// detalle cuadra con lo que la rutina prescribió.

// ── parsers de carga / reps ─────────────────────────────────────────────────
function sdParseW(t) {
  const m = String(t).match(/([+]?)([\d.,]+)\s*kg/i);
  if (m) return { kind: "kg", prefix: m[1] || "", w: parseFloat(m[2].replace(",", ".")) };
  if (/^\d+\s*s$/.test(String(t).trim())) return { kind: "time", label: String(t).trim() };
  return { kind: "other", label: String(t) };
}
function sdNum(n) { return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ","); }
function sdRound25(w) { return Math.round(w / 2.5) * 2.5; }
function sdFmtW(p) { return p.prefix + sdNum(p.w) + " kg"; }
function sdParseReps(r) {
  const m = String(r).match(/(\d+)\s*[–-]\s*(\d+)/);
  if (m) return [+m[1], +m[2]];
  const s = String(r).match(/(\d+)/);
  return s ? [+s[1], +s[1]] : [8, 8];
}

// muscle (del plan) → grupo amplio (para el desglose muscular)
const SD_MUSC_GROUP = {
  "Pecho": "Pecho", "Pecho sup.": "Pecho", "Pecho inf.": "Pecho",
  "Hombro": "Hombros", "Deltoides": "Hombros", "Deltoides post.": "Hombros",
  "Tríceps": "Tríceps", "Bíceps": "Bíceps", "Braquial": "Bíceps",
  "Dorsal": "Espalda", "Espalda": "Espalda",
  "Cuádriceps": "Cuádriceps", "Femoral": "Femoral", "Glúteo": "Glúteo",
  "Gemelo": "Gemelo", "Core": "Core",
};

// ── síntesis de una sesión a partir de su plan ──────────────────────────────
function sdSynth(spec) {
  const plan = (typeof RD_PLANS !== "undefined" && RD_PLANS[spec.plan]) ? RD_PLANS[spec.plan] : null;
  const exercises = [];
  let volKg = 0, series = 0, reps = 0, peak = 0;
  const muscleVol = {};

  if (plan) {
    plan.ex.forEach((ex, i) => {
      const p = sdParseW(ex.target);
      const [lo, hi] = sdParseReps(ex.reps);
      const isKey = !!ex.key;
      const sets = [];
      let exVol = 0;
      for (let s = 0; s < ex.sets; s++) {
        const rp = Math.max(lo, hi - s);             // baja un poco por serie
        series += 1;
        if (p.kind === "kg") {
          const w = sdRound25(p.w * (spec.scale || 1));  // carga constante; escalada por bloque
          const pr = spec.prs > 0 && isKey && s === 0;
          volKg += w * rp; exVol += w * rp; reps += rp;
          if (w > peak) peak = w;
          sets.push({ disp: sdNum(w) + " × " + rp, w, reps: rp, pr });
        } else if (p.kind === "time") {
          sets.push({ disp: p.label, pr: false });
        } else {
          reps += rp;
          sets.push({ disp: p.label + " × " + rp, pr: false });
        }
      }
      const grp = SD_MUSC_GROUP[ex.muscle] || ex.muscle;
      muscleVol[grp] = (muscleVol[grp] || 0) + exVol;
      exercises.push({
        name: ex.name, muscle: ex.muscle, equip: ex.equip, slug: rdSlug(ex.name),
        prescrip: ex.sets + "×" + ex.reps + " · RIR " + ex.rir, key: isKey,
        top: sets.reduce((b, x) => (x.w && (!b || x.w >= b.w) ? x : b), null),
        sets, hasPR: sets.some((x) => x.pr),
      });
    });
  }

  const total = Object.values(muscleVol).reduce((a, b) => a + b, 0) || 1;
  const muscles = Object.entries(muscleVol)
    .map(([name, v]) => ({ name, volT: v / 1000, pct: Math.round((v / total) * 100) }))
    .sort((a, b) => b.volT - a.volT).slice(0, 4);

  return {
    exercises, muscles,
    volT: +(volKg / 1000).toFixed(1),
    series, reps, peak,
  };
}

// ── specs (terso) → se expanden con la síntesis ─────────────────────────────
const SD_SPECS = [
  { slug: "legs-b-31may", date: "Sáb 31", dateLong: "Sábado · 31 may", name: "Legs B", type: "legs", plan: "legs-b",
    dur: "66m", durMin: 66, delta: 4, prs: 1, rir: 2.0, completion: 100, scores: { effort: 9, quality: 8, pump: 9 },
    note: "Femoral con buena conexión. La última de RDL se fue un poco de RIR pero limpia.",
    recap: "Sesión sólida: +4 % de volumen y PR de carga en RDL a 125 kg. El femoral aguantó bien el doble estímulo del día. Mantenemos cargas y subimos reps la semana que viene." },
  { slug: "pull-b-30may", date: "Vie 30", dateLong: "Viernes · 30 may", name: "Pull B", type: "pull", plan: "pull-b",
    dur: "54m", durMin: 54, delta: -2, prs: 0, rir: 1.8, completion: 100, scores: { effort: 8, quality: 7, pump: 8 },
    note: "Algo cansado del día de pierna. El remo costó más de lo normal.",
    recap: "Bajó un 2 % el volumen — esperable tras Legs B del día anterior. Técnica de remo correcta; nada que ajustar. Descansa bien antes del sábado." },
  { slug: "push-b-29may", date: "Jue 29", dateLong: "Jueves · 29 may", name: "Push B", type: "push", plan: "push-b",
    dur: "55m", durMin: 55, delta: 6, prs: 1, rir: 2.1, completion: 100, scores: { effort: 8, quality: 9, pump: 8 },
    note: "Press militar muy fino hoy, subió fácil.",
    recap: "Gran día de empuje vertical: PR en press militar a 57,5 kg y +6 % de volumen. La técnica de hombro fue de las mejores del bloque. Vamos por buen camino." },
  { slug: "legs-a-28may", date: "Mié 28", dateLong: "Miércoles · 28 may", name: "Legs A", type: "legs", plan: "legs-a",
    dur: "64m", durMin: 64, delta: 3, prs: 0, rir: 2.0, completion: 100, scores: { effort: 9, quality: 8, pump: 7 },
    note: "Sentadilla pesada, rodillas bien. Hip thrust con buena activación.",
    recap: "Día clave cumplido: sentadilla a 140 kg estable y +3 % de volumen general. RIR controlado en los básicos. El glúteo respondió bien al hip thrust." },
  { slug: "pull-a-27may", date: "Mar 27", dateLong: "Martes · 27 may", name: "Pull A", type: "pull", plan: "pull-a",
    dur: "57m", durMin: 57, delta: 1, prs: 0, rir: 2.0, completion: 100, scores: { effort: 7, quality: 8, pump: 8 },
    note: "Dominadas con lastre cómodas. Buen bombeo de dorsal.",
    recap: "Tirón consistente, +1 % de volumen. La dominada lastrada se ve madura: pronto subimos lastre. Espalda con buen control escapular." },
  { slug: "push-a-26may", date: "Lun 26", dateLong: "Lunes · 26 may", name: "Push A", type: "push", plan: "push-a",
    dur: "58m", durMin: 58, delta: 8, prs: 2, rir: 2.2, completion: 100, scores: { effort: 8, quality: 9, pump: 9 },
    note: "El mejor press banca en semanas. Hombro sin molestias.",
    recap: "Arranque de semana inmejorable: 2 PRs (press banca 82,5 kg y press militar) y +8 % de volumen. La calidad técnica fue altísima. Así se empieza un bloque." },
];

// ── historial completo: varios BLOQUES (rutinas) hacia atrás ────────────────
// PPL Hipertrofia (activa, semanas 1-3, may) + archivo: PPL base (feb) e
// Iniciación full-body (dic). Las más antiguas usan cargas escaladas.
const SD_DAYS = [
  { name: "Push A", type: "push", plan: "push-a" },
  { name: "Pull A", type: "pull", plan: "pull-a" },
  { name: "Legs A", type: "legs", plan: "legs-a" },
  { name: "Push B", type: "push", plan: "push-b" },
  { name: "Pull B", type: "pull", plan: "pull-b" },
  { name: "Legs B", type: "legs", plan: "legs-b" },
];
const SD_DOW = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const SD_DOW_S = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const SD_DUR = { push: 56, pull: 55, legs: 64 };
const SD_RECAP_GEN = {
  push: "Empuje en línea con el plan. Técnica de hombro estable y cargas controladas para esta fase del bloque.",
  pull: "Tirón sólido y consistente. Buen control escapular; nada que ajustar en este punto del bloque.",
  legs: "Pierna completada con buena ejecución de los básicos. Cargas acordes a la fase del bloque.",
};

// rutinas (bloques) del historial
const SD_ROUTINES = {
  ppl:  { slug: "ppl-hipertrofia",      name: "PPL Hipertrofia",      state: "active",    range: "12–31 may" },
  base: { slug: "ppl-base",             name: "PPL base",             state: "completed", range: "23–28 feb" },
  inic: { slug: "iniciacion-fullbody",  name: "Iniciación full-body", state: "completed", range: "15–19 dic" },
};

// genera un bloque-semana de sesiones (newest-first)
function sdGenBlock({ routine, days, startDay, mon, scale, week, offsets }) {
  const off = offsets || days.map((_, i) => i);
  return days.map((d, i) => {
    const day = startDay + off[i];
    return {
      slug: routine.slug + "-" + d.plan + "-" + day + mon,
      date: SD_DOW_S[off[i]] + " " + day, dateLong: SD_DOW[off[i]] + " · " + day + " " + mon, mon,
      name: d.name, type: d.type, plan: d.plan, week, scale,
      dur: SD_DUR[d.type] + "m", durMin: SD_DUR[d.type], delta: (i % 2 ? -1 : 2),
      prs: 0, rir: 2.0, completion: 100, scores: { effort: 7, quality: 8, pump: 7 },
      note: "", recap: SD_RECAP_GEN[d.type],
      routine: routine.slug, routineName: routine.name, routineState: routine.state, blockRange: routine.range,
    };
  }).reverse();
}

function sdAttachRoutine(specs, routine) {
  return specs.map((s) => ({ ...s, routine: routine.slug, routineName: routine.name, routineState: routine.state, blockRange: routine.range }));
}

const SD_ALL_SPECS = [
  // PPL Hipertrofia (activa): semana 3 autorada + semanas 2·1 generadas
  ...sdAttachRoutine(SD_SPECS.map((s) => ({ ...s, week: 3, mon: "may" })), SD_ROUTINES.ppl),
  ...sdGenBlock({ routine: SD_ROUTINES.ppl, days: SD_DAYS, startDay: 19, mon: "may", scale: 0.95, week: 2 }),
  ...sdGenBlock({ routine: SD_ROUTINES.ppl, days: SD_DAYS, startDay: 12, mon: "may", scale: 0.90, week: 1 }),
  // PPL base (completada): última semana de febrero
  ...sdGenBlock({ routine: SD_ROUTINES.base, days: SD_DAYS, startDay: 23, mon: "feb", scale: 0.82, week: 8 }),
  // Iniciación full-body (completada): 3 días alternos de diciembre
  ...sdGenBlock({ routine: SD_ROUTINES.inic, scale: 0.68, week: 4, startDay: 15, mon: "dic", offsets: [0, 2, 4],
    days: [
      { name: "Full body A", type: "push", plan: "push-a" },
      { name: "Full body B", type: "legs", plan: "legs-a" },
      { name: "Full body C", type: "pull", plan: "pull-a" },
    ] }),
];

const VX_SESSIONS_ALL = SD_ALL_SPECS.map((s) => ({ ...s, ...sdSynth(s) }));
const SD_MAX_VOLT = Math.max(...VX_SESSIONS_ALL.map((s) => s.volT), 9);
VX_SESSIONS_ALL.forEach((s) => { s.frac = s.volT / SD_MAX_VOLT; });

// recientes (segmento Sesiones de Entreno) = la semana en curso de la activa
const VX_SESSIONS = VX_SESSIONS_ALL.slice(0, 6);

const VX_SESSION_BY_SLUG = Object.fromEntries(VX_SESSIONS_ALL.map((s) => [s.slug, s]));
function vxSessionBySlug(slug) { return VX_SESSION_BY_SLUG[slug] || VX_SESSIONS_ALL[0]; }

// rutinas presentes en el historial (para el select), en orden de aparición
function sdHistoryRoutines() {
  const seen = [], out = [];
  VX_SESSIONS_ALL.forEach((s) => {
    if (!seen.includes(s.routine)) { seen.push(s.routine); out.push({ slug: s.routine, name: s.routineName, state: s.routineState }); }
  });
  return out;
}

// agrupa una lista por RUTINA (bloque) → [{ slug, name, state, range, items, volT }]
// `asc` invierte el orden de bloques y de sesiones dentro (antiguo primero)
function sdRoutineGroups(list, asc) {
  const order = [], by = {};
  list.forEach((s) => { if (!by[s.routine]) { by[s.routine] = []; order.push(s.routine); } by[s.routine].push(s); });
  let groups = order.map((slug) => {
    const items = by[slug];
    return {
      slug, name: items[0].routineName, state: items[0].routineState, range: items[0].blockRange,
      items: asc ? items.slice().reverse() : items,
      volT: +items.reduce((a, s) => a + s.volT, 0).toFixed(1),
    };
  });
  return asc ? groups.reverse() : groups;
}

Object.assign(window, {
  VX_SESSIONS, VX_SESSIONS_ALL, VX_SESSION_BY_SLUG, vxSessionBySlug,
  sdSynth, sdFmtW, sdNum, sdRoutineGroups, sdHistoryRoutines, SD_MAX_VOLT,
});
