/**
 * EntrenoScreen — the landing and spine of the Entreno tab. Header (title +
 * library button → Rutinas) over a sliding `SegmentedControl` with three
 * sections: Rutina (the active-routine day view), Sesiones (recent history), Ejercicios
 * (the exercise library). Phase 0 wires the segments + navigation skeleton;
 * each section's real composition lands in later phases.
 */
import { View, ScrollView, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { Layers } from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import { SegmentedControl } from "../components/SegmentedControl";
import { useEntrenoSegment } from "../hooks/useEntrenoSegment";
import { RutinaSegment } from "../components/RutinaSegment";
import { WipBody } from "../components/WipBody";

export function EntrenoScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { segment, setSegment, options } = useEntrenoSegment();

  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header: title + library entry point */}
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
          <Text style={{ fontFamily: sans(700), fontSize: 30, color: glass.white, letterSpacing: -1.05 }}>
            {t("training.title")}
          </Text>
          <Pressable
            onPress={() => router.push("/workout/rutinas" as Href)}
            accessibilityRole="button"
            accessibilityLabel={t("training.library")}
            style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
          >
            <GlassSurface
              radius={20}
              style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
            >
              <Layers size={20} color={glass.white} strokeWidth={2} />
            </GlassSurface>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <SegmentedControl options={options} value={segment} onChange={setSegment} />
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {segment === "routine" ? (
            <RutinaSegment />
          ) : (
            <WipBody screen={t(`training.segments.${segment}`)} />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
