// programas-core.jsx — "Programas": la biblioteca de programas que el agente ha
// armado, agrupada por estado (activo · pausa · borrador · archivo). Espejo de
// "Rutinas"/"Dietas". El rasgo propio del programa es el ACOPLAMIENTO: cada
// tarjeta enseña la rutina y la dieta que une. Solo lee: crear/activar lo hace
// el agente — aquí se enmarca como petición. Usa programas-data.jsx.

const PgIcon = {
  dumbbell: (p) => <Svg {...p}><path d="M6.5 6.5l11 11M3 9l3-3M18 21l3-3M6 18l-3-3M21 6l-3-3M14.5 9.5l-5 5" /></Svg>,
  utensils: (p) => <Svg {...p}><path d="M4 3v6a2 2 0 0 0 2 2v10M6 3v8M9 3v6a2 2 0 0 1-2 2M18 3c-1.5 1-2 3-2 5s.5 3 2 3v10" /></Svg>,
  target:   (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  calendar: (p) => <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></Svg>,
  trendUp:  (p) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" /></Svg>,
  trophy:   (p) => <Svg {...p}><path d="M6 4h12v3a6 6 0 0 1-12 0V4ZM6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 17h6M10 17v-2.3M14 17v-2.3M8 21h8" /></Svg>,
  search:   (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Svg>,
  sort:     (p) => <Svg {...p}><path d="M7 4v16M7 20l-3-3M7 4l3 3M17 20V4M17 4l-3 3M17 20l3-3" /></Svg>,
  pause:    (p) => <Svg {...p}><path d="M8 5v14M16 5v14" /></Svg>,
  link:     (p) => <Svg {...p}><path d="M9 12a3 3 0 0 1 3-3h3a3 3 0 0 1 0 6h-1M15 12a3 3 0 0 1-3 3H9a3 3 0 0 1 0-6h1" /></Svg>,
};

const PG_SORTS = [
  { id: "recientes", label: "Recientes", hint: "El activo primero, luego por fecha" },
  { id: "nombre", label: "Alfabético", hint: "De la A a la Z" },
  { id: "adherencia", label: "Adherencia", hint: "Mejor cumplimiento primero" },
];

function pgFilterSort(list, q, sort) {
  let r = list.filter((p) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return [p.name, pgGoalCfg(p.goal).tag, p.description].some((x) => (x || "").toLowerCase().includes(s));
  });
  const byName = (a, b) => a.name.localeCompare(b.name, "es");
  if (sort === "nombre") r = r.slice().sort(byName);
  else if (sort === "adherencia") r = r.slice().sort((a, b) => ((b.adherence?.unifiedScore || 0) - (a.adherence?.unifiedScore || 0)) || byName(a, b));
  return r;
}

function PgBubble({ color, bg, size = 46, glow, children }) {
  return (
    <span className="pg-bubble" style={{ width: size, height: size, color, background: bg,
      boxShadow: glow ? `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 22px ${glow}` : undefined }}>{children}</span>
  );
}

function PgScoreChip({ state }) {
  const cls = { ahead: "ahead", on: "on", behind: "behind" }[state] || "on";
  return <span className={"pg-score is-" + cls}>{state === "ahead" && <PgIcon.trendUp size={11} />}{pgScoreWord(state)}</span>;
}

// chip de acoplamiento (rutina / dieta) — el rasgo propio del programa
function PgCoupleChip({ kind, label }) {
  const Ico = kind === "diet" ? PgIcon.utensils : PgIcon.dumbbell;
  const empty = !label;
  return (
    <span className={"pg-couple" + (empty ? " is-empty" : "")}>
      <Ico size={11} />
      <span className="pg-couple__txt">{empty ? (kind === "diet" ? "Sin dieta" : "Sin rutina") : label}</span>
    </span>
  );
}

function PgCoupleRow({ program }) {
  const r = pgRoutine(program), d = pgDiet(program);
  return (
    <div className="pg-couplerow">
      <PgIcon.link size={12} style={{ color: "rgba(255,255,255,0.34)", flexShrink: 0 }} />
      <PgCoupleChip kind="routine" label={r ? r.name : null} />
      <PgCoupleChip kind="diet" label={d ? d.name.split(" · ")[0] : null} />
    </div>
  );
}

function pgWeekCells(program) {
  return (
    <div className="pg-cells">
      {Array.from({ length: program.weeks }).map((_, i) => {
        const done = program.state === "completed" || i < program.week - 1;
        const now = program.state !== "completed" && i === program.week - 1;
        const frac = (program.state === "active" && program.weekFrac > 0 && program.weekFrac < 1) ? program.weekFrac : null;
        return (
          <span key={i} className={"pg-cell " + (done ? "is-done" : now ? "is-now" : "")}>
            {now && frac != null && <span className="pg-cell__fill" style={{ width: Math.max(8, frac * 100) + "%" }} />}
          </span>
        );
      })}
    </div>
  );
}

// ── tarjeta grande (activo / pausa / borrador) ───────────────────────────────
function ProgramCard({ program, onOpen }) {
  const cfg = pgGoalCfg(program.goal), st = PG_STATE[program.state];
  const isDraft = program.state === "draft";
  const isActive = program.state === "active";
  const isPaused = program.state === "paused";
  const adh = program.adherence;

  return (
    <button className={"pg-card pg-card--" + program.state} onClick={onOpen}>
      <div className="pg-card__top">
        <span className="pg-eyebrow" style={{ color: st.color }}>
          {isDraft && <Isotype size={12} glow />}
          {isActive && <span className="pg-livedot" />}
          {isPaused && <PgIcon.pause size={11} />}
          {st.short}
        </span>
        <span className="pg-card__per"><PgIcon.calendar size={11} /> {pgWindowShort(program)}</span>
      </div>

      <div className="pg-card__row">
        <PgBubble color={cfg.color} bg={cfg.bg} size={46} glow={cfg.glow}>{cfg.icon({ size: 23 })}</PgBubble>
        <div className="pg-card__id">
          <div className="pg-card__name">{program.name}</div>
          <div className="pg-card__tags">
            <span className="pg-tag" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.color + "55" }}><PgIcon.target size={11} /> {cfg.tag}</span>
          </div>
        </div>
      </div>

      <PgCoupleRow program={program} />

      <div className="pg-card__foot">
        {isDraft ? (
          <div className="pg-foot__draft">
            <span className="pg-foot__lbl">Sin empezar · {program.weeks} semanas planeadas</span>
            <span className="pg-foot__cta" style={{ color: st.color }}>Ver plan ›</span>
          </div>
        ) : (
          <>
            <div className="pg-foot__head">
              <span className="pg-foot__lbl">Semana <b>{program.week}</b> de {program.weeks}</span>
              {adh && <PgScoreChip state={adh.state} />}
            </div>
            {pgWeekCells(program)}
            {adh && (
              <div className="pg-foot__meta">
                <span>Entreno {adh.training.score}% · Dieta {adh.diet.score}%</span>
                <span className="pg-foot__adh"><PgIcon.trendUp size={11} /> {adh.unifiedScore} unificado</span>
              </div>
            )}
          </>
        )}
      </div>
    </button>
  );
}

