/**
 * DietArchiveRow — the compact row for a completed diet in the "Archivo" section:
 * the goal bubble, the name over "goal · hasta {date}", and a trophy with the
 * adherence pct. Taps through to the diet detail. Nutrition mirror of
 * `RoutineArchiveRow`.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { Trophy, ChevronRight } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { dShortDate } from "../lib/format";
import { goalLabel } from "../lib/labels";
import { dietGoalVisual } from "../lib/dietGoalVisual";
import type { DietLibraryItem } from "@/domain/nutrition/models/DietLibrary";

export function DietArchiveRow({ item }: { item: DietLibraryItem }) {
  const { t } = useTranslation();
  const router = useRouter();
  const cfg = dietGoalVisual(item.goal);
  const goal = item.goal ? goalLabel(item.goal, t) : null;
  const until = dShortDate(item.endDate);

  return (
    <Pressable
      onPress={() => router.push(`/nutrition/dieta/${item.id}` as Href)}
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
            {goal && until
              ? t("nutrition.dietas.archiveUntil", { goal, date: until })
              : (goal ?? until ?? "")}
          </Text>
        </View>

        {item.adherence != null && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Trophy size={11} color={glass.ink2} strokeWidth={2} />
            <Text
              style={{ fontFamily: mono(500), fontSize: 11.5, color: glass.ink2 }}
            >
              {t("nutrition.dietas.adherence", { pct: Math.round(item.adherence) })}
            </Text>
          </View>
        )}
        <ChevronRight size={16} color="rgba(255,255,255,0.28)" strokeWidth={2} />
      </GlassSurface>
    </Pressable>
  );
}
