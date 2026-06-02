import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { authKeys } from "./useSession";

export function useSignIn() {
  const uc = useDI((c) => c.signIn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uc.execute.bind(uc),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: authKeys.session() }),
  });
}
