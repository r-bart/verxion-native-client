/**
 * MeasureRecordRow — one weekly record in the "Detalle de medida" list: date,
 * a proportional bar, the value, and the delta vs the previous record (green/red
 * by direction, "=" when it rounds to zero).
 */
import { View, Text } from "react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { formatShortDate, formatValue, formatDelta } from "../lib/format";

type Props = {
  date: string;
  value: number;
  deltaPrev: number | null;
  unit: string;
  dec: number;
  goodDown: boolean;
  /** 0..1 fill fraction (value normalized within the record window). */
  frac: number;
  tint: string;
};

export function MeasureRecordRow({ date, value, deltaPrev, unit, dec, goodDown, frac, tint }: Props) {
  const delta = formatDelta(deltaPrev, "", dec, goodDown, "=");
  const deltaColor =
    delta.tone === "up" ? glass.up : delta.tone === "lava" ? glass.lava : glass.ink3;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 }}>
      <Text style={{ width: 48, fontFamily: mono(400), fontSize: 11, color: glass.ink2 }}>
        {formatShortDate(date)}
      </Text>
      <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)" }}>
        <View
          style={{
            width: `${Math.max(4, Math.min(100, frac * 100))}%`,
            height: 6,
            borderRadius: 3,
            backgroundColor: tint,
          }}
        />
      </View>
      <Text style={{ width: 70, textAlign: "right", fontFamily: sans(600), fontSize: 13, color: glass.white }}>
        {formatValue(value, unit, dec)}
      </Text>
      <Text style={{ width: 48, textAlign: "right", fontFamily: mono(400), fontSize: 11, color: deltaColor }}>
        {delta.text}
      </Text>
    </View>
  );
}
