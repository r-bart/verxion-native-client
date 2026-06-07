// dietas-core.jsx — "Dietas": la biblioteca de dietas que el agente ha armado,
// agrupada por estado (activa · archivo). Espejo de "Todas las rutinas". Solo lee:
// crear/activar una dieta lo hace el agente — aquí se enmarca como petición.
// buildDietas(t). Usa dietas-data.jsx.

const DzIcon = {
  target:   (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  utensils: (p) => <Svg {...p}><path d="M4 3v6a2 2 0 0 0 2 2v10M6 3v8M9 3v6a2 2 0 0 1-2 2M18 3c-1.5 1-2 3-2 5s.5 3 2 3v10" /></Svg>,
  trendUp:  (p) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" /></Svg>,
  trophy:   (p) => <Svg {...p}><path d="M6 4h12v3a6 6 0 0 1-12 0V4ZM6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 17h6M10 17v-2.3M14 17v-2.3M8 21h8" /></Svg>,
  search:   (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Svg>,
  sort:     (p) => <Svg {...p}><path d="M7 4v16M7 20l-3-3M7 4l3 3M17 20V4M17 4l-3 3M17 20l3-3" /></Svg>,
};

const DZ_SORTS = [
  { id: "recientes", label: "Recientes", hint: "La activa primero, luego por fecha" },
  { id: "nombre", label: "Alfabético", hint: "De la A a la Z" },
  { id: "adherencia", label: "Adherencia", hint: "Mejor cumplimiento primero" },
  { id: "kcal", label: "Calorías", hint: "De más a menos kcal/día" },
];
const dzN = (n) => Number(Math.round(n)).toLocaleString("de-DE");

function dzFilterSort(list, q, sort) {
  let r = list.filter((d) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return [d.name, DZ_GOAL[d.goal].tag, d.macroSplit].some((x) => (x || "").toLowerCase().includes(s));
  });
  const byName = (a, b) => a.name.localeCompare(b.name, "es");
  if (sort === "nombre") r = r.slice().sort(byName);
  else if (sort === "adherencia") r = r.slice().sort((a, b) => b.adherence - a.adherence || byName(a, b));
  else if (sort === "kcal") r = r.slice().sort((a, b) => b.kcalGoal - a.kcalGoal || byName(a, b));
  return r; // recientes = orden del catálogo
}

function DzBubble({ color, bg, size = 44, glow, children }) {
  return (
    <span className="dz-bubble" style={{ width: size, height: size, color, background: bg,
      boxShadow: glow ? `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 22px ${glow}` : undefined }}>{children}</span>
  );
}

function DzScoreChip({ state }) {
  const cls = { ahead: "ahead", on: "on", behind: "behind" }[state] || "on";
  const word = state === "ahead" ? "Vas adelantado" : state === "behind" ? "Vas justo" : "En objetivo";
  return <span className={"dz-score is-" + cls}>{state === "ahead" && <DzIcon.trendUp size={11} />}{word}</span>;
}

// ── tarjeta grande (activa) ────────────────────────────────────────────────
function DietCard({ diet, onOpen }) {
  const cfg = DZ_GOAL[diet.goal], st = DZ_STATE[diet.state];
  const isActive = diet.state === "active";
  return (
    <button className={"dz-card dz-card--" + diet.state} onClick={onOpen}>
      <div className="dz-card__top">
        <span className="dz-eyebrow" style={{ color: st.color }}>
          {isActive && <span className="dz-livedot" />}{st.short}
        </span>
        <span className="dz-card__per">{diet.macroSplit.split(" · ")[0]}</span>
      </div>
      <div className="dz-card__row">
        <DzBubble color={cfg.color} bg={cfg.bg} size={46} glow={cfg.glow}>{cfg.icon({ size: 23 })}</DzBubble>
        <div className="dz-card__id">
          <div className="dz-card__name">{diet.name}</div>
          <div className="dz-card__tags">
            <span className="dz-tag" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.color + "55" }}><DzIcon.target size={11} /> {cfg.tag}</span>
          </div>
        </div>
      </div>
      <div className="dz-card__foot">
        <div className="dz-foot__head">
          <span className="dz-foot__lbl">Semana <b>{diet.week}</b> de {diet.weeks}</span>
          <DzScoreChip state={diet.scoreState} />
        </div>
        <div className="dz-cells">
          {Array.from({ length: diet.weeks }).map((_, i) => {
            const cls = i < diet.week - 1 ? "is-done" : i === diet.week - 1 ? "is-now" : "";
            return <span key={i} className={"dz-cell " + cls} />;
          })}
        </div>
        <div className="dz-foot__meta">
          <span>{dzN(diet.kcalGoal)} kcal · {diet.pGoal} g P</span>
          <span className="dz-foot__adh"><DzIcon.trendUp size={11} /> {diet.adherence}% adh.</span>
        </div>
      </div>
    </button>
  );
}

// ── fila compacta (archivo) ────────────────────────────────────────────────
function DietRow({ diet, onOpen }) {
  const cfg = DZ_GOAL[diet.goal];
  return (
    <button className="dz-row" onClick={onOpen}>
      <DzBubble color={cfg.color} bg={cfg.bg} size={38}>{cfg.icon({ size: 18 })}</DzBubble>
      <div className="dz-row__body">
        <div className="dz-row__name">{diet.name}</div>
        <div className="dz-row__meta">{cfg.tag} · hasta {diet.finished}</div>
      </div>
      <span className="dz-row__done"><DzIcon.trophy size={10} /> {diet.adherence}%</span>
      <Icon.chevronRight size={16} style={{ color: "rgba(255,255,255,0.28)", flexShrink: 0 }} />
    </button>
  );
}

