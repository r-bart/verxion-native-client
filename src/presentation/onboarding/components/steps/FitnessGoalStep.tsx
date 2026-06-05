import type { FitnessGoalType } from "@/domain/onboarding/models/Onboarding";
import { copy } from "../../copy";
import { StepLayout } from "../StepLayout";
import { OptionList } from "@/presentation/_shared/components/OptionList";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";
import { FieldLabel } from "@/presentation/_shared/components/Field";

interface Props {
  value: FitnessGoalType | undefined;
  onChange: (value: FitnessGoalType) => void;
  /** Submit the whole form (last step). */
  onSubmit: () => void;
  /** Submit with `primaryGoal` cleared. */
  onSkip: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const GOALS: FitnessGoalType[] = [
  "muscle_gain",
  "fat_loss",
  "strength",
  "endurance",
  "flexibility",
  "general_fitness",
  "athletic_performance",
  "rehabilitation",
  "recomposition",
];

export function FitnessGoalStep({ value, onChange, onSubmit, onSkip, onBack, isSubmitting }: Props) {
  const c = copy.fitnessGoal;
  return (
    <StepLayout
      title={c.title}
      subtitle={c.subtitle}
      testID="step-fitness-goal"
      footer={
        <>
          <OnboardingButton
            label={isSubmitting ? c.submitPending : c.submitIdle}
            onPress={onSubmit}
            disabled={!value}
            loading={isSubmitting}
            testID="goal-submit"
          />
          <OnboardingButton label={c.back} variant="secondary" onPress={onBack} disabled={isSubmitting} />
          <OnboardingButton label={c.skipAndFinish} variant="ghost" onPress={onSkip} disabled={isSubmitting} testID="goal-skip" />
        </>
      }
    >
      <FieldLabel optional>{c.label}</FieldLabel>
      <OptionList<FitnessGoalType>
        value={value}
        onChange={onChange}
        options={GOALS.map((g) => ({ value: g, label: copy.fitnessGoal[g] }))}
      />
    </StepLayout>
  );
}
