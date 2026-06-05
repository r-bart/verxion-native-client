import { Text, TextInput, View } from "react-native";
import type { GenderType, MeasurementSystemType } from "@/domain/onboarding/models/Onboarding";
import { tokens } from "@/presentation/_shared/design/tokens";
import { mono } from "@/presentation/_shared/design/fonts";
import { copy } from "../../copy";
import { StepLayout } from "../StepLayout";
import { OptionList } from "@/presentation/_shared/components/OptionList";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";
import { DateOfBirthField } from "@/presentation/_shared/components/DateOfBirthField";
import { FieldLabel, inputStyle } from "@/presentation/_shared/components/Field";

const MIN_CM = 50;
const MAX_CM = 300;

function parseCm(raw: string): number | undefined {
  const cm = parseFloat(raw);
  if (Number.isNaN(cm) || cm < MIN_CM || cm > MAX_CM) return undefined;
  return Math.round(cm);
}

function parseFeetInches(feetRaw: string, inchesRaw: string): number | undefined {
  const feet = parseInt(feetRaw, 10);
  const inches = parseInt(inchesRaw, 10) || 0;
  if (Number.isNaN(feet)) return undefined;
  if (feet === 0 && inches === 0) return undefined;
  const cm = Math.round((feet * 12 + inches) * 2.54);
  if (cm < MIN_CM || cm > MAX_CM) return undefined;
  return cm;
}

function isValidAge(dateStr: string): boolean {
  const dob = new Date(dateStr);
  if (Number.isNaN(dob.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age >= 14 && age <= 120;
}

interface Props {
  gender: GenderType | undefined;
  onGenderChange: (value: GenderType) => void;
  dateOfBirth: string | undefined;
  onDateOfBirthChange: (value: string) => void;
  measurementSystem: MeasurementSystemType;
  heightCmInput: string;
  heightFeetInput: string;
  heightInchesInput: string;
  onHeightCmInputChange: (raw: string, cm: number | undefined) => void;
  onHeightFeetInputChange: (raw: string, cm: number | undefined) => void;
  onHeightInchesInputChange: (raw: string, cm: number | undefined) => void;
  onNext: () => void;
  onBack: () => void;
}

/** Consolidated demographics step — all fields optional. Continue with nothing
 *  filled just advances. Mirrors the SPA's PersonalDetailsStep. */
export function PersonalDetailsStep({
  gender,
  onGenderChange,
  dateOfBirth,
  onDateOfBirthChange,
  measurementSystem,
  heightCmInput,
  heightFeetInput,
  heightInchesInput,
  onHeightCmInputChange,
  onHeightFeetInputChange,
  onHeightInchesInputChange,
  onNext,
  onBack,
}: Props) {
  const c = copy.personalDetails;
  const isMetric = measurementSystem === "metric";
  const dobInvalid = !!dateOfBirth && !isValidAge(dateOfBirth);

  const genderOptions: { value: GenderType; label: string }[] = [
    { value: "male", label: copy.gender.male },
    { value: "female", label: copy.gender.female },
    { value: "not_specified", label: copy.gender.not_specified },
  ];

  return (
    <StepLayout
      title={c.title}
      subtitle={c.subtitle}
      testID="step-personal-details"
      footer={
        <>
          <OnboardingButton label={c.continue} onPress={onNext} disabled={dobInvalid} testID="personal-continue" />
          <OnboardingButton label={c.back} variant="secondary" onPress={onBack} />
        </>
      }
    >
      <View>
        <FieldLabel optional>{c.genderLabel}</FieldLabel>
        <OptionList<GenderType> value={gender} onChange={onGenderChange} options={genderOptions} />
      </View>

      <View>
        <DateOfBirthField
          value={dateOfBirth}
          onChange={onDateOfBirthChange}
          label={c.dateOfBirthLabel}
          placeholder={c.dateOfBirthPlaceholder}
        />
        {dobInvalid ? (
          <Text style={{ fontFamily: mono(400), fontSize: 12, color: tokens.color.destructive, marginTop: 6 }}>
            {c.ageError}
          </Text>
        ) : null}
      </View>

      {isMetric ? (
        <View>
          <FieldLabel optional>{c.heightLabelCm}</FieldLabel>
          <TextInput
            testID="height-cm"
            value={heightCmInput}
            onChangeText={(t) => onHeightCmInputChange(t, parseCm(t))}
            placeholder="175"
            placeholderTextColor={tokens.text.tertiary}
            keyboardType="number-pad"
            maxLength={3}
            style={inputStyle}
          />
        </View>
      ) : (
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <FieldLabel optional>{c.heightLabelFeet}</FieldLabel>
            <TextInput
              testID="height-ft"
              value={heightFeetInput}
              onChangeText={(t) => onHeightFeetInputChange(t, parseFeetInches(t, heightInchesInput))}
              placeholder="5"
              placeholderTextColor={tokens.text.tertiary}
              keyboardType="number-pad"
              maxLength={1}
              style={inputStyle}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel optional>{c.heightLabelInches}</FieldLabel>
            <TextInput
              testID="height-in"
              value={heightInchesInput}
              onChangeText={(t) => onHeightInchesInputChange(t, parseFeetInches(heightFeetInput, t))}
              placeholder="9"
              placeholderTextColor={tokens.text.tertiary}
              keyboardType="number-pad"
              maxLength={2}
              style={inputStyle}
            />
          </View>
        </View>
      )}
    </StepLayout>
  );
}
