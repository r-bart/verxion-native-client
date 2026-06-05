/**
 * Chip — the small status pill used on card headers and the day header (an
 * optional leading icon + a label). Ported from the design handoff
 * (`lookbook/foundation/Chip.tsx`), retoned onto `glass.ts` / `tokens.ts`.
 */
import { View, Text } from "react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans } from "@/presentation/_shared/design/fonts";

export type ChipTone = "up" | "neutral" | "lava";

const TONE: Record<ChipTone, { color: string; bg: string; border: string }> = {
  up: { color: glass.up, bg: glass.upBg, border: "rgba(95,227,154,0.3)" },
  neutral: { color: palette.neutral.text, bg: palette.neutral.background, border: "rgba(255,185,0,0.3)" },
  lava: { color: glass.lava, bg: glass.lavaBg, border: glass.lavaBorder },
};

export function Chip({
  tone,
  icon,
  label,
}: {
  tone: ChipTone;
  icon?: React.ReactNode;
  label: string;
}) {
  const t = TONE[tone];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 9999,
        backgroundColor: t.bg,
        borderWidth: 1,
        borderColor: t.border,
      }}
    >
      {icon}
      <Text style={{ color: t.color, fontFamily: sans(700), fontSize: 10, letterSpacing: 0.1 }}>
        {label}
      </Text>
    </View>
  );
}
