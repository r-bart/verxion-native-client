/**
 * Progress / analytics design constants.
 *
 * This is now an ADAPTER over the canonical design tokens
 * (`@/presentation/_shared/design/tokens`). The public API (PROGRESS_COLORS,
 * METRIC_TYPOGRAPHY, CARD_SPACING, helpers) is unchanged — ~116 screens import
 * it — but every value is sourced from the SPA-aligned token source of truth.
 * Do NOT hardcode colors here; edit design/tokens.ts instead.
 */
import {
  palette,
  status,
  surface,
  text,
  typography,
  radius,
  spacing,
} from "@/presentation/_shared/design/tokens";

// =======================
// COLOR PALETTE
// =======================

export const PROGRESS_COLORS = {
  // Metric Type Colors (data-viz palette)
  positive: palette.positive,
  health: palette.health,
  body: palette.body,
  neutral: palette.neutral,
  insight: palette.insight,

  // Status Colors
  active: status.active,
  completed: status.completed,
  paused: status.paused,

  // Background (chrome surfaces)
  cardBackground: surface.card,
  screenBackground: surface.screen,

  // Text
  primaryText: text.primary,
  secondaryText: text.secondary,
  tertiaryText: text.tertiary,
} as const;

export type ProgressColorType =
  | "positive"
  | "health"
  | "body"
  | "neutral"
  | "insight"
  | "gray";

// =======================
// TYPOGRAPHY
// =======================

export const METRIC_TYPOGRAPHY = {
  metric: typography.metric,
  metricLabel: typography.metricLabel,
  cardTitle: typography.cardTitle,
  cardSubtitle: typography.cardSubtitle,
  context: typography.context,
} as const;

// =======================
// SPACING
// =======================

export const CARD_SPACING = {
  padding: spacing[6],
  gap: spacing[4],
  borderRadius: radius.lg,
  iconSize: 32,
  chevronSize: 20,
} as const;

// =======================
// HELPER FUNCTIONS
// =======================

export function getMetricColor(
  type: "positive" | "health" | "body" | "neutral" | "insight"
) {
  return PROGRESS_COLORS[type];
}

const GRAY_COLOR_THEME = {
  primary: PROGRESS_COLORS.completed,
  secondary: PROGRESS_COLORS.completed,
  background: PROGRESS_COLORS.cardBackground,
  text: PROGRESS_COLORS.completed,
} as const;

export function getColorTheme(color: ProgressColorType) {
  if (color === "gray") return GRAY_COLOR_THEME;
  return PROGRESS_COLORS[color];
}
