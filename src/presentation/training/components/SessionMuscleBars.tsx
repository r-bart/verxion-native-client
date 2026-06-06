/**
 * SessionMuscleBars — the muscle-group split of a session's volume: the top
 * groups with their tonnage, share, and a lava-tinted bar. Mirrors `SdMuscles`.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { fmtTonnes } from "../lib/sessionFormat";
import type { SessionMuscleShare } from "@/domain/training/models/SessionDetailView";

export function SessionMuscleBars({
  muscles,
}: {
  muscles: SessionMuscleShare[];
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  return (
    <GlassSurface radius={18} style={{ padding: 16, gap: 13 }}>
      {muscles.map((m) => (
        <View key={m.name} style={{ gap: 6 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontFamily: sans(600),
                fontSize: 13,
                color: glass.white,
              }}
            >
              {m.name}
            </Text>
            <Text
              style={{ fontFamily: mono(500), fontSize: 11, color: glass.ink2 }}
            >
              {fmtTonnes(locale, m.volumeKg)} {t("training.sessionDetail.tiles.tonneUnit")} · {m.pct}%
            </Text>
          </View>
          <View
            style={{
              height: 5,
              borderRadius: 9999,
              backgroundColor: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${m.pct}%`,
                backgroundColor: glass.lava,
                borderRadius: 9999,
              }}
            />
          </View>
        </View>
      ))}
    </GlassSurface>
  );
}
