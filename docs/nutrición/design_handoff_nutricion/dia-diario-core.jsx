// dia-diario-core.jsx — "Detalle de día del diario": el informe persistido de un
// día de dieta ya cerrado, reabierto desde el Diario (espejo del Detalle de
// sesión de Entreno). Es la versión de SOLO LECTURA de cómo cerró el día —
// kcal/macros reales, adherencia, el desglose por comida y el informe del
// agente. Corregir un registro es petición al agente, nunca edición a mano.
// buildDiaDiario(t). Usa comidas-data.jsx (vxDiaryDay).

// ── iconos (lucide-style, stroke 2) sobre <Svg> de icons.jsx ────────────────
const DdIcon = {
  sunrise:  (p) => <Svg {...p}><path d="M12 3v3M5.6 9.6l-1.4-1.4M18.4 9.6l1.4-1.4M3 16h2M19 16h2M8 16a4 4 0 0 1 8 0M2 20h20M7.5 12.5 12 8l4.5 4.5" /></Svg>,
  coffee:   (p) => <Svg {...p}><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9ZM17 10h2.5a2.5 2.5 0 0 1 0 5H17M8 2c-.5 1 .5 2 0 3M12 2c-.5 1 .5 2 0 3" /></Svg>,
  utensils: (p) => <Svg {...p}><path d="M4 3v6a2 2 0 0 0 2 2v10M6 3v8M9 3v6a2 2 0 0 1-2 2M18 3c-1.5 1-2 3-2 5s.5 3 2 3v10" /></Svg>,
  apple:    (p) => <Svg {...p}><path d="M12 7c-1.5-2-5-2.5-6.5-.5C3.5 9 4 14 6 17c1 1.5 2 2.5 3.2 2 .9-.4 1.7-.4 2.6 0 1.2.5 2.2-.5 3.2-2 1.3-2 1.9-4.7 1.4-7M12 7c0-2 1.2-3.4 3-4M12 7c-.3-1.4-1-2.3-2-3" /></Svg>,
  moon:     (p) => <Svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Svg>,
  pill:     (p) => <Svg {...p}><path d="M10.5 20.5a4.95 4.95 0 0 1-7-7l6-6a4.95 4.95 0 0 1 7 7l-6 6ZM8.5 8.5l7 7" /></Svg>,
  droplet:  (p) => <Svg {...p}><path d="M12 2.7l5.3 6.6a6.7 6.7 0 1 1-10.6 0Z" /></Svg>,
  target:   (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  trophy:   (p) => <Svg {...p}><path d="M6 4h12v3a6 6 0 0 1-12 0V4ZM6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 17h6M10 17v-2.3M14 17v-2.3M8 21h8" /></Svg>,
  swap:     (p) => <Svg {...p}><path d="M8 3L4 7l4 4M4 7h12M16 21l4-4-4-4M20 17H8" /></Svg>,
  star:     (p) => <Svg {...p}><path d="M12 3l2.6 6.3L21 10l-5 4.2L17.5 21 12 17.3 6.5 21 8 14.2 3 10l6.4-.7L12 3Z" /></Svg>,
  layers:   (p) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" /></Svg>,
  flame:    (p) => <Svg {...p}><path d="M12 2c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1 .3-2 1-3-.2 2 1 3 1 3 .8-2-1-4 2-8ZM7 14a5 5 0 0 0 10 0c0-2-1-3.5-2-5" /></Svg>,
  repeat:   (p) => <Svg {...p}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></Svg>,
  more:     (p) => <Svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
};
const DD_MEAL_ICON = { sunrise: DdIcon.sunrise, coffee: DdIcon.coffee, utensils: DdIcon.utensils, apple: DdIcon.apple, moon: DdIcon.moon };
const DD_MACRO_COL = { p: "var(--vx-lava)", c: "var(--vx-body)", f: "var(--vx-neutral)" };

const ddN = (n) => Number(Math.round(n)).toLocaleString("de-DE");
const ddL = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// ── modelo ───────────────────────────────────────────────────────────────────
function buildDiaDiario(t) {
  const slug = t.dia || (typeof VX_DIARY_ALL !== "undefined" && VX_DIARY_ALL[0] ? VX_DIARY_ALL[0].slug : "d-1jun");
  const day = (typeof vxDiaryDay !== "undefined") ? vxDiaryDay(slug) : null;
  return { slug, day };
}

// ── bits ─────────────────────────────────────────────────────────────────────
function DdBubble({ color, bg, size = 44, glow, children }) {
  return (
    <span className="dd-bubble" style={{ width: size, height: size, color, background: bg,
      boxShadow: glow ? `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 22px ${glow}` : undefined }}>{children}</span>
  );
}

// anillo de kcal segmentado por macro (mismo lenguaje que la vista Nutrición) ──
function DdRing({ totals, goal, size = 88, sw = 9 }) {
  const r = (size - sw) / 2, c = size / 2, len = 2 * Math.PI * r;
  const pK = totals.p * 4, cK = totals.c * 4, fK = totals.f * 9, mTot = pK + cK + fK || 1;
  const fill = Math.max(0, Math.min(1, totals.kcal / goal));
  const segs = [{ kc: pK, col: "var(--vx-lava)" }, { kc: cK, col: "var(--vx-body)" }, { kc: fK, col: "var(--vx-neutral)" }];
  const gap = 2.5;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", display: "block" }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={sw} />
      {segs.map((s, i) => {
        const frac = (s.kc / mTot) * fill, dash = Math.max(0, frac * len - gap);
        const el = frac > 0.004 ? (
          <circle key={i} cx={c} cy={c} r={r} fill="none" stroke={s.col} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={`${dash} ${len - dash}`} strokeDashoffset={-acc * len}
            style={{ filter: `drop-shadow(0 0 6px ${s.col})` }} />
        ) : null;
        acc += frac;
        return el;
      })}
    </svg>
  );
}

