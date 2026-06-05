import type {
  GenderType,
  MeasurementSystemType,
  ExperienceLevelType,
  FitnessGoalType,
} from "@/domain/_shared/fitness";

/** OAuth consent categories (mirrors the platform `CONSENT_CATEGORIES`). */
export type ConsentCategory =
  | "workouts"
  | "nutrition"
  | "profile"
  | "social"
  | "notes";

export const CONSENT_CATEGORIES: readonly ConsentCategory[] = [
  "workouts",
  "nutrition",
  "profile",
  "social",
  "notes",
];

/** App-preference wire values (mirror the platform `UpdatePreferences` enums). */
export type ThemeType = "light" | "dark" | "system";
export type AccentType =
  | "red"
  | "dark_blue"
  | "purple"
  | "fuchsia"
  | "lime"
  | "ocean_blue";
export type AppLanguage = "en" | "es";

/** BYOK model provider for `aiPreferences` (the Agent section persists this). */
export type AIProviderType = "openai" | "anthropic" | "google";

/** Closed sport-tag vocabulary the API accepts on `PUT /profiles/me` (write side). */
export type SportTag =
  | "powerlifting"
  | "bodybuilding"
  | "crossfit"
  | "calisthenics"
  | "weightlifting"
  | "strongman"
  | "functional_fitness"
  | "hiit"
  | "yoga"
  | "pilates"
  | "running"
  | "cycling"
  | "swimming"
  | "martial_arts"
  | "boxing"
  | "climbing"
  | "gymnastics"
  | "general_fitness";

/**
 * `PUT /users/me` — personal/fitness identity fields. The API names the gender
 * field `sex`. All optional; only changed fields are sent. `username`/`firstName`
 * are intentionally omitted: display name lives on `PUT /profiles/me` and the
 * username on `PUT /profiles/me/username` (settings keeps `name` read-only, §8.1).
 */
export interface UpdateAccountInput {
  sex?: GenderType | null;
  dateOfBirth?: string | null;
  heightCm?: number;
  measurementSystem?: MeasurementSystemType;
  experienceLevel?: ExperienceLevelType;
}

/**
 * `PUT /users/me/preferences` — nested preference groups, all optional. Mirrors
 * the platform `UpdatePreferences` schema. `aiPreferences` requires BOTH fields
 * when present (the API rejects a partial provider/model).
 */
export interface UpdatePreferencesInput {
  fitnessPreferences?: {
    measurementSystem?: MeasurementSystemType;
    experienceLevel?: ExperienceLevelType;
    primaryGoal?: FitnessGoalType;
  };
  appPreferences?: {
    theme?: ThemeType;
    accent?: AccentType;
    language?: AppLanguage;
  };
  aiPreferences?: { provider: AIProviderType; modelId: string };
}

/** `PUT /profiles/me` — public athlete profile fields. */
export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  sportTags?: SportTag[];
}

/**
 * A picked image for `POST /profiles/me/avatar` (multipart `file` field). Shape
 * matches React Native's FormData file part (`{ uri, name, type }`).
 */
export interface AvatarFile {
  uri: string;
  name: string;
  type: string;
}

/** `PATCH /auth-sessions/apps/:clientId/scopes` — granular consent update. */
export interface UpdateConnectedAppScopesInput {
  clientId: string;
  categories: ConsentCategory[];
  includeDestructive: boolean;
}
