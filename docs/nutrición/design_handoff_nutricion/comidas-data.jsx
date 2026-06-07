// comidas-data.jsx — fuente de verdad de NUTRICIÓN (paralela a exercises-data.jsx).
// Dos cosas: (1) el PLAN DEL DÍA — las comidas como espina temporal que armó el
// agente, y (2) la BIBLIOTECA de alimentos (lista + filtro + orden). Read-only:
// es lo que verxion ha planificado; la app solo lo lee. Cada comida sintetiza
// sus macros sumando sus alimentos; cada alimento trae sus valores por ración.

// ── objetivos del día (mismos números que la tarjeta de Hoy) ────────────────
const VX_DIET = {
  name: "Definición · 2.250 kcal",
  goal: "Definición",
  macroSplit: "5 comidas · 180 g proteína",
  week: 3, weeks: 6,
  score: 78, scoreState: "on",          // ahead | on | behind
  kcalGoal: 2250, pGoal: 180, cGoal: 240, fGoal: 70,
  waterGoal: 2.5,                        // litros
};

// ── tipo de comida → icono (color cohesionado: las comidas van en lava, los
// suplementos en insight, el agua en body — igual que el lenguaje de Hoy) ────
// macro dominante → color/etiqueta (idéntico a los macros de Hoy:
// proteína=lava · carbos=body · grasa=neutral). Es el lenguaje de toda la app.
const VX_MACRO = {
  p: { key: "p", label: "Proteína", short: "P", color: "var(--vx-lava)",    bg: "var(--vx-lava-bg)" },
  c: { key: "c", label: "Carbos",   short: "C", color: "var(--vx-body)",    bg: "var(--vx-body-bg)" },
  f: { key: "f", label: "Grasa",    short: "G", color: "var(--vx-neutral)", bg: "var(--vx-neutral-bg)" },
};

