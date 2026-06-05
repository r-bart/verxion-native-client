import { Text, View } from "react-native";
import { Isotype } from "@/presentation/_shared/components/Isotype";
import { tokens } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { copy } from "../../copy";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";

interface Props {
  completedCount: number;
  totalCount: number;
  nextStepNumber: number;
  nextStepLabel: string;
  onContinue: () => void;
  onRestart: () => void;
  onSignOut: () => void;
}

export function ResumeStep({
  completedCount,
  totalCount,
  nextStepNumber,
  nextStepLabel,
  onContinue,
  onRestart,
  onSignOut,
}: Props) {
  const c = copy.resume;
  const safeCompleted = Math.min(Math.max(completedCount, 0), totalCount);
  const segments = Array.from({ length: totalCount });

  return (
    <View style={{ flex: 1, justifyContent: "center" }} testID="step-resume">
      <View style={{ alignItems: "center", gap: 16 }}>
        <Isotype size={56} glow />
        <View style={{ alignItems: "center", gap: 8 }}>
          <Text style={{ fontFamily: sans(800), fontSize: 24, letterSpacing: -0.6, color: tokens.text.primary, textAlign: "center", maxWidth: 280 }}>
            {c.title}
          </Text>
          <Text style={{ fontFamily: mono(400), fontSize: 13, lineHeight: 20, color: tokens.text.secondary, textAlign: "center", maxWidth: 320 }}>
            {c.heroSubtitle(safeCompleted, totalCount)}
          </Text>
        </View>

        {/* progress segments */}
        <View style={{ width: "100%", gap: 8, marginTop: 8 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            {segments.map((_, i) => (
              <View
                key={`progress-segment-${i}`}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: i < safeCompleted ? tokens.text.primary : tokens.color.border,
                }}
              />
            ))}
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: mono(600), fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: tokens.text.tertiary }}>
              {copy.stepper.stepOf(Math.max(nextStepNumber, 1), totalCount)}
            </Text>
            <Text style={{ fontFamily: mono(600), fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: tokens.text.tertiary }} numberOfLines={1}>
              {c.nextStepLabel(nextStepLabel)}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ gap: 10, marginTop: 36 }}>
        <OnboardingButton label={c.continue} onPress={onContinue} testID="resume-continue" />
        <OnboardingButton label={c.restart} variant="ghost" onPress={onRestart} testID="resume-restart" />
        <OnboardingButton label={copy.welcome.signOut} variant="ghost" onPress={onSignOut} />
      </View>
    </View>
  );
}
