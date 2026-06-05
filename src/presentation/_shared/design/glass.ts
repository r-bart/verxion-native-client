/**
 * Glass design language — RN-safe tokens promoted verbatim from the design
 * handoff (lookbook `foundation/agentTheme.ts`, lifted from `agente.css`).
 *
 * These are the "liquid glass over a lava bloom" values: a near-black screen,
 * translucent white glass fills + hairline strokes, ink text tiers, and the
 * lava brand anchor. They complement `tokens.ts` (the shadcn/NativeWind hsl
 * system) — this module holds the values that don't fit the hsl/CSS-var model
 * (alpha-over-dark fills, blooms). Consumed by GlassSurface, ScreenBloom, the
 * glass tab bar and avatar.
 */
export const glass = {
  // screen
  screenBg: "#08080a",

  // glass fills / strokes
  fill: "rgba(255,255,255,0.055)",
  fill2: "rgba(255,255,255,0.085)",
  stroke: "rgba(255,255,255,0.12)",
  tabFill: "rgba(120,120,128,0.16)",

  // ink (text tiers over the dark bloom)
  white: "#ffffff",
  ink: "#ededed",
  ink2: "rgba(255,255,255,0.6)",
  ink3: "rgba(255,255,255,0.42)",

  // brand — lava
  lava: "#FF6262",
  lavaHover: "#FF7A7A",
  lavaBg: "#1F1214",
  lavaGlow: "rgba(255,98,98,0.5)",
  lavaBorder: "rgba(255,98,98,0.3)",
  fgOnLava: "#0A0A0A",

  // "ahead / up / done" green
  up: "#5FE39A",
  upBg: "#0E1A13",

  // motion / feedback
  pressOpacity: 0.8,
} as const;

export type Glass = typeof glass;