// ── fila compacta (archivo · completados) ────────────────────────────────────
function ProgramRow({ program, onOpen }) {
  const cfg = pgGoalCfg(program.goal);
  const adh = program.adherence;
  return (
    <button className="pg-row" onClick={onOpen}>
      <PgBubble color={cfg.color} bg={cfg.bg} size={38}>{cfg.icon({ size: 18 })}</PgBubble>
      <div className="pg-row__body">
        <div className="pg-row__name">{program.name}</div>
        <div className="pg-row__meta">{cfg.tag} · hasta {program.finished}</div>
      </div>
      {adh && <span className="pg-row__done"><PgIcon.trophy size={10} /> {adh.unifiedScore}</span>}
      <Icon.chevronRight size={16} style={{ color: "rgba(255,255,255,0.28)", flexShrink: 0 }} />
    </button>
  );
}

function PgAskAgent() {
  return (
    <button className="pg-ask" onClick={() => vxNav(VX.AGENTE, { caso: "inicio" })}>
      <span className="pg-ask__iso"><Isotype size={22} glow /></span>
      <div className="pg-ask__body">
        <div className="pg-ask__label">Pídele a verxion un programa nuevo</div>
        <div className="pg-ask__hint">Un programa une una rutina y una dieta bajo un objetivo. El agente lo arma y lo activa — descríbele a dónde quieres llegar.</div>
      </div>
      <span className="pg-ask__c">›</span>
    </button>
  );
}

function PgSearchBar({ q, setQ }) {
  return (
    <div className="pg-searchbar">
      <PgIcon.search size={16} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
      <input className="pg-searchbar__in" placeholder="Buscar programa u objetivo" value={q} onChange={(e) => setQ(e.target.value)} />
      {q && <button className="pg-searchbar__x" aria-label="Limpiar" onClick={() => setQ("")}><Icon.x size={14} /></button>}
    </div>
  );
}