const VX_DOW_N = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function vxKcal(n) { return Number(Math.round(n)).toLocaleString("de-DE"); }
function vxG(n) { return Math.round(n) + " g"; }
function vxSlugN(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── el plan del día: comidas (cada una con sus alimentos) ───────────────────
// kcal/macros de la comida = suma de sus alimentos (se calcula al expandir).
const VX_MEAL_SPECS = [
  { id: "desayuno", name: "Desayuno", time: "07:45", icon: "sunrise",
    foods: [
      { food: "Avena", qty: "67 g" }, { food: "Claras de huevo", qty: "250 ml" },
      { food: "Huevo entero", qty: "2 ud" }, { food: "Plátano", qty: "1 ud" },
    ] },
  { id: "snack-am", name: "Media mañana", time: "11:00", icon: "coffee",
    foods: [
      { food: "Yogur griego", qty: "150 g" }, { food: "Arándanos", qty: "80 g" },
      { food: "Almendras", qty: "10 g" },
    ] },
  { id: "comida", name: "Comida", time: "13:30", icon: "utensils", key: true,
    recipe: "bowl-de-pollo-y-arroz",
    foods: [
      { food: "Pechuga de pollo", qty: "150 g" }, { food: "Arroz basmati", qty: "110 g" },
      { food: "Brócoli", qty: "150 g" }, { food: "Aceite de oliva", qty: "3 ml" },
    ] },
  { id: "pre", name: "Pre-entreno", time: "16:30", icon: "apple",
    swap: { from: "Tostada con miel", why: "Lo cambié a tortitas de arroz: digieren más rápido antes del entreno." },
    foods: [
      { food: "Tortitas de arroz", qty: "3 ud" }, { food: "Pavo", qty: "80 g" },
      { food: "Manzana", qty: "1 ud" },
    ] },
  { id: "cena", name: "Cena", time: "20:00", icon: "moon",
    recipe: "salmon-al-horno-con-patata",
    foods: [
      { food: "Salmón", qty: "135 g" }, { food: "Patata", qty: "220 g" },
      { food: "Espinacas", qty: "100 g" }, { food: "Aguacate", qty: "1/2 ud" },
    ] },
];

// suplementos del día (eventos paralelos a los del timeline de Hoy)
const VX_SUPPS = [
  { id: "am", time: "08:00", name: "Creatina · Omega-3", tag: "AM" },
  { id: "pm", time: "22:00", name: "Vitamina D", tag: "PM" },
];

// ── historial del diario: UNA fuente para la lista "Días recientes" y la
// gráfica semanal. Cronológico (antiguo→reciente), 7 días COMPLETADOS que
// terminan ayer (hoy = Martes 2 jun; el día en curso vive en el anillo, no aquí).
// dow = inicial del día (es-ES). adh = adherencia % calculada por la API.
// Cada día lleva su informe (recap) y, si lo hubo, el cambio que registró el
// agente — para el "Detalle de día del diario" (espejo del Detalle de sesión).
const VX_DIARY_WEEK = [
  { slug: "d-26may", date: "Mar 26", dl: "Martes · 26 may",    dow: "M", mon: "may", kcal: 2270, p: 181, adh: 94, star: false, water: 2.5,
    recap: "Día sólido: 2.270 kcal y 181 g de proteína, prácticamente clavado al objetivo. El reparto cargó la proteína en comida y cena. Buen arranque de semana." },
  { slug: "d-27may", date: "Mié 27", dl: "Miércoles · 27 may", dow: "X", mon: "may", kcal: 2240, p: 179, adh: 95, star: false, water: 2.5,
    recap: "Otro día redondo: 2.240 kcal en objetivo y proteína al milímetro. Hidratación completa. Así se sostiene una definición." },
  { slug: "d-28may", date: "Jue 28", dl: "Jueves · 28 may",    dow: "J", mon: "may", kcal: 2060, p: 158, adh: 86, star: false, water: 1.9,
    note: "Cena fuera de casa, no controlé del todo las raciones.",
    swaps: { cena: { from: "Salmón al horno", why: "Cenaste fuera — registré una opción equivalente, pero bajaste de proteína." } },
    recap: "Día por debajo: te quedaste en 158 g de proteína (−22 del objetivo) por la cena fuera. Nada grave en una semana; mañana recupera la proteína fuerte." },
  { slug: "d-29may", date: "Vie 29", dl: "Viernes · 29 may",   dow: "V", mon: "may", kcal: 2190, p: 184, adh: 97, star: true,  water: 2.6,
    recap: "Día clavado: 184 g de proteína (incluso por encima) y kcal en objetivo. Tu mejor adherencia de la semana. La hidratación, completa." },
  { slug: "d-30may", date: "Sáb 30", dl: "Sábado · 30 may",    dow: "S", mon: "may", kcal: 2480, p: 168, adh: 88, star: false, water: 2.2,
    note: "Comida social, me pasé un poco con los carbos.",
    swaps: { comida: { from: "Bowl de pollo y arroz", why: "Comida social — más carbos y grasa de lo planificado. Lo compensamos el resto del día." } },
    recap: "Día alto: +230 kcal sobre el objetivo, casi todo de carbos y grasa del almuerzo social. La proteína aguantó en 168 g. Un día así a la semana no rompe el déficit." },
  { slug: "d-31may", date: "Dom 31", dl: "Domingo · 31 may",   dow: "D", mon: "may", kcal: 2230, p: 176, adh: 92, star: false, water: 2.4,
    recap: "Vuelta al plan: 2.230 kcal y 176 g de proteína. Buen cierre de semana tras el sábado. Mantienes el rumbo de la definición." },
  { slug: "d-1jun",  date: "Lun 1",  dl: "Lunes · 1 jun",      dow: "L", mon: "jun", kcal: 2210, p: 182, adh: 96, star: true,  water: 2.5,
    recap: "Arranque de semana perfecto: 182 g de proteína y kcal en objetivo. Cinco comidas completas e hidratación al 100 %. Semana 3 en verde." },
];

// ── biblioteca de alimentos (catálogo único, paralelo a VX_EXERCISES) ───────
// valores por la ración indicada en `serv`. `lead` = macro dominante → color.
const VX_FOOD_GROUPS = ["Proteínas", "Carbohidratos", "Grasas", "Verduras", "Frutas", "Lácteos"];

const VX_FOOD_SPECS = [
  { name: "Pechuga de pollo", group: "Proteínas", serv: "100 g", g: 100, kcal: 165, p: 31, c: 0,  f: 3.6, logs: 22, lastDays: 0, fav: true,  src: "BEDCA", cat: "Fuente de proteína magra", hl: ["Vit. B6", "Selenio"] },
  { name: "Salmón",            group: "Proteínas", serv: "100 g", g: 100, kcal: 208, p: 20, c: 0,  f: 13,  logs: 14, lastDays: 0, fav: true,  src: "BEDCA", cat: "Pescado azul · omega-3", hl: ["Omega-3", "Vit. D"] },
  { name: "Claras de huevo",   group: "Proteínas", serv: "100 ml", g: 100, kcal: 52, p: 11, c: 0.7,f: 0.2, logs: 19, lastDays: 0, src: "BEDCA", cat: "Proteína sin grasa", hl: ["Riboflavina"] },
  { name: "Huevo entero",      group: "Proteínas", serv: "1 ud",   g: 50,  kcal: 78, p: 6,  c: 0.6,f: 5.3, logs: 19, lastDays: 0, src: "BEDCA", cat: "Proteína completa", hl: ["Colina", "Vit. B12"] },
  { name: "Pavo",              group: "Proteínas", serv: "100 g",  g: 100, kcal: 135,p: 29, c: 0,  f: 1.7, logs: 8,  lastDays: 2, src: "Open Food Facts", cat: "Fiambre magro", hl: ["Niacina"] },
  { name: "Yogur griego",      group: "Lácteos",   serv: "100 g",  g: 100, kcal: 97, p: 9,  c: 4,  f: 5,   logs: 12, lastDays: 1, fav: true, src: "BEDCA", cat: "Lácteo proteico", hl: ["Calcio", "Probióticos"] },
  { name: "Arroz basmati",     group: "Carbohidratos", serv: "100 g", g: 100, kcal: 130, p: 2.7, c: 28, f: 0.3, logs: 17, lastDays: 0, fav: true, src: "BEDCA", cat: "Carbohidrato base", hl: ["Magnesio"] },
  { name: "Avena",             group: "Carbohidratos", serv: "100 g", g: 100, kcal: 389, p: 13,  c: 66, f: 7,   logs: 21, lastDays: 0, fav: true, src: "BEDCA", cat: "Cereal integral", hl: ["Fibra", "Hierro"] },
  { name: "Patata",            group: "Carbohidratos", serv: "100 g", g: 100, kcal: 77,  p: 2,   c: 17, f: 0.1, logs: 9,  lastDays: 0, src: "BEDCA", cat: "Tubérculo", hl: ["Potasio", "Vit. C"] },
  { name: "Tortitas de arroz", group: "Carbohidratos", serv: "1 ud",  g: 7,   kcal: 28,  p: 0.6, c: 6,  f: 0.2, logs: 6,  lastDays: 0, src: "Open Food Facts", cat: "Carbo rápido", hl: [] },
  { name: "Aceite de oliva",   group: "Grasas",    serv: "10 ml",  g: 10,  kcal: 90, p: 0,  c: 0,  f: 10,  logs: 24, lastDays: 0, fav: true, src: "BEDCA", cat: "Grasa monoinsaturada", hl: ["Vit. E", "Omega-9"] },
  { name: "Aguacate",          group: "Grasas",    serv: "1/2 ud", g: 100, kcal: 120,p: 1.5,c: 6,  f: 11,  logs: 7,  lastDays: 0, src: "BEDCA", cat: "Grasa saludable", hl: ["Fibra", "Potasio"] },
  { name: "Almendras",         group: "Grasas",    serv: "15 g",   g: 15,  kcal: 87, p: 3,  c: 3,  f: 7.5, logs: 11, lastDays: 1, src: "BEDCA", cat: "Fruto seco", hl: ["Vit. E", "Magnesio"] },
  { name: "Brócoli",           group: "Verduras",  serv: "150 g",  g: 150, kcal: 51, p: 4,  c: 10, f: 0.5, logs: 13, lastDays: 0, src: "BEDCA", cat: "Verdura · fibra", hl: ["Vit. C", "Fibra"] },
  { name: "Espinacas",         group: "Verduras",  serv: "100 g",  g: 100, kcal: 23, p: 2.9,c: 3.6,f: 0.4, logs: 8,  lastDays: 0, src: "BEDCA", cat: "Hoja verde", hl: ["Hierro", "Vit. K"] },
  { name: "Plátano",           group: "Frutas",    serv: "1 ud",   g: 120, kcal: 105,p: 1.3,c: 27, f: 0.4, logs: 16, lastDays: 0, src: "BEDCA", cat: "Fruta · pre-entreno", hl: ["Potasio", "Vit. B6"] },
  { name: "Arándanos",         group: "Frutas",    serv: "80 g",   g: 80,  kcal: 46, p: 0.6,c: 12, f: 0.3, logs: 9,  lastDays: 1, src: "Open Food Facts", cat: "Fruta · antioxidante", hl: ["Antioxidantes", "Vit. C"] },
  { name: "Manzana",           group: "Frutas",    serv: "1 ud",   g: 180, kcal: 95, p: 0.5,c: 25, f: 0.3, logs: 10, lastDays: 0, src: "BEDCA", cat: "Fruta · fibra", hl: ["Fibra", "Vit. C"] },
  { name: "Mantequilla de cacahuete", group: "Grasas", serv: "20 g", g: 20, kcal: 118, p: 5, c: 4, f: 10, logs: 4, lastDays: 6, custom: true, src: "Creado por ti", cat: "Grasa · personalizado", hl: ["Vit. E"] },
  { name: "Tofu firme",        group: "Proteínas", serv: "100 g",  g: 100, kcal: 144,p: 17, c: 3,  f: 9,   logs: 0,  lastDays: null, src: "Open Food Facts", cat: "Proteína vegetal", hl: ["Calcio", "Hierro"] },
];

// macro dominante de un alimento (por gramos, ponderando proteína)
function vxLead(p, c, f) {
  const score = { p: p * 1.1, c: c, f: f * 1.0 };
  return Object.keys(score).reduce((a, b) => (score[b] > score[a] ? b : a), "p");
}

// micronutrientes sintéticos (plausibles, por grupo) — la "ficha" oficial
function vxMicros(s) {
  const fiberByGroup = { Verduras: 3.0, Frutas: 2.4, Carbohidratos: 4.5, Grasas: 2.5, Proteínas: 0, Lácteos: 0 };
  const fib = +(((fiberByGroup[s.group] || 0) * (s.g / 100)) || 0).toFixed(1);
  const sugar = +(s.c * ({ Frutas: 0.7, Lácteos: 0.5, Verduras: 0.35 }[s.group] || 0.08)).toFixed(1);
  const sodium = Math.round(({ Proteínas: 70, Lácteos: 45, Carbohidratos: 8, Grasas: 3, Verduras: 30, Frutas: 1 }[s.group] || 10) * (s.g / 100));
  return [
    { name: "Fibra", val: fib + " g" },
    { name: "Azúcares", val: sugar + " g" },
    { name: "Sodio", val: sodium + " mg" },
  ];
}

// expande alimentos → catálogo completo
const VX_FOODS = VX_FOOD_SPECS.map((s) => {
  const lead = vxLead(s.p, s.c, s.f);
  const per100 = s.g ? 100 / s.g : 1;
  return {
    ...s,
    kind: "food",
    slug: vxSlugN(s.name),
    custom: !!s.custom,
    used: s.logs > 0,
    fav: !!s.fav,
    source: s.src || "BEDCA",
    lead,
    pal: VX_MACRO[lead],
    kcal100: Math.round(s.kcal * per100),
    per100: { kcal: s.kcal * per100, p: s.p * per100, c: s.c * per100, f: s.f * per100 },
    micros: vxMicros(s),
    hl: s.hl || [],
    macros: [
      { ...VX_MACRO.p, g: s.p }, { ...VX_MACRO.c, g: s.c }, { ...VX_MACRO.f, g: s.f },
    ],
  };
});
const VX_FOOD_BY_SLUG = Object.fromEntries(VX_FOODS.map((f) => [f.slug, f]));
function vxFoodByName(name) { return VX_FOODS.find((f) => f.name === name); }

// escala un alimento por la ración indicada (p.ej. "150 g" sobre base "100 g")
function vxScaleItem(it) {
  const f = vxFoodByName(it.food) || { kcal: 0, p: 0, c: 0, f: 0, lead: "p", pal: VX_MACRO.p, slug: "" };
  const baseNum = parseFloat((f.serv || "100").replace(",", ".")) || 100;
  const planNum = parseFloat((it.qty || "100").replace(",", ".")) || 100;
  const sameUnit = (f.serv || "").replace(/[\d.,\s/]/g, "") === (it.qty || "").replace(/[\d.,\s/]/g, "");
  const k = sameUnit && baseNum ? planNum / baseNum : 1;
  return { name: it.food, slug: f.slug, qty: it.qty, kcal: f.kcal * k, p: f.p * k, c: f.c * k, f: f.f * k, lead: f.lead };
}

// expande el plan: cada comida suma macros de sus alimentos (por ración del plan)
function vxExpandMeals() {
  return VX_MEAL_SPECS.map((m) => {
    const items = m.foods.map(vxScaleItem);
    const sum = (key) => items.reduce((a, it) => a + it[key], 0);
    return { ...m, items, kcal: sum("kcal"), p: sum("p"), c: sum("c"), f: sum("f") };
  });
}

// ── recetas (alimentos compuestos: ingredientes + pasos) ─────────────────────
const VX_RECIPE_SPECS = [
  { name: "Bowl de pollo y arroz", time: "20 min", portions: 1, src: "verxion", fav: true, logs: 9, lastDays: 1,
    tag: "Comida · alto en proteína",
    ingredients: [
      { food: "Pechuga de pollo", qty: "150 g" }, { food: "Arroz basmati", qty: "100 g" },
      { food: "Brócoli", qty: "150 g" }, { food: "Aceite de oliva", qty: "5 ml" },
    ],
    steps: ["Cuece el arroz basmati con una pizca de sal.", "Saltea el pollo a fuego fuerte hasta dorar.",
      "Cuece el brócoli al vapor 5 min.", "Monta el bowl y riega con el aceite de oliva."],
    desc: "El plato base de tu definición: proteína magra, carbo de calidad y verdura. Versátil y rápido." },
  { name: "Salmón al horno con patata", time: "35 min", portions: 1, src: "Creado por ti", logs: 5, lastDays: 4,
    tag: "Cena · omega-3",
    ingredients: [
      { food: "Salmón", qty: "140 g" }, { food: "Patata", qty: "200 g" },
      { food: "Espinacas", qty: "100 g" }, { food: "Aceite de oliva", qty: "5 ml" },
    ],
    steps: ["Precalienta el horno a 200 °C.", "Asa la patata en gajos 25 min.",
      "Añade el salmón los últimos 12 min.", "Saltea las espinacas y sirve."],
    desc: "Cena que creaste tú: grasa saludable del salmón, carbo lento de la patata y hoja verde." },
  { name: "Tortitas proteicas de avena", time: "12 min", portions: 1, src: "Creado por ti", fav: true, logs: 14, lastDays: 0,
    tag: "Desayuno · pre-entreno",
    ingredients: [
      { food: "Avena", qty: "80 g" }, { food: "Claras de huevo", qty: "200 ml" },
      { food: "Plátano", qty: "1 ud" },
    ],
    steps: ["Tritura la avena con las claras y el plátano.", "Deja reposar la masa 2 min.",
      "Cuaja a fuego medio en tortitas pequeñas.", "Voltea cuando burbujee la superficie."],
    desc: "Tu desayuno de cabecera antes de entrenar: carbo de digestión media y proteína completa." },
];

const VX_RECIPES = VX_RECIPE_SPECS.map((r) => {
  const items = r.ingredients.map(vxScaleItem);
  const sum = (key) => items.reduce((a, it) => a + it[key], 0);
  const tot = { kcal: sum("kcal"), p: sum("p"), c: sum("c"), f: sum("f") };
  return {
    ...r, kind: "recipe", slug: vxSlugN(r.name), items, ...tot,
    custom: r.src === "Creado por ti", used: r.logs > 0, fav: !!r.fav,
    source: r.src, group: "Recetas", serv: r.portions + (r.portions === 1 ? " ración" : " raciones"),
    cat: r.tag, lead: vxLead(tot.p, tot.c, tot.f), pal: VX_MACRO[vxLead(tot.p, tot.c, tot.f)],
    kcalN: Math.round(tot.kcal),
    macros: [{ ...VX_MACRO.p, g: tot.p }, { ...VX_MACRO.c, g: tot.c }, { ...VX_MACRO.f, g: tot.f }],
  };
});

// biblioteca unificada (alimentos + recetas) + búsqueda por slug
const VX_LIBRARY = [...VX_FOODS, ...VX_RECIPES];
const VX_LIB_BY_SLUG = Object.fromEntries(VX_LIBRARY.map((x) => [x.slug, x]));
function vxItemBySlug(slug) { return VX_LIB_BY_SLUG[slug] || VX_FOODS[0]; }

// ── DIARIO: síntesis de un día registrado (espejo de sdSynth en sesiones) ────
// La app SOLO LEE: kcal/proteína/adherencia los calculó la API (VX_DIARY_WEEK).
// Aquí derivamos carbos/grasa que CUADRAN las kcal del día y el desglose por
// comida, escalando el plan base a los totales reales. Nada se escribe.
function vxDeriveCF(kcal, p, goals) {
  const g = goals || VX_DIET;
  const protK = p * 4;
  const rem = Math.max(0, kcal - protK);
  const cGoalK = g.cGoal * 4, fGoalK = g.fGoal * 9, totGoalK = cGoalK + fGoalK || 1;
  return { c: (rem * (cGoalK / totGoalK)) / 4, f: (rem * (fGoalK / totGoalK)) / 9 };
}

// adherencia % → clasificación del día (lenguaje semántico de toda la app)
function vxDiaryAdh(adh) {
  if (adh >= 95) return { key: "clavado",  label: "Día clavado",  color: "var(--vx-up)",      bg: "var(--vx-up-tint)",     line: "var(--vx-up-line)" };
  if (adh >= 90) return { key: "objetivo", label: "En objetivo",  color: "var(--vx-up)",      bg: "var(--vx-up-tint)",     line: "var(--vx-up-line)" };
  if (adh >= 82) return { key: "correcto", label: "Día correcto", color: "var(--vx-neutral)", bg: "var(--vx-neutral-bg)",  line: "rgba(255,185,0,0.3)" };
  return            { key: "bajo",     label: "Por debajo",   color: "var(--vx-health)",  bg: "var(--vx-health-bg)",   line: "rgba(255,71,87,0.3)" };
}

function vxSynthDiaryDay(spec) {
  const goals = {
    kcalGoal: spec.kcalGoal || VX_DIET.kcalGoal, pGoal: spec.pGoal || VX_DIET.pGoal,
    cGoal: spec.cGoal || VX_DIET.cGoal, fGoal: spec.fGoal || VX_DIET.fGoal,
  };
  const base = vxExpandMeals();
  const bTot = ["kcal", "p", "c", "f"].reduce((o, k) => (o[k] = base.reduce((a, m) => a + m[k], 0), o), {});
  const cf = vxDeriveCF(spec.kcal, spec.p, goals);
  const totals = { kcal: spec.kcal, p: spec.p, c: cf.c, f: cf.f };
  const rK = spec.kcal / bTot.kcal, rP = spec.p / bTot.p, rC = totals.c / bTot.c, rF = totals.f / bTot.f;
  const swaps = spec.swaps || {};
  const meals = base.map((m) => {
    const sw = swaps[m.id] || null;
    const slug = m.recipe || (m.items[0] && m.items[0].slug) || null;
    return {
      id: m.id, name: m.name, time: m.time, icon: m.icon, key: !!m.key, slug, swap: sw,
      kcal: m.kcal * rK, p: m.p * rP, c: m.c * rC, f: m.f * rF,
    };
  });
  // distribución de macros (% de kcal del día) — sección "reparto"
  const pK = totals.p * 4, cK = totals.c * 4, fK = totals.f * 9, mTot = pK + cK + fK || 1;
  const macros = [
    { key: "p", label: "Proteína", g: totals.p, kc: pK, pct: Math.round(pK / mTot * 100), color: "var(--vx-lava)",    goal: goals.pGoal },
    { key: "c", label: "Carbos",   g: totals.c, kc: cK, pct: Math.round(cK / mTot * 100), color: "var(--vx-body)",    goal: goals.cGoal },
    { key: "f", label: "Grasa",    g: totals.f, kc: fK, pct: Math.round(fK / mTot * 100), color: "var(--vx-neutral)", goal: goals.fGoal },
  ];
  return { ...spec, totals, meals, macros, adhClass: vxDiaryAdh(spec.adh), kcalGoal: goals.kcalGoal, supps: VX_SUPPS };
}

// ── historial completo del diario (espejo de VX_SESSIONS_ALL) ────────────────
// La semana en curso (week 3, autorada arriba) + semanas 2·1 generadas, todas
// del bloque "Definición". newest-first dentro de cada semana.
const VX_DIARY_DOW_S = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const VX_DIARY_DOW_I = ["L", "M", "X", "J", "V", "S", "D"];
const VX_DIARY_DOW_L = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
function vxGenDiaryWeek({ weekN, start, mon, adh, kcal, p }) {
  return VX_DIARY_DOW_S.map((d, i) => {
    const day = start + i, a = adh[i], k = kcal[i], pr = p[i];
    return {
      slug: "d-" + day + mon, date: d + " " + day, dl: VX_DIARY_DOW_L[i] + " · " + day + " " + mon,
      dow: VX_DIARY_DOW_I[i], mon, kcal: k, p: pr, adh: a, star: a >= 96, water: a >= 90 ? 2.5 : 2.1, week: weekN,
      recap: "Semana " + weekN + " de definición · " + (a >= 90 ? "día en objetivo, buen control de raciones."
        : a >= 82 ? "ligeramente por debajo, pero dentro del rango."
        : "flojo de proteína — a recuperar al día siguiente."),
    };
  });
}
const _vxWk3 = VX_DIARY_WEEK.map((d) => ({ ...d, week: 3 }));
const _vxWk2 = vxGenDiaryWeek({ weekN: 2, start: 19, mon: "may",
  adh: [93, 91, 88, 90, 94, 85, 92], kcal: [2240, 2260, 2180, 2230, 2200, 2520, 2250], p: [180, 178, 170, 179, 183, 165, 181] });
const _vxWk1 = vxGenDiaryWeek({ weekN: 1, start: 12, mon: "may",
  adh: [88, 90, 84, 89, 91, 87, 93], kcal: [2300, 2240, 2120, 2260, 2210, 2300, 2230], p: [176, 179, 162, 178, 181, 172, 180] });

// ── días de diario por dieta (todas las fases, no solo la activa) ────────────
// La activa lleva sus 3 semanas autoradas; las archivadas se generan de forma
// procedural (kcal/proteína/adherencia coherentes con sus objetivos). Cada día
// guarda su dietSlug + objetivos, para agruparlo por fase y sintetizarlo bien.
const _VX_MON = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const _VX_DOW_S = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const _VX_DOW_I = ["D", "L", "M", "X", "J", "V", "S"];
const _VX_DOW_L = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
function _vxTs(mon, dayNum) { const m = _VX_MON.indexOf(mon); return new Date(2026, m < 0 ? 4 : m, dayNum).getTime(); }
function _vxWob(i, s) { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); }

