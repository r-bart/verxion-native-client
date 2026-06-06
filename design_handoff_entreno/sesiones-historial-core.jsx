// sesiones-historial-core.jsx — "Historial de sesiones": el log completo del
// usuario, filtrable por RUTINA (select) y por tipo, ordenable por reciente /
// antiguo / volumen / duración. Cuelga de Entreno · Sesiones. Solo lectura.

const ShIcon = {
  dumbbell: (p) => <Svg {...p}><path d="M6.5 6.5l11 11M3 9l3-3M18 21l3-3M6 18l-3-3M21 6l-3-3M14.5 9.5l-5 5" /></Svg>,
  rows:    (p) => <Svg {...p}><path d="M3 6.5h18M3 12h18M3 17.5h18" /></Svg>,
  footprints: (p) => <Svg {...p}><path d="M4 16v-2a2 2 0 1 1 4 0v2c0 2-.5 3-2 3s-2-1-2-3ZM16 14v-2a2 2 0 1 1 4 0v2c0 2-.5 3-2 3s-2-1-2-3ZM5 9c0-2 .5-4 2-4s1.5 2 1 4M19 7c0-2-.5-4-2-4" /></Svg>,
  sort:    (p) => <Svg {...p}><path d="M7 4v16M7 20l-3-3M7 4l3 3M17 20V4M17 4l-3 3M17 20l3-3" /></Svg>,
  trophy:  (p) => <Svg {...p}><path d="M6 4h12v3a6 6 0 0 1-12 0V4ZM6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 17h6M10 17v-2.3M14 17v-2.3M8 21h8" /></Svg>,
  chevronDown: (p) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>,
  layers:  (p) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" /></Svg>,
};

const SH_DAY = {
  push: { color: "var(--vx-lava)",    bg: "var(--vx-lava-bg)",    icon: ShIcon.dumbbell },
  pull: { color: "var(--vx-body)",    bg: "var(--vx-body-bg)",    icon: ShIcon.rows },
  legs: { color: "var(--vx-neutral)", bg: "var(--vx-neutral-bg)", icon: ShIcon.footprints },
};
const SH_STATE = {
  active:    { label: "Activa",     color: "var(--vx-lava)",    bg: "var(--vx-lava-bg)",    line: "rgba(255,98,98,0.3)" },
  completed: { label: "Completada", color: "var(--vx-up)",      bg: "var(--vx-up-tint)",    line: "var(--vx-up-line)" },
};

const SH_TYPES = [
  { id: "all", label: "Todos" },
  { id: "push", label: "Push" },
  { id: "pull", label: "Pull" },
  { id: "legs", label: "Legs" },
];
const SH_SORTS = [
  { id: "reciente", label: "Más reciente", hint: "Lo último primero, por bloque" },
  { id: "antiguo",  label: "Más antiguo",  hint: "Desde el principio" },
  { id: "volumen",  label: "Volumen",      hint: "Más tonelaje primero" },
  { id: "duracion", label: "Duración",     hint: "Sesiones más largas primero" },
];

function shFmtVol(t) { return t.toFixed(1).replace(".", ",") + " t"; }

// ── fila de sesión ───────────────────────────────────────────────────────────
function ShRow({ s }) {
  const cfg = SH_DAY[s.type] || SH_DAY.push;
  return (
    <button className="sh-row" onClick={() => vxNav(VX.SESION_DET, { sesion: s.slug })}>
      <div className="sh-row__date">{s.date}<em>{s.mon}</em></div>
      <span className="sh-bubble" style={{ color: cfg.color, background: cfg.bg }}>{cfg.icon({ size: 16 })}</span>
      <div className="sh-row__body">
        <div className="sh-row__name">
          {s.name}
          {s.prs > 0 && <span className="sh-row__pr"><ShIcon.trophy size={9} /> {s.prs} PR</span>}
        </div>
        <div className="sh-row__bar"><span style={{ width: Math.max(6, s.frac * 100) + "%", background: cfg.color }} /></div>
      </div>
      <div className="sh-row__meta">
        <div className="sh-row__vol">{shFmtVol(s.volT)}</div>
        <div className="sh-row__dur">{s.dur}</div>
      </div>
      <Icon.chevronRight size={15} style={{ color: "rgba(255,255,255,0.26)", flexShrink: 0, alignSelf: "center" }} />
    </button>
  );
}

