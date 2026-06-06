/**
 * SessionTiles — the 6 KPI tiles summarizing a completed session (volume,
 * duration, series, reps, peak load, avg RIR), laid out as two rows of three.
 * Each tile owns its tint + unit; values are display-ready. Mirrors `SdTiles`.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import {
  Dumbbell,
  Clock,
  Layers,
  Repeat,
  Trophy,
  Target,
  type LucideIcon,
} from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { fmtTonnes, fmtMinutes, fmtDecimal } from "../lib/sessionFormat";
import type { SessionTiles as Tiles } from "@/domain/training/models/SessionDetailView";

type Tile = {
  value: string;
  unit: string;
  label: string;
  Icon: LucideIcon;
  color: string;
  bg: string;
};

function TileCard({ tile }: { tile: Tile }) {
  return (
    <GlassSurface radius={16} style={{ flex: 1, padding: 12, gap: 7 }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 9,
          backgroundColor: tile.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <tile.Icon size={15} color={tile.color} strokeWidth={2} />
      </View>
      <Text
        style={{
          fontFamily: sans(700),
          fontSize: 18,
          color: glass.white,
          letterSpacing: -0.4,
        }}
      >
        {tile.value}
        {tile.unit ? (
          <Text
            style={{ fontFamily: mono(500), fontSize: 11, color: glass.ink2 }}
          >
            {" "}
            {tile.unit}
          </Text>
        ) : null}
      </Text>
      <Text
        style={{
          fontFamily: mono(400),
          fontSize: 9.5,
          color: glass.ink3,
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {tile.label}
      </Text>
    </GlassSurface>
  );
}

export function SessionTiles({ tiles }: { tiles: Tiles }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const items: Tile[] = [
    {
      value: fmtTonnes(locale, tiles.volumeKg),
      unit: t("training.sessionDetail.tiles.tonneUnit"),
      label: t("training.sessionDetail.tiles.volume"),
      Icon: Dumbbell,
      color: palette.health.text,
      bg: palette.health.background,
    },
    {
      value: fmtMinutes(tiles.durationSec),
      unit: t("training.sessionDetail.tiles.minUnit"),
      label: t("training.sessionDetail.tiles.duration"),
      Icon: Clock,
      color: palette.insight.text,
      bg: palette.insight.background,
    },
    {
      value: String(tiles.series),
      unit: "",
      label: t("training.sessionDetail.tiles.series"),
      Icon: Layers,
      color: glass.lava,
      bg: glass.lavaBg,
    },
    {
      value: String(tiles.reps),
      unit: "",
      label: t("training.sessionDetail.tiles.reps"),
      Icon: Repeat,
      color: palette.neutral.text,
      bg: palette.neutral.background,
    },
    {
      value: tiles.peakKg != null ? fmtDecimal(locale, tiles.peakKg) : "—",
      unit: tiles.peakKg != null ? t("training.sessionDetail.tiles.kgUnit") : "",
      label: t("training.sessionDetail.tiles.peak"),
      Icon: Trophy,
      color: palette.health.text,
      bg: palette.health.background,
    },
    {
      value: tiles.avgRir != null ? fmtDecimal(locale, tiles.avgRir) : "—",
      unit: "",
      label: t("training.sessionDetail.tiles.avgRir"),
      Icon: Target,
      color: palette.body.text,
      bg: palette.body.background,
    },
  ];

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {items.slice(0, 3).map((tile) => (
          <TileCard key={tile.label} tile={tile} />
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {items.slice(3, 6).map((tile) => (
          <TileCard key={tile.label} tile={tile} />
        ))}
      </View>
    </View>
  );
}
