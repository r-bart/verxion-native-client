import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { settingsKeys } from "../keys";

/** The full account view (`GET /users/me`) — personal/fitness fields + identity. */
export function useAccount() {
  const uc = useDI((c) => c.getAccount);
  return useQuery({
    queryKey: settingsKeys.account(),
    queryFn: () => uc.execute(),
    staleTime: 60_000,
  });
}
