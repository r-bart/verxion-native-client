// alimento-core.jsx — Detalle de alimento / receta (espejo de ejercicio-core).
// Lo que ves al tocar un alimento en la biblioteca. Read-only-first: la ficha
// viene de bases de datos oficiales (BEDCA / Open Food Facts) o la creaste tú;
// las recetas combinan alimentos. buildAlimento(t). Usa comidas-data.jsx.

// ── iconos (lucide-style, stroke 2) sobre <Svg> de icons.jsx ────────────────
const AIcon = {
  utensils: (p) => <Svg {...p}><path d="M4 3v6a2 2 0 0 0 2 2v10M6 3v8M9 3v6a2 2 0 0 1-2 2M18 3c-1.5 1-2 3-2 5s.5 3 2 3v10" /></Svg>,
  chef:     (p) => <Svg {...p}><path d="M7 21h10M6 16h12M8 16V9a4 4 0 1 1 5-3.9A3.5 3.5 0 1 1 16 9v7" /></Svg>,
  clock:    (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>,
  layers:   (p) => <Svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" /></Svg>,
  more:     (p) => <Svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></Svg>,
  trophy:   (p) => <Svg {...p}><path d="M6 4h12v3a6 6 0 0 1-12 0V4ZM6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 17h6M10 17v-2.3M14 17v-2.3M8 21h8" /></Svg>,
  database: (p) => <Svg {...p}><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></Svg>,
  pencil:   (p) => <Svg {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></Svg>,
  check:    (p) => <Svg {...p}><path d="M20 6L9 17l-5-5" /></Svg>,
  star:     (p) => <Svg {...p}><path d="M12 3l2.6 5.6 6 .7-4.5 4 1.3 6L12 16.8 6.6 19.3l1.3-6-4.5-4 6-.7L12 3Z" /></Svg>,
  leaf:     (p) => <Svg {...p}><path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 9-4 14-9 16ZM4 20c2-5 5-8 9-9" /></Svg>,
  sparkle:  (p) => <Svg {...p}><path d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4L12 3Z" /></Svg>,
};

const aN = (n) => Number(Math.round(n)).toLocaleString("de-DE");
const a1 = (n) => (Math.round(n * 10) / 10).toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 1 });

// fuente → cómo se etiqueta y su icono
const A_SOURCE = {
  "BEDCA":            { label: "BEDCA · base oficial española", icon: AIcon.database, color: "var(--vx-body)" },
  "Open Food Facts":  { label: "Open Food Facts", icon: AIcon.database, color: "var(--vx-body)" },
  "Creado por ti":    { label: "Creado por ti", icon: AIcon.pencil, color: "var(--vx-insight)" },
  "verxion":          { label: "Receta de verxion", icon: AIcon.sparkle, color: "var(--vx-lava)" },
};

// ── modelo ───────────────────────────────────────────────────────────────────
function buildAlimento(t) {
  const slug = t.item || "pechuga-de-pollo";
  const item = (typeof vxItemBySlug !== "undefined") ? vxItemBySlug(slug) : null;
  const isRecipe = item.kind === "recipe";
  const basis = isRecipe ? "racion" : (t.basis || "racion");   // racion | g100
  const tab = t.tab || "nutricion";                            // nutricion | ficha/receta

  // valores según base
  const base = (basis === "g100" && item.per100)
    ? { kcal: item.per100.kcal, p: item.per100.p, c: item.per100.c, f: item.per100.f, label: "por 100 g" }
    : { kcal: item.kcal, p: item.p, c: item.c, f: item.f, label: isRecipe ? "por ración" : "por " + item.serv };

  // "en tu plan" — comidas de hoy que usan este alimento
  const meals = (typeof vxExpandMeals !== "undefined") ? vxExpandMeals() : [];
  const usage = isRecipe ? [] : meals
    .filter((m) => m.items.some((it) => it.slug === slug))
    .map((m) => {
      const it = m.items.find((x) => x.slug === slug);
      return { meal: m.name, time: m.time, qty: it.qty, kcal: it.kcal };
    });

  // historial de consumo (sintético) — últimas veces registrado
  const hist = [];
  if (item.logs > 0) {
    const days = ["Hoy", "Ayer", "Lun 2", "Dom 1", "Sáb 31", "Vie 30"];
    for (let i = 0; i < Math.min(6, item.logs); i++) {
      const qf = [1, 1, 1.5, 1, 0.5, 1][i] || 1;
      hist.push({ date: days[i], qty: item.serv, kcal: Math.round(item.kcal * qf), star: i === 2 && item.fav });
    }
  }

  return { slug, item, isRecipe, basis, tab, base, usage, hist };
}

