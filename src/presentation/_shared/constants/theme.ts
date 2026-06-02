/**
 * React Navigation theme colors, derived from the design tokens.
 * The app is dark-only; `light` is kept neutral for completeness.
 */
import { color, surface, text } from "@/presentation/_shared/design/tokens";

export const NAV_THEME = {
  light: {
    background: "hsl(0, 0%, 100%)",
    border: "hsla(0, 0%, 0%, 0.1)",
    card: "hsl(0, 0%, 100%)",
    notification: color.accent,
    primary: "hsl(0, 0%, 10%)",
    text: "hsl(0, 0%, 4%)",
  },
  dark: {
    background: surface.screen,
    border: color.border,
    card: surface.card,
    notification: color.accent,
    primary: color.primary,
    text: text.primary,
  },
};
