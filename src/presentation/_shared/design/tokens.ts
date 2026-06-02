/**
 * Verxion design tokens — single source of truth (native).
 *
 * Baseline adopted from the web SPA (`apps/web-app/src/index.css` `@theme`):
 * neutral grays (hue 0), lava-red accent `hsl(0 100% 69%)`, SPA radius and
 * type scale. The product is dark-only (`app.json` → userInterfaceStyle: dark),
 * matching the SPA.
 *
 * Web→native translation note: the SPA expresses surfaces as translucent layers
 * (e.g. card `hsl(0 0% 19% / 0.1)`) that rely on the browser's backdrop/layering.
 * On RN that alpha over near-black is invisible, so chrome SURFACES are opaque
 * elevations here while keeping the SPA's neutral hue. Hairline borders stay
 * translucent (they read fine on device).
 *
 * Two consumers read these tokens:
 *  - Runtime constants (RN `style={{…}}`) → RN-safe `hsl()/hsla()` comma syntax.
 *    RN does NOT parse the modern space/slash syntax (`hsl(0 0% 4% / .1)`).
 *  - NativeWind CSS variables (`global.css`, consumed by `tailwind.config.js`) →
 *    space-separated hsl channels. Generated from `CSS_VARS` via
 *    `scripts/generate-design-tokens.ts` so the two never drift.
 *
 * Edit channels/values HERE, then run `npm run tokens` to regenerate global.css.
 */

// ── color channels (hsl) ─────────────────────────────────────────────────────
type Hsl = { h: number; s: number; l: number; a?: number };

