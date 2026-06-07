// rutinas-data.jsx — catálogo ÚNICO de rutinas (lo que el agente ha armado).
// Fuente de verdad compartida por:
//   · "Todas las rutinas"  (lista por estado)
//   · "Detalle de rutina"  (metadatos + la rotación de días)
//   · "Detalle de día"     (metadatos del día + lista de ejercicios)
// La app SOLO LEE. Crear/activar/editar una rutina lo hace el agente vía MCP;
// en la UI eso se enmarca como "pídeselo a verxion", nunca como un botón que escribe.

// ── día → color/icono/etiqueta (mismo vocabulario que entreno-core/prescripcion) ──
const RD_DAY = {
  push: { color: "var(--vx-lava)",    bg: "var(--vx-lava-bg)",    glow: "rgba(255,98,98,0.30)", tag: "Push",  icon: (p) => <Svg {...p}><path d="M6.5 6.5l11 11M3 9l3-3M18 21l3-3M6 18l-3-3M21 6l-3-3M14.5 9.5l-5 5" /></Svg> },
  pull: { color: "var(--vx-body)",    bg: "var(--vx-body-bg)",    glow: "rgba(0,210,255,0.26)", tag: "Pull",  icon: (p) => <Svg {...p}><path d="M3 6.5h18M3 12h18M3 17.5h18" /></Svg> },
  legs: { color: "var(--vx-neutral)", bg: "var(--vx-neutral-bg)", glow: "rgba(255,185,0,0.26)", tag: "Legs",  icon: (p) => <Svg {...p}><path d="M4 16v-2a2 2 0 1 1 4 0v2c0 2-.5 3-2 3s-2-1-2-3ZM16 14v-2a2 2 0 1 1 4 0v2c0 2-.5 3-2 3s-2-1-2-3ZM5 9c0-2 .5-4 2-4s1.5 2 1 4M19 7c0-2-.5-4-2-4" /></Svg> },
  rest: { color: "var(--vx-insight)", bg: "var(--vx-insight-bg)", glow: "rgba(155,89,182,0.26)", tag: "Descanso", icon: (p) => <Svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Svg> },
};

// ── estado de rutina → etiqueta/color ──────────────────────────────────────
const RD_STATE = {
  active:    { label: "Activa",     short: "RUTINA ACTIVA",   color: "var(--vx-lava)",    bg: "var(--vx-lava-bg)",    line: "rgba(255,98,98,0.3)" },
  paused:    { label: "En pausa",   short: "EN PAUSA",        color: "var(--vx-neutral)", bg: "var(--vx-neutral-bg)", line: "rgba(255,185,0,0.3)" },
  completed: { label: "Completada", short: "COMPLETADA",      color: "var(--vx-up)",      bg: "var(--vx-up-tint)",    line: "var(--vx-up-line)" },
};

