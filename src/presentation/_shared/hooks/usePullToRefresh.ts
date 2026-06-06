/**
 * usePullToRefresh — wires pull-to-refresh to one or more TanStack Query
 * refetchers and returns `{ refreshing, onRefresh }` to feed a
 * `<GlassRefreshControl>` (or any `RefreshControl`).
 *
 * It owns its own `refreshing` flag so the spinner tracks the manual pull only —
 * not the background refetches TanStack runs on focus/stale. Keeping this a pure
 * data hook (no JSX) matches the rest of `_shared/hooks`; the on-brand styling
 * lives in `GlassRefreshControl`.
 */
import { useCallback, useState } from "react";

type Refetcher = () => Promise<unknown>;

export function usePullToRefresh(refetch: Refetcher | Refetcher[]) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    const fns = Array.isArray(refetch) ? refetch : [refetch];
    setRefreshing(true);
    try {
      await Promise.all(fns.map((fn) => fn()));
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return { refreshing, onRefresh };
}
