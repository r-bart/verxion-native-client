import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { todayKeys } from "@/presentation/_shared/keys";

export function useLogSteps() {
  const uc = useDI((c) => c.logSteps);
  const queryClient = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  return useMutation({
    mutationFn: (totalSteps: number) => uc.execute(totalSteps),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: todayKeys.dailySteps(today),
      });
    },
  });
}
