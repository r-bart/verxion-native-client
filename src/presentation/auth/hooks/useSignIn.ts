import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { authKeys } from "./useSession";

/**
 * Email + password sign-in. Reviewer-only path, reachable solely via the
 * hidden reviewer form on the login screen.
 */
export function useSignIn() {
  const uc = useDI((c) => c.signIn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uc.execute.bind(uc),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: authKeys.session() }),
  });
}