// ── bits ─────────────────────────────────────────────────────────────────────
function ABubble({ color, bg, size = 54, glow, children }) {
  return (
    <span className="a-bubble" style={{ width: size, height: size, color, background: bg,
      boxShadow: glow ? `inset 0 1px 0 0 rgba(255,255,255,0.16), 0 0 22px ${glow}` : undefined }}>
      {children}
    </span>
  );
}

// ── donut de macros (reparto de kcal P/C/G) ───────────────────────────────────
function MacroDonut({ p, c, f, kcal, size = 138, sw = 15 }) {
  const pk = p * 4, ck = c * 4, fk = f * 9, tot = pk + ck + fk || 1;
  const segs = [
    { v: pk, col: "var(--vx-lava)" }, { v: ck, col: "var(--vx-body)" }, { v: fk, col: "var(--vx-neutral)" },
  ];
  const r = (size - sw) / 2, cc = size / 2, len = 2 * Math.PI * r, gap = 2.5;
  let acc = 0;
  return (
    <div className="a-donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={cc} cy={cc} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={sw} />
        {segs.map((s, i) => {
          const frac = s.v / tot;
          const dash = Math.max(0, frac * len - gap);
          const el = (
            <circle key={i} cx={cc} cy={cc} r={r} fill="none" stroke={s.col} strokeWidth={sw} strokeLinecap="round"
              strokeDasharray={`${dash} ${len - dash}`} strokeDashoffset={-acc * len}
              style={{ filter: `drop-shadow(0 0 5px ${s.col})` }} />
          );
          acc += frac;
          return frac > 0.005 ? el : null;
        })}
      </svg>
      <div className="a-donut__c">
        <span className="a-donut__k">{aN(kcal)}</span>
        <span className="a-donut__l">kcal</span>
      </div>
    </div>
  );
}

// ── hero ──────────────────────────────────────────────────────────────────────
function AHero({ model }) {
  const { item, isRecipe } = model;
  const src = A_SOURCE[item.source] || A_SOURCE["BEDCA"];
  const color = isRecipe ? "var(--vx-lava)" : item.pal.color;
  const bg = isRecipe ? "var(--vx-lava-bg)" : item.pal.bg;
  return (
    <div className="a-hero">
      <ABubble color={color} bg={bg} size={54} glow={isRecipe ? "rgba(255,98,98,0.28)" : null}>
        {isRecipe ? <AIcon.chef size={26} /> : <span className="a-hero__lead">{item.pal.short}</span>}
      </ABubble>
      <div style={{ minWidth: 0 }}>
        <div className="a-hero__name">{item.name}</div>
        <div className="a-hero__tags">
          <span className="a-tag">{item.group}</span>
          <span className="a-tag">{item.serv}</span>
          {item.fav && <span className="a-tag a-tag--fav"><AIcon.star size={10} /> Favorito</span>}
        </div>
        <div className="a-hero__src" style={{ color: src.color }}>{src.icon({ size: 12 })} {src.label}</div>
      </div>
    </div>
  );
}

// ── tabs ────────────────────────────────────────────────────────────────────────
function ATabs({ tab, onTab, isRecipe }) {
  const T = isRecipe
    ? [{ id: "nutricion", label: "Nutrición" }, { id: "ficha", label: "Receta" }]
    : [{ id: "nutricion", label: "Nutrición" }, { id: "ficha", label: "Ficha" }];
  const idx = Math.max(0, T.findIndex((x) => x.id === tab));
  return (
    <div className="a-tabs">
      <div className="a-tabs__thumb" style={{ left: `calc(3px + ${idx} * (100% - 6px) / 2)` }} />
      {T.map((x) => (
        <button key={x.id} className={"a-tabs__b" + (x.id === tab ? " is-on" : "")} onClick={() => onTab(x.id)}>{x.label}</button>
      ))}
    </div>
  );
}

