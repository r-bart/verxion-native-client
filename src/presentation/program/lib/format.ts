/**
 * es-ES formatting for Programas, hand-rolled (NO Intl) — Hermes-iOS ships an
 * incomplete Intl, so we format manually like the Entreno/Nutrición helpers.
 */
import type { ProgramOverview } from "@/domain/program/models/Program";

/** Integer with a dot thousands separator: 2250 → "2.250". Non-finite → "—". */
export function pgInt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n);
  const sign = rounded < 0 ? "-" : "";
  return sign + Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const ES_MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/** Short es-ES date: "2026-05-13" → "13 may 2026". null for empty/invalid. */
export function pgShortDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getDate()} ${ES_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Long window label for the hero chip: "13 may 2026 – 24 jun 2026" / "Indefinido". */
export function pgWindow(p: ProgramOverview, indefiniteLabel: string): string {
  if (p.durationType === "indefinite") return indefiniteLabel;
  const from = pgShortDate(p.startDate);
  const to = pgShortDate(p.status === "completed" ? p.finishedDate : p.endDate);
  if (from && to) return `${from} – ${to}`;
  return from ?? to ?? indefiniteLabel;
}

/** Count of training days in the weekly schedule (the hero's "días/sem"). */
export function pgTrainingDays(p: ProgramOverview): number {
  return (p.weeklySchedule ?? []).filter((d) => d === "training").length;
}
