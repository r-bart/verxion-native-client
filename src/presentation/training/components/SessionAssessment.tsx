/**
 * SessionAssessment — the user's close-out rating (effort, quality, pump), three
 * tiles scored 1–10 and colored by band (green ≥7, amber ≥5, red below). What the
 * agent doesn't measure. Mirrors the handoff's `SdAssess`.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { SessionAssessment as Assessment } from "@/domain/training/models/SessionDetailView";

function scoreColor(v: number): string {
  if (v >= 7) return glass.up;
  if (v >= 5) return palette.neutral.text;
  return palette.health.text;
}

export function SessionAssessment({ assessment }: { assessment: Assessment }) {
  const { t } = useTranslation();
  const items = [
    {
      label: t("training.sessionDetail.assessment.effort"),
      value: assessment.effort,
    },
    {
      label: t("training.sessionDetail.assessment.quality"),
      value: assessment.quality,
    },
    {
      label: t("training.sessionDetail.assessment.pump"),
      value: assessment.pump,
    },
  ];

  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {items.map((item) => (
        <GlassSurface
          key={item.label}
          radius={16}
          style={{ flex: 1, padding: 14, alignItems: "center", gap: 4 }}
        >
          <Text
            style={{
              fontFamily: sans(700),
              fontSize: 22,
              color: scoreColor(item.value),
              letterSpacing: -0.6,
            }}
          >
            {item.value}
            <Text
              style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}
            >
              /10
            </Text>
          </Text>
          <Text
            style={{
              fontFamily: mono(400),
              fontSize: 10,
              color: glass.ink3,
              textTransform: "uppercase",
              letterSpacing: 0.3,
            }}
          >
            {item.label}
          </Text>
        </GlassSurface>
      ))}
    </View>
  );
}
