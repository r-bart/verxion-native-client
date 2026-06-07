/**
 * ProgramArchiveRow — the compact row for a completed program in the "Archivo"
 * section: goal bubble, name over "goal · hasta {date}", a trophy with the unified
 * score, and a chevron. Taps through to the detail. Mirrors the handoff `ProgramRow`.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { Trophy, ChevronRight } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { ProgramOverview } from "@/domain/program/models/Program";
import { programGoalVisual } from "../lib/programGoalVisual";
import { pgShortDate } from "../lib/format";

export function ProgramArchiveRow({ program }: { program: ProgramOverview }) {
  const { t } = useTranslation();
  const router = useRouter();
  const cfg = programGoalVisual(program.goal);
  const goal = program.goal ? t(`program.goals.${program.goal}`) : null;
  const until = pgShortDate(program.finishedDate ?? program.endDate);

  return (
    <Pressable
      onPress={() => router.push(`/programas/${program.id}` as Href)}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface radius={16} style={{ padding: 12, flexDirection: "row", alignItems: "center", gap: 11 }}>
        <IconBubble bg={cfg.bg} size={38}>
          <cfg.Icon size={18} color={cfg.color} strokeWidth={2} />
        </IconBubble>

        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }} numberOfLines={1}>
            {program.name}
          </Text>
          <Text style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink2 }} numberOfLines={1}>
            {goal && until ? t("program.archiveUntil", { goal, date: until }) : (goal ?? until ?? "")}
          </Text>
        </View>

        {program.unifiedExecutionScore != null && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Trophy size={11} color={glass.ink2} strokeWidth={2} />
            <Text style={{ fontFamily: mono(500), fontSize: 11.5, color: glass.ink2 }}>
              {program.unifiedExecutionScore}
            </Text>
          </View>
        )}
        <ChevronRight size={16} color="rgba(255,255,255,0.28)" strokeWidth={2} />
      </GlassSurface>
    </Pressable>
  );
}
