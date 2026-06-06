import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { authKeys } from "./useSession";

/**
 * Triggers Apple sign-in. The native credential acquisition lives in
 * infrastructure (`appleCredentialProvider`); this hook only invokes the use
 * case and refreshes the session. A user cancellation surfaces as
 * `SignInCancelled`, which the screen treats as silent.
 */
export function useSignInApple() {
  const uc = useDI((c) => c.signInApple);
  const rememberProvider = useDI((c) => c.lastAuthProvider.setLastAuthProvider);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => uc.execute(),
    onSuccess: () => {
      void rememberProvider("apple");
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
}
