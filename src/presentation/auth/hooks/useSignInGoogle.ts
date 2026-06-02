import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { authKeys } from "./useSession";

export function useSignInGoogle() {
  const uc = useDI((c) => c.signInGoogle);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => uc.execute(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: authKeys.session() }),
  });
}
