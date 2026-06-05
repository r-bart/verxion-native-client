import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { userKeys } from "../keys";

/**
 * The authenticated platform user (`GET /users/me`). Drives the onboarding gate
 * (`hasAthleteProfile`) and the header avatar/initials. App-shared — lives in
 * `_shared` so no single feature owns it.
 */
export function useCurrentUser(enabled = true) {
  const uc = useDI((c) => c.getCurrentUser);
  return useQuery({
    queryKey: userKeys.currentUser(),
    queryFn: () => uc.execute(),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