// ── tarjeta de macros: donut + leyenda + toggle ración/100g ───────────────────
function MacroCard({ model, onBasis }) {
  const { base, item, isRecipe } = model;
  const pk = base.p * 4, ck = base.c * 4, fk = base.f * 9, tot = pk + ck + fk || 1;
  const rows = [
    { k: "Proteína", g: base.p, kc: pk, col: "var(--vx-lava)" },
    { k: "Carbos", g: base.c, kc: ck, col: "var(--vx-body)" },
    { k: "Grasa", g: base.f, kc: fk, col: "var(--vx-neutral)" },
  ];
  return (
    <div className="a-macrocard">
      <div className="a-macrocard__head">
        <span className="a-macrocard__lbl">{base.label}</span>
        {!isRecipe && item.per100 && (
          <div className="a-mseg">
            <button className={"a-mseg__b" + (model.basis === "racion" ? " is-on" : "")} onClick={() => onBasis("racion")}>Ración</button>
            <button className={"a-mseg__b" + (model.basis === "g100" ? " is-on" : "")} onClick={() => onBasis("g100")}>100 g</button>
          </div>
        )}
      </div>
      <div className="a-macrocard__body">
        <MacroDonut p={base.p} c={base.c} f={base.f} kcal={base.kcal} />
        <div className="a-legend">
          {rows.map((r) => (
            <div className="a-legrow" key={r.k}>
              <span className="a-legdot" style={{ background: r.col }} />
              <span className="a-legname">{r.k}</span>
              <span className="a-leggr">{a1(r.g)} g</span>
              <span className="a-legpct">{Math.round(r.kc / tot * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── micronutrientes + destacados (la ficha oficial) ───────────────────────────
function AMicros({ item }) {
  return (
    <div className="a-card a-micros">
      <div className="a-micros__grid">
        {item.micros.map((m) => (
          <div className="a-micro" key={m.name}>
            <span className="a-micro__v">{m.val}</span>
            <span className="a-micro__l">{m.name}</span>
          </div>
        ))}
      </div>
      {item.hl && item.hl.length > 0 && (
        <div className="a-micros__hl">
          <span className="a-micros__hlk">Rico en</span>
          {item.hl.map((h) => <span className="a-hlchip" key={h}>{h}</span>)}
        </div>
      )}
    </div>
  );
}

// ── en tu plan ─────────────────────────────────────────────────────────────────
function AUsage({ usage }) {
  return (
    <div className="a-usage">
      {usage.map((u, i) => (
        <div className="a-urow" key={i}>
          <span className="a-urow__time">{u.time}</span>
          <span className="a-urow__meal">{u.meal}</span>
          <span className="a-urow__qty">{u.qty}</span>
          <span className="a-urow__kcal">{aN(u.kcal)} kcal</span>
        </div>
      ))}
    </div>
  );
}

// ── historial de consumo ─────────────────────────────────────────────────────
function AHistory({ hist }) {
  return (
    <div className="a-hist">
      {hist.map((h, i) => (
        <div className="a-hrow" key={i}>
          <span className="a-hrow__date">{h.date}</span>
          <span className="a-hrow__qty">{h.qty}{h.star && <span className="a-hrow__star"><AIcon.star size={9} /></span>}</span>
          <span className="a-hrow__kcal">{aN(h.kcal)} <em>kcal</em></span>
        </div>
      ))}
    </div>
  );
}

// ── ficha (descripción + chips) ───────────────────────────────────────────────
function AFicha({ item }) {
  const src = A_SOURCE[item.source] || A_SOURCE["BEDCA"];
  return (
    <div className="a-card">
      <div className="a-ficha__chips">
        <span className="a-chip2">{item.group}</span>
        <span className="a-chip2">{item.cat}</span>
        {item.custom && <span className="a-chip2 a-chip2--cust">Personalizado</span>}
      </div>
      <p className="a-ficha__p">
        {item.cat}. Valores de <b style={{ color: src.color }}>{item.source}</b> por {item.serv}
        {item.per100 ? " · " + item.kcal100 + " kcal / 100 g" : ""}.
      </p>
    </div>
  );
}

// ── receta: ingredientes + pasos ───────────────────────────────────────────────
function ARecipe({ item }) {
  return (
    <>
      <div className="a-recipe__meta">
        <div className="a-rmeta"><AIcon.clock size={14} /><b>{item.time}</b><span>preparación</span></div>
        <div className="a-rmeta"><AIcon.layers size={14} /><b>{item.serv.split(" ")[0]}</b><span>{item.portions === 1 ? "ración" : "raciones"}</span></div>
        <div className="a-rmeta"><AIcon.utensils size={14} /><b>{item.ingredients.length}</b><span>ingredientes</span></div>
      </div>

      <div className="a-section"><span className="a-section__k">Ingredientes</span><span className="a-section__line" /></div>
      <div className="a-card a-ingr">
        {item.items.map((it, i) => (
          <div className="a-ing" key={i} onClick={() => it.slug && vxNav(VX.ALIMENTO, { item: it.slug })} style={{ cursor: it.slug ? "pointer" : "default" }}>
            <span className="a-ing__dot" style={{ background: MACRO_COL_A[it.lead] }} />
            <span className="a-ing__name">{it.name}</span>
            <span className="a-ing__qty">{it.qty}</span>
            <span className="a-ing__kcal">{aN(it.kcal)} kcal</span>
            <Icon.chevronRight size={14} style={{ color: "rgba(255,255,255,0.28)", flexShrink: 0 }} />
          </div>
        ))}
      </div>

      <div className="a-section"><span className="a-section__k">Preparación</span><span className="a-section__count">{item.steps.length} pasos</span><span className="a-section__line" /></div>
      <div className="a-card a-steps">
        {item.steps.map((s, i) => (
          <div className="a-step" key={i}>
            <span className="a-step__n">{i + 1}</span>
            <span className="a-step__t">{s}</span>
          </div>
        ))}
      </div>
    </>
  );
}
const MACRO_COL_A = { p: "var(--vx-lava)", c: "var(--vx-body)", f: "var(--vx-neutral)" };

// ── nota del agente + edición ───────────────────────────────────────────────────
function AAgentNote({ msg }) {
  return (
    <div className="a-agent">
      <span className="a-agent__mark"><Isotype size={22} glow /></span>
      <div>
        <div className="a-agent__from">verxion · lectura</div>
        <div className="a-agent__msg">{msg}</div>
      </div>
    </div>
  );
}
function AAgentEdit({ isRecipe }) {
  return (
    <button className="a-edit">
      <span className="a-edit__iso"><Isotype size={20} glow /></span>
      <div className="a-edit__body">
        <div className="a-edit__label">Pídeselo al agente</div>
        <div className="a-edit__hint">{isRecipe ? "Pídele que la meta en tu plan o que cree una variante." : "Pídele que lo añada a una comida o que busque uno parecido."}</div>
      </div>
      <span className="a-edit__c">›</span>
    </button>
  );
}

// nota contextual del agente por ítem
function aAgentMsg(model) {
  const { item, isRecipe, usage } = model;
  if (isRecipe) return `Esta receta cuadra ${aN(item.kcal)} kcal y ${Math.round(item.p)} g de proteína por ración — encaja en tu objetivo de definición sin pasarte de grasa.`;
  if (usage.length) return `Hoy aparece en ${usage.length === 1 ? "tu " + usage[0].meal.toLowerCase() : usage.length + " comidas"}. Es de tus alimentos fijos: buena densidad de proteína por kcal.`;
  if (!item.used) return `Aún no está en tu plan. Si quieres, te lo meto en una comida y ajusto el resto de macros del día.`;
  return `Lo has usado ${item.logs} veces. Encaja bien en tu reparto: ${item.hl && item.hl.length ? "aporta " + item.hl.join(" y ").toLowerCase() + "." : "fuente fiable de macros."}`;
}

Object.assign(window, {
  AIcon, A_SOURCE, MACRO_COL_A, aN, a1, buildAlimento, ABubble, MacroDonut, AHero, ATabs,
  MacroCard, AMicros, AUsage, AHistory, AFicha, ARecipe, AAgentNote, AAgentEdit, aAgentMsg,
});