function vxGenDietDiary({ dietSlug, start, days, kcalGoal, pGoal, cGoal, fGoal, adhBase, adhSpread, seed, phase }) {
  const out = [];
  for (let i = 0; i < days; i++) {
    const dt = new Date(start.getTime() + i * 86400000);
    const dow = dt.getDay(), dayNum = dt.getDate(), mon = _VX_MON[dt.getMonth()];
    const w1 = _vxWob(i, seed), w2 = _vxWob(i, seed + 5);
    const adh = Math.max(78, Math.min(99, Math.round(adhBase + (w1 - 0.5) * adhSpread)));
    out.push({
      slug: dietSlug + "-" + dayNum + mon, date: _VX_DOW_S[dow] + " " + dayNum,
      dl: _VX_DOW_L[dow] + " · " + dayNum + " " + mon, dow: _VX_DOW_I[dow], mon,
      kcal: Math.round(kcalGoal + (w2 - 0.5) * kcalGoal * 0.07),
      p: Math.round(pGoal + (w1 - 0.5) * 18),
      adh, star: adh >= 97, water: adh >= 90 ? 2.6 : 2.1,
      dietSlug, kcalGoal, pGoal, cGoal, fGoal, week: Math.floor(i / 7) + 1, ts: dt.getTime(),
      recap: phase + " · " + (adh >= 92 ? "día en objetivo, buen control de raciones."
        : adh >= 84 ? "ligeramente desviado, pero dentro del rango." : "flojo de proteína — recuperado al día siguiente."),
    });
  }
  return out;
}

