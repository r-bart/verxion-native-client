// nutricion-library.jsx — vistas secundarias del landing de Nutrición.
// DiarioView (espejo de Sesiones) + AlimentosView (espejo de Ejercicios: búsqueda
// + filtro + orden) + hojas modales + selector segmentado + tab bar + la
// composición NutricionScreen que monta todo según el segmento y el estado.

// ── DIARIO — historial de días (paralelo a Sesiones) ─────────────────────────
// ── DIARIO — analítica (adherencia calculada por la API) + historial ──────────
// fuente única del diario (definida en comidas-data.jsx)
const _DW = (typeof VX_DIARY_WEEK !== "undefined") ? VX_DIARY_WEEK : [];
const DIARY_RANGES = [
  { id: "semana", label: "7 días", long: "Últimos 7 días" },
  { id: "mes", label: "30 días", long: "Últimos 30 días" },
  { id: "trimestre", label: "3 meses", long: "Últimos 3 meses" },
];
const DIARY_METRICS = [
  { id: "adherencia", label: "Adherencia", unit: "%", color: "var(--vx-lava)", goal: 90 },
  { id: "kcal", label: "Kcal", unit: "", color: "var(--vx-body)", goal: 2250 },
  { id: "proteina", label: "Proteína", unit: " g", color: "var(--vx-neutral)", goal: 180 },
];
const DIARY_LABELS = { semana: _DW.map((d) => d.dow), mes: ["S1", "S2", "S3", "S4"], trimestre: ["Abr", "May", "Jun"] };
const DIARY_SERIES = {
  adherencia: { semana: _DW.map((d) => d.adh),  mes: [82, 88, 91, 93], trimestre: [76, 85, 92] },
  kcal:       { semana: _DW.map((d) => d.kcal), mes: [2330, 2260, 2240, 2235], trimestre: [2410, 2300, 2240] },
  proteina:   { semana: _DW.map((d) => d.p),    mes: [171, 176, 179, 180], trimestre: [162, 174, 179] },
};
// KPIs de periodo — devueltos calculados por la API
const DIARY_PERIOD = {
  semana:    { on: "5 / 7", streak: 6, water: 92 },
  mes:       { on: "24 / 30", streak: 6, water: 88 },
  trimestre: { on: "78 / 90", streak: 6, water: 85 },
};

