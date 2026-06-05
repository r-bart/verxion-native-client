import type {
  GenderType,
  MeasurementSystemType,
  ExperienceLevelType,
  FitnessGoalType,
} from "@/domain/_shared/fitness";
import type { AppLanguage } from "./inputs";

/**
 * The editable account surface read from `GET /users/me`. Combines read-only
 * identity (email) with the personal/fitness fields the settings screens edit
 * (split on save across `PUT /users/me` and `PUT /users/me/preferences`).
 *
 * The slim onboarding `CurrentUser` (the gate) stays separate — this is the
 * full account view that only the settings module needs.
 */
export interface UserAccount {
  id: string;
  /** Read-only — email is managed by the auth provider, not here. */
  email: string;
  name: string | null;
  username: string | null;
  gender: GenderType | null;
  /** ISO date `YYYY-MM-DD`. */
  dateOfBirth: string | null;
  heightCm: number | null;
  measurementSystem: MeasurementSystemType;
  experienceLevel: ExperienceLevelType;
  primaryGoal: FitnessGoalType | null;
  /**
   * App-language mirror read from `appPreferences.language`. `null` = never set
   * server-side → the client falls back to the device locale. Used by the
   * post-login language reconcile (§8.3); the local override still wins.
   */
  language: AppLanguage | null;
  /** Active health-consent version (gates writes to `PUT /users/me`). */
  currentHealthConsentVersion: string;
}
