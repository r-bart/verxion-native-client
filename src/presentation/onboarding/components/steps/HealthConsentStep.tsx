import { Linking, Text, View } from "react-native";
import { tokens } from "@/presentation/_shared/design/tokens";
import { mono } from "@/presentation/_shared/design/fonts";
import { copy } from "../../copy";
import { StepLayout } from "../StepLayout";
import { ConsentCheckbox } from "../ConsentCheckbox";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";

const MARKETING_URL = process.env.EXPO_PUBLIC_MARKETING_URL ?? "https://verxion.ai";

interface Props {
  accepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export function HealthConsentStep({ accepted, onAcceptChange, onNext, onBack }: Props) {
  const c = copy.healthConsent;
  return (
    <StepLayout
      title={c.title}
      subtitle={c.subtitle}
      testID="step-health-consent"
      footer={
        <>
          <OnboardingButton label={c.next} onPress={onNext} disabled={!accepted} testID="consent-continue" />
          <OnboardingButton label={c.back} variant="secondary" onPress={onBack} />
        </>
      }
    >
      <View
        style={{
          borderRadius: tokens.radius.lg,
          borderWidth: 1,
          borderColor: tokens.color.border,
          backgroundColor: tokens.color.card,
          padding: 16,
          gap: 12,
        }}
      >
        <ConsentCheckbox checked={accepted} onToggle={onAcceptChange} label={c.checkbox} testID="consent-checkbox" />
        <Text style={{ fontFamily: mono(400), fontSize: 12, lineHeight: 18, color: tokens.text.tertiary }}>
          {c.detailsPrefix}{" "}
          <Text
            onPress={() => Linking.openURL(`${MARKETING_URL}/privacy`)}
            style={{ color: tokens.text.primary, textDecorationLine: "underline" }}
          >
            {c.detailsLink}
          </Text>{" "}
          {c.detailsSuffix}
        </Text>
      </View>
    </StepLayout>
  );
}
