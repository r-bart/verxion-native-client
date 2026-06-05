/**
 * sessionFeedFixture — typed example page for `SessionFeedPage`, the contract
 * proposal for `GET /training/sessions-feed`. Layer-neutral. Mirrors the
 * handoff's `sesiones-data` (two recent blocks). `nextCursor` is null — the stub
 * serves a single page; the real endpoint cursor-paginates.
 *
 * TEMPORARY: served by the repository stub until the endpoint ships.
 */
import type { SessionFeedPage } from "../models/SessionFeed";

export const sessionFeedFixture: SessionFeedPage = {
  totalCount: 14,
  nextCursor: null,
  blocks: [
    {
      id: "ppl-hipertrofia",
      name: "PPL Hipertrofia",
      state: "active",
      dateRange: "12-31 may",
      totalVolume: "174,6 t",
      sessions: [
        { id: "legs-b-31may", dateLabel: "Sáb 31", monthLabel: "may", type: "legs", name: "Legs B", hasPR: true, prCount: 1, volumeLabel: "16,3 t", volumeFraction: 0.96, durationLabel: "66m" },
        { id: "pull-b-30may", dateLabel: "Vie 30", monthLabel: "may", type: "pull", name: "Pull B", hasPR: false, prCount: 0, volumeLabel: "8,6 t", volumeFraction: 0.51, durationLabel: "54m" },
        { id: "push-b-29may", dateLabel: "Jue 29", monthLabel: "may", type: "push", name: "Push B", hasPR: true, prCount: 1, volumeLabel: "4,8 t", volumeFraction: 0.28, durationLabel: "55m" },
        { id: "legs-a-28may", dateLabel: "Mié 28", monthLabel: "may", type: "legs", name: "Legs A", hasPR: false, prCount: 0, volumeLabel: "17,0 t", volumeFraction: 1.0, durationLabel: "64m" },
        { id: "pull-a-27may", dateLabel: "Mar 27", monthLabel: "may", type: "pull", name: "Pull A", hasPR: false, prCount: 0, volumeLabel: "7,0 t", volumeFraction: 0.41, durationLabel: "57m" },
        { id: "push-a-26may", dateLabel: "Lun 26", monthLabel: "may", type: "push", name: "Push A", hasPR: true, prCount: 2, volumeLabel: "7,4 t", volumeFraction: 0.44, durationLabel: "58m" },
        { id: "legs-b-24may", dateLabel: "Sáb 24", monthLabel: "may", type: "legs", name: "Legs B", hasPR: false, prCount: 0, volumeLabel: "15,6 t", volumeFraction: 0.92, durationLabel: "64m" },
        { id: "pull-b-23may", dateLabel: "Vie 23", monthLabel: "may", type: "pull", name: "Pull B", hasPR: false, prCount: 0, volumeLabel: "8,2 t", volumeFraction: 0.48, durationLabel: "55m" },
        { id: "push-b-22may", dateLabel: "Jue 22", monthLabel: "may", type: "push", name: "Push B", hasPR: false, prCount: 0, volumeLabel: "4,6 t", volumeFraction: 0.27, durationLabel: "56m" },
      ],
    },
    {
      id: "ppl-base",
      name: "PPL base",
      state: "completed",
      dateRange: "6 ene – 28 feb",
      totalVolume: "41,8 t",
      sessions: [
        { id: "legs-b-28feb", dateLabel: "Vie 28", monthLabel: "feb", type: "legs", name: "Legs B", hasPR: false, prCount: 0, volumeLabel: "14,1 t", volumeFraction: 0.95, durationLabel: "62m" },
        { id: "pull-b-27feb", dateLabel: "Jue 27", monthLabel: "feb", type: "pull", name: "Pull B", hasPR: false, prCount: 0, volumeLabel: "7,4 t", volumeFraction: 0.50, durationLabel: "52m" },
        { id: "push-b-26feb", dateLabel: "Mié 26", monthLabel: "feb", type: "push", name: "Push B", hasPR: true, prCount: 1, volumeLabel: "4,2 t", volumeFraction: 0.28, durationLabel: "54m" },
        { id: "legs-a-25feb", dateLabel: "Mar 25", monthLabel: "feb", type: "legs", name: "Legs A", hasPR: false, prCount: 0, volumeLabel: "14,8 t", volumeFraction: 1.0, durationLabel: "60m" },
        { id: "pull-a-24feb", dateLabel: "Lun 24", monthLabel: "feb", type: "pull", name: "Pull A", hasPR: false, prCount: 0, volumeLabel: "6,8 t", volumeFraction: 0.46, durationLabel: "55m" },
      ],
    },
  ],
};