// ── plantillas de día (planId → ejercicios) ────────────────────────────────
// El detalle de día lee de aquí. Cada fila es la prescripción de un ejercicio.
const RD_PLANS = {
  "push-a": { type: "push", focus: "Pecho · hombros · tríceps", ex: [
    { name: "Press banca",              muscle: "Pecho",      equip: "Barra",     sets: 4, reps: "6–8",   rir: 2, rest: "2:30", target: "82,5 kg", last: "80 kg × 8",   up: "+2,5", key: true },
    { name: "Press inclinado mancuerna", muscle: "Pecho sup.", equip: "Mancuerna", sets: 3, reps: "8–10",  rir: 2, rest: "2:00", target: "34 kg",   last: "32 kg × 9",   up: "+2" },
    { name: "Press militar",            muscle: "Hombro",     equip: "Barra",     sets: 4, reps: "8",     rir: 2, rest: "2:00", target: "55 kg",   last: "52,5 kg × 8", up: "+2,5" },
    { name: "Aperturas en polea",       muscle: "Pecho",      equip: "Polea",     sets: 3, reps: "12–15", rir: 1, rest: "1:30", target: "18 kg",   last: "16 kg × 14" },
    { name: "Elevaciones laterales",    muscle: "Deltoides",  equip: "Mancuerna", sets: 4, reps: "12–15", rir: 1, rest: "1:00", target: "12 kg",   last: "12 kg × 13" },
    { name: "Extensión de tríceps en polea", muscle: "Tríceps", equip: "Polea",   sets: 3, reps: "12",    rir: 2, rest: "1:30", target: "30 kg",   last: "27,5 kg × 12" },
  ]},
  "pull-a": { type: "pull", focus: "Espalda · bíceps · deltoides post.", ex: [
    { name: "Dominadas lastradas",      muscle: "Dorsal",      equip: "Peso corp.", sets: 4, reps: "6–8",   rir: 2, rest: "2:30", target: "+20 kg",  last: "+17,5 kg × 7", up: "+2,5", key: true },
    { name: "Remo con barra",           muscle: "Espalda",     equip: "Barra",      sets: 4, reps: "8–10",  rir: 2, rest: "2:00", target: "80 kg",   last: "77,5 kg × 9",  up: "+2,5" },
    { name: "Jalón al pecho",           muscle: "Dorsal",      equip: "Polea",      sets: 3, reps: "10–12", rir: 2, rest: "1:45", target: "65 kg",   last: "62,5 kg × 11" },
    { name: "Curl de bíceps",           muscle: "Bíceps",      equip: "Mancuerna",  sets: 3, reps: "8–10",  rir: 1, rest: "1:30", target: "16 kg",   last: "16 kg × 11" },
    { name: "Face pull",                muscle: "Deltoides post.", equip: "Polea",  sets: 3, reps: "15",    rir: 2, rest: "1:00", target: "25 kg",   last: "22,5 kg × 15" },
  ]},
  "legs-a": { type: "legs", focus: "Cuádriceps · glúteo · core", ex: [
    { name: "Sentadilla",               muscle: "Cuádriceps",  equip: "Barra",      sets: 4, reps: "5–7",   rir: 2, rest: "3:00", target: "142,5 kg", last: "140 kg × 6",  up: "+2,5", key: true },
    { name: "Peso muerto rumano",       muscle: "Femoral",     equip: "Barra",      sets: 3, reps: "8–10",  rir: 2, rest: "2:30", target: "122,5 kg", last: "120 kg × 9",  up: "+2,5" },
    { name: "Prensa inclinada",         muscle: "Cuádriceps",  equip: "Máquina",    sets: 3, reps: "10–12", rir: 2, rest: "2:00", target: "220 kg",   last: "210 kg × 11" },
    { name: "Hip thrust",               muscle: "Glúteo",      equip: "Barra",      sets: 3, reps: "10",    rir: 2, rest: "1:45", target: "105 kg",   last: "100 kg × 12", up: "+5" },
    { name: "Plancha",                  muscle: "Core",        equip: "Peso corp.", sets: 3, reps: "45 s",  rir: 1, rest: "1:00", target: "45 s",     last: "—" },
  ]},
  "push-b": { type: "push", focus: "Hombro · tríceps · pecho sup.", ex: [
    { name: "Press militar",            muscle: "Hombro",     equip: "Barra",     sets: 4, reps: "6–8",   rir: 2, rest: "2:30", target: "57,5 kg", last: "55 kg × 7",   up: "+2,5", key: true },
    { name: "Press inclinado mancuerna", muscle: "Pecho sup.", equip: "Mancuerna", sets: 4, reps: "8–10",  rir: 2, rest: "2:00", target: "36 kg",   last: "34 kg × 9",   up: "+2" },
    { name: "Fondos en paralelas",      muscle: "Pecho inf.", equip: "Peso corp.", sets: 3, reps: "8–10",  rir: 2, rest: "2:00", target: "+10 kg",  last: "+7,5 kg × 9" },
    { name: "Elevaciones laterales",    muscle: "Deltoides",  equip: "Mancuerna", sets: 4, reps: "12–15", rir: 1, rest: "1:00", target: "12 kg",   last: "12 kg × 13" },
    { name: "Extensión de tríceps en polea", muscle: "Tríceps", equip: "Polea",   sets: 3, reps: "10–12", rir: 1, rest: "1:30", target: "32,5 kg", last: "30 kg × 12", up: "+2,5" },
  ]},
  "pull-b": { type: "pull", focus: "Dorsal · trapecio · bíceps", ex: [
    { name: "Remo con barra",           muscle: "Espalda",     equip: "Barra",      sets: 4, reps: "6–8",   rir: 2, rest: "2:30", target: "85 kg",   last: "82,5 kg × 8",  up: "+2,5", key: true },
    { name: "Jalón al pecho",           muscle: "Dorsal",      equip: "Polea",      sets: 4, reps: "8–10",  rir: 2, rest: "2:00", target: "70 kg",   last: "67,5 kg × 9",  up: "+2,5" },
    { name: "Remo en polea baja",       muscle: "Espalda",     equip: "Polea",      sets: 3, reps: "10–12", rir: 2, rest: "1:45", target: "62,5 kg", last: "60 kg × 11" },
    { name: "Face pull",                muscle: "Deltoides post.", equip: "Polea",  sets: 3, reps: "15",    rir: 2, rest: "1:00", target: "27,5 kg", last: "25 kg × 15", up: "+2,5" },
    { name: "Curl de bíceps",           muscle: "Bíceps",      equip: "Mancuerna",  sets: 3, reps: "10–12", rir: 1, rest: "1:15", target: "18 kg",   last: "16 kg × 11", up: "+2" },
  ]},
  "legs-b": { type: "legs", focus: "Femoral · glúteo · gemelo", ex: [
    { name: "Peso muerto rumano",       muscle: "Femoral",     equip: "Barra",      sets: 4, reps: "6–8",   rir: 2, rest: "3:00", target: "125 kg",  last: "122,5 kg × 8", up: "+2,5", key: true },
    { name: "Sentadilla",               muscle: "Cuádriceps",  equip: "Barra",      sets: 3, reps: "8–10",  rir: 2, rest: "2:30", target: "120 kg",  last: "117,5 kg × 9", up: "+2,5" },
    { name: "Curl nórdico",             muscle: "Femoral",     equip: "Peso corp.", sets: 3, reps: "6–8",   rir: 2, rest: "2:00", target: "Peso corp.", last: "8 reps" },
    { name: "Hip thrust",               muscle: "Glúteo",      equip: "Barra",      sets: 4, reps: "10–12", rir: 1, rest: "1:45", target: "110 kg",  last: "105 kg × 12", up: "+5" },
    { name: "Elevación de gemelo",      muscle: "Gemelo",      equip: "Máquina",    sets: 4, reps: "12–15", rir: 1, rest: "1:00", target: "92,5 kg", last: "90 kg × 15" },
  ]},
};