/** RN-safe color string (comma hsl/hsla). */
function rn(c: Hsl): string {
  return c.a != null
    ? `hsla(${c.h}, ${c.s}%, ${c.l}%, ${c.a})`
    : `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
}

/** CSS-variable value (space-separated channels, optional `/ alpha`). */
function cssVar(c: Hsl): string {
  return c.a != null ? `${c.h} ${c.s}% ${c.l}% / ${c.a}` : `${c.h} ${c.s}% ${c.l}%`;
}

/**
 * Semantic color channels — SPA dark baseline, neutralized hue + opaque surfaces.
 *
 * The SPA expresses several tokens as translucent white over a layered card
 * (e.g. secondary `0 0% 100% / 0.05`, border `0 0% 100% / 0.06`). NativeWind +
 * react-native-reusables consume vars as opaque `hsl(var(--x))`, so those are
 * baked here to the solid equivalent over the `0 0% 4%` background — same look,
 * proven RN path, no slash-alpha parsing at runtime.
 */
const CH = {
  background: { h: 0, s: 0, l: 4 },
  foreground: { h: 0, s: 0, l: 98 },
  card: { h: 0, s: 0, l: 11 }, // opaque elevation (RN translation of SPA's translucent card)
  cardForeground: { h: 0, s: 0, l: 98 },
  popover: { h: 0, s: 0, l: 8 },
  popoverForeground: { h: 0, s: 0, l: 98 },
  primary: { h: 0, s: 0, l: 96 },
  primaryForeground: { h: 0, s: 0, l: 10 },
  secondary: { h: 0, s: 0, l: 10 }, // SPA white/0.06 baked over bg
  secondaryForeground: { h: 0, s: 0, l: 98 },
  muted: { h: 0, s: 0, l: 9 }, // SPA white/0.05 baked over bg
  mutedForeground: { h: 0, s: 0, l: 57 }, // SPA white/0.55 baked over bg
  accent: { h: 0, s: 100, l: 69 }, // lava red — the brand anchor (matches SPA + web)
  accentForeground: { h: 0, s: 0, l: 4 },
  destructive: { h: 0, s: 100, l: 75 },
  destructiveForeground: { h: 0, s: 0, l: 98 },
  success: { h: 142, s: 71, l: 45 },
  successForeground: { h: 0, s: 0, l: 98 },
  border: { h: 0, s: 0, l: 14 }, // SPA white/0.08 baked; reads as a hairline on device
  input: { h: 0, s: 0, l: 10 },
  ring: { h: 0, s: 0, l: 28 },
  // text tiers
  tertiaryForeground: { h: 0, s: 0, l: 38 }, // SPA white/0.35 baked over bg
} satisfies Record<string, Hsl>;

/** Resolved, RN-safe semantic colors. */
export const color = {
  background: rn(CH.background),
  foreground: rn(CH.foreground),
  card: rn(CH.card),
  cardForeground: rn(CH.cardForeground),
  popover: rn(CH.popover),
  popoverForeground: rn(CH.popoverForeground),
  primary: rn(CH.primary),
  primaryForeground: rn(CH.primaryForeground),
  secondary: rn(CH.secondary),
  secondaryForeground: rn(CH.secondaryForeground),
  muted: rn(CH.muted),
  mutedForeground: rn(CH.mutedForeground),
  accent: rn(CH.accent),
  accentForeground: rn(CH.accentForeground),
  destructive: rn(CH.destructive),
  destructiveForeground: rn(CH.destructiveForeground),
  success: rn(CH.success),
  successForeground: rn(CH.successForeground),
  border: rn(CH.border),
  input: rn(CH.input),
  ring: rn(CH.ring),
} as const;

/** Text tiers (chrome). */
export const text = {
  primary: rn(CH.foreground),
  secondary: rn(CH.mutedForeground),
  tertiary: rn(CH.tertiaryForeground),
} as const;

/** Chrome surfaces. */
export const surface = {
  screen: rn(CH.background),
  card: rn(CH.card),
  popover: rn(CH.popover),
} as const;

/**
 * Data-visualization palette (native-only — the web has no analytics charts).
 * `positive` is sourced from the brand accent so the lava red stays single-sourced;
 * the rest are vivid metric hues with no web equivalent and are preserved as-is.
 */
export const palette = {
  positive: { primary: color.accent, secondary: "#E04545", background: "#1F1214", text: color.accent },
  health: { primary: "#FF4757", secondary: "#E84118", background: "#1F1214", text: "#FF4757" },
  body: { primary: "#00D2FF", secondary: "#00A8CC", background: "#0F1820", text: "#00D2FF" },
  neutral: { primary: "#FFB900", secondary: "#FF9500", background: "#1F1A10", text: "#FFB900" },
  insight: { primary: "#9B59B6", secondary: "#8E44AD", background: "#1A151C", text: "#9B59B6" },
} as const;

/** Status colors. */
export const status = {
  active: color.accent,
  completed: "#6C757D",
  paused: "#FFB900",
} as const;

// ── radius (SPA: 0.5 / 0.75 / 1.25rem → px) ──────────────────────────────────
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// ── spacing (4-pt scale) ─────────────────────────────────────────────────────
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// ── typography (SPA type scale) ──────────────────────────────────────────────
type TypeStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: "400" | "500" | "600" | "700";
  letterSpacing?: number;
};

/** Named roles used across the app. Sizes track the SPA scale (xs/sm/md/lg). */
export const typography = {
  metric: { fontSize: 64, lineHeight: 72, fontWeight: "700", letterSpacing: -1 },
  cardTitle: { fontSize: 20, lineHeight: 28, fontWeight: "600", letterSpacing: -0.2 },
  metricLabel: { fontSize: 16, lineHeight: 24, fontWeight: "500" },
  cardSubtitle: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
  context: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
} satisfies Record<string, TypeStyle>;

/** Font families (match the SPA — Geist). Loaded via expo-font; falls back to system. */
export const fontFamily = {
  sans: "Geist",
  mono: "Geist Mono",
} as const;

// ── CSS variables (generated into global.css by scripts/generate-design-tokens.ts) ──
// Keys map to the shadcn-style vars that tailwind.config.js consumes as hsl(var(--x)).
export const CSS_VARS: Record<string, string> = {
  background: cssVar(CH.background),
  foreground: cssVar(CH.foreground),
  card: cssVar(CH.card),
  "card-foreground": cssVar(CH.cardForeground),
  popover: cssVar(CH.popover),
  "popover-foreground": cssVar(CH.popoverForeground),
  primary: cssVar(CH.primary),
  "primary-foreground": cssVar(CH.primaryForeground),
  secondary: cssVar(CH.secondary),
  "secondary-foreground": cssVar(CH.secondaryForeground),
  muted: cssVar(CH.muted),
  "muted-foreground": cssVar(CH.mutedForeground),
  accent: cssVar(CH.accent),
  "accent-foreground": cssVar(CH.accentForeground),
  destructive: cssVar(CH.destructive),
  "destructive-foreground": cssVar(CH.destructiveForeground),
  border: cssVar(CH.border),
  input: cssVar(CH.input),
  ring: cssVar(CH.ring),
};

/** Light-theme overrides (app is dark-only; kept neutral for the nav theme toggle). */
export const CSS_VARS_LIGHT: Record<string, string> = {
  background: "0 0% 100%",
  foreground: "0 0% 4%",
  card: "0 0% 100%",
  "card-foreground": "0 0% 4%",
  popover: "0 0% 100%",
  "popover-foreground": "0 0% 4%",
  primary: "0 0% 10%",
  "primary-foreground": "0 0% 98%",
  secondary: "0 0% 95%",
  "secondary-foreground": "0 0% 10%",
  muted: "0 0% 96%",
  "muted-foreground": "0 0% 45%",
  accent: "0 100% 69%",
  "accent-foreground": "0 0% 100%",
  destructive: "0 84% 60%",
  "destructive-foreground": "0 0% 98%",
  border: "0 0% 90%",
  input: "0 0% 92%",
  ring: "0 0% 10%",
};

/** Aggregate export. */
export const tokens = {
  color,
  text,
  surface,
  palette,
  status,
  radius,
  spacing,
  typography,
  fontFamily,
} as const;

export type Tokens = typeof tokens;
