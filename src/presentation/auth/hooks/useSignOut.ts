import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useDI } from "@/infrastructure/di/DIContext";

/**
 * Signs the user out. Clears the session locally (the `@better-auth/expo`
 * client wipes the SecureStore cookie + session cache on `/sign-out`), then
 * empties the query cache and navigates to the login screen *explicitly*.
 *
 * Navigation matters here: settings is a screen pushed on top of the root Stack,
 * above the `(auth)`/`(onboarding)`/`(tabs)` groups. `AuthGuard` only switches
 * between those groups, so it can't pop the pushed settings stack on its own —
 * relying on its redirect alone left the user stranded on settings after signing
 * out. We first `dismissAll()` any pushed screens, then `replace` to login: a
 * lingering settings route would otherwise resurface after the user signs back
 * in (re-login dropped them right back into settings). Dismissing unwinds to a
 * clean root so both logout and the next login start from `(tabs)`.
 *
 * We finalize on `onSettled` (not `onSuccess`): the `@better-auth/expo` client
 * wipes the local session — cookie + cache — in its request `init` hook, before
 * the `/sign-out` network call resolves. So even if that call fails, the device
 * is already logged out; redirecting regardless avoids stranding the user on a
 * stale, now-invalid session. Re-login is the only correct path from there.
 */
export function useSignOut() {
  const uc = useDI((c) => c.signOut);
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => uc.execute(),
    onSettled: () => {
      queryClient.clear();
      if (router.canDismiss()) router.dismissAll();
      router.replace("/(auth)/login");
    },
  });
}
