import { Text, View } from "react-native";
import { tokens } from "@/presentation/_shared/design/tokens";
import { mono } from "@/presentation/_shared/design/fonts";
import { copy } from "../copy";

interface Props {
  /** 0-based index of the current step among the countable steps. */
  currentStepIndex: number;
  totalSteps: number;
}

/** Top progress chrome: segmented bar + "Step X of N" caption. */
export function ProgressHeader({ currentStepIndex, totalSteps }: Props) {
  const filled = currentStepIndex + 1;
  return (
    <View style={{ gap: 10, marginBottom: 28 }}>
      <View style={{ flexDirection: "row", gap: 4 }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i < filled ? tokens.color.accent : tokens.color.border,
            }}
          />
        ))}
      </View>
      <Text style={{ fontFamily: mono(600), fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: tokens.text.tertiary }}>
        {copy.stepper.stepOf(filled, totalSteps)}
      </Text>
    </View>
  );
}
