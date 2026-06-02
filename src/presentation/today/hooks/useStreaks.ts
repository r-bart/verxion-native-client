import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { todayKeys } from "../keys";

export function useStreaks() {
  const uc = useDI((c) => c.getStreaks);
  return useQuery({
    queryKey: todayKeys.streaks(),
    queryFn: () => uc.execute(),
  });
}