// ── HERO ─────────────────────────────────────────────────────────────────────
// glass (con backdrop-filter) SIN svg dentro: el anillo va en la tarjeta de
// "consumido" (fondo degradado, sin backdrop-filter) — así no rompe el render.
function DdHero({ day }) {
  const ac = day.adhClass;
  return (
    <div className="dd-hero">
      <div className="dd-hero__top">
        <span className="dd-eyebrow" style={{ color: ac.color }}>
          {day.star ? <DdIcon.star size={11} /> : <DdIcon.flame size={11} />} DÍA REGISTRADO
        </span>
        <span className="dd-hero__ctx"><DdIcon.repeat size={12} /> {VX_DIET.name}</span>
      </div>
      <div className="dd-hero__row">
        <DdBubble color={ac.color} bg={ac.bg} size={52} glow={ac.key === "bajo" ? null : "rgba(255,98,98,0.18)"}>
          <DdIcon.utensils size={26} />
        </DdBubble>
        <div style={{ minWidth: 0 }}>
          <div className="dd-hero__date">{day.dl}</div>
          <div className="dd-hero__sub">{day.adh}% de adherencia</div>
        </div>
      </div>
      <div className="dd-hero__class">
        <span className="dd-class" style={{ color: ac.color, background: ac.bg, borderColor: ac.line }}>
          {(ac.key === "clavado" || ac.key === "objetivo") && <DdIcon.star size={11} />}{ac.label}
        </span>
        <span className="dd-class__meta">{ddN(day.totals.kcal)} / {ddN(day.kcalGoal)} kcal</span>
        {day.star && <span className="dd-prtag"><DdIcon.target size={11} /> proteína clavada</span>}
      </div>
    </div>
  );
}

