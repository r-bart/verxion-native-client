// programas-data.jsx — catálogo ÚNICO de programas (lo que el agente ha armado).
// Un PROGRAMA es el contenedor de alto nivel: acopla una rutina (routineSlug) y/o
// una dieta (dietSlug) bajo un objetivo común, con calendario semanal y ventana
// temporal. Fuente de verdad compartida por:
//   · "Programas"            (biblioteca por estado)
//   · "Detalle de programa"  (metadatos + adherencia unificada + acoplamiento)
// La app SOLO LEE. Crear/activar/pausar/duplicar un programa lo hace el agente vía
// MCP; en la UI eso se enmarca como "pídeselo a verxion", nunca como un botón que
// escribe. Reutiliza rutinas-data.jsx (RD_ROUTINES, rdRoutineBySlug, rdHeroType,
// RD_DAY) y dietas-data.jsx (VX_DIETS, vxDietBySlug, vxDietTotals, DZ_GOAL).

// ── ProgramGoal (10 valores) → castellano + color/icono del sistema ──────────
const PG_GOAL = {
  muscle_gain: { tag: "Ganar músculo", color: "var(--vx-body)", bg: "var(--vx-body-bg)", glow: "rgba(0,210,255,0.26)",
    icon: (p) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" /></Svg> },
  fat_loss: { tag: "Perder grasa", color: "var(--vx-lava)", bg: "var(--vx-lava-bg)", glow: "rgba(255,98,98,0.30)",
    icon: (p) => <Svg {...p}><path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-1.5.5-2.5 1-3 .2 1 1 1.7 1.7 1.7C11 9 9.5 6 12 2Z" /></Svg> },
  strength: { tag: "Fuerza", color: "var(--vx-neutral)", bg: "var(--vx-neutral-bg)", glow: "rgba(255,185,0,0.26)",
    icon: (p) => <Svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" /></Svg> },
  endurance: { tag: "Resistencia", color: "var(--vx-body)", bg: "var(--vx-body-bg)", glow: "rgba(0,210,255,0.26)",
    icon: (p) => <Svg {...p}><path d="M3 12h4l2-7 4 14 2-7h6" /></Svg> },
  maintenance: { tag: "Mantenimiento", color: "var(--vx-neutral)", bg: "var(--vx-neutral-bg)", glow: "rgba(255,185,0,0.26)",
    icon: (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg> },
  recomp: { tag: "Recomposición", color: "var(--vx-insight)", bg: "var(--vx-insight-bg)", glow: "rgba(155,89,182,0.26)",
    icon: (p) => <Svg {...p}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></Svg> },
  general_fitness: { tag: "Forma general", color: "var(--vx-up)", bg: "var(--vx-up-bg)", glow: "rgba(46,204,113,0.26)",
    icon: (p) => <Svg {...p}><path d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4L12 3ZM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" /></Svg> },
  athletic_performance: { tag: "Rendimiento", color: "var(--vx-lava)", bg: "var(--vx-lava-bg)", glow: "rgba(255,98,98,0.30)",
    icon: (p) => <Svg {...p}><circle cx="12" cy="13" r="8" /><path d="M12 13l3.5-3.5M9 2h6M12 5V2" /></Svg> },
  rehabilitation: { tag: "Rehabilitación", color: "var(--vx-insight)", bg: "var(--vx-insight-bg)", glow: "rgba(155,89,182,0.26)",
    icon: (p) => <Svg {...p}><path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" /><path d="M9 11l2 2 4-4" /></Svg> },
  health: { tag: "Salud", color: "var(--vx-health)", bg: "var(--vx-health-bg)", glow: "rgba(255,71,87,0.28)",
    icon: (p) => <Svg {...p}><path d="M19 5.5a4.5 4.5 0 0 0-7-1 4.5 4.5 0 0 0-7 1c-1.6 2.2-1 5.4 4 9.5l3 2.5 3-2.5c5-4.1 5.6-7.3 4-9.5Z" /><path d="M3.5 12h4l1.5-3 2 5 1.5-2h4" /></Svg> },
};
function pgGoalCfg(goal) { return PG_GOAL[goal] || PG_GOAL.general_fitness; }

// ── tipo de día del calendario semanal (weeklySchedule) → color/etiqueta ─────
const PG_SLOT = {
  training: { label: "Entreno",   color: "var(--vx-lava)",    bg: "var(--vx-lava-bg)",    line: "rgba(255,98,98,0.34)",  fill: "rgba(255,98,98,0.28)", fillLine: "rgba(255,98,98,0.58)" },
  rest:     { label: "Descanso",  color: "var(--vx-insight)", bg: "var(--vx-insight-bg)", line: "rgba(155,89,182,0.32)", fill: null,                   fillLine: null },
  refeed:   { label: "Recarga",   color: "var(--vx-neutral)", bg: "var(--vx-neutral-bg)", line: "rgba(255,185,0,0.32)",  fill: "rgba(255,185,0,0.24)", fillLine: "rgba(255,185,0,0.54)" },
  custom:   { label: "A medida",  color: "var(--vx-body)",    bg: "var(--vx-body-bg)",    line: "rgba(0,210,255,0.32)",  fill: "rgba(0,210,255,0.24)", fillLine: "rgba(0,210,255,0.52)" },
};
const PG_DOW = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// ── estado de programa → etiqueta/color (espejo de RD_STATE) ─────────────────
const PG_STATE = {
  active:    { label: "Activo",     short: "PROGRAMA ACTIVO",     color: "var(--vx-lava)",    bg: "var(--vx-lava-bg)",    line: "rgba(255,98,98,0.3)" },
  draft:     { label: "Borrador",   short: "BORRADOR · verxion",  color: "var(--vx-insight)", bg: "var(--vx-insight-bg)", line: "rgba(155,89,182,0.32)" },
  paused:    { label: "En pausa",   short: "EN PAUSA",            color: "var(--vx-neutral)", bg: "var(--vx-neutral-bg)", line: "rgba(255,185,0,0.3)" },
  completed: { label: "Completado", short: "COMPLETADO",          color: "var(--vx-up)",      bg: "var(--vx-up-tint)",    line: "var(--vx-up-line)" },
};

// ── ProgramAdherence read-model: fase + confianza (castellano) ───────────────
const PG_PHASE = {
  cold_start:        { label: "Arranque en frío",  hint: "Aún pocos datos — la lectura es provisional." },
  baseline_building: { label: "Construyendo base", hint: "Recogiendo tu línea base de adherencia." },
  active_tracking:   { label: "Seguimiento activo", hint: "Datos suficientes para una lectura fiable." },
};
const PG_CONF = { low: "Confianza baja", medium: "Confianza media", high: "Confianza alta" };

// chip de estado de adherencia (mismo vocabulario que rutinas/dietas)
function pgScoreWord(state) {
  return state === "ahead" ? "Vas adelantado" : state === "behind" ? "Vas justo" : "En objetivo";
}

// ── catálogo de programas ────────────────────────────────────────────────────
// routineSlug → RD_ROUTINES (rutinas-data) · dietSlug → VX_DIETS (dietas-data).
const VX_PROGRAMS = [
  {
    slug: "recomp-primavera", name: "Recomposición de primavera",
    description: "Subir fuerza mientras bajas grasa: PPL de hipertrofia acoplado a un déficit ligero con la proteína bien alta.",
    goal: "recomp", routineSlug: "ppl-hipertrofia", dietSlug: "definicion-2250",
    durationType: "date_range", startDate: "13 may 2026", endDate: "24 jun 2026",
    perWeek: 5, weeks: 6, week: 3, weekFrac: 3 / 7, state: "active",
    weeklySchedule: ["training", "training", "training", "training", "training", "refeed", "rest"],
    created: "13 may 2026", updated: "Hoy",
    adherence: {
      unifiedScore: 84, state: "ahead", phase: "active_tracking", confidence: "high",
      training: { score: 86, done: 14, planned: 36 }, diet: { score: 92, done: 19, planned: 21 },
    },
    note: "Tu mejor recomp hasta ahora: semana 3 y vas adelantado en los dos frentes. El entreno sostiene volumen al alza y la dieta cierra al 92 % de adherencia. Mantenemos el déficit ligero dos semanas más y reevaluamos cargas.",
  },
  {
    slug: "volumen-invierno", name: "Volumen de invierno",
    description: "Ocho semanas de superávit limpio para construir músculo sobre la base de fuerza ya asentada.",
    goal: "muscle_gain", routineSlug: "ppl-base", dietSlug: "volumen-2900",
    durationType: "date_range", startDate: "6 ene 2026", endDate: "1 mar 2026",
    perWeek: 6, weeks: 8, week: 8, state: "completed",
    weeklySchedule: ["training", "training", "training", "training", "training", "training", "rest"],
    created: "6 ene 2026", finished: "1 mar 2026",
    adherence: {
      unifiedScore: 90, state: "ahead", phase: "active_tracking", confidence: "high",
      training: { score: 91, done: 44, planned: 48 }, diet: { score: 90, done: 50, planned: 56 },
    },
    note: "Ocho semanas de volumen limpio que te dejaron listo para definir. Subiste fuerza en todos los básicos y la adherencia se mantuvo al 90 % en entreno y dieta. La base de músculo que ahora estás puliendo.",
  },
  {
    slug: "base-adaptacion", name: "Base de adaptación",
    description: "Tu primer programa: cuatro semanas para fijar técnica y hábitos antes de subir cargas.",
    goal: "general_fitness", routineSlug: "iniciacion-fullbody", dietSlug: "mantenimiento-2500",
    durationType: "date_range", startDate: "2 dic 2025", endDate: "30 dic 2025",
    perWeek: 3, weeks: 4, week: 4, state: "completed",
    weeklySchedule: ["training", "rest", "training", "rest", "training", "rest", "rest"],
    created: "2 dic 2025", finished: "30 dic 2025",
    adherence: {
      unifiedScore: 87, state: "ahead", phase: "active_tracking", confidence: "high",
      training: { score: 88, done: 11, planned: 12 }, diet: { score: 86, done: 24, planned: 28 },
    },
    note: "Tu punto de partida. Cuatro semanas de full-body y mantenimiento para fijar técnica y hábitos sin prisa. Misión cumplida: base sólida para todo lo que vino después.",
  },
  {
    slug: "fuerza-q3", name: "Bloque de fuerza",
    description: "Un mesociclo de fuerza centrado en los básicos con progresión por dobles. verxion está terminando de armarlo.",
    goal: "strength", routineSlug: null, dietSlug: null,
    durationType: "indefinite", startDate: null, endDate: null,
    perWeek: 4, weeks: 5, week: 0, state: "draft",
    weeklySchedule: ["training", "rest", "training", "rest", "training", "rest", "training"],
    created: "Hoy",
    adherence: null,
    note: "Estoy armando un bloque de fuerza de 4 días a la semana con progresión por dobles sobre sentadilla, banca, peso muerto y press. Antes de activarlo conviene acoplar una rutina y una dieta de mantenimiento — dímelo y lo dejo listo.",
  },
];

const VX_PROGRAM_BY_SLUG = Object.fromEntries(VX_PROGRAMS.map((p) => [p.slug, p]));
function pgProgramBySlug(slug) { return VX_PROGRAM_BY_SLUG[slug] || VX_PROGRAMS[0]; }
function pgActiveProgram() { return VX_PROGRAMS.find((p) => p.state === "active") || VX_PROGRAMS[0]; }

// ventana temporal legible
function pgWindow(program) {
  if (program.durationType === "indefinite") return "Indefinido";
  if (program.state === "completed") return program.startDate + " – " + program.finished;
  return program.startDate + " – " + program.endDate;
}
function pgWindowShort(program) {
  return program.durationType === "indefinite" ? "Indefinido" : program.weeks + " sem";
}

// resumen legible de la semana ("5 entrenos · 1 recarga · 1 descanso")
function pgWeekSummary(schedule) {
  const order = ["training", "refeed", "custom", "rest"];
  const plural = {
    training: ["entreno", "entrenos"], refeed: ["recarga", "recargas"],
    rest: ["descanso", "descansos"], custom: ["a medida", "a medida"],
  };
  return order
    .map((type) => {
      const n = (schedule || []).filter((s) => s === type).length;
      if (!n) return null;
      const w = plural[type];
      return n + " " + (n === 1 ? w[0] : w[1]);
    })
    .filter(Boolean)
    .join(" · ");
}

// nº de días de entreno reales en la semana (fuente del "días/sem" del hero)
function pgTrainingDays(program) {
  return ((program && program.weeklySchedule) || []).filter((s) => s === "training").length;
}

// resuelve rutina/dieta acopladas (o null) desde sus catálogos
function pgRoutine(program) {
  return program.routineSlug && typeof rdRoutineBySlug === "function" ? rdRoutineBySlug(program.routineSlug) : null;
}
function pgDiet(program) {
  return program.dietSlug && typeof vxDietBySlug === "function" ? vxDietBySlug(program.dietSlug) : null;
}

Object.assign(window, {
  PG_GOAL, pgGoalCfg, PG_SLOT, PG_DOW, PG_STATE, PG_PHASE, PG_CONF, pgScoreWord,
  VX_PROGRAMS, VX_PROGRAM_BY_SLUG, pgProgramBySlug, pgActiveProgram,
  pgWindow, pgWindowShort, pgWeekSummary, pgTrainingDays, pgRoutine, pgDiet,
});
