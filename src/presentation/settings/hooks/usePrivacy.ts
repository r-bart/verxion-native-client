import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import type {
  SectionVisibility,
  ShowcaseMetric,
  TimelineDetailLevel,
  FeedSharingSettings,
} from "@/domain/settings";
import { settingsKeys } from "../keys";

/**
 * Profile-privacy mutations. The current state for visibility / showcase /
 * timeline / follow-approval lives on the athlete profile (`GET /profiles/me`),
 * so these invalidate `settingsKeys.profile()` to refetch after a write.
 */
export function useUpdateVisibility() {
  const uc = useDI((c) => c.updateVisibility);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (visibility: SectionVisibility) => uc.execute(visibility),
    onSuccess: () => {
      track("settings_visibility_updated");
      qc.invalidateQueries({ queryKey: settingsKeys.profile() });
    },
  });
}

export function useUpdateShowcase() {
  const uc = useDI((c) => c.updateShowcase);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (metrics: ShowcaseMetric[]) => uc.execute(metrics),
    onSuccess: () => {
      track("settings_showcase_updated");
      qc.invalidateQueries({ queryKey: settingsKeys.profile() });
    },
  });
}

export function useUpdateTimelineDetail() {
  const uc = useDI((c) => c.updateTimelineDetail);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (level: TimelineDetailLevel) => uc.execute(level),
    onSuccess: () => {
      track("settings_timeline_detail_updated");
      qc.invalidateQueries({ queryKey: settingsKeys.profile() });
    },
  });
}

export function useUpdateFollowApproval() {
  const uc = useDI((c) => c.updateFollowApproval);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requireApproval: boolean) => uc.execute(requireApproval),
    onSuccess: () => {
      track("settings_follow_approval_updated");
      qc.invalidateQueries({ queryKey: settingsKeys.profile() });
    },
  });
}

/** Feed-sharing state (`GET /profiles/me/feed-sharing`) — its own read-model. */
export function useFeedSharing() {
  const uc = useDI((c) => c.getFeedSharing);
  return useQuery({
    queryKey: settingsKeys.feedSharing(),
    queryFn: () => uc.execute(),
    staleTime: 60_000,
  });
}

export function useUpdateFeedSharing() {
  const uc = useDI((c) => c.updateFeedSharing);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: FeedSharingSettings) => uc.execute(settings),
    onSuccess: () => {
      track("settings_feed_sharing_updated");
      qc.invalidateQueries({ queryKey: settingsKeys.feedSharing() });
    },
  });
}
