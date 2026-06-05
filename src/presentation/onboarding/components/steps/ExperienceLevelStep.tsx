import type { ExperienceLevelType } from "@/domain/onboarding/models/Onboarding";
import { copy } from "../../copy";
import { StepLayout } from "../StepLayout";
import { OptionList } from "@/presentation/_shared/components/OptionList";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";

interface Props {
  value: ExperienceLevelType | undefined;
  onChange: (value: ExperienceLevelType) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ExperienceLevelStep({ value, onChange, onNext, onBack }: Props) {
  const c = copy.experienceLevel;
  return (
    <StepLayout
      title={c.title}
      subtitle={c.subtitle}
      testID="step-experience-level"
      footer={
        <>
          <OnboardingButton label={c.submitIdle} onPress={onNext} disabled={!value} testID="experience-continue" />
          <OnboardingButton label={c.back} variant="secondary" onPress={onBack} />
        </>
      }
    >
      <OptionList<ExperienceLevelType>
        value={value}
        onChange={onChange}
        options={[
          { value: "beginner", label: c.beginner },
          { value: "intermediate", label: c.intermediate },
          { value: "advanced", label: c.advanced },
        ]}
      />
    </StepLayout>
  );
}
