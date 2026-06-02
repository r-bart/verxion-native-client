import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";

export function useSignOut() {
  const uc = useDI((c) => c.signOut);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => uc.execute(),
    onSuccess: () => queryClient.clear(),
  });
}
