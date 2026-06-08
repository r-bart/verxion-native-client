/**
 * ExerciseHistoryRow — one session in the "Detalle de ejercicio" history: date,
 * the top set ("82,5 kg × 8") + PR badge, the server-localized meta line, and the
 * active metric's value with its % delta vs the previous session.
 */
import { View, Text } from "react-native";
import { Trophy } from "lucide-react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { formatShortDate, formatNumber } from "../lib/format";

type Props = {
  date: string;
  topSetWeightKg: number;
  topSetReps: number;
  isPr: boolean;
  meta: string | null;
  value: number;
  deltaPct: number | null;
  tint: string;
};

export function ExerciseHistoryRow({
  date,
  topSetWeightKg,
  topSetReps,
  isPr,
  meta,
  value,
  deltaPct,
  tint,
}: Props) {
  const deltaColor = deltaPct == null ? glass.ink3 : deltaPct >= 0 ? glass.up : glass.lava;
  const deltaText =
    deltaPct == null
      ? "—"
      : `${deltaPct >= 0 ? "+" : "−"}${formatNumber(Math.abs(deltaPct), 1)}%`;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9 }}>
      <Text style={{ width: 44, fontFamily: mono(400), fontSize: 11, color: glass.ink2 }}>
        {formatShortDate(date)}
      </Text>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontFamily: sans(600), fontSize: 13, color: glass.white }}>
            {`${formatNumber(topSetWeightKg, 1)} kg × ${topSetReps}`}
          </Text>
          {isPr && <Trophy size={12} color={glass.lava} strokeWidth={2.4} />}
        </View>
        {meta != null && (
          <Text style={{ fontFamily: mono(400), fontSize: 10, color: glass.ink3 }}>{meta}</Text>
        )}
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontFamily: sans(700), fontSize: 13, color: tint }}>
          {formatNumber(value, 0)}
        </Text>
        <Text style={{ fontFamily: mono(400), fontSize: 10, color: deltaColor }}>{deltaText}</Text>
      </View>
    </View>
  );
}