// estimación de duración/volumen del día desde el plan
function rdDaySummary(plan) {
  const ex = plan.ex.length;
  const sets = plan.ex.reduce((a, e) => a + e.sets, 0);
  const min = Math.round(sets * 2.6 + ex * 1.2);
  return { ex, sets, min };
}

// ── catálogo de rutinas ─────────────────────────────────────────────────────
// `days` describe la rotación; `plan` referencia una plantilla de RD_PLANS.
const RD_ROUTINES = [
  {
    slug: "ppl-hipertrofia", name: "PPL Hipertrofia", state: "active",
    goal: "Hipertrofia", split: "Push · Pull · Legs", perWeek: 6,
    week: 3, weeks: 6, done: 14, planned: 36, dayOfWeek: 3, weekFrac: 3 / 7,
    score: 86, scoreState: "ahead", volTotal: "32,1 t", volTrend: 8,
    created: "13 may 2026", lastTrained: "Sáb 31 may",
    note: "Tu mejor bloque hasta ahora: semana 3 y vas adelantado. Subió el volumen un 8 % y la sentadilla suma 12 kg de e1RM. Mantenemos PPL dos vueltas más y reevaluamos cargas.",
    days: [
      { dow: "Lun", name: "Push A", plan: "push-a", est: "~62 min" },
      { dow: "Mar", name: "Pull A", plan: "pull-a", est: "~58 min" },
      { dow: "Mié", name: "Legs A", plan: "legs-a", est: "~65 min" },
      { dow: "Jue", name: "Push B", plan: "push-b", est: "~55 min" },
      { dow: "Vie", name: "Pull B", plan: "pull-b", est: "~54 min" },
      { dow: "Sáb", name: "Legs B", plan: "legs-b", est: "~66 min" },
      { dow: "Dom", name: "Descanso", type: "rest", focus: "Movilidad opcional · 10 min" },
    ],
    todayIdx: 2,
  },
  {
    slug: "ppl-base", name: "PPL base", state: "completed",
    goal: "Hipertrofia", split: "Push · Pull · Legs", perWeek: 6,
    week: 8, weeks: 8, done: 44, planned: 48,
    score: 91, scoreState: "ahead", volTotal: "41,8 t", volTrend: 12,
    created: "6 ene 2026", finished: "1 mar 2026",
    note: "Cerrada con un 91/100 de adherencia — 44 de 48 sesiones. La base que te dejó listo para el bloque actual. Volúmenes y PRs migrados a tu historial.",
    days: [
      { dow: "Lun", name: "Push A", plan: "push-a", est: "~60 min" },
      { dow: "Mar", name: "Pull A", plan: "pull-a", est: "~56 min" },
      { dow: "Mié", name: "Legs A", plan: "legs-a", est: "~62 min" },
      { dow: "Jue", name: "Push B", plan: "push-b", est: "~54 min" },
      { dow: "Vie", name: "Pull B", plan: "pull-b", est: "~52 min" },
      { dow: "Sáb", name: "Legs B", plan: "legs-b", est: "~62 min" },
    ],
  },
  {
    slug: "iniciacion-fullbody", name: "Iniciación full-body", state: "completed",
    goal: "Adaptación", split: "Full body", perWeek: 3,
    week: 4, weeks: 4, done: 11, planned: 12,
    score: 88, scoreState: "ahead", volTotal: "12,4 t", volTrend: 6,
    created: "2 dic 2025", finished: "30 dic 2025",
    note: "Tu primera rutina. Cuatro semanas de adaptación para fijar técnica antes de subir volumen. Misión cumplida: base sólida para todo lo que vino después.",
    days: [
      { dow: "Lun", name: "Full body A", plan: "push-a", est: "~50 min" },
      { dow: "Mié", name: "Full body B", plan: "legs-a", est: "~52 min" },
      { dow: "Vie", name: "Full body C", plan: "pull-a", est: "~48 min" },
    ],
  },
];

