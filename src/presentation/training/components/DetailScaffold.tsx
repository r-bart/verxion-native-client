/**
 * DetailScaffold — the shared shell for every Entreno detail/list screen below
 * the landing: the screen bloom, a top-safe area, the `DetailHeader` chrome,
 * and a scrolling content area. Keeps each screen thin (compose, don't plumb).
 */
import { useMemo } from "react";
import { View, ScrollView, type ScrollViewProps } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { glass } from "@/presentation/_shared/design/glass";
import { DetailHeader } from "./DetailHeader";

type Props = {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  /** Pull-to-refresh control (from `usePullToRefresh`) for the scroll area. */
  refreshControl?: ScrollViewProps["refreshControl"];
};

// The native liquid-glass tab bar floats over the content; SafeAreaView only
// claims the top edge, so the scroll runs to the screen bottom (behind the bar).
// Clear it with the home-indicator inset plus the tab bar's own height so the
// last card scrolls fully clear instead of hiding under the bar.
const TAB_BAR_CLEARANCE = 64;

export function DetailScaffold({ title, right, children, refreshControl }: Props) {
  const insets = useSafeAreaInsets();
  
  const contentContainerStyle = useMemo(() => ({
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: insets.bottom + TAB_BAR_CLEARANCE,
  }), [insets.bottom]);
  
  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <DetailHeader title={title} right={right} />
        <ScrollView
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
