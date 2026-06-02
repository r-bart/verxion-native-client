import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

export function useSessionList() {
  const uc = useDI((c) => c.listSessions);
  return useQuery({
    queryKey: trainingKeys.sessions(),
    queryFn: () => uc.execute(),
  });
}
