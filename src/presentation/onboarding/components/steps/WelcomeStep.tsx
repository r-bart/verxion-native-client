import { Text, View } from "react-native";
import { Isotype } from "@/presentation/_shared/components/Isotype";
import { tokens } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { copy } from "../../copy";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";

interface Props {
  onNext: () => void;
  onSignOut: () => void;
}

export function WelcomeStep({ onNext, onSignOut }: Props) {
  const c = copy.welcome;
  return (
    <View style={{ flex: 1, justifyContent: "center" }} testID="step-welcome">
      <View style={{ alignItems: "center", gap: 18 }}>
        <Isotype size={64} glow />
        <View style={{ alignItems: "center", gap: 8 }}>
          <Text style={{ fontFamily: sans(800), fontSize: 26, letterSpacing: -0.6, color: tokens.text.primary, textAlign: "center" }}>
            {c.title}
          </Text>
          <Text style={{ fontFamily: mono(400), fontSize: 13, lineHeight: 20, color: tokens.text.secondary, textAlign: "center", maxWidth: 300 }}>
            {c.subtitle}
          </Text>
        </View>
      </View>

      <View style={{ gap: 10, marginTop: 40 }}>
        <OnboardingButton label={c.getStarted} onPress={onNext} testID="welcome-start" />
        <OnboardingButton label={c.signOut} variant="ghost" onPress={onSignOut} />
      </View>
    </View>
  );
}
