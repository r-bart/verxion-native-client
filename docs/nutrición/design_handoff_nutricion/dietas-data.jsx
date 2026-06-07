// dietas-data.jsx — catálogo ÚNICO de dietas (lo que el agente ha armado).
// Fuente de verdad compartida por:
//   · "Dietas"           (biblioteca por estado)
//   · "Detalle de dieta" (metadatos + la espina de comidas del día)
//   · "Detalle de comida"(metadatos de la comida + sus alimentos)
// La app SOLO LEE. Crear/activar/editar una dieta lo hace el agente vía MCP;
// en la UI eso se enmarca como "pídeselo a verxion", nunca como un botón que escribe.
// Espejo de rutinas-data.jsx. Usa comidas-data.jsx (VX_DIET, VX_MEAL_SPECS,
// vxExpandMeals, vxDeriveCF, VX_SUPPS, MEAL_ICON colors via VX_MACRO).

// ── objetivo de dieta → color/icono/etiqueta (vocabulario de toda la app) ────
const DZ_GOAL = {
  definicion:    { color: "var(--vx-lava)",    bg: "var(--vx-lava-bg)",    glow: "rgba(255,98,98,0.30)", tag: "Definición",
    icon: (p) => <Svg {...p}><path d="M12 2c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1 .3-2 1-3-.2 2 1 3 1 3 .8-2-1-4 2-8ZM7 14a5 5 0 0 0 10 0c0-2-1-3.5-2-5" /></Svg> },
  volumen:       { color: "var(--vx-body)",    bg: "var(--vx-body-bg)",    glow: "rgba(0,210,255,0.26)", tag: "Volumen",
    icon: (p) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" /></Svg> },
  mantenimiento: { color: "var(--vx-neutral)", bg: "var(--vx-neutral-bg)", glow: "rgba(255,185,0,0.26)", tag: "Mantenimiento",
    icon: (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg> },
};

// ── estado de dieta → etiqueta/color (espejo de RD_STATE) ────────────────────
const DZ_STATE = {
  active:    { label: "Activa",     short: "DIETA ACTIVA",      color: "var(--vx-lava)",    bg: "var(--vx-lava-bg)",    line: "rgba(255,98,98,0.3)" },
  draft:     { label: "Borrador",   short: "BORRADOR · verxion", color: "var(--vx-insight)", bg: "var(--vx-insight-bg)", line: "rgba(155,89,182,0.32)" },
  completed: { label: "Completada", short: "COMPLETADA",        color: "var(--vx-up)",      bg: "var(--vx-up-tint)",    line: "var(--vx-up-line)" },
};

// icono de comida → SVG (mismo set que el resto de Nutrición) ─────────────────
const DZ_MEAL_ICON = {
  sunrise:  (p) => <Svg {...p}><path d="M12 3v3M5.6 9.6l-1.4-1.4M18.4 9.6l1.4-1.4M3 16h2M19 16h2M8 16a4 4 0 0 1 8 0M2 20h20M7.5 12.5 12 8l4.5 4.5" /></Svg>,
  coffee:   (p) => <Svg {...p}><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9ZM17 10h2.5a2.5 2.5 0 0 1 0 5H17M8 2c-.5 1 .5 2 0 3M12 2c-.5 1 .5 2 0 3" /></Svg>,
  utensils: (p) => <Svg {...p}><path d="M4 3v6a2 2 0 0 0 2 2v10M6 3v8M9 3v6a2 2 0 0 1-2 2M18 3c-1.5 1-2 3-2 5s.5 3 2 3v10" /></Svg>,
  apple:    (p) => <Svg {...p}><path d="M12 7c-1.5-2-5-2.5-6.5-.5C3.5 9 4 14 6 17c1 1.5 2 2.5 3.2 2 .9-.4 1.7-.4 2.6 0 1.2.5 2.2-.5 3.2-2 1.3-2 1.9-4.7 1.4-7M12 7c0-2 1.2-3.4 3-4M12 7c-.3-1.4-1-2.3-2-3" /></Svg>,
  moon:     (p) => <Svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Svg>,
};

// ── catálogo de dietas ───────────────────────────────────────────────────────
// La ACTIVA referencia el plan real (meals: "current" → vxExpandMeals, con
// desglose por alimento). Las archivadas llevan una espina ligera (sin desglose
// por alimento) — igual que en entreno los días completados comparten plantilla.
const VX_DIETS = [
  {
    slug: "definicion-2250", name: "Definición · 2.250 kcal", goal: "definicion", state: "active",
    kcalGoal: 2250, pGoal: 180, cGoal: 240, fGoal: 70, waterGoal: 2.5,
    macroSplit: "5 comidas · 180 g proteína",
    week: 3, weeks: 6, score: 78, scoreState: "on", adherence: 92,
    created: "13 may 2026", lastDay: "Lun 1 jun", days: 21,
    note: "Tu mejor racha de adherencia hasta ahora: semana 3 y vas en objetivo, con 92 % de media. El reparto carga la proteína en comida y cena, y deja los carbos alrededor del entreno. Mantenemos el déficit dos semanas más y reevaluamos.",
    meals: "current",
  },
  {
    slug: "volumen-2900", name: "Volumen limpio · 2.900 kcal", goal: "volumen", state: "completed",
    kcalGoal: 2900, pGoal: 190, cGoal: 330, fGoal: 80, waterGoal: 3.0,
    macroSplit: "5 comidas · 190 g proteína",
    week: 8, weeks: 8, score: 90, scoreState: "ahead", adherence: 90,
    created: "10 mar 2026", finished: "5 may 2026", days: 56,
    note: "Ocho semanas de volumen limpio que te dejaron listo para definir. Subiste fuerza en todos los básicos con un 90 % de adherencia. La base de músculo que ahora estás puliendo.",
    meals: [
      { id: "desayuno", name: "Desayuno", time: "08:00", icon: "sunrise", kcal: 620, p: 40 },
      { id: "snack-am", name: "Media mañana", time: "11:00", icon: "coffee", kcal: 380, p: 28 },
      { id: "comida", name: "Comida", time: "14:00", icon: "utensils", kcal: 760, p: 52, key: true },
      { id: "pre", name: "Pre-entreno", time: "17:00", icon: "apple", kcal: 360, p: 24 },
      { id: "cena", name: "Cena", time: "21:00", icon: "moon", kcal: 780, p: 46 },
    ],
  },
  {
    slug: "mantenimiento-2500", name: "Mantenimiento · 2.500 kcal", goal: "mantenimiento", state: "completed",
    kcalGoal: 2500, pGoal: 175, cGoal: 270, fGoal: 75, waterGoal: 2.7,
    macroSplit: "5 comidas · 175 g proteína",
    week: 4, weeks: 4, score: 86, scoreState: "on", adherence: 86,
    created: "10 feb 2026", finished: "9 mar 2026", days: 28,
    note: "Un mes de mantenimiento entre bloques para dar un respiro al déficit y consolidar peso. Adherencia sólida del 86 % sin pasar hambre. El puente perfecto antes del volumen.",
    meals: [
      { id: "desayuno", name: "Desayuno", time: "08:00", icon: "sunrise", kcal: 520, p: 36 },
      { id: "snack-am", name: "Media mañana", time: "11:00", icon: "coffee", kcal: 330, p: 24 },
      { id: "comida", name: "Comida", time: "14:00", icon: "utensils", kcal: 680, p: 46, key: true },
      { id: "pre", name: "Pre-entreno", time: "17:00", icon: "apple", kcal: 330, p: 22 },
      { id: "cena", name: "Cena", time: "21:00", icon: "moon", kcal: 640, p: 47 },
    ],
  },
];

const VX_DIET_BY_SLUG = Object.fromEntries(VX_DIETS.map((d) => [d.slug, d]));
function vxDietBySlug(slug) { return VX_DIET_BY_SLUG[slug] || VX_DIETS[0]; }
function vxActiveDiet() { return VX_DIETS.find((d) => d.state === "active") || VX_DIETS[0]; }
function vxDietCfg(diet) { return DZ_GOAL[diet.goal] || DZ_GOAL.definicion; }

// resuelve la espina de comidas de una dieta → forma unificada
// {id,name,time,icon,key,kcal,p,c,f,items,recipe,swap}
function vxDietMeals(diet) {
  if (diet.meals === "current") {
    return vxExpandMeals().map((m) => ({
      id: m.id, name: m.name, time: m.time, icon: m.icon, key: !!m.key,
      kcal: m.kcal, p: m.p, c: m.c, f: m.f, items: m.items, recipe: m.recipe || null, swap: m.swap || null,
    }));
  }
  // archivada: deriva carbos/grasa de kcal+proteína; sin desglose por alimento
  return (diet.meals || []).map((m) => {
    const cf = vxDeriveCF(m.kcal, m.p);
    return { id: m.id, name: m.name, time: m.time, icon: m.icon, key: !!m.key,
      kcal: m.kcal, p: m.p, c: cf.c, f: cf.f, items: [], recipe: null, swap: null };
  });
}
function vxDietMeal(dietSlug, mealId) {
  const diet = vxDietBySlug(dietSlug);
  const meals = vxDietMeals(diet);
  const idx = Math.max(0, meals.findIndex((m) => m.id === mealId));
  return { diet, meal: meals[idx] || meals[0], idx, total: meals.length };
}

// totales del día de una dieta (suma de su espina) + reparto de macros
function vxDietTotals(diet) {
  const meals = vxDietMeals(diet);
  const tot = ["kcal", "p", "c", "f"].reduce((o, k) => (o[k] = meals.reduce((a, m) => a + m[k], 0), o), {});
  const pK = tot.p * 4, cK = tot.c * 4, fK = tot.f * 9, mT = pK + cK + fK || 1;
  const macros = [
    { key: "p", label: "Proteína", g: tot.p, kc: pK, pct: Math.round(pK / mT * 100), color: "var(--vx-lava)",    goal: diet.pGoal },
    { key: "c", label: "Carbos",   g: tot.c, kc: cK, pct: Math.round(cK / mT * 100), color: "var(--vx-body)",    goal: diet.cGoal },
    { key: "f", label: "Grasa",    g: tot.f, kc: fK, pct: Math.round(fK / mT * 100), color: "var(--vx-neutral)", goal: diet.fGoal },
  ];
  return { meals, tot, macros };
}

Object.assign(window, {
  DZ_GOAL, DZ_STATE, DZ_MEAL_ICON, VX_DIETS, VX_DIET_BY_SLUG,
  vxDietBySlug, vxActiveDiet, vxDietCfg, vxDietMeals, vxDietMeal, vxDietTotals,
});
