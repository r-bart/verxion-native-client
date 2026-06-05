import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { House, Dumbbell, Sparkles, Apple, TrendingUp, type LucideIcon } from "lucide-react-native";
import { AppHeader } from "@/presentation/_shared/components/AppHeader";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { glass } from "@/presentation/_shared/design/glass";

export type Section = "today" | "workout" | "agent" | "nutrition" | "progress";

const ICONS: Record<Section, LucideIcon> = {
  today: House,
  workout: Dumbbell,
  agent: Sparkles,
  nutrition: Apple,
  progress: TrendingUp,
};

/**
 * Common blank-slate for tabs whose real screens haven't landed yet. The app
 * is being rebuilt in public, tab by tab; each tab renders this with its own
 * section icon over the screen bloom until its screen ships.
 */
export function ComingSoonScreen({ section }: { section: Section }) {
  const { t } = useTranslation();
  const Icon = ICONS[section];
  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <AppHeader />
        <View style={{ flex: 1 }}>
          <EmptyState
            icon={<Icon size={28} color={glass.lava} strokeWidth={2} />}
            title={t("comingSoon.title")}
            body={t("comingSoon.body")}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