const RD_BY_SLUG = Object.fromEntries(RD_ROUTINES.map((r) => [r.slug, r]));
function rdRoutineBySlug(slug) { return RD_BY_SLUG[slug] || RD_ROUTINES[0]; }

// resuelve un día (de una rutina) a { cfg, name, focus, plan, summary }
function rdResolveDay(routine, dayIdx) {
  const d = routine.days[dayIdx] || routine.days[0];
  const type = d.type || (RD_PLANS[d.plan] ? RD_PLANS[d.plan].type : "push");
  const cfg = RD_DAY[type];
  if (type === "rest") {
    return { isRest: true, cfg, name: d.name || "Descanso", focus: d.focus || "Recuperación", dow: d.dow, plan: null, summary: null };
  }
  const plan = RD_PLANS[d.plan] || RD_PLANS["push-a"];
  return { isRest: false, cfg, type, name: d.name, focus: plan.focus, dow: d.dow, est: d.est, plan, summary: rdDaySummary(plan) };
}

// slug es-ES para enlazar al detalle de ejercicio (coincide con exercises-data)
function rdSlug(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// tipo "representativo" de una rutina (primer día de entreno) → color del bubble
function rdHeroType(routine) {
  const d = routine.days.find((x) => (x.type || "") !== "rest");
  return d ? (d.type || RD_PLANS[d.plan].type) : "push";
}

Object.assign(window, {
  RD_DAY, RD_STATE, RD_PLANS, RD_ROUTINES, RD_BY_SLUG,
  rdRoutineBySlug, rdResolveDay, rdDaySummary, rdSlug, rdHeroType,
});