function DzAskAgent() {
  return (
    <button className="dz-ask" onClick={() => vxNav(VX.AGENTE, { caso: "inicio" })}>
      <span className="dz-ask__iso"><Isotype size={22} glow /></span>
      <div className="dz-ask__body">
        <div className="dz-ask__label">Pídele a verxion una dieta nueva</div>
        <div className="dz-ask__hint">Las dietas las arma y activa el agente — descríbele tu objetivo y aparecerá aquí.</div>
      </div>
      <span className="dz-ask__c">›</span>
    </button>
  );
}

function DzSearchBar({ q, setQ }) {
  return (
    <div className="dz-searchbar">
      <DzIcon.search size={16} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
      <input className="dz-searchbar__in" placeholder="Buscar dieta u objetivo" value={q} onChange={(e) => setQ(e.target.value)} />
      {q && <button className="dz-searchbar__x" aria-label="Limpiar" onClick={() => setQ("")}><Icon.x size={14} /></button>}
    </div>
  );
}

function DzSortSheet({ value, onPick, onClose }) {
  return (
    <div className="dz-scrim" onClick={onClose}>
      <div className="dz-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="dz-sheet__grab" />
        <div className="dz-sheet__head">
          <span className="dz-sheet__title">Ordenar por</span>
          <button className="dz-sheet__close" aria-label="Cerrar" onClick={onClose}><Icon.x size={18} /></button>
        </div>
        <div className="dz-sortlist">
          {DZ_SORTS.map((s) => (
            <button key={s.id} className={"dz-sortrow" + (s.id === value ? " is-on" : "")} onClick={() => { onPick(s.id); onClose(); }}>
              <div>
                <div className="dz-sortrow__l">{s.label}</div>
                <div className="dz-sortrow__h">{s.hint}</div>
              </div>
              {s.id === value && <span className="dz-sortrow__c"><Icon.check size={16} /></span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── pantalla ────────────────────────────────────────────────────────────────
function DietasScreen({ t }) {
  const all = VX_DIETS;
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState((t && t.orden) || "recientes");
  const [sheet, setSheet] = React.useState(false);
  const open = (d) => vxNav(VX.DIETA, { dieta: d.slug });
  const searching = !!q || sort !== "recientes";
  const results = dzFilterSort(all, q, sort);
  const sortLabel = (DZ_SORTS.find((s) => s.id === sort) || DZ_SORTS[0]).label;

  const active = all.filter((d) => d.state === "active");
  const completed = all.filter((d) => d.state === "completed");

  return (
    <div className="dz-screen">
      <div className="dz-scroll">
        <div className="dz-chrome">
          <button className="dz-chrome__btn" aria-label="Volver" onClick={() => vxNav(VX.NUTRICION, { segment: "plan" })}><Icon.chevronLeft size={20} /></button>
          <div className="dz-chrome__title">Dietas</div>
          <div className="dz-chrome__spacer" aria-hidden="true" />
        </div>

        <div className="dz-pad">
          <div className="dz-lead">
            <div className="dz-lead__count">{all.length} dietas</div>
            <div className="dz-lead__sub">Tu dieta activa y el archivo de planes que ya has completado.</div>
          </div>

          <DzSearchBar q={q} setQ={setQ} />
          <div className="dz-fbar">
            <button className="dz-fbtn" onClick={() => setSheet(true)}><DzIcon.sort size={15} /> {sortLabel}</button>
          </div>

          {searching ? (
            <>
              <div className="dz-sec">{results.length} {results.length === 1 ? "resultado" : "resultados"}{results.length !== all.length ? ` · de ${all.length}` : ""}</div>
              {results.length === 0 ? (
                <div className="dz-noresults">
                  <DzIcon.search size={26} style={{ color: "rgba(255,255,255,0.3)" }} />
                  <div className="dz-noresults__t">Sin resultados</div>
                  <div className="dz-noresults__b">Prueba a cambiar la búsqueda o el orden.</div>
                </div>
              ) : (
                <div className="dz-stack">
                  {results.map((d) => d.state === "active"
                    ? <DietCard key={d.slug} diet={d} onOpen={() => open(d)} />
                    : <DietRow key={d.slug} diet={d} onOpen={() => open(d)} />)}
                </div>
              )}
            </>
          ) : (
            <>
              {active.length > 0 && <div className="dz-sec">En curso</div>}
              <div className="dz-stack">
                {active.map((d) => <DietCard key={d.slug} diet={d} onOpen={() => open(d)} />)}
              </div>
              {completed.length > 0 && <div className="dz-sec dz-sec--sp">Archivo · completadas</div>}
              <div className="dz-rows">
                {completed.map((d) => <DietRow key={d.slug} diet={d} onOpen={() => open(d)} />)}
              </div>
            </>
          )}

          <DzAskAgent />
        </div>
      </div>

      {sheet && <DzSortSheet value={sort} onPick={setSort} onClose={() => setSheet(false)} />}
    </div>
  );
}

Object.assign(window, {
  DzIcon, DZ_SORTS, dzN, dzFilterSort, DzBubble, DzScoreChip, DietCard, DietRow,
  DzAskAgent, DzSearchBar, DzSortSheet, DietasScreen,
});
