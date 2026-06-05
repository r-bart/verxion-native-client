import type {
  CompleteOnboardingResult,
  CurrentUser,
  OnboardingData,
  UsernameCheckResult,
} from "../models/Onboarding";

/**
 * Onboarding module port. Backed by the platform's `/users/*` endpoints:
 *  - getCurrentUser  → GET  /users/me            (the gate: hasAthleteProfile)
 *  - checkUsername   → GET  /users/check-username/:username
 *  - completeOnboarding → POST /users/onboard
 *
 * `getCurrentUser` lives here (not in auth) because the only thing that reads
 * it today is the onboarding gate. The auth port stays scoped to the Better
 * Auth session; this returns the platform user profile.
 */
export interface IOnboardingPort {
  getCurrentUser(): Promise<CurrentUser>;
  checkUsername(username: string): Promise<UsernameCheckResult>;
  completeOnboarding(data: OnboardingData): Promise<CompleteOnboardingResult>;
}