// activa: 3 semanas autoradas, etiquetadas con dietSlug + ts
const _vxDef = [..._vxWk3.slice().reverse(), ..._vxWk2.slice().reverse(), ..._vxWk1.slice().reverse()]
  .map((d) => ({ ...d, dietSlug: "definicion-2250", ts: _vxTs(d.mon, parseInt(d.date.split(" ")[1], 10)) }));
// archivadas: generadas (newest-first dentro de cada una)
const _vxVol = vxGenDietDiary({ dietSlug: "volumen-2900", start: new Date(2026, 2, 10), days: 56,
  kcalGoal: 2900, pGoal: 190, cGoal: 330, fGoal: 80, adhBase: 90, adhSpread: 14, seed: 3, phase: "Volumen limpio" }).reverse();
const _vxMant = vxGenDietDiary({ dietSlug: "mantenimiento-2500", start: new Date(2026, 1, 10), days: 28,
  kcalGoal: 2500, pGoal: 175, cGoal: 270, fGoal: 75, adhBase: 86, adhSpread: 16, seed: 7, phase: "Mantenimiento" }).reverse();

const VX_DIARY_ALL = [..._vxDef, ..._vxVol, ..._vxMant];
const VX_DIARY_MAXK = Math.max(2400, ...VX_DIARY_ALL.map((d) => d.kcal));
const VX_DIARY_BY_SLUG = Object.fromEntries(VX_DIARY_ALL.map((d) => [d.slug, d]));
function vxDiaryDay(slug) { return vxSynthDiaryDay(VX_DIARY_BY_SLUG[slug] || VX_DIARY_ALL[0]); }

