import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { todayKeys } from "@/presentation/_shared/keys";

export function useLogWater() {
  const uc = useDI((c) => c.logWater);
  const queryClient = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  return useMutation({
    mutationFn: (amountMl: number) => uc.execute(amountMl),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: todayKeys.dailyWater(today),
      });
    },
  });
}