// ── consumido del día: anillo segmentado por macro + barras (espejo landing) ──
function DdIntake({ day }) {
  const { totals, kcalGoal } = day;
  const over = totals.kcal > kcalGoal;
  const diff = Math.abs(kcalGoal - totals.kcal);
  const onTgt = Math.abs(totals.kcal - kcalGoal) <= 120;
  return (
    <div className="dd-intake">
      <div className="dd-intake__top">
        <div className="dd-intake__ring" style={{ width: 92, height: 92 }}>
          <DdRing totals={totals} goal={kcalGoal} size={92} />
          <div className="dd-intake__ringc">
            <span className="dd-intake__num">{ddN(totals.kcal)}</span>
            <span className="dd-intake__den">/ {ddN(kcalGoal)}</span>
          </div>
        </div>
        <div className="dd-intake__side">
          <div className="dd-intake__lbl">CONSUMIDO EN EL DÍA</div>
          <div className={"dd-intake__tag" + (onTgt ? " is-on" : over ? " is-over" : " is-low")}>
            {onTgt ? "En objetivo" : over ? `${ddN(diff)} kcal de más` : `${ddN(diff)} kcal por debajo`}
          </div>
          <div className="dd-intake__obj">Objetivo {ddN(kcalGoal)} kcal · {day.meals.length} comidas</div>
        </div>
      </div>
      <DdMacros macros={day.macros} />
    </div>
  );
}

// ── macros consumidos / objetivo (las tres barras canónicas, dentro de intake) ─
function DdMacros({ macros }) {
  return (
    <div className="dd-macros">
      {macros.map((m) => {
        const frac = Math.min(1, m.g / m.goal);
        return (
          <div className="dd-macro" key={m.key}>
            <div className="dd-macro__head">
              <span>{m.label}</span>
              <span>{ddN(m.g)}<em>/{m.goal} g · {m.pct}%</em></span>
            </div>
            <div className="dd-bar"><div className="dd-bar__fill" style={{ width: (frac * 100) + "%", background: m.color, color: m.color }} /></div>
          </div>
        );
      })}
    </div>
  );
}

// ── informe del agente ─────────────────────────────────────────────────────────
function DdRecap({ msg }) {
  return (
    <div className="dd-recap">
      <span className="dd-recap__mark"><Isotype size={22} glow /></span>
      <div>
        <div className="dd-recap__from">verxion · informe</div>
        <div className="dd-recap__msg">{msg}</div>
      </div>
    </div>
  );
}

// ── tiles de día (adherencia · agua · comidas) ──────────────────────────────────
function DdTiles({ day }) {
  const tiles = [
    { v: day.adh, u: "%", l: "Adherencia", icon: DdIcon.target, color: day.adhClass.color, bg: day.adhClass.bg },
    { v: ddL(day.water), u: "L", l: "Agua", icon: DdIcon.droplet, color: "var(--vx-body)", bg: "var(--vx-body-bg)" },
    { v: day.meals.length, u: "", l: "Comidas", icon: DdIcon.utensils, color: "var(--vx-lava)", bg: "var(--vx-lava-bg)" },
  ];
  return (
    <div className="dd-tiles">
      {tiles.map((t) => (
        <div className="dd-tile" key={t.l}>
          <span className="dd-tile__bubble" style={{ background: t.bg, color: t.color }}>{t.icon({ size: 16 })}</span>
          <div className="dd-tile__v">{t.v}{t.u && <em>{t.u}</em>}</div>
          <div className="dd-tile__l">{t.l}</div>
        </div>
      ))}
    </div>
  );
}

// ── desglose por comida (lo que cerró el día) ───────────────────────────────────
function DdMeal({ meal }) {
  const Ico = DD_MEAL_ICON[meal.icon] || DdIcon.utensils;
  const tappable = !!meal.slug;
  return (
    <button className={"dd-meal" + (meal.key ? " is-key" : "") + (meal.swap ? " is-swap" : "")}
      onClick={tappable ? () => vxNav(VX.ALIMENTO, { item: meal.slug }) : undefined}
      style={tappable ? null : { cursor: "default" }}>
      <div className="dd-meal__head">
        <DdBubble color="var(--vx-lava)" bg="var(--vx-lava-bg)" size={38}><Ico size={19} /></DdBubble>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="dd-meal__name">
            {meal.name}
            {meal.key && <span className="dd-meal__keytag">principal</span>}
          </div>
          <div className="dd-meal__time">{meal.time}</div>
        </div>
        <div className="dd-meal__kcal"><span>{ddN(meal.kcal)}</span><em>kcal</em></div>
      </div>
      <div className="dd-meal__macros">
        {[["p", "P"], ["c", "C"], ["f", "G"]].map(([k, lbl]) => (
          <span className="dd-mq" key={k} style={{ color: DD_MACRO_COL[k] }}><b>{ddN(meal[k])}</b>{lbl}</span>
        ))}
        {tappable && <Icon.chevronRight size={15} style={{ color: "rgba(255,255,255,0.26)", marginLeft: "auto", alignSelf: "center" }} />}
      </div>
      {meal.swap && (
        <div className="dd-meal__swap">
          <DdIcon.swap size={12} /> El agente registró un cambio · {meal.swap.why}
        </div>
      )}
    </button>
  );
}

