import type {
  CompleteOnboardingResult,
  CurrentUser,
  OnboardingData,
  UsernameCheckResult,
} from "@/domain/onboarding/models/Onboarding";
import type { IOnboardingPort } from "@/domain/onboarding/ports/IOnboardingPort";
import { apiClient } from "../api/apiClient";

/** Raw `/users/me` (and `/users/onboard` → user) response shape we read from. */
interface UserProfileResponse {
  id: string;
  authUserId: string;
  email?: string | null;
  name?: string | null;
  username?: string | null;
  hasAthleteProfile: boolean;
  preferences?: { language?: string | null } | null;
  currentHealthConsentVersion: string;
}

function toCurrentUser(r: UserProfileResponse): CurrentUser {
  const lang = r.preferences?.language;
  return {
    id: r.id,
    authUserId: r.authUserId,
    email: r.email ?? "",
    name: r.name ?? null,
    username: r.username ?? null,
    hasAthleteProfile: r.hasAthleteProfile,
    language: lang === "en" || lang === "es" ? lang : null,
    currentHealthConsentVersion: r.currentHealthConsentVersion,
  };
}

export class HttpOnboardingRepository implements IOnboardingPort {
  async getCurrentUser(): Promise<CurrentUser> {
    const data = await apiClient.get<UserProfileResponse>("/users/me");
    return toCurrentUser(data);
  }

  async checkUsername(username: string): Promise<UsernameCheckResult> {
    return apiClient.get<UsernameCheckResult>(
      `/users/check-username/${encodeURIComponent(username)}`,
    );
  }

  async completeOnboarding(
    data: OnboardingData,
  ): Promise<CompleteOnboardingResult> {
    const res = await apiClient.post<{
      user: UserProfileResponse;
      isNewUser: boolean;
    }>("/users/onboard", data);
    return { user: toCurrentUser(res.user), isNewUser: res.isNewUser };
  }
}
