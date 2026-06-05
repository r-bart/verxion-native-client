/**
 * Public athlete profile read from `GET /profiles/me`. Edited via
 * `PUT /profiles/me` (displayName, bio, sportTags) and `PUT /profiles/me/username`.
 * `bio` is `null` when never set (distinct from an empty string).
 *
 * The privacy surface (`sectionVisibility`, `showcaseMetrics`,
 * `timelineDetailLevel`, `requireFollowApproval`) is read here too and edited
 * via the dedicated `PUT /profiles/me/{visibility,showcase,timeline-detail,follow-approval}`
 * routes. Feed-sharing lives behind its own GET/PUT (see `FeedSharingSettings`).
 */

/** Per-section public visibility (`PUT /profiles/me/visibility`). */
export interface SectionVisibility {
  bio: boolean;
  training: boolean;
  bodyMetrics: boolean;
  nutrition: boolean;
}

/** Detail level of the public activity timeline (`PUT /profiles/me/timeline-detail`). */
export type TimelineDetailLevel = "summary" | "detailed";

/** Metrics that can be pinned to the public profile showcase (max 6). */
export type ShowcaseMetric =
  | "sport_tags"
  | "total_sessions"
  | "total_volume"
  | "current_streak"
  | "prs_this_month"
  | "favorite_exercises"
  | "weekly_frequency"
  | "current_weight"
  | "weight_trend"
  | "body_fat"
  | "measurements"
  | "avg_daily_calories"
  | "macro_split"
  | "diet_plan_type"
  | "nutrition_streak";

export const SHOWCASE_METRICS: readonly ShowcaseMetric[] = [
  "sport_tags",
  "total_sessions",
  "total_volume",
  "current_streak",
  "prs_this_month",
  "favorite_exercises",
  "weekly_frequency",
  "current_weight",
  "weight_trend",
  "body_fat",
  "measurements",
  "avg_daily_calories",
  "macro_split",
  "diet_plan_type",
  "nutrition_streak",
];

export const SHOWCASE_MAX = 6;

/** What the feed shares per domain (`GET`/`PUT /profiles/me/feed-sharing`). */
export interface FeedSharingSettings {
  training: boolean;
  nutrition: boolean;
  bodyMetrics: boolean;
}

export interface AthleteProfile {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  sportTags: string[];
  isPublic: boolean;
  followerCount: number;
  followingCount: number;
  /** ISO timestamp of the last username change — drives the 30-day cooldown UI. */
  usernameChangedAt: string | null;
  // ── Privacy surface ──
  sectionVisibility: SectionVisibility;
  showcaseMetrics: ShowcaseMetric[];
  timelineDetailLevel: TimelineDetailLevel;
  requireFollowApproval: boolean;
}
