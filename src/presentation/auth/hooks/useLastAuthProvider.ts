import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { authKeys } from "./useSession";

/**
 * The provider the user last signed in with (or null on a fresh install).
 * Read once on the login screen to surface a "Last used" hint. Persisted in
 * SecureStore via the DI `lastAuthProvider` service, so it survives sign-out.
 */
export function useLastAuthProvider() {
  const get = useDI((c) => c.lastAuthProvider.getLastAuthProvider);
  return useQuery({
    queryKey: authKeys.lastProvider(),
    queryFn: () => get(),
    staleTime: Infinity,
  });
}
