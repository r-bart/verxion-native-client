/**
 * SessionBlockHeader — the group header that precedes each routine block in the
 * Sesiones feed: the block name, a state chip, the date range and the block's
 * total tonnage. Mirrors the handoff's history block header.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { BlockState } from "@/domain/training/models/SessionFeed";

const STATE: Record<BlockState, { color: string; bg: string }> = {
  active: { color: glass.lava, bg: glass.lavaBg },
  paused: { color: palette.neutral.text, bg: palette.neutral.background },
  completed: { color: glass.ink3, bg: "rgba(255,255,255,0.06)" },
};

export function SessionBlockHeader({
  name,
  state,
  dateRange,
  totalVolume,
}: {
  name: string;
  state: BlockState;
  dateRange: string;
  totalVolume: string;
}) {
  const { t } = useTranslation();
  const tone = STATE[state];

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 18, paddingBottom: 8 }}>
      <Text style={{ fontFamily: sans(700), fontSize: 15, color: glass.white, letterSpacing: -0.3 }}>{name}</Text>
      <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 9999, backgroundColor: tone.bg }}>
        <Text style={{ fontFamily: mono(600), fontSize: 8.5, letterSpacing: 0.6, color: tone.color, textTransform: "uppercase" }}>
          {t(`training.blockState.${state}`)}
        </Text>
      </View>
      <View style={{ flex: 1 }} />
      <Text style={{ fontFamily: mono(500), fontSize: 10.5, color: glass.ink3 }} numberOfLines={1}>
        {dateRange} · {totalVolume}
      </Text>
    </View>
  );
}
