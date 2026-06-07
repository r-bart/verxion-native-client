/**
 * ScoreChip — how the user tracks against a plan, as a WORD not a number: "Vas
 * adelantado" (green ↗), "En objetivo" (amber), "Vas justo" (red). App-wide:
 * used by both Entreno (routine score) and Nutrición (diet score).
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans } from "@/presentation/_shared/design/fonts";

/** How the user tracks against a plan. Kept local so this app-wide chip depends
 *  on no single feature's domain; matches training `ScoreState` and nutrition
 *  `DietScoreState` structurally. */
export type ScoreState = "ahead" | "on" | "behind";

const TONE: Record<ScoreState, { color: string; bg: string; border: string }> = {
  ahead: { color: glass.up, bg: glass.upBg, border: "rgba(95,227,154,0.3)" },
  on: { color: palette.neutral.text, bg: palette.neutral.background, border: "rgba(255,185,0,0.3)" },
  behind: { color: palette.health.text, bg: palette.health.background, border: "rgba(255,71,87,0.3)" },
};

export function ScoreChip({ state }: { state: ScoreState }) {
  const { t } = useTranslation();
  const tone = TONE[state];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 9999,
        backgroundColor: tone.bg,
        borderWidth: 1,
        borderColor: tone.border,
      }}
    >
      {state === "ahead" && <TrendingUp size={12} color={tone.color} strokeWidth={2.4} />}
      <Text style={{ fontFamily: sans(600), fontSize: 12, color: tone.color }}>
        {t(`common.score.${state}`)}
      </Text>
    </View>
  );
}
