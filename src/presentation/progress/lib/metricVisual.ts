/**
 * metricVisual — the CLIENT-side registry that maps a metric `key` (the API's
 * opaque slug) to its icon, domain tint and i18n label. Per the read-only split
 * (progress-screen-spec §3), the API owns the data; icons/colors/labels are
 * fixed on the client. `measure` flags the 6 body/activity metrics that have a
 * "Detalle de medida" subpage (`/progress/measure/{metric}`); the rest deep-link
 * to their owning tab (Entreno / Nutrición) and are not navigable here.
 */
import {
  Scale,
  Ruler,
  Dumbbell,
  Utensils,
  HeartPulse,
  Footprints,
  Beef,
  Flame,
  Wheat,
  Droplet,
  Activity,
  TrendingUp,
  type LucideIcon,
} from "lucide-react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";

export type DomainTone = "body" | "neutral" | "lava" | "health" | "up" | "insight";

/** Inventory grouping for the Métricas lens (client-side; the API order is flat). */
export type MetricGroup = "cuerpo" | "entrenamiento" | "nutricion" | "actividad";

/** Render order of the Métricas groups. */
export const METRIC_GROUP_ORDER: MetricGroup[] = ["cuerpo", "entrenamiento", "nutricion", "actividad"];

/** Resolved ink (icon/value color) + tint (bubble background) per domain tone. */
export const TONE_COLOR: Record<DomainTone, { ink: string; tint: string }> = {
  body: { ink: palette.body.primary, tint: palette.body.background },
  neutral: { ink: palette.neutral.primary, tint: palette.neutral.background },
  lava: { ink: glass.lava, tint: glass.lavaBg },
  health: { ink: palette.health.primary, tint: palette.health.background },
  up: { ink: glass.up, tint: glass.upBg },
  insight: { ink: palette.insight.primary, tint: palette.insight.background },
};

type MetricVisual = { icon: LucideIcon; tone: DomainTone; measure: boolean; group: MetricGroup };

// The 13 perimeter sites the API emits (MeasurementType.rawValue): each side is
// an independent row, all mapped to the BODY group with a measure-detail subpage
// (`/progress/measure/{site}`, identity). The contract order pairs right/left
// adjacent, so the 2-col grid lands der./izq. on the same row automatically.
const PERIMETER_SITES = [
  "waist",
  "hips",
  "chest",
  "shoulders",
  "neck",
  "bicep_right",
  "bicep_left",
  "forearm_right",
  "forearm_left",
  "thigh_right",
  "thigh_left",
  "calf_right",
  "calf_left",
] as const;

const PERIMETER_VISUAL: MetricVisual = { icon: Ruler, tone: "neutral", measure: true, group: "cuerpo" };

const REGISTRY: Record<string, MetricVisual> = {
  peso: { icon: Scale, tone: "body", measure: true, group: "cuerpo" },
  ...Object.fromEntries(PERIMETER_SITES.map((site) => [site, PERIMETER_VISUAL])),
  pasos: { icon: Footprints, tone: "neutral", measure: true, group: "actividad" },
  cardio: { icon: HeartPulse, tone: "health", measure: true, group: "actividad" },
  volumen: { icon: Dumbbell, tone: "lava", measure: false, group: "entrenamiento" },
  sesiones: { icon: Activity, tone: "lava", measure: false, group: "entrenamiento" },
  adherencia: { icon: Utensils, tone: "up", measure: false, group: "nutricion" },
  nutricion: { icon: Utensils, tone: "up", measure: false, group: "nutricion" },
  proteina: { icon: Beef, tone: "up", measure: false, group: "nutricion" },
  carbos: { icon: Wheat, tone: "up", measure: false, group: "nutricion" },
  grasa: { icon: Droplet, tone: "up", measure: false, group: "nutricion" },
  kcal: { icon: Flame, tone: "up", measure: false, group: "nutricion" },
};

const FALLBACK: MetricVisual = { icon: TrendingUp, tone: "insight", measure: false, group: "actividad" };

/** Visual descriptor for a metric key (never throws — unknown keys get a fallback). */
export function metricVisual(key: string): MetricVisual {
  return REGISTRY[key] ?? FALLBACK;
}

/** i18n key for a metric label. */
export function metricLabelKey(key: string): string {
  return `progress.metrics.${key}`;
}

/** Human-readable fallback for an unmapped key: "adherencia_rutina" → "Adherencia rutina". */
export function humanizeMetricKey(key: string): string {
  const spaced = key.replace(/[_-]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

type TFn = (key: string, opts?: Record<string, unknown>) => string;

/**
 * Localized metric label, resilient to keys the API adds before we map them: a
 * known key resolves via i18n, an unknown one falls back to a humanized form
 * (never the raw `progress.metrics.x` string the user reported seeing on device).
 */
export function metricLabel(t: TFn, key: string): string {
  return t(metricLabelKey(key), { defaultValue: humanizeMetricKey(key) });
}
