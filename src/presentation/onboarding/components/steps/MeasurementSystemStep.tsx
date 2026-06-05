import type { MeasurementSystemType } from "@/domain/onboarding/models/Onboarding";
import { copy } from "../../copy";
import { StepLayout } from "../StepLayout";
import { OptionList } from "@/presentation/_shared/components/OptionList";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";

interface Props {
  value: MeasurementSystemType | undefined;
  onChange: (value: MeasurementSystemType) => void;
  onNext: () => void;
  onBack: () => void;
}

export function MeasurementSystemStep({ value, onChange, onNext, onBack }: Props) {
  const c = copy.measurementSystem;
  return (
    <StepLayout
      title={c.title}
      subtitle={c.subtitle}
      testID="step-measurement-system"
      footer={
        <>
          <OnboardingButton label={c.next} onPress={onNext} disabled={!value} testID="units-continue" />
          <OnboardingButton label={c.back} variant="secondary" onPress={onBack} />
        </>
      }
    >
      <OptionList<MeasurementSystemType>
        value={value}
        onChange={onChange}
        options={[
          { value: "metric", label: c.metric, hint: c.metricHint },
          { value: "imperial", label: c.imperial, hint: c.imperialHint },
        ]}
      />
    </StepLayout>
  );
}
