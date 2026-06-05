/**
 * DetailScaffold — the shared shell for every Entreno detail/list screen below
 * the landing: the screen bloom, a top-safe area, the `DetailHeader` chrome,
 * and a scrolling content area. Keeps each screen thin (compose, don't plumb).
 */
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { glass } from "@/presentation/_shared/design/glass";
import { DetailHeader } from "./DetailHeader";

type Props = {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
};

export function DetailScaffold({ title, right, children }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <DetailHeader title={title} right={right} />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
