/**
 * RoutineHero — the centerpiece of the Rutina segment: the active routine as a
 * tappable glass card. Eyebrow + chevron, name, goal chip, divider, the block
 * line (when periodized), then the WeekBar. Tapping opens the routine detail.
 * Mirrors the handoff's `RoutineHero`.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { ChevronRight, Target } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { Chip } from "@/presentation/_shared/components/Chip";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { WeekBar } from "./WeekBar";
import { BlockLine } from "./BlockLine";
import type { ActiveRoutineSummary } from "@/domain/training/models/RoutineDashboard";

export function RoutineHero({ routine }: { routine: ActiveRoutineSummary }) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/workout/rutinas/${routine.id}` as Href)}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface radius={24} style={{ padding: 18, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text
            style={{
              fontFamily: mono(600),
              fontSize: 10,
              letterSpacing: 1.2,
              color: glass.lava,
              textTransform: "uppercase",
            }}
          >
            {t("training.routine.activeEyebrow")}
          </Text>
          <ChevronRight size={15} color="rgba(255,255,255,0.3)" strokeWidth={2} />
        </View>

        <Text style={{ fontFamily: sans(700), fontSize: 25, color: glass.white, letterSpacing: -0.75 }}>
          {routine.name}
        </Text>

        {routine.goal && (
          <View style={{ flexDirection: "row" }}>
            <Chip tone="lava" icon={<Target size={12} color={glass.lava} strokeWidth={2.2} />} label={routine.goal} />
          </View>
        )}

        <View style={{ height: 1, backgroundColor: glass.stroke, marginVertical: 2 }} />

        {/* Block context — renders only when the routine is periodized (null-safe). */}
        <BlockLine mesocycle={routine.mesocycle} />

        <WeekBar routine={routine} />
      </GlassSurface>
    </Pressable>
  );
}
