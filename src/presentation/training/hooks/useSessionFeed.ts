import { useInfiniteQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import type { SessionFeedBlock, SessionSort } from "@/domain/training/models/SessionFeed";
import { trainingKeys } from "../keys";

/**
 * The Entreno landing "Sesiones" infinite feed. Cursor-paginates via
 * `GetSessionFeedUseCase`; the repository stubs a single page until the platform
 * ships `GET /training/sessions-feed`. Blocks that span page boundaries are
 * merged by id so a routine's group stays whole as more pages load.
 */
export function useSessionFeed(routineId: string | null, sort: SessionSort) {
  const uc = useDI((c) => c.getSessionFeed);

  const query = useInfiniteQuery({
    queryKey: trainingKeys.sessionFeed(routineId, sort),
    queryFn: ({ pageParam }) => uc.execute({ routineId, sort, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    staleTime: 60_000,
  });

  const blocks: SessionFeedBlock[] = (() => {
    const merged: SessionFeedBlock[] = [];
    const byId = new Map<string, SessionFeedBlock>();
    for (const page of query.data?.pages ?? []) {
      for (const block of page.blocks) {
        const existing = byId.get(block.id);
        if (existing) existing.sessions = [...existing.sessions, ...block.sessions];
        else {
          const copy = { ...block, sessions: [...block.sessions] };
          byId.set(block.id, copy);
          merged.push(copy);
        }
      }
    }
    return merged;
  })();

  const totalCount = query.data?.pages[0]?.totalCount ?? 0;

  return { ...query, blocks, totalCount };
}