// gráfica de tendencia (área + línea + línea de objetivo)
function NDiaryChart({ points, color, unit, goal }) {
  const W = 360, H = 150, padL = 6, padR = 46, padT = 16, padB = 24;
  const n = points.length, vals = points.map((p) => p.v);
  let lo = Math.min(...vals, goal), hi = Math.max(...vals, goal);
  const span = hi - lo || 1; lo -= span * 0.28; hi += span * 0.22;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const X = (i) => padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const Y = (v) => padT + plotH - ((v - lo) / (hi - lo)) * plotH;
  const pts = points.map((p, i) => [X(i), Y(p.v)]);
  const line = "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
  const area = `M${X(0).toFixed(1)},${(padT + plotH).toFixed(1)} L`
    + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L")
    + ` L${X(n - 1).toFixed(1)},${(padT + plotH).toFixed(1)} Z`;
  const last = pts[n - 1], lastVal = points[n - 1].v;
  const gy = Y(goal);
  const gid = "ng-" + Math.round(Math.random() * 1e6);
  return (
    <svg className="n-chart__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeDasharray="3 4" />
      <text x={W - padR + 4} y={gy + 3.5} fill="rgba(255,255,255,0.4)" style={{ font: "600 9px var(--vx-font-mono)" }}>obj</text>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 2px 6px ${color})` }} />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === n - 1 ? 0 : 2.3} fill="#0a0a0c" stroke={color} strokeWidth="2" />
      ))}
      <circle cx={last[0]} cy={last[1]} r="9" fill={color} fillOpacity="0.18" />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill={color} stroke="#0a0a0c" strokeWidth="2" />
      <text x={Math.min(last[0] + 10, W - 2)} y={last[1] + 4} textAnchor="end"
        fill="#fff" style={{ font: "700 14px var(--vx-font-sans)" }}>{nInt(lastVal)}{unit}</text>
      {points.map((p, i) => (
        <text key={i} x={X(i)} y={H - 7} textAnchor="middle" fill="rgba(255,255,255,0.34)" style={{ font: "500 9px var(--vx-font-mono)" }}>{p.l}</text>
      ))}
    </svg>
  );
}

// ── DIARIO · feed integrado (espejo del SesionesSegment de Entreno) ──────────
// Sin "Ver todo": el historial de TODAS las dietas vive aquí, agrupado por fase
// (dieta), con filtros Dieta + Orden en hojas y reveal progresivo (scroll
// infinito) sobre .n-scroll. Bloque = dieta (paralelo a bloque = rutina).
const DIARY_FEED_SORTS = [
  { id: "reciente", label: "Más reciente", hint: "Lo último primero, por dieta" },
  { id: "antiguo", label: "Más antiguo", hint: "Desde la primera dieta" },
  { id: "adherencia", label: "Adherencia", hint: "Mayor adherencia primero" },
  { id: "objetivo", label: "Cerca del objetivo", hint: "Días más ajustados a las kcal" },
];
const _diaryAll = () => (typeof VX_DIARY_ALL !== "undefined" ? VX_DIARY_ALL : []);
const _diets = () => (typeof VX_DIETS !== "undefined" ? VX_DIETS : []);
const _dayGoal = (d) => d.kcalGoal || (typeof VX_DIET !== "undefined" ? VX_DIET.kcalGoal : 2250);
const _dayOnTgt = (d) => Math.abs(d.kcal - _dayGoal(d)) <= _dayGoal(d) * 0.06;

// agrupa días por DIETA (fase) en orden de recencia (activa primero)
function diaryDietGroups(list, asc) {
  const order = _diets().map((x) => x.slug);
  const by = {};
  list.forEach((d) => { (by[d.dietSlug] = by[d.dietSlug] || []).push(d); });
  let groups = order.filter((slug) => by[slug]).map((slug) => {
    const diet = (typeof vxDietBySlug === "function") ? vxDietBySlug(slug) : { name: slug, state: "completed", created: "", finished: "" };
    const items = by[slug].slice().sort((a, b) => asc ? a.ts - b.ts : b.ts - a.ts);
    const adhAvg = Math.round(items.reduce((a, d) => a + d.adh, 0) / items.length);
    const st = (typeof DZ_STATE !== "undefined") ? DZ_STATE[diet.state] : null;
    const range = diet.state === "completed"
      ? (diet.created || "").replace(" 2026", "") + " – " + (diet.finished || "").replace(" 2026", "")
      : "desde " + (diet.created || "").replace(" 2026", "");
    return { dietSlug: slug, diet, name: (diet.name || slug).split(" · ")[0], state: diet.state, st, range, adhAvg, items };
  });
  return asc ? groups.reverse() : groups;
}

function diaryFeedItems(sort, dietFilter) {
  let all = _diaryAll();
  if (dietFilter) all = all.filter((d) => d.dietSlug === dietFilter);
  if (sort === "reciente" || sort === "antiguo") {
    const groups = diaryDietGroups(all, sort === "antiguo");
    const items = [];
    groups.forEach((g) => { items.push({ kind: "phase", g }); g.items.forEach((d) => items.push({ kind: "row", d })); });
    return items;
  }
  const flat = all.slice().sort((a, b) => sort === "adherencia"
    ? (b.adh - a.adh) : (Math.abs(a.kcal - _dayGoal(a)) - Math.abs(b.kcal - _dayGoal(b))));
  return [{ kind: "flathdr", n: flat.length }, ...flat.map((d) => ({ kind: "row", d }))];
}

function NDiaryPhaseHeader({ g }) {
  const st = g.st || { label: g.state === "active" ? "Activa" : "Cerrada", color: "var(--vx-up)", bg: "var(--vx-up-tint)", line: "var(--vx-up-line)" };
  return (
    <div className="n-phasehd">
      <div className="n-phasehd__top">
        <span className="n-phasehd__name">{g.name}</span>
        <span className="n-phasehd__state" style={{ color: st.color, background: st.bg, borderColor: st.line }}>{st.label}</span>
        <span className="n-phasehd__line" />
        <span className="n-phasehd__adh">{g.adhAvg}%</span>
      </div>
      <div className="n-phasehd__meta">{g.range} · {g.items.length} días</div>
    </div>
  );
}

function NDiaryRow({ d }) {
  const onTgt = _dayOnTgt(d);
  const col = onTgt ? "var(--vx-lava)" : "var(--vx-neutral)";
  const frac = Math.max(6, Math.min(100, (d.kcal / _dayGoal(d)) * 100));
  return (
    <div className="n-dday n-dday--tap" onClick={() => vxNav(VX.DIA_DIARIO, { dia: d.slug })} style={{ cursor: "pointer" }}>
      <div className="n-dday__date">{d.date}</div>
      <NBubble color={col} bg={onTgt ? "var(--vx-lava-bg)" : "var(--vx-neutral-bg)"} size={34}>
        {d.star ? <NIcon.trophy size={15} /> : <NIcon.utensils size={15} />}
      </NBubble>
      <div className="n-dday__body">
        <div className="n-dday__name">
          {nInt(d.kcal)} <span className="n-dday__goal">/ {nInt(_dayGoal(d))} kcal</span>
          {d.star && <span className="n-dday__pr"><NIcon.trophy size={9} /> {d.p} g P</span>}
        </div>
        <div className="n-dday__bar"><span style={{ width: frac + "%", background: col }} /></div>
      </div>
      <div className="n-dday__meta">
        <div className="n-dday__adh">{d.adh}<em>%</em></div>
        <div className="n-dday__pgram">{d.p} g P</div>
      </div>
      <Icon.chevronRight size={15} style={{ color: "rgba(255,255,255,0.26)", flexShrink: 0, alignSelf: "center" }} />
    </div>
  );
}

// feed con reveal progresivo: arranca con 9 ítems y carga más al acercarse al
// final del scroll del propio screen (.n-scroll) — el "infinito" del prototipo.
function NDiaryFeed({ sort, onOpenSort, dietFilter, onOpenDiet, onClearDiet }) {
  const items = React.useMemo(() => diaryFeedItems(sort, dietFilter), [sort, dietFilter]);
  const [shown, setShown] = React.useState(9);
  const sentinel = React.useRef(null);
  React.useEffect(() => { setShown(9); }, [sort, dietFilter]);
  React.useEffect(() => {
    const root = sentinel.current && sentinel.current.closest(".n-scroll");
    if (!root) return;
    const check = () => {
      if (root.scrollTop + root.clientHeight >= root.scrollHeight - 320) {
        setShown((s) => (s < items.length ? Math.min(items.length, s + 9) : s));
      }
    };
    root.addEventListener("scroll", check, { passive: true });
    const id = setTimeout(check, 0);   // por si el contenido ya cabe
    return () => { root.removeEventListener("scroll", check); clearTimeout(id); };
  }, [items.length, sort, dietFilter, shown]);

  let vis = items.slice(0, shown);
  while (vis.length && vis[vis.length - 1].kind === "phase") vis = vis.slice(0, -1);
  const hasMore = vis.length < items.length;
  let days = _diaryAll();
  if (dietFilter) days = days.filter((d) => d.dietSlug === dietFilter);
  const adhAvg = days.length ? Math.round(days.reduce((a, d) => a + d.adh, 0) / days.length) : 0;
  const sortLabel = (DIARY_FEED_SORTS.find((s) => s.id === sort) || DIARY_FEED_SORTS[0]).label;
  const dietName = dietFilter && typeof vxDietBySlug === "function" ? vxDietBySlug(dietFilter).name.split(" · ")[0] : null;

  return (
    <>
      <div className="n-diaryhead">
        <div className="n-diaryhead__count">{days.length} días · {adhAvg}% adherencia media</div>
        <div className="n-diaryhead__sub">{dietName ? "Tu diario de " + dietName + "." : "Todo tu diario, por dieta."}</div>
      </div>
      <div className="n-fbar">
        <button className={"n-fbtn" + (dietFilter ? " is-on" : "")} onClick={onOpenDiet}><NIcon_layers size={15} /> {dietName || "Todas las dietas"}</button>
        <button className="n-fbtn" onClick={onOpenSort}><NIcon_sort size={15} /> {sortLabel}</button>
      </div>
      {dietFilter && (
        <div className="n-actchips">
          <button className="n-actchip" onClick={onClearDiet}>{dietName} <Icon.x size={11} /></button>
        </div>
      )}
      <div className="n-diary">
        {vis.map((it) =>
          it.kind === "phase" ? <NDiaryPhaseHeader key={"p" + it.g.dietSlug} g={it.g} />
          : it.kind === "flathdr" ? <div key="fh" className="n-feedflat">{it.n} días · por {sortLabel.toLowerCase()}</div>
          : <NDiaryRow key={it.d.slug} d={it.d} />,
        )}
      </div>
      <div ref={sentinel} className="n-feedend">{hasMore && <span className="n-feedspin" />}</div>
    </>
  );
}

function NDiarySortSheet({ value, onPick, onClose }) {
  return (
    <NSheetShell title="Ordenar por" onClose={onClose}>
      <div className="n-sortlist">
        {DIARY_FEED_SORTS.map((s) => (
          <button key={s.id} className={"n-sortrow" + (s.id === value ? " is-on" : "")} onClick={() => { onPick(s.id); onClose(); }}>
            <div>
              <div className="n-sortrow__l">{s.label}</div>
              <div className="n-sortrow__h">{s.hint}</div>
            </div>
            {s.id === value && <span className="n-sortrow__c"><Icon.check size={16} /></span>}
          </button>
        ))}
      </div>
    </NSheetShell>
  );
}

function NDiaryDietSheet({ value, onPick, onClose }) {
  const diets = _diets();
  return (
    <NSheetShell title="Filtrar por dieta" onClose={onClose}>
      <div className="n-sortlist">
        <button className={"n-sortrow" + (!value ? " is-on" : "")} onClick={() => { onPick(null); onClose(); }}>
          <div>
            <div className="n-sortrow__l">Todas las dietas</div>
            <div className="n-sortrow__h">El diario completo, por fase</div>
          </div>
          {!value && <span className="n-sortrow__c"><Icon.check size={16} /></span>}
        </button>
        {diets.map((d) => (
          <button key={d.slug} className={"n-sortrow" + (value === d.slug ? " is-on" : "")} onClick={() => { onPick(d.slug); onClose(); }}>
            <div>
              <div className="n-sortrow__l">{d.name.split(" · ")[0]}</div>
              <div className="n-sortrow__h">{d.state === "active" ? "Activa" : "Cerrada"} · {d.days} días</div>
            </div>
            {value === d.slug && <span className="n-sortrow__c"><Icon.check size={16} /></span>}
          </button>
        ))}
      </div>
    </NSheetShell>
  );
}

function DiarioView({ model, range, setRange, metric, setMetric, diarySort, onOpenDiarySort, diaryDiet, setDiaryDiet, onOpenDiaryDiet }) {
  const { diary, empty, fresh } = model;
  const [metricOpen, setMetricOpen] = React.useState(false);
  const [periodOpen, setPeriodOpen] = React.useState(false);

  if (empty || fresh) {
    return (
      <div className="n-emptynote">
        <NBubble color="var(--vx-fg-3)" bg="rgba(255,255,255,0.06)" size={48}><NIcon.utensils size={22} /></NBubble>
        <div className="n-emptynote__t">{fresh ? "Aún sin días registrados" : "Sin registros todavía"}</div>
        <div className="n-emptynote__d">A medida que sigas tu dieta, verxion irá calculando tu adherencia y la verás aquí en tendencia.</div>
      </div>
    );
  }

  const m = DIARY_METRICS.find((x) => x.id === metric);
  const metricOpts = DIARY_METRICS.map((x) => ({ id: x.id, label: x.label, long: x.label }));
  const rangeOpts = DIARY_RANGES.map((r) => ({ id: r.id, label: r.label, long: r.long }));
  const series = DIARY_SERIES[metric][range];
  const points = series.map((v, i) => ({ l: DIARY_LABELS[range][i], v }));
  const avg = Math.round(series.reduce((a, b) => a + b, 0) / series.length);
  const delta = series[series.length - 1] - series[0];
  const per = DIARY_PERIOD[range];
  const adhAvg = Math.round(DIARY_SERIES.adherencia[range].reduce((a, b) => a + b, 0) / DIARY_SERIES.adherencia[range].length);
  const kcalAvg = Math.round(DIARY_SERIES.kcal[range].reduce((a, b) => a + b, 0) / DIARY_SERIES.kcal[range].length);

  // analítica = tendencia de la dieta EN CURSO; al filtrar a una dieta pasada
  // se oculta y el segmento se lee como "el log de esa dieta".
  const activeSlug = (typeof vxActiveDiet === "function") ? vxActiveDiet().slug : null;
  const showAnalytics = !diaryDiet || diaryDiet === activeSlug;

  return (
    <>
      {showAnalytics && (<>
      <div className="n-anhead">
        <span className="n-anhead__k">Análisis</span>
        <div className="n-selgroup">
          <MenuSelect value={metric} options={metricOpts} onChange={setMetric} align="left"
            open={metricOpen} setOpen={(v) => { setMetricOpen(v); if (v) setPeriodOpen(false); }} />
          <MenuSelect value={range} options={rangeOpts} onChange={setRange} align="right"
            open={periodOpen} setOpen={(v) => { setPeriodOpen(v); if (v) setMetricOpen(false); }} />
        </div>
      </div>

      <div className="n-chartcard">
        <div className="n-chartcard__head">
          <div className="n-big">
            <div className="n-big__v">{nInt(avg)}<em>{m.unit}</em></div>
            <div className="n-big__l">{m.label} media · {DIARY_RANGES.find((r) => r.id === range).label}</div>
            <div className={"n-big__delta " + (delta >= 0 ? "is-up" : "is-down")}>
              <NIcon.trendUp size={11} style={delta < 0 ? { transform: "scaleY(-1)" } : null} /> {delta >= 0 ? "+" : ""}{nInt(delta)}{m.unit} en el periodo
            </div>
          </div>
        </div>
        <div className="n-chart"><NDiaryChart points={points} color={m.color} unit={m.unit} goal={m.goal} /></div>
        <div className="n-anote"><Isotype size={13} glow /> verxion calcula tu adherencia a partir de tu plan y de cómo cierras cada día.</div>
      </div>

      <div className="n-kpis">
        <div className="n-kpi"><div className="n-kpi__v">{adhAvg}<em>%</em></div><div className="n-kpi__l">Adherencia</div></div>
        <div className="n-kpi"><div className="n-kpi__v">{per.on}</div><div className="n-kpi__l">En objetivo</div></div>
        <div className="n-kpi"><div className="n-kpi__v n-kpi__v--hot">{per.streak}</div><div className="n-kpi__l">Racha (días)</div></div>
        <div className="n-kpi"><div className="n-kpi__v">{nInt(kcalAvg)}</div><div className="n-kpi__l">Kcal media</div></div>
      </div>
      </>)}

      <NDiaryFeed sort={diarySort} onOpenSort={onOpenDiarySort}
        dietFilter={diaryDiet} onOpenDiet={onOpenDiaryDiet} onClearDiet={() => setDiaryDiet(null)} />
    </>
  );
}

// ── ALIMENTOS — biblioteca con búsqueda / filtro / orden (paralelo Ejercicios)
const FOOD_FILTER_DEFAULT = { q: "", groups: [], leads: [], tipo: "all", estado: "all", sort: "recientes" };
const FOOD_SORTS = [
  { id: "recientes", label: "Recientes", hint: "Lo último que registraste primero" },
  { id: "usados",    label: "Más usados", hint: "Por número de registros" },
  { id: "kcal",      label: "Calorías", hint: "De más a menos kcal por ración" },
  { id: "proteina",  label: "Proteína", hint: "Mayor proteína por ración" },
  { id: "az",        label: "Alfabético", hint: "De la A a la Z" },
];
const FOOD_LEADS = [{ id: "p", label: "Proteína" }, { id: "c", label: "Carbos" }, { id: "f", label: "Grasa" }];
const FOOD_TIPOS = [{ id: "all", label: "Todos" }, { id: "oficial", label: "Oficiales" }, { id: "custom", label: "Personalizados" }, { id: "receta", label: "Recetas" }];
const FOOD_ESTADOS = [{ id: "all", label: "Todos" }, { id: "fav", label: "Favoritos" }, { id: "used", label: "Registrados" }, { id: "todo", label: "Sin registrar" }];

function foodFilterCount(f) {
  return f.groups.length + f.leads.length + (f.tipo !== "all" ? 1 : 0) + (f.estado !== "all" ? 1 : 0);
}
function foodFilterSort(list, f) {
  const order = (typeof VX_FOOD_GROUPS !== "undefined") ? VX_FOOD_GROUPS : [];
  let r = list.filter((fd) => {
    if (f.q) {
      const q = f.q.toLowerCase();
      if (![fd.name, fd.cat, fd.group].some((s) => (s || "").toLowerCase().includes(q))) return false;
    }
    if (f.groups.length && !f.groups.includes(fd.group)) return false;
    if (f.leads.length && !f.leads.includes(fd.lead)) return false;
    if (f.tipo === "oficial" && (fd.kind === "recipe" || fd.custom)) return false;
    if (f.tipo === "custom" && !fd.custom) return false;
    if (f.tipo === "receta" && fd.kind !== "recipe") return false;
    if (f.estado === "fav" && !fd.fav) return false;
    if (f.estado === "used" && !fd.used) return false;
    if (f.estado === "todo" && fd.used) return false;
    return true;
  });
  const az = (a, b) => a.name.localeCompare(b.name, "es");
  r = r.slice().sort((a, b) => {
    if (f.sort === "az") return az(a, b);
    if (f.sort === "usados") return (b.logs - a.logs) || az(a, b);
    if (f.sort === "kcal") return (b.kcal - a.kcal) || az(a, b);
    if (f.sort === "proteina") return (b.p - a.p) || az(a, b);
    const al = a.lastDays == null ? 1e9 : a.lastDays, bl = b.lastDays == null ? 1e9 : b.lastDays;
    return (al - bl) || az(a, b);
  });
  return r;
}
function toggleInN(arr, v) { return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]; }

function FoodMacroDots({ food }) {
  // mini desglose P·C·G como pastilla de barras
  const total = food.p + food.c + food.f || 1;
  return (
    <div className="n-fmacro">
      {food.macros.map((m) => (
        <span key={m.key} className="n-fmacro__seg" title={m.label}>
          <span className="n-fmacro__bar" style={{ width: Math.max(8, (m.g / total) * 100) + "%", background: m.color }} />
          <em style={{ color: m.color }}>{Math.round(m.g)}</em>
        </span>
      ))}
    </div>
  );
}

function AlimentosView({ model, f, setF, onOpenFilter, onOpenSort }) {
  const list = foodFilterSort(model.foods, f);
  const nFilters = foodFilterCount(f);
  const sortLabel = (FOOD_SORTS.find((s) => s.id === f.sort) || FOOD_SORTS[0]).label;
  const total = model.foods.length;
  const nRecipes = model.foods.filter((x) => x.kind === "recipe").length;

  // chips de acceso rápido (un toque) — sincronizados con tipo/estado de la hoja
  const QUICK = [
    { id: "todos", label: "Todos", apply: { tipo: "all", estado: "all" } },
    { id: "recetas", label: "Recetas", n: nRecipes, apply: { tipo: "receta", estado: "all" } },
    { id: "favoritos", label: "Favoritos", apply: { tipo: "all", estado: "fav" } },
    { id: "oficiales", label: "Oficiales", apply: { tipo: "oficial", estado: "all" } },
    { id: "personalizados", label: "Tuyos", apply: { tipo: "custom", estado: "all" } },
  ];
  const quickOn = f.tipo === "receta" ? "recetas"
    : f.tipo === "oficial" ? "oficiales"
    : f.tipo === "custom" ? "personalizados"
    : f.estado === "fav" ? "favoritos"
    : (f.tipo === "all" && f.estado === "all") ? "todos" : null;

  // chips removibles solo para selecciones de la hoja (categoría / macro)
  const active = [];
  f.groups.forEach((g) => active.push({ k: "g:" + g, label: g, off: () => setF({ groups: f.groups.filter((x) => x !== g) }) }));
  f.leads.forEach((l) => active.push({ k: "l:" + l, label: FOOD_LEADS.find((x) => x.id === l).label, off: () => setF({ leads: f.leads.filter((x) => x !== l) }) }));

  return (
    <>
      <div className="n-searchbar">
        <NIcon_search size={16} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
        <input className="n-searchbar__in" placeholder="Buscar alimento o receta" value={f.q} onChange={(e) => setF({ q: e.target.value })} />
        {f.q && <button className="n-searchbar__x" aria-label="Limpiar" onClick={() => setF({ q: "" })}><Icon.x size={14} /></button>}
      </div>

      <div className="n-quick">
        {QUICK.map((q) => (
          <button key={q.id} className={"n-qchip" + (quickOn === q.id ? " is-on" : "") + (q.id === "recetas" ? " n-qchip--recipe" : "")} onClick={() => setF(q.apply)}>
            {q.id === "recetas" && <NIcon_chef size={13} />}
            {q.label}
            {q.n != null && <span className="n-qchip__n">{q.n}</span>}
          </button>
        ))}
      </div>

      <div className="n-fbar">
        <button className={"n-fbtn" + (nFilters ? " is-on" : "")} onClick={onOpenFilter}>
          <NIcon_funnel size={15} /> Filtros{nFilters > 0 && <span className="n-fbtn__badge">{nFilters}</span>}
        </button>
        <button className="n-fbtn" onClick={onOpenSort}><NIcon_sort size={15} /> {sortLabel}</button>
      </div>

      {active.length > 0 && (
        <div className="n-actchips">
          {active.map((a) => (
            <button key={a.k} className="n-actchip" onClick={a.off}>{a.label} <Icon.x size={11} /></button>
          ))}
          <button className="n-actchip n-actchip--clear" onClick={() => setF({ groups: [], leads: [] })}>Limpiar</button>
        </div>
      )}

      <div className="n-section">{list.length} {quickOn === "recetas" ? (list.length === 1 ? "receta" : "recetas") : (list.length === 1 ? "alimento" : "alimentos")}{list.length !== total ? ` · de ${total}` : ""}</div>

      {list.length === 0 ? (
        <div className="n-noresults">
          <NIcon_search size={26} style={{ color: "rgba(255,255,255,0.3)" }} />
          <div className="n-noresults__t">Sin resultados</div>
          <div className="n-noresults__b">Prueba a quitar algún filtro o cambiar la búsqueda.</div>
        </div>
      ) : (
        <div className="n-foodlist">
          {list.map((fd) => {
            const isRecipe = fd.kind === "recipe";
            return (
              <div className={"n-food" + (fd.used ? "" : " is-todo")} key={fd.slug}
                onClick={() => vxNav(VX.ALIMENTO, { item: fd.slug })} style={{ cursor: "pointer" }}>
                <NBubble color={isRecipe ? "var(--vx-lava)" : fd.pal.color} bg={isRecipe ? "var(--vx-lava-bg)" : fd.pal.bg} size={38}>
                  {isRecipe ? <NIcon_chef size={18} /> : fd.pal.short}
                </NBubble>
                <div className="n-food__body">
                  <div className="n-food__name">
                    {fd.name}
                    {isRecipe && <span className="n-food__recipe">Receta</span>}
                    {fd.fav && <NIcon_star size={12} style={{ color: "var(--vx-neutral)", marginLeft: 6, verticalAlign: "-1px" }} />}
                    {fd.custom && !isRecipe && <span className="n-food__cust">Personalizado</span>}
                  </div>
                  <div className="n-food__meta">{Math.round(fd.kcal)} kcal · {fd.serv} · {fd.cat}</div>
                </div>
                <div className="n-food__right"><FoodMacroDots food={fd} /></div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
// alias de iconos usados arriba (definidos en NIcon de nutricion-core + extras locales)
const NIcon_search = (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Svg>;
const NIcon_funnel = (p) => <Svg {...p}><path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" /></Svg>;
const NIcon_sort   = (p) => <Svg {...p}><path d="M7 4v16M7 20l-3-3M7 4l3 3M17 20V4M17 4l-3 3M17 20l3-3" /></Svg>;
const NIcon_star   = (p) => <Svg {...p}><path d="M12 3l2.6 5.6 6 .7-4.5 4 1.3 6L12 16.8 6.6 19.3l1.3-6-4.5-4 6-.7L12 3Z" /></Svg>;
const NIcon_chef   = (p) => <Svg {...p}><path d="M7 21h10M6 16h12M8 16V9a4 4 0 1 1 5-3.9A3.5 3.5 0 1 1 16 9v7" /></Svg>;
const NIcon_chevdown = (p) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>;
const NIcon_layers = (p) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" /></Svg>;

// select pull-down nativo (reutilizable: métrica y periodo)
function MenuSelect({ value, options, onChange, open, setOpen, align = "left" }) {
  const cur = options.find((o) => o.id === value) || options[0];
  return (
    <div className="n-sel">
      <button className={"n-rpick" + (open ? " is-open" : "")} onClick={() => setOpen(!open)}>
        {cur.label}<NIcon_chevdown size={15} />
      </button>
      {open && (
        <>
          <div className="n-rmenu__back" onClick={() => setOpen(false)} />
          <div className={"n-rmenu n-rmenu--" + align}>
            {options.map((o) => (
              <button key={o.id} className={"n-rmenu__b" + (o.id === value ? " is-on" : "")}
                onClick={() => { onChange(o.id); setOpen(false); }}>
                <span>{o.long || o.label}</span>
                {o.id === value && <Icon.check size={15} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── hojas modales (filtro / orden) ───────────────────────────────────────────
function NSheetShell({ title, onClose, children, foot }) {
  return (
    <div className="n-scrim" onClick={onClose}>
      <div className="n-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="n-sheet__grab" />
        <div className="n-sheet__head">
          <span className="n-sheet__title">{title}</span>
          <button className="n-sheet__close" aria-label="Cerrar" onClick={onClose}><Icon.x size={18} /></button>
        </div>
        <div className="n-sheet__body">{children}</div>
        {foot}
      </div>
    </div>
  );
}
function NChipGroup({ options, selected, onToggle, labelFor }) {
  return (
    <div className="n-fchips">
      {options.map((o) => {
        const id = typeof o === "string" ? o : o.id;
        const label = typeof o === "string" ? o : o.label;
        return (
          <button key={id} className={"n-fchip" + (selected.includes(id) ? " is-on" : "")} onClick={() => onToggle(id)}>
            {selected.includes(id) && <Icon.check size={12} />} {label}
          </button>
        );
      })}
    </div>
  );
}
function NSegRow({ options, value, onChange }) {
  return (
    <div className="n-seg2">
      {options.map((o) => (
        <button key={o.id} className={"n-seg2__b" + (o.id === value ? " is-on" : "")} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}
function NFilterSheet({ f, setF, count, onClose }) {
  const nActive = foodFilterCount(f);
  return (
    <NSheetShell title="Filtros" onClose={onClose}
      foot={
        <div className="n-sheet__foot">
          {nActive > 0 && <button className="n-sheet__clear" onClick={() => setF({ groups: [], leads: [], tipo: "all", estado: "all" })}>Limpiar todo</button>}
          <button className="n-sheet__cta" onClick={onClose}>Ver {count} {count === 1 ? "alimento" : "alimentos"}</button>
        </div>
      }>
      <div className="n-sheet__sec">
        <div className="n-sheet__seclbl">Categoría</div>
        <NChipGroup options={VX_FOOD_GROUPS} selected={f.groups} onToggle={(g) => setF({ groups: toggleInN(f.groups, g) })} />
      </div>
      <div className="n-sheet__sec">
        <div className="n-sheet__seclbl">Macro dominante</div>
        <NChipGroup options={FOOD_LEADS} selected={f.leads} onToggle={(l) => setF({ leads: toggleInN(f.leads, l) })} />
      </div>
      <div className="n-sheet__sec">
        <div className="n-sheet__seclbl">Tipo</div>
        <NSegRow options={FOOD_TIPOS} value={f.tipo} onChange={(v) => setF({ tipo: v })} />
      </div>
      <div className="n-sheet__sec">
        <div className="n-sheet__seclbl">Estado</div>
        <NSegRow options={FOOD_ESTADOS} value={f.estado} onChange={(v) => setF({ estado: v })} />
      </div>
    </NSheetShell>
  );
}
function NSortSheet({ f, setF, onClose }) {
  return (
    <NSheetShell title="Ordenar por" onClose={onClose}>
      <div className="n-sortlist">
        {FOOD_SORTS.map((s) => (
          <button key={s.id} className={"n-sortrow" + (s.id === f.sort ? " is-on" : "")} onClick={() => { setF({ sort: s.id }); onClose(); }}>
            <div>
              <div className="n-sortrow__l">{s.label}</div>
              <div className="n-sortrow__h">{s.hint}</div>
            </div>
            {s.id === f.sort && <span className="n-sortrow__c"><Icon.check size={16} /></span>}
          </button>
        ))}
      </div>
    </NSheetShell>
  );
}

// ── selector segmentado ───────────────────────────────────────────────────────
const N_SEGMENTS = [
  { id: "plan", label: "Plan" },
  { id: "diario", label: "Diario" },
  { id: "alimentos", label: "Alimentos" },
];
function NSelector({ active, onSelect }) {
  const idx = Math.max(0, N_SEGMENTS.findIndex((s) => s.id === active));
  return (
    <div className="n-seg">
      <div className="n-seg__thumb" style={{ left: `calc(3px + ${idx} * (100% - 6px) / 3)`, width: "calc((100% - 6px) / 3)" }} />
      {N_SEGMENTS.map((s) => (
        <button key={s.id} className={"n-seg__btn" + (s.id === active ? " is-on" : "")} onClick={() => onSelect(s.id)}>{s.label}</button>
      ))}
    </div>
  );
}

// ── tab bar ────────────────────────────────────────────────────────────────────
const N_TABS = [
  { id: "hoy", label: "Hoy", icon: Icon.flame },
  { id: "entreno", label: "Entreno", icon: Icon.dumbbell },
  { id: "nutricion", label: "Nutrición", icon: Icon.leaf },
  { id: "progreso", label: "Progreso", icon: Icon.lineChart },
];
function NTabBar({ active = "nutricion" }) {
  const dest = { hoy: VX.HOY, entreno: VX.ENTRENO, nutricion: VX.NUTRICION, progreso: VX.PROGRESO };
  return (
    <div className="n-tabbar">
      {N_TABS.map((tb) => (
        <div key={tb.id} className={"n-tab" + (tb.id === active ? " is-active" : "")}
          onClick={() => dest[tb.id] && tb.id !== active ? vxNav(dest[tb.id]) : undefined}
          style={{ cursor: dest[tb.id] && tb.id !== active ? "pointer" : "default" }}>
          <span className="n-tab__icon">{tb.icon({ size: 23 })}</span>
          <span className="n-tab__label">{tb.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── composición de pantalla ─────────────────────────────────────────────────────
function NutricionScreen({ t, onSelect }) {
  const model = buildNutricion(t);
  const { segment, empty } = model;
  const [f, setFRaw] = React.useState(FOOD_FILTER_DEFAULT);
  const [sheet, setSheet] = React.useState(null);
  const [diaryRange, setDiaryRange] = React.useState("semana");
  const [diaryMetric, setDiaryMetric] = React.useState("adherencia");
  const [diarySort, setDiarySort] = React.useState("reciente");
  const [diaryDiet, setDiaryDiet] = React.useState(t.dieta || null);
  const setF = (patch) => setFRaw((prev) => ({ ...prev, ...patch }));

  let body;
  if (segment === "diario") {
    body = <div className="n-pad"><DiarioView model={model}
      range={diaryRange} setRange={setDiaryRange} metric={diaryMetric} setMetric={setDiaryMetric}
      diarySort={diarySort} onOpenDiarySort={() => setSheet("diario-orden")}
      diaryDiet={diaryDiet} setDiaryDiet={setDiaryDiet} onOpenDiaryDiet={() => setSheet("diario-dieta")} /></div>;
  } else if (segment === "alimentos") {
    body = <div className="n-pad"><AlimentosView model={model} f={f} setF={setF}
      onOpenFilter={() => setSheet("filtros")} onOpenSort={() => setSheet("orden")} /></div>;
  } else if (empty) {
    body = <div className="n-pad"><NEmptyInvite /></div>;
  } else {
    body = (
      <div className="n-pad">
        <DietHero model={model} />
        <TodayIntake model={model} />
        <HydrationCard model={model} />
        <div className="n-sectionrow n-section--sp">
          <span className="n-section" style={{ padding: 0 }}>El día · tus comidas</span>
          <button className="n-seclink" onClick={() => vxNav(VX.PLAN_COMIDAS)}>Plan completo <Icon.chevronRight size={13} /></button>
        </div>
        <MealSpine model={model} />
        <NAgentEdit />
      </div>
    );
  }

  return (
    <div className="n-screen">
      <div className="n-scroll">
        <div className="n-head">
          <div className="n-headrow">
            <div className="n-title">Nutrición</div>
            {segment === "plan" && !empty && (
              <button className="n-headbtn" aria-label="Todas tus dietas" onClick={() => vxNav(VX.DIETAS)}>
                <NIcon_layers size={20} />
              </button>
            )}
          </div>
          <NSelector active={segment} onSelect={onSelect} />
        </div>
        {body}
      </div>
      <NTabBar active="nutricion" />
      {sheet === "filtros" && <NFilterSheet f={f} setF={setF} count={foodFilterSort(model.foods, f).length} onClose={() => setSheet(null)} />}
      {sheet === "orden" && <NSortSheet f={f} setF={setF} onClose={() => setSheet(null)} />}
      {sheet === "diario-orden" && <NDiarySortSheet value={diarySort} onPick={setDiarySort} onClose={() => setSheet(null)} />}
      {sheet === "diario-dieta" && <NDiaryDietSheet value={diaryDiet} onPick={setDiaryDiet} onClose={() => setSheet(null)} />}
    </div>
  );
}

Object.assign(window, {
  DiarioView, AlimentosView, foodFilterSort, foodFilterCount,
  NFilterSheet, NSortSheet, NSheetShell, NSelector, NTabBar, NutricionScreen,
  FOOD_FILTER_DEFAULT,
});
