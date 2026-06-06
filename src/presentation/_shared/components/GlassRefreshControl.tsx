/**
 * GlassRefreshControl — the app's one pull-to-refresh spinner, tinted with the
 * lava anchor so every scroll view refreshes on-brand. Pair it with
 * `usePullToRefresh`, which owns the `refreshing` flag and the refetch wiring:
 *
 *   const refresh = usePullToRefresh(refetch);
 *   <ScrollView refreshControl={<GlassRefreshControl {...refresh} />} />
 */
import { RefreshControl } from "react-native";
import { glass } from "../design/glass";

type Props = {
  refreshing: boolean;
  onRefresh: () => void;
};

export function GlassRefreshControl({ refreshing, onRefresh }: Props) {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={glass.lava}
      colors={[glass.lava]}
      progressBackgroundColor={glass.screenBg}
    />
  );
}