function PgSortSheet({ value, onPick, onClose }) {
  return (
    <div className="pg-scrim" onClick={onClose}>
      <div className="pg-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="pg-sheet__grab" />
        <div className="pg-sheet__head">
          <span className="pg-sheet__title">Ordenar por</span>
          <button className="pg-sheet__close" aria-label="Cerrar" onClick={onClose}><Icon.x size={18} /></button>
        </div>
        <div className="pg-sortlist">
          {PG_SORTS.map((s) => (
            <button key={s.id} className={"pg-sortrow" + (s.id === value ? " is-on" : "")} onClick={() => { onPick(s.id); onClose(); }}>
              <div>
                <div className="pg-sortrow__l">{s.label}</div>
                <div className="pg-sortrow__h">{s.hint}</div>
              </div>
              {s.id === value && <span className="pg-sortrow__c"><Icon.check size={16} /></span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── pantalla ────────────────────────────────────────────────────────────────
function ProgramasScreen({ t, initialQ }) {
  const all = VX_PROGRAMS;
  const [q, setQ] = React.useState(initialQ || "");
  const [sort, setSort] = React.useState((t && t.orden) || "recientes");
  const [sheet, setSheet] = React.useState(false);
  const open = (p) => vxNav(VX.PROGRAMA, { programa: p.slug });
  const searching = !!q || sort !== "recientes";
  const results = pgFilterSort(all, q, sort);
  const sortLabel = (PG_SORTS.find((s) => s.id === sort) || PG_SORTS[0]).label;

  const groups = [
    { key: "active", sec: "En curso", items: all.filter((p) => p.state === "active") },
    { key: "paused", sec: "En pausa", items: all.filter((p) => p.state === "paused") },
    { key: "draft", sec: "Borradores · verxion los está armando", items: all.filter((p) => p.state === "draft") },
  ];
  const completed = all.filter((p) => p.state === "completed");

  return (
    <div className="pg-screen">
      <div className="pg-scroll">
        <div className="pg-chrome">
          <button className="pg-chrome__btn" aria-label="Volver" onClick={() => vxNav(VX.HOY)}><Icon.chevronLeft size={20} /></button>
          <div className="pg-chrome__title">Programas</div>
          <div className="pg-chrome__spacer" aria-hidden="true" />
        </div>

        <div className="pg-pad">
          <div className="pg-lead">
            <div className="pg-lead__count">{all.length} programas</div>
            <div className="pg-lead__sub">Cada programa une una rutina y una dieta bajo un objetivo. Tu programa activo y el archivo de los que ya cerraste.</div>
          </div>

          <PgSearchBar q={q} setQ={setQ} />
          <div className="pg-fbar">
            <button className="pg-fbtn" onClick={() => setSheet(true)}><PgIcon.sort size={15} /> {sortLabel}</button>
          </div>

          {searching ? (
            <>
              <div className="pg-sec">{results.length} {results.length === 1 ? "resultado" : "resultados"}{results.length !== all.length ? ` · de ${all.length}` : ""}</div>
              {results.length === 0 ? (
                <div className="pg-noresults">
                  <PgIcon.search size={26} style={{ color: "rgba(255,255,255,0.3)" }} />
                  <div className="pg-noresults__t">Sin resultados</div>
                  <div className="pg-noresults__b">Prueba a cambiar la búsqueda o el orden.</div>
                </div>
              ) : (
                <div className="pg-stack">
                  {results.map((p) => p.state === "completed"
                    ? <ProgramRow key={p.slug} program={p} onOpen={() => open(p)} />
                    : <ProgramCard key={p.slug} program={p} onOpen={() => open(p)} />)}
                </div>
              )}
            </>
          ) : (
            <>
              {groups.map((g) => g.items.length > 0 && (
                <React.Fragment key={g.key}>
                  <div className={"pg-sec" + (g.key !== "active" ? " pg-sec--sp" : "")}>{g.sec}</div>
                  <div className="pg-stack">
                    {g.items.map((p) => <ProgramCard key={p.slug} program={p} onOpen={() => open(p)} />)}
                  </div>
                </React.Fragment>
              ))}
              {completed.length > 0 && <div className="pg-sec pg-sec--sp">Archivo · completados</div>}
              <div className="pg-rows">
                {completed.map((p) => <ProgramRow key={p.slug} program={p} onOpen={() => open(p)} />)}
              </div>
            </>
          )}

          <PgAskAgent />
        </div>
      </div>

      {sheet && <PgSortSheet value={sort} onPick={setSort} onClose={() => setSheet(false)} />}
    </div>
  );
}

Object.assign(window, {
  PgIcon, PG_SORTS, pgFilterSort, PgBubble, PgScoreChip, PgCoupleChip, PgCoupleRow,
  pgWeekCells, ProgramCard, ProgramRow, PgAskAgent, PgSearchBar, PgSortSheet, ProgramasScreen,
});
