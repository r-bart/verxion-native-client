import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";

export const authKeys = {
  session: () => ["auth", "session"] as const,
};

export function useSession() {
  const uc = useDI((c) => c.getSession);
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: () => uc.execute(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
