/**
 * RoutineArchiveRow — the compact row for a completed routine in the "Archivo"
 * section: the type bubble, the name over "goal · hasta {date}", and a trophy
 * with the done/planned tally. Taps through to the routine detail. Mirrors the
 * handoff's `RoutineRow` (completed variant).
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { Trophy, ChevronRight } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { DAY_TYPE } from "../lib/dayType";
import type { RoutineLibraryItem } from "@/domain/training/models/RoutineLibrary";

export function RoutineArchiveRow({ item }: { item: RoutineLibraryItem }) {
  const { t } = useTranslation();
  const router = useRouter();
  const cfg = DAY_TYPE[item.type];

  return (
    <Pressable
      onPress={() => router.push(`/workout/rutinas/${item.id}` as Href)}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface
        radius={16}
        style={{
          padding: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 11,
        }}
      >
        <IconBubble bg={cfg.bg} size={38}>
          <cfg.Icon size={18} color={cfg.color} strokeWidth={2} />
        </IconBubble>

        <View style={{ flex: 1, gap: 3 }}>
          <Text
            style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink2 }}
            numberOfLines={1}
          >
            {item.finishedLabel
              ? t("training.routineLibrary.archiveUntil", {
                  goal: item.goal,
                  date: item.finishedLabel,
                })
              : item.goal}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Trophy size={11} color={glass.ink2} strokeWidth={2} />
          <Text
            style={{ fontFamily: mono(500), fontSize: 11.5, color: glass.ink2 }}
          >
            {item.sessionsDone}/{item.sessionsPlanned}
          </Text>
        </View>
        <ChevronRight
          size={16}
          color="rgba(255,255,255,0.28)"
          strokeWidth={2}
        />
      </GlassSurface>
    </Pressable>
  );
}
