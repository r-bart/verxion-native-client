/**
 * ProgramScheduleCalendar — the "La semana" heatmap: 7 tinted cells (Mon→Sun) by
 * day-kind, rest rendered as a hollow dashed cell, plus a legend of the kinds
 * present. No per-cell glow (design rule: glow is reserved for the lava CTA).
 * Mirrors the handoff `PgdSchedule`.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { ProgramDayKind } from "@/domain/program/models/Program";
import { programDayVisual, PROGRAM_DOW_KEYS } from "../lib/programDayVisual";

export function ProgramScheduleCalendar({ schedule }: { schedule: ProgramDayKind[] }) {
  const { t } = useTranslation();
  const kinds: ProgramDayKind[] = [];
  schedule.forEach((k) => {
    if (!kinds.includes(k)) kinds.push(k);
  });

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {schedule.slice(0, 7).map((kind, i) => {
          const cfg = programDayVisual(kind);
          const isRest = kind === "rest";
          return (
            <View key={i} style={{ flex: 1, alignItems: "center", gap: 6 }}>
              <Text style={{ fontFamily: mono(500), fontSize: 9.5, letterSpacing: 0.4, color: glass.ink3, textTransform: "uppercase" }}>
                {t(`program.detail.dow.${PROGRAM_DOW_KEYS[i]}`)}
              </Text>
              <View
                style={{
                  width: "100%",
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: cfg.fill ?? "transparent",
                  borderWidth: 1,
                  borderColor: cfg.line,
                  borderStyle: isRest ? "dashed" : "solid",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isRest && <View style={{ width: 8, height: 1.5, borderRadius: 9999, backgroundColor: glass.ink3 }} />}
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {kinds.map((kind) => {
          const cfg = programDayVisual(kind);
          const isRest = kind === "rest";
          return (
            <View key={kind} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 9999,
                  backgroundColor: isRest ? "transparent" : cfg.color,
                  borderWidth: isRest ? 1 : 0,
                  borderColor: cfg.line,
                }}
              />
              <Text style={{ fontFamily: sans(500), fontSize: 11.5, color: glass.ink2 }}>
                {t(`program.detail.dayKind.${kind}`)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
