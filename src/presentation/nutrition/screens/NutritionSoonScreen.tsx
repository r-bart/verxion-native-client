/**
 * NutritionSoonScreen — graceful placeholder for the Nutrición detail/list
 * routes that haven't shipped yet (Dietas, diet/meal detail, the day's meal
 * plan). The landing already links to them; until each slice lands, tapping a
 * card pushes this — a back affordance over the "coming soon" blank-slate —
 * instead of an unmatched-route error. Each placeholder route is replaced by its
 * real screen as the build progresses.
 */
import { View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Apple } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { glass } from "@/presentation/_shared/design/glass";

export function NutritionSoonScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            style={({ pressed }) => ({
              opacity: pressed ? glass.pressOpacity : 1,
            })}
          >
            <GlassSurface
              radius={19}
              style={{
                width: 38,
                height: 38,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={20} color={glass.white} strokeWidth={2} />
            </GlassSurface>
          </Pressable>
        </View>
        <View style={{ flex: 1 }}>
          <EmptyState
            icon={<Apple size={28} color={glass.lava} strokeWidth={2} />}
            title={t("comingSoon.title")}
            body={t("comingSoon.body")}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
