// rutinas-core.jsx — "Todas las rutinas": la biblioteca de rutinas que el agente
// ha armado, agrupada por estado (activa · borrador · pausa · archivo). Solo lee.
// Crear/activar una rutina es cosa del agente — aquí se enmarca como petición.

const RIcon = {
  target:   (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  repeat:   (p) => <Svg {...p}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></Svg>,
  calendar: (p) => <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></Svg>,
  trendUp:  (p) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" /></Svg>,
  bolt:     (p) => <Svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" /></Svg>,
  more:     (p) => <Svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  trophy:   (p) => <Svg {...p}><path d="M6 4h12v3a6 6 0 0 1-12 0V4ZM6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 17h6M10 17v-2.3M14 17v-2.3M8 21h8" /></Svg>,
  pause:    (p) => <Svg {...p}><path d="M8 5v14M16 5v14" /></Svg>,
  search:   (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Svg>,
  funnel:   (p) => <Svg {...p}><path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" /></Svg>,
  sort:     (p) => <Svg {...p}><path d="M7 4v16M7 20l-3-3M7 4l3 3M17 20V4M17 4l-3 3M17 20l3-3" /></Svg>,
};

// ── facetas de filtro / orden ──────────────────────────────────────────────
const RT_STATES = [
  { id: "active", label: "Activa" },
  { id: "completed", label: "Completada" },
];
const RT_SORTS = [
  { id: "recientes", label: "Recientes", hint: "La activa primero, luego por fecha" },
  { id: "nombre", label: "Alfabético", hint: "De la A a la Z" },
  { id: "adherencia", label: "Adherencia", hint: "Mejor cumplimiento primero" },
];
function rtGoals() {
  const seen = [];
  RD_ROUTINES.forEach((r) => { if (!seen.includes(r.goal)) seen.push(r.goal); });
  return seen;
}
const RT_FILTER_DEFAULT = { q: "", states: [], goals: [], sort: "recientes" };
function rtFilterCount(f) { return f.states.length + f.goals.length; }
function rtToggleIn(arr, v) { return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]; }
function rtIsActive(f) { return !!f.q || rtFilterCount(f) > 0 || f.sort !== "recientes"; }
function rtFilterSort(list, f) {
  let r = list.filter((rt) => {
    if (f.q) {
      const q = f.q.toLowerCase();
      if (![rt.name, rt.goal, rt.split].some((s) => (s || "").toLowerCase().includes(q))) return false;
    }
    if (f.states.length && !f.states.includes(rt.state)) return false;
    if (f.goals.length && !f.goals.includes(rt.goal)) return false;
    return true;
  });
  const byName = (a, b) => a.name.localeCompare(b.name, "es");
  if (f.sort === "nombre") r = r.slice().sort(byName);
  else if (f.sort === "adherencia") r = r.slice().sort((a, b) => (b.done / b.planned) - (a.done / a.planned) || byName(a, b));
  return r; // "recientes" = orden del catálogo
}

function RScoreChip({ state }) {
  const cls = { ahead: "ahead", on: "on", behind: "behind" }[state] || "on";
  const word = state === "ahead" ? "Vas adelantado" : state === "behind" ? "Vas justo" : "En objetivo";
  return (
    <span className={"r-score is-" + cls}>
      {state === "ahead" && <RIcon.trendUp size={11} />}
      {word}
    </span>
  );
}

function RBubble({ color, bg, size = 44, glow, children }) {
  return (
    <span className="r-bubble" style={{ width: size, height: size, color, background: bg,
      boxShadow: glow ? `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 22px ${glow}` : undefined }}>{children}</span>
  );
}

function RWeekCells({ week, weeks, nowFrac }) {
  const frac = (typeof nowFrac === "number" && nowFrac > 0 && nowFrac < 1) ? nowFrac : null;
  return (
    <div className="r-cells">
      {Array.from({ length: weeks }).map((_, i) => {
        const cls = i < week - 1 ? "is-done" : i === week - 1 ? "is-now" : "";
        return (
          <span key={i} className={"r-cell " + cls}>
            {cls === "is-now" && frac != null && <span className="r-cell__fill" style={{ width: Math.max(8, frac * 100) + "%" }} />}
          </span>
        );
      })}
    </div>
  );
}

// rep type para el bubble lo provee rutinas-data (rdHeroType, global).

// ── tarjeta grande (activa / borrador / pausa) ─────────────────────────────
function RoutineCard({ routine, onOpen }) {
  const st = RD_STATE[routine.state];
  const type = rdHeroType(routine);
  const cfg = RD_DAY[type];
  const isDraft = routine.state === "draft";
  const isActive = routine.state === "active";
  const isPaused = routine.state === "paused";
  const adherence = Math.round((routine.done / routine.planned) * 100);

  return (
    <button className={"r-card r-card--" + routine.state} onClick={onOpen}>
      <div className="r-card__top">
        <span className="r-eyebrow" style={{ color: st.color }}>
          {isDraft && <Isotype size={12} glow />}
          {isActive && <span className="r-livedot" />}
          {isPaused && <RIcon.pause size={11} />}
          {st.short}
        </span>
        <span className="r-card__per">{routine.perWeek} días/sem</span>
      </div>

      <div className="r-card__row">
        <RBubble color={cfg.color} bg={cfg.bg} size={46} glow={cfg.glow}>{cfg.icon({ size: 23 })}</RBubble>
        <div className="r-card__id">
          <div className="r-card__name">{routine.name}</div>
          <div className="r-card__tags">
            <span className="r-tag"><RIcon.target size={11} /> {routine.goal}</span>
          </div>
        </div>
      </div>

      <div className="r-card__foot">
        {isDraft ? (
          <div className="r-foot__draft">
            <span className="r-foot__lbl">Sin empezar · {routine.weeks} semanas planeadas</span>
            <span className="r-foot__cta" style={{ color: st.color }}>Ver plan ›</span>
          </div>
        ) : (
          <>
            <div className="r-foot__head">
              <span className="r-foot__lbl">{routine.state === "completed" ? <>Completada · {routine.weeks} sem</> : <>Semana <b>{routine.week}</b> de {routine.weeks}</>}</span>
              {routine.state !== "completed" && <RScoreChip state={routine.scoreState} />}
            </div>
            <RWeekCells week={routine.week} weeks={routine.weeks} nowFrac={routine.state === "active" ? routine.weekFrac : null} />
            <div className="r-foot__meta">
              <span>{routine.done}/{routine.planned} sesiones · {adherence}% adherencia</span>
              <span className="r-foot__vol"><RIcon.trendUp size={11} /> +{routine.volTrend}% vol.</span>
            </div>
          </>
        )}
      </div>
    </button>
  );
}

// ── fila compacta (archivo + modo compacto) — sensible al estado ────────────
function RoutineRow({ routine, onOpen }) {
  const type = rdHeroType(routine);
  const cfg = RD_DAY[type];
  const st = RD_STATE[routine.state];
  const isDraft = routine.state === "draft";
  const isCompleted = routine.state === "completed";
  const sub = isDraft ? routine.goal + " · " + routine.weeks + " sem"
    : isCompleted ? routine.goal + " · hasta " + routine.finished
    : routine.goal + " · sem " + routine.week + "/" + routine.weeks;
  return (
    <button className="r-row" onClick={onOpen}>
      <RBubble color={cfg.color} bg={cfg.bg} size={38}>{cfg.icon({ size: 18 })}</RBubble>
      <div className="r-row__body">
        <div className="r-row__name">
          {routine.name}
          {routine.state !== "completed" && <span className="r-row__state" style={{ color: st.color, background: st.bg, borderColor: st.line }}>{st.label}</span>}
        </div>
        <div className="r-row__meta">{sub}</div>
      </div>
      <div className="r-row__right">
        {isDraft
          ? <span className="r-row__draft" style={{ color: st.color }}>Ver plan</span>
          : <>
              <span className="r-row__done"><RIcon.trophy size={10} /> {routine.done}/{routine.planned}</span>
            </>}
      </div>
      <Icon.chevronRight size={16} style={{ color: "rgba(255,255,255,0.28)", flexShrink: 0 }} />
    </button>
  );
}

// ── superficie de "pídeselo al agente" ─────────────────────────────────────
function RAskAgent() {
  return (
    <button className="r-ask" onClick={() => vxNav(VX.AGENTE, { caso: "inicio" })}>
      <span className="r-ask__iso"><Isotype size={22} glow /></span>
      <div className="r-ask__body">
        <div className="r-ask__label">Pídele a verxion una rutina nueva</div>
        <div className="r-ask__hint">Las rutinas las arma y activa el agente — descríbele qué buscas y aparecerá aquí.</div>
      </div>
      <span className="r-ask__c">›</span>
    </button>
  );
}

// ── búsqueda + barra de filtro/orden ────────────────────────────────────────
function RSearchBar({ q, setF }) {
  return (
    <div className="r-searchbar">
      <RIcon.search size={16} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
      <input className="r-searchbar__in" placeholder="Buscar rutina, objetivo o split" value={q}
        onChange={(e) => setF({ q: e.target.value })} />
      {q && <button className="r-searchbar__x" aria-label="Limpiar" onClick={() => setF({ q: "" })}><Icon.x size={14} /></button>}
    </div>
  );
}

function RFilterBar({ f, onOpenFilter, onOpenSort }) {
  const n = rtFilterCount(f);
  const sortLabel = (RT_SORTS.find((s) => s.id === f.sort) || RT_SORTS[0]).label;
  return (
    <div className="r-fbar">
      <button className={"r-fbtn" + (n ? " is-on" : "")} onClick={onOpenFilter}>
        <RIcon.funnel size={15} /> Filtros
        {n > 0 && <span className="r-fbtn__badge">{n}</span>}
      </button>
      <button className="r-fbtn" onClick={onOpenSort}>
        <RIcon.sort size={15} /> {sortLabel}
      </button>
    </div>
  );
}

function RActiveChips({ f, setF }) {
  const chips = [];
  f.states.forEach((s) => chips.push({ k: "s:" + s, label: RT_STATES.find((x) => x.id === s).label, off: () => setF({ states: f.states.filter((x) => x !== s) }) }));
  f.goals.forEach((g) => chips.push({ k: "g:" + g, label: g, off: () => setF({ goals: f.goals.filter((x) => x !== g) }) }));
  if (chips.length === 0) return null;
  return (
    <div className="r-actchips">
      {chips.map((c) => (
        <button key={c.k} className="r-actchip" onClick={c.off}>{c.label} <Icon.x size={11} /></button>
      ))}
      <button className="r-actchip r-actchip--clear" onClick={() => setF({ states: [], goals: [] })}>Limpiar</button>
    </div>
  );
}

// ── hojas inferiores ─────────────────────────────────────────────────────────
function RSheetShell({ title, onClose, children, foot }) {
  return (
    <div className="r-scrim" onClick={onClose}>
      <div className="r-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="r-sheet__grab" />
        <div className="r-sheet__head">
          <span className="r-sheet__title">{title}</span>
          <button className="r-sheet__close" aria-label="Cerrar" onClick={onClose}><Icon.x size={18} /></button>
        </div>
        <div className="r-sheet__body">{children}</div>
        {foot}
      </div>
    </div>
  );
}

function RChipGroup({ options, selected, onToggle }) {
  return (
    <div className="r-fchips">
      {options.map((o) => {
        const id = typeof o === "string" ? o : o.id;
        const label = typeof o === "string" ? o : o.label;
        return (
          <button key={id} className={"r-fchip" + (selected.includes(id) ? " is-on" : "")} onClick={() => onToggle(id)}>
            {selected.includes(id) && <Icon.check size={12} />} {label}
          </button>
        );
      })}
    </div>
  );
}

function RFilterSheet({ f, setF, count, onClose }) {
  const n = rtFilterCount(f);
  return (
    <RSheetShell title="Filtros" onClose={onClose}
      foot={
        <div className="r-sheet__foot">
          {n > 0 && <button className="r-sheet__clear" onClick={() => setF({ states: [], goals: [] })}>Limpiar todo</button>}
          <button className="r-sheet__cta" onClick={onClose}>Ver {count} {count === 1 ? "rutina" : "rutinas"}</button>
        </div>
      }>
      <div className="r-sheet__sec">
        <div className="r-sheet__seclbl">Estado</div>
        <RChipGroup options={RT_STATES} selected={f.states} onToggle={(s) => setF({ states: rtToggleIn(f.states, s) })} />
      </div>
      <div className="r-sheet__sec">
        <div className="r-sheet__seclbl">Objetivo</div>
        <RChipGroup options={rtGoals()} selected={f.goals} onToggle={(g) => setF({ goals: rtToggleIn(f.goals, g) })} />
      </div>
    </RSheetShell>
  );
}

function RSortSheet({ f, setF, onClose }) {
  return (
    <RSheetShell title="Ordenar por" onClose={onClose}>
      <div className="r-sortlist">
        {RT_SORTS.map((s) => (
          <button key={s.id} className={"r-sortrow" + (s.id === f.sort ? " is-on" : "")}
            onClick={() => { setF({ sort: s.id }); onClose(); }}>
            <div>
              <div className="r-sortrow__l">{s.label}</div>
              <div className="r-sortrow__h">{s.hint}</div>
            </div>
            {s.id === f.sort && <span className="r-sortrow__c"><Icon.check size={16} /></span>}
          </button>
        ))}
      </div>
    </RSheetShell>
  );
}

// ── pantalla ────────────────────────────────────────────────────────────────
function RutinasScreen({ t }) {
  const all = RD_ROUTINES;
  const seed = (t && t.seed) || {};
  const [f, setFRaw] = React.useState({ ...RT_FILTER_DEFAULT, ...seed });
  const [sheet, setSheet] = React.useState(null); // 'filtros' | 'orden' | null
  const setF = (patch) => setFRaw((prev) => ({ ...prev, ...patch }));
  // re-siembra cuando el tweak de demo cambia
  React.useEffect(() => { setFRaw({ ...RT_FILTER_DEFAULT, ...seed }); }, [t && t.demo]);

  const open = (r) => vxNav(VX.RUTINA, { rutina: r.slug });
  const filtering = rtIsActive(f);
  const results = rtFilterSort(all, f);

  const groups = [
    { key: "active", sec: "En curso", items: all.filter((r) => r.state === "active") },
    { key: "draft", sec: "Propuesta del agente", items: all.filter((r) => r.state === "draft") },
    { key: "paused", sec: "En pausa", items: all.filter((r) => r.state === "paused") },
  ];
  const completed = all.filter((r) => r.state === "completed");

  return (
    <div className="r-screen">
      <div className="r-scroll">
        <div className="r-chrome">
          <button className="r-chrome__btn" aria-label="Volver" onClick={() => vxNav(VX.ENTRENO, { segment: "rutina" })}><Icon.chevronLeft size={20} /></button>
          <div className="r-chrome__title">Rutinas</div>
          <div className="r-chrome__spacer" aria-hidden="true" />
        </div>

        <div className="r-pad">
          <div className="r-lead">
            <div className="r-lead__count">{all.length} rutinas</div>
            <div className="r-lead__sub">Tu rutina activa y el archivo de bloques que ya has completado.</div>
          </div>

          <RSearchBar q={f.q} setF={setF} />
          <RFilterBar f={f} onOpenFilter={() => setSheet("filtros")} onOpenSort={() => setSheet("orden")} />
          <RActiveChips f={f} setF={setF} />

          {filtering ? (
            /* ── modo resultados: lista plana filtrada + ordenada ── */
            <>
              <div className="r-sec">{results.length} {results.length === 1 ? "resultado" : "resultados"}{results.length !== all.length ? ` · de ${all.length}` : ""}</div>
              {results.length === 0 ? (
                <div className="r-noresults">
                  <RIcon.search size={26} style={{ color: "rgba(255,255,255,0.3)" }} />
                  <div className="r-noresults__t">Sin resultados</div>
                  <div className="r-noresults__b">Prueba a quitar algún filtro o cambiar la búsqueda.</div>
                </div>
              ) : (
                <div className="r-stack">
                  {results.map((r) => <RoutineCard key={r.slug} routine={r} onOpen={() => open(r)} />)}
                </div>
              )}
            </>
          ) : (
            /* ── modo navegar: agrupado por estado ── */
            <>
              {groups.map((g) => g.items.length > 0 && (
                <React.Fragment key={g.key}>
                  <div className={"r-sec" + (g.key !== "active" ? " r-sec--sp" : "")}>{g.sec}</div>
                  <div className="r-stack">
                    {g.items.map((r) => <RoutineCard key={r.slug} routine={r} onOpen={() => open(r)} />)}
                  </div>
                </React.Fragment>
              ))}
              {completed.length > 0 && <div className="r-sec r-sec--sp">Archivo · completadas</div>}
              <div className="r-rows">
                {completed.map((r) => <RoutineRow key={r.slug} routine={r} onOpen={() => open(r)} />)}
              </div>
            </>
          )}

          <RAskAgent />
        </div>
      </div>

      {sheet === "filtros" && <RFilterSheet f={f} setF={setF} count={rtFilterSort(all, f).length} onClose={() => setSheet(null)} />}
      {sheet === "orden" && <RSortSheet f={f} setF={setF} onClose={() => setSheet(null)} />}
    </div>
  );
}

Object.assign(window, {
  RIcon, RScoreChip, RBubble, RWeekCells, RT_STATES, RT_SORTS,
  rtFilterSort, rtFilterCount, rtIsActive, rtToggleIn,
  RoutineCard, RoutineRow, RAskAgent, RSearchBar, RFilterBar, RActiveChips,
  RSheetShell, RChipGroup, RFilterSheet, RSortSheet, RutinasScreen,
});
