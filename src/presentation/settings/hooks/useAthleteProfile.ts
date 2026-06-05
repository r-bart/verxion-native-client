import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { settingsKeys } from "../keys";

/** The public athlete profile (`GET /profiles/me`) — displayName, bio, etc. */
export function useAthleteProfile() {
  const uc = useDI((c) => c.getAthleteProfile);
  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: () => uc.execute(),
    staleTime: 60_000,
  });
}