// ── hoja genérica de selección ─────────────────────────────────────────────
function ShSheet({ title, options, value, onPick, onClose }) {
  return (
    <div className="sh-scrim" onClick={onClose}>
      <div className="sh-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sh-sheet__grab" />
        <div className="sh-sheet__head">
          <span className="sh-sheet__title">{title}</span>
          <button className="sh-sheet__close" aria-label="Cerrar" onClick={onClose}><Icon.x size={18} /></button>
        </div>
        <div className="sh-sortlist">
          {options.map((o) => (
            <button key={o.id} className={"sh-sortrow" + (o.id === value ? " is-on" : "")}
              onClick={() => { onPick(o.id); onClose(); }}>
              <div>
                <div className="sh-sortrow__l">{o.label}</div>
                {o.hint && <div className="sh-sortrow__h">{o.hint}</div>}
              </div>
              {o.id === value && <span className="sh-sortrow__c"><Icon.check size={16} /></span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── sección de bloque (rutina) ───────────────────────────────────────────────
function ShBlock({ g }) {
  const st = SH_STATE[g.state] || SH_STATE.completed;
  return (
    <>
      <div className="sh-block">
        <span className="sh-block__name">{g.name}</span>
        <span className="sh-block__state" style={{ color: st.color, background: st.bg, borderColor: st.line }}>{st.label}</span>
        <span className="sh-block__line" />
        <span className="sh-block__meta">{g.range} · {shFmtVol(g.volT)}</span>
      </div>
      <div className="sh-rows">
        {g.items.map((s) => <ShRow key={s.slug} s={s} />)}
      </div>
    </>
  );
}

// ── pantalla ────────────────────────────────────────────────────────────────
function HistorialSesionesScreen({ t }) {
  const all = (typeof VX_SESSIONS_ALL !== "undefined") ? VX_SESSIONS_ALL : [];
  const routines = (typeof sdHistoryRoutines !== "undefined") ? sdHistoryRoutines() : [];
  const ROUTINE_OPTS = [{ id: "all", label: "Todas las rutinas" }, ...routines.map((r) => ({ id: r.slug, label: r.name }))];

  const [routine, setRoutine] = React.useState((t && t.rutina) || "all");
  const [sort, setSort] = React.useState((t && t.orden) || "reciente");
  const [sheet, setSheet] = React.useState(null); // 'rutina' | 'orden' | null

  const filtered = all.filter((s) => routine === "all" || s.routine === routine);

  const grouped = sort === "reciente" || sort === "antiguo";
  const groups = grouped ? sdRoutineGroups(filtered, sort === "antiguo") : [];
  const flat = grouped ? [] : filtered.slice().sort((a, b) =>
    sort === "volumen" ? b.volT - a.volT : b.durMin - a.durMin);

  const routineLabel = (ROUTINE_OPTS.find((o) => o.id === routine) || ROUTINE_OPTS[0]).label;
  const sortLabel = (SH_SORTS.find((x) => x.id === sort) || SH_SORTS[0]).label;

  return (
    <div className="sh-screen">
      <div className="sh-scroll">
        <div className="sh-chrome">
          <button className="sh-chrome__btn" aria-label="Volver" onClick={() => vxNav(VX.ENTRENO, { segment: "sesiones" })}><Icon.chevronLeft size={20} /></button>
          <div className="sh-chrome__title">Historial de sesiones</div>
          <div className="sh-chrome__spacer" aria-hidden="true" />
        </div>

        <div className="sh-pad">
          <div className="sh-lead">
            <div className="sh-lead__count">{filtered.length} {filtered.length === 1 ? "sesión" : "sesiones"}</div>
            <div className="sh-lead__sub">Todo tu log de entrenos, por bloque.</div>
          </div>

          <div className="sh-bar">
            <button className="sh-select" onClick={() => setSheet("rutina")}>
              <ShIcon.layers size={15} />
              <span className="sh-select__v">{routineLabel}</span>
              <ShIcon.chevronDown size={16} style={{ color: "rgba(255,255,255,0.5)", flexShrink: 0 }} />
            </button>
            <button className="sh-sortbtn" onClick={() => setSheet("orden")}><ShIcon.sort size={15} /> {sortLabel}</button>
          </div>

          {filtered.length === 0 ? (
            <div className="sh-empty">Sin sesiones con estos filtros.</div>
          ) : grouped ? (
            groups.map((g) => <ShBlock key={g.slug} g={g} />)
          ) : (
            <>
              <div className="sh-sec">{flat.length} sesiones · por {sortLabel.toLowerCase()}</div>
              <div className="sh-rows">
                {flat.map((s) => <ShRow key={s.slug} s={s} />)}
              </div>
            </>
          )}
        </div>
      </div>

      {sheet === "rutina" && <ShSheet title="Filtrar por rutina" options={ROUTINE_OPTS} value={routine} onPick={setRoutine} onClose={() => setSheet(null)} />}
      {sheet === "orden" && <ShSheet title="Ordenar por" options={SH_SORTS} value={sort} onPick={setSort} onClose={() => setSheet(null)} />}
    </div>
  );
}

Object.assign(window, {
  ShIcon, SH_DAY, SH_STATE, SH_TYPES, SH_SORTS, shFmtVol, ShRow, ShSheet, ShBlock, HistorialSesionesScreen,
});
