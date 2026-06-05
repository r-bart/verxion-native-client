/**
 * Onboarding domain models — mirror the platform's `completeOnboardingSchema`
 * (packages/shared/src/schemas/user.ts) exactly so `POST /users/onboard`
 * accepts the payload without translation. Friendly UI copy lives in the
 * presentation layer; these are the canonical wire values.
 */

// Shared fitness vocabulary lives in the domain shared kernel so `settings` and
// `onboarding` both depend on it instead of on each other. Re-exported here to
// keep the onboarding module's public API unchanged.
import type {
  GenderType,
  MeasurementSystemType,
  FitnessGoalType,
  ExperienceLevelType,
} from "../../_shared/fitness";

export type {
  GenderType,
  MeasurementSystemType,
  FitnessGoalType,
  ExperienceLevelType,
} from "../../_shared/fitness";

export type OnboardingStepKey =
  | "healthConsent"
  | "username"
  | "measurementSystem"
  | "experienceLevel"
  | "personalDetails"
  | "fitnessGoal";

export interface OnboardingStepMeta {
  key: OnboardingStepKey;
  label: string;
  optional: boolean;
}

/**
 * Step ordering — required steps first, then the optional tail. There is no
 * mid-flow "summary" off-ramp (it nudged users to skip the optional tail).
 * `fitnessGoal` is the submit anchor: its Continue and Skip both submit.
 * Mirrors the SPA's `ONBOARDING_STEPS`.
 */
export const ONBOARDING_STEPS: OnboardingStepMeta[] = [
  { key: "healthConsent", label: "Health consent", optional: false },
  { key: "username", label: "Username", optional: false },
  { key: "measurementSystem", label: "Units", optional: false },
  { key: "experienceLevel", label: "Experience", optional: false },
  { key: "personalDetails", label: "Personal details", optional: true },
  { key: "fitnessGoal", label: "Goal", optional: true },
];

/**
 * Payload for `POST /users/onboard`. Required: username, measurementSystem,
 * experienceLevel, healthDataConsentGranted (literal true). Everything else
 * optional and omitted when unset.
 */
export interface OnboardingData {
  username: string;
  healthDataConsentGranted: true;
  measurementSystem: MeasurementSystemType;
  experienceLevel: ExperienceLevelType;
  gender?: GenderType;
  dateOfBirth?: string; // YYYY-MM-DD
  heightCm?: number;
  primaryGoal?: FitnessGoalType;
}

/** Authenticated user profile (`GET /users/me`) — the onboarding gate. */
export interface CurrentUser {
  id: string;
  authUserId: string;
  email: string;
  name: string | null;
  username: string | null;
  /** When false, the user has not completed onboarding → route to the wizard. */
  hasAthleteProfile: boolean;
  /**
   * Server-side app language (`appPreferences.language`); `null` = unset.
   * Drives the post-login reconcile (§8.3) — local choice still wins.
   */
  language: "en" | "es" | null;
  /** Active consent version — invalidates persisted drafts when it changes. */
  currentHealthConsentVersion: string;
}

/** Result of `POST /users/onboard`. */
export interface CompleteOnboardingResult {
  user: CurrentUser;
  isNewUser: boolean;
}

/** Result of `GET /users/check-username/:username`. */
export interface UsernameCheckResult {
  isAvailable: boolean;
  isValid: boolean;
  error?: string;
}
