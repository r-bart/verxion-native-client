/**
 * EntrenoScreen — the landing and spine of the Entreno tab. Header (title +
 * library button → Rutinas) over a sliding `SegmentedControl` with three
 * sections: Rutina (the active-routine day view), Sesiones (recent history), Ejercicios
 * (the exercise library). Phase 0 wires the segments + navigation skeleton;
 * each section's real composition lands in later phases.
 */
import { View, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { Layers } from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import { SegmentedControl } from "@/presentation/_shared/components/SegmentedControl";
import { useEntrenoSegment } from "../hooks/useEntrenoSegment";
import { RutinaSegment } from "../components/RutinaSegment";
import { SesionesSegment } from "../components/SesionesSegment";
import { EjerciciosSegment } from "../components/EjerciciosSegment";

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

        <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
          <SegmentedControl options={options} value={segment} onChange={setSegment} />
        </View>

        {/* Each segment owns its own scroll (FlatList feed / ScrollView), so the
            landing doesn't wrap them — a list inside a ScrollView would lose
            virtualization. The header + selector above stay fixed. */}
        <View style={{ flex: 1 }}>
          {segment === "routine" ? (
            <RutinaSegment />
          ) : segment === "sessions" ? (
            <SesionesSegment />
          ) : (
            <EjerciciosSegment />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
