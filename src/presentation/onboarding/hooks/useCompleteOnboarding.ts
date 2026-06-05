import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import type {
  CompleteOnboardingResult,
  OnboardingData,
} from "@/domain/onboarding/models/Onboarding";
import { userKeys } from "@/presentation/_shared/keys";

/**
 * Submit onboarding (`POST /users/onboard`). On success, seed the currentUser
 * cache (so the gate sees `hasAthleteProfile=true` immediately) and invalidate
 * session/currentUser so the guard re-routes out of the wizard. Draft cleanup
 * and the `onboarding_completed` event live here — not at the call site —
 * because the stepper unmounts as soon as the gate re-routes, which would drop
 * a mutate-call onSuccess (TanStack Query v5 behavior).
 */
export function useCompleteOnboarding() {
  const uc = useDI((c) => c.completeOnboarding);
  const { track, identify } = useDI((c) => c.telemetry);
  const draftStore = useDI((c) => c.onboardingDraftStore);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OnboardingData) => uc.execute(data),
    onSuccess: (result: CompleteOnboardingResult, variables: OnboardingData) => {
      // Tie the anonymous pre-onboarding events to the now-known user.
      identify(result.user.authUserId, {
        username: result.user.username ?? undefined,
        experience_level: variables.experienceLevel,
        measurement_system: variables.measurementSystem,
      });
      track("onboarding_completed", {
        measurement_system: variables.measurementSystem,
        experience_level: variables.experienceLevel,
        fitness_goal: variables.primaryGoal ?? null,
        has_personal_details: !!(
          variables.gender ||
          variables.dateOfBirth ||
          variables.heightCm
        ),
      });
      // Clear the persisted draft now that onboarding is done. Done HERE (not
      // at the call site) because the stepper unmounts the moment the gate
      // re-routes, which would drop a mutate-call onSuccess.
      void draftStore.clearOnboardingDraft({
        userId: result.user.authUserId,
        consentVersion: result.user.currentHealthConsentVersion,
      });
      queryClient.setQueryData(userKeys.currentUser(), result.user);
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      queryClient.invalidateQueries({ queryKey: userKeys.currentUser() });
    },
    onError: (error: unknown, variables: OnboardingData) => {
      track("onboarding_failed", {
        error_message: error instanceof Error ? error.message : "unknown",
        measurement_system: variables.measurementSystem,
        experience_level: variables.experienceLevel,
      });
    },
  });
}
