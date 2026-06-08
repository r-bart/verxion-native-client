/**
 * NutricionScreen — the landing and spine of the Nutrición tab. Header (title +
 * library button → Dietas) over a sliding `SegmentedControl` with three sections:
 * Plan (the active diet + today's intake), Diario (adherence history), Alimentos
 * (the food library). Each segment owns its own read + scroll. Mirrors `EntrenoScreen`.
 */
import { View, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Layers } from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { SegmentedControl } from "@/presentation/_shared/components/SegmentedControl";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import { useNutricionSegment } from "../hooks/useNutricionSegment";
import { PlanSegment } from "../components/PlanSegment";
import { DiarioSegment } from "../components/DiarioSegment";
import { AlimentosSegment } from "../components/AlimentosSegment";

export function NutricionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { segment, setSegment, options } = useNutricionSegment();

  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header: title + diet library entry point */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
          }}
        >
          <Text
            style={{
              fontFamily: sans(700),
              fontSize: 30,
              color: glass.white,
              letterSpacing: -1.05,
            }}
          >
            {t("nutrition.title")}
          </Text>
          <Pressable
            onPress={() => router.push("/nutrition/dietas")}
            accessibilityRole="button"
            accessibilityLabel={t("nutrition.library")}
            style={({ pressed }) => ({
              opacity: pressed ? glass.pressOpacity : 1,
            })}
          >
            <GlassSurface
              radius={20}
              style={{
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Layers size={20} color={glass.white} strokeWidth={2} />
            </GlassSurface>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
          <SegmentedControl
            options={options}
            value={segment}
            onChange={setSegment}
          />
        </View>

        {/* Each segment owns its own scroll, so the landing doesn't wrap them. */}
        <View style={{ flex: 1 }}>
          {segment === "plan" ? (
            <PlanSegment />
          ) : segment === "diario" ? (
            <DiarioSegment />
          ) : (
            <AlimentosSegment />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
