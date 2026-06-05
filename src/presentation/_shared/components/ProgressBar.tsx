/**
 * ProgressBar — a thin rounded progress bar with a soft glow in the fill color.
 * Ported from the design handoff (`lookbook/home/ui.tsx` `Bar`).
 */
import { View } from "react-native";

type Props = {
  /** 0..1 fill fraction. */
  value: number;
  color: string;
  track?: string;
  height?: number;
};

export function ProgressBar({ value, color, track = "rgba(255,255,255,0.1)", height = 5 }: Props) {
  return (
    <View style={{ height, borderRadius: 9999, backgroundColor: track, overflow: "hidden" }}>
      <View
        style={{
          height: "100%",
          width: `${Math.max(0, Math.min(100, value * 100))}%`,
          borderRadius: 9999,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.6,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </View>
  );
}
