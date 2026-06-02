import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { useSession } from "@/presentation/auth/hooks/useSession";
import { todayKeys } from "@/presentation/_shared/keys";
import { sessionViewerKeys } from "../keys";
import type { LiveSessionProgress } from "@/domain/sessions/models/Session";

interface ActiveSessionState {
  data: LiveSessionProgress | null;
  isLoading: boolean;
  isError: boolean;
  displayElapsed: number;
}

export function useActiveSessionWithProgress(): ActiveSessionState {
  const { data: authSession } = useSession();
  const isAuthenticated = !!authSession;

  const getActiveSession = useDI((c) => c.getActiveSession);
  const getLiveProgress = useDI((c) => c.getLiveProgress);

  const { data: activeSession, isLoading: isLoadingActive } = useQuery({
    queryKey: todayKeys.activeSession(),
    queryFn: () => getActiveSession.execute(),
    refetchInterval: 30_000,
    enabled: isAuthenticated,
  });

  const sessionId = activeSession?.id;

  const {
    data: liveProgress,
    isLoading: isLoadingProgress,
    isError,
  } = useQuery({
    queryKey: sessionViewerKeys.liveProgress(sessionId ?? ""),
    queryFn: () => getLiveProgress.execute(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 10_000,
  });

  const [displayElapsed, setDisplayElapsed] = useState(0);
  const sessionStatus = liveProgress?.session.status;
  const serverElapsed = liveProgress?.session.elapsedSeconds;

  // Snap the display to the server value whenever it changes. Adjusting state
  // during render (React's "storing info from previous renders" pattern) avoids
  // the cascading re-render an effect-based sync would cause.
  const [prevServerElapsed, setPrevServerElapsed] = useState<number | null>(null);
  if (serverElapsed != null && serverElapsed !== prevServerElapsed) {
    setPrevServerElapsed(serverElapsed);
    setDisplayElapsed(serverElapsed);
  }

  // Tick every second — deps are stable primitives only
  useEffect(() => {
    if (!sessionId || sessionStatus === "paused" || isError) return;
    if (serverElapsed == null) return;

    const interval = setInterval(() => {
      setDisplayElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, sessionStatus, isError, serverElapsed]);

  return {
    data: liveProgress ?? null,
    isLoading: isLoadingActive || (!!sessionId && isLoadingProgress),
    isError,
    displayElapsed,
  };
}
