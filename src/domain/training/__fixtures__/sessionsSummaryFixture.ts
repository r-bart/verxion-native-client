/**
 * sessionsSummaryFixture — typed example payload for `SessionsSummary`, the
 * contract proposal for `GET /training/sessions-summary`. Layer-neutral (imports
 * only the domain type). Mirrors the handoff's `sesiones-data` recent slice
 * (PPL Hipertrofia, last 6 sessions).
 *
 * TEMPORARY: served by the repository stub until the endpoint ships.
 */
import type { SessionsSummary } from "../models/SessionsSummary";

export const sessionsSummaryFixture: SessionsSummary = {
  stats: { sessions: 14, blockVolume: "32,1 t", trendPct: 8 },
  recent: [
    { id: "legs-b-31may", dateLabel: "Sáb 31", type: "legs", name: "Legs B", hasPR: true, prCount: 1, volumeLabel: "9,2 t", volumeFraction: 0.95, deltaPct: 4 },
    { id: "pull-b-30may", dateLabel: "Vie 30", type: "pull", name: "Pull B", hasPR: false, prCount: 0, volumeLabel: "6,8 t", volumeFraction: 0.70, deltaPct: -2 },
    { id: "push-b-29may", dateLabel: "Jue 29", type: "push", name: "Push B", hasPR: true, prCount: 1, volumeLabel: "7,1 t", volumeFraction: 0.73, deltaPct: 6 },
    { id: "legs-a-28may", dateLabel: "Mié 28", type: "legs", name: "Legs A", hasPR: false, prCount: 0, volumeLabel: "8,9 t", volumeFraction: 0.92, deltaPct: 3 },
    { id: "pull-a-27may", dateLabel: "Mar 27", type: "pull", name: "Pull A", hasPR: false, prCount: 0, volumeLabel: "6,5 t", volumeFraction: 0.67, deltaPct: 1 },
    { id: "push-a-26may", dateLabel: "Lun 26", type: "push", name: "Push A", hasPR: true, prCount: 2, volumeLabel: "7,4 t", volumeFraction: 0.76, deltaPct: 8 },
  ],
};