// agrupa días por SEMANA (bloque del diario) → [{ week, range, items, adhAvg }]
// `asc` invierte el orden de semanas y de días dentro (antiguo primero)
function vxDiaryWeekGroups(list, asc) {
  const order = [], by = {};
  list.forEach((d) => { if (!by[d.week]) { by[d.week] = []; order.push(d.week); } by[d.week].push(d); });
  let groups = order.map((wk) => {
    const items = by[wk];
    const adhAvg = Math.round(items.reduce((a, d) => a + d.adh, 0) / items.length);
    const first = items[items.length - 1], last = items[0];
    return {
      week: wk, range: first.date + " – " + last.date, adhAvg,
      items: asc ? items.slice().reverse() : items,
    };
  });
  return asc ? groups.reverse() : groups;
}

Object.assign(window, {
  VX_DIET, VX_MACRO, VX_DOW_N, VX_SUPPS, VX_DIARY_WEEK, VX_FOOD_GROUPS, VX_FOODS, VX_FOOD_BY_SLUG,
  VX_RECIPES, VX_LIBRARY, VX_LIB_BY_SLUG, vxItemBySlug,
  VX_MEAL_SPECS, vxExpandMeals, vxScaleItem, vxFoodByName, vxKcal, vxG, vxSlugN, vxLead, vxMicros,
  vxDeriveCF, vxDiaryAdh, vxSynthDiaryDay, vxDiaryDay, vxDiaryWeekGroups,
  VX_DIARY_ALL, VX_DIARY_BY_SLUG, VX_DIARY_MAXK,
});
