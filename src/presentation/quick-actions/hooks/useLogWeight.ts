import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { todayKeys, progressKeys } from "@/presentation/_shared/keys";

export function useLogWeight() {
  const uc = useDI((c) => c.logWeight);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (weightKg: number) => uc.execute(weightKg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todayKeys.all() });
      queryClient.invalidateQueries({ queryKey: progressKeys.all() });
    },
  });
}