// ── suplementos del día (tira compacta) ─────────────────────────────────────────
function DdSupps({ supps }) {
  return (
    <div className="dd-supps">
      {supps.map((s) => (
        <div className="dd-supp" key={s.id}>
          <DdBubble color="var(--vx-insight)" bg="var(--vx-insight-bg)" size={32}><DdIcon.pill size={15} /></DdBubble>
          <div className="dd-supp__body">
            <div className="dd-supp__name">{s.name}</div>
            <div className="dd-supp__time">{s.time}</div>
          </div>
          <span className="dd-supp__tag"><Icon.check size={11} /> {s.tag}</span>
        </div>
      ))}
    </div>
  );
}

// ── nota del usuario + corregir con el agente ──────────────────────────────────
function DdUserNote({ note }) {
  return (
    <div className="dd-usernote">
      <div className="dd-usernote__k">Tu nota del día</div>
      <div className="dd-usernote__t">“{note}”</div>
    </div>
  );
}
function DdAskAgent() {
  return (
    <button className="dd-ask" onClick={() => vxNav(VX.AGENTE, { caso: "inicio" })}>
      <span className="dd-ask__iso"><Isotype size={20} glow /></span>
      <div className="dd-ask__body">
        <div className="dd-ask__label">¿Algún dato mal? Corrígelo con el agente</div>
        <div className="dd-ask__hint">El registro es de solo lectura — dile a verxion qué ajustar y lo corrige.</div>
      </div>
      <span className="dd-ask__c">›</span>
    </button>
  );
}

function DdSection({ icon, count, children }) {
  return (
    <div className="dd-sec">
      <span className="dd-sec__ic">{icon}</span>
      <span className="dd-sec__k">{children}</span>
      {count != null && <span className="dd-sec__count">{count}</span>}
      <span className="dd-sec__line" />
    </div>
  );
}

// ── pantalla ────────────────────────────────────────────────────────────────
function DiaDiarioScreen({ t }) {
  const { day } = buildDiaDiario(t);
  if (!day) return <div className="dd-screen" />;
  return (
    <div className="dd-screen">
      <div className="dd-scroll">
        <div className="dd-chrome">
          <button className="dd-chrome__btn" aria-label="Volver" onClick={() => vxNav(VX.NUTRICION, { segment: "diario" })}><Icon.chevronLeft size={20} /></button>
          <div className="dd-chrome__title">Día del diario</div>
          <button className="dd-chrome__btn" aria-label="Más"><DdIcon.more size={20} /></button>
        </div>

        <div className="dd-pad">
          <DdHero day={day} />

          <DdSection icon={<DdIcon.flame size={15} />}>Consumido · macros del día</DdSection>
          <DdIntake day={day} />
          <DdTiles day={day} />

          <DdSection icon={<DdIcon.layers size={15} />} count={day.meals.length + " comidas"}>El día · comidas</DdSection>
          <div className="dd-meallist">
            {day.meals.map((m) => <DdMeal key={m.id} meal={m} />)}
          </div>

          <DdSection icon={<DdIcon.pill size={15} />}>Suplementos</DdSection>
          <DdSupps supps={day.supps} />

          {day.note && <DdUserNote note={day.note} />}
          <DdAskAgent />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  DdIcon, DD_MEAL_ICON, DD_MACRO_COL, ddN, ddL, buildDiaDiario, DdBubble, DdRing,
  DdHero, DdIntake, DdRecap, DdMacros, DdTiles, DdMeal, DdSupps, DdUserNote, DdAskAgent, DdSection, DiaDiarioScreen,
});
