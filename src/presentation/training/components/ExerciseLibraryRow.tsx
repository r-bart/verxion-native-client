/**
 * ExerciseLibraryRow — one row of the Ejercicios library: the part bubble, the
 * exercise name over "muscle · equipment", and a training-status tag (a gold PR
 * with its value, a logged count, or a muted "unregistered"). Taps through to
 * the exercise detail.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { Trophy } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { DAY_TYPE } from "../lib/dayType";
import type { ExerciseLibraryItem } from "@/domain/training/models/ExerciseLibrary";

function Status({ item }: { item: ExerciseLibraryItem }) {
  const { t } = useTranslation();

  if (item.prLabel) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, backgroundColor: palette.neutral.background, borderWidth: 1, borderColor: "rgba(255,185,0,0.3)" }}>
        <Trophy size={11} color={palette.neutral.text} strokeWidth={2.2} />
        <Text style={{ fontFamily: sans(700), fontSize: 11, color: palette.neutral.text }}>{item.prLabel}</Text>
      </View>
    );
  }
  if (item.logCount > 0) {
    return <Text style={{ fontFamily: mono(500), fontSize: 11, color: glass.ink2 }}>{t("training.exerciseLibrary.logged", { count: item.logCount })}</Text>;
  }
  return <Text style={{ fontFamily: mono(500), fontSize: 11, color: glass.ink3 }}>{t("training.exerciseLibrary.unregistered")}</Text>;
}

export function ExerciseLibraryRow({ item }: { item: ExerciseLibraryItem }) {
  const router = useRouter();
  const cfg = DAY_TYPE[item.part];

  return (
    <Pressable
      onPress={() => router.push(`/workout/ejercicio/${item.id}` as Href)}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface radius={16} style={{ padding: 12, flexDirection: "row", alignItems: "center", gap: 11 }}>
        <IconBubble bg={cfg.bg} size={38}>
          <cfg.Icon size={19} color={cfg.color} strokeWidth={2} />
        </IconBubble>

        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }} numberOfLines={1}>{item.name}</Text>
          <Text style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink2 }} numberOfLines={1}>
            {item.muscle} · {item.equipment}
          </Text>
        </View>

        <Status item={item} />
      </GlassSurface>
    </Pressable>
  );
}
