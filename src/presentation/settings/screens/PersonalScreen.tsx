import { useState } from "react";
import { View, Text, TextInput, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import type {
  GenderType,
  MeasurementSystemType,
  ExperienceLevelType,
  FitnessGoalType,
  UserAccount,
  UpdateAccountInput,
  UpdatePreferencesInput,
} from "@/domain/settings";
import { OptionList, type Option } from "@/presentation/_shared/components/OptionList";
import { DateOfBirthField } from "@/presentation/_shared/components/DateOfBirthField";
import { inputStyle, FieldLabel } from "@/presentation/_shared/components/Field";
import { SettingsScaffold } from "../components/SettingsScaffold";
import { SaveBar } from "../components/SaveBar";
import { useAccount } from "../hooks/useAccount";
import { useUpdatePersonal } from "../hooks/useUpdatePersonal";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";

function cmToFeetInches(cm: number): { ft: number; inch: number } {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  return { ft, inch: Math.round(totalIn - ft * 12) };
}
function feetInchesToCm(ft: number, inch: number): number {
  return Math.round((ft * 12 + inch) * 2.54);
}

export function PersonalScreen() {
  const { t } = useTranslation();
  const account = useAccount();
  const data = account.data;

  if (account.isLoading || !data) {
    return (
      <SettingsScaffold title={t("settings.screens.personal.title")}>
        <ActivityIndicator color={glass.lava} style={{ marginTop: 24 }} />
      </SettingsScaffold>
    );
  }

  const seedKey = [
    data.gender,
    data.dateOfBirth,
    data.measurementSystem,
    data.heightCm,
    data.experienceLevel,
    data.primaryGoal,
  ].join("|");
  return <PersonalForm key={seedKey} data={data} />;
}

function PersonalForm({ data }: { data: UserAccount }) {
  const { t } = useTranslation();
  const save = useUpdatePersonal();

  const [gender, setGender] = useState<GenderType | undefined>(data.gender ?? undefined);
  const [dob, setDob] = useState<string | undefined>(data.dateOfBirth ?? undefined);
  const [system, setSystem] = useState<MeasurementSystemType>(data.measurementSystem);
  const [heightCm, setHeightCm] = useState<number | null>(data.heightCm);
  const [experience, setExperience] = useState<ExperienceLevelType>(data.experienceLevel);
  const [goal, setGoal] = useState<FitnessGoalType | undefined>(data.primaryGoal ?? undefined);

  const genderOptions: Option<GenderType>[] = [
    { value: "male", label: t("settings.screens.personal.genderMale") },
    { value: "female", label: t("settings.screens.personal.genderFemale") },
    { value: "not_specified", label: t("settings.screens.personal.genderNotSpecified") },
  ];
  const systemOptions: Option<MeasurementSystemType>[] = [
    { value: "metric", label: t("settings.screens.personal.metric"), hint: t("settings.screens.personal.metricHint") },
    { value: "imperial", label: t("settings.screens.personal.imperial"), hint: t("settings.screens.personal.imperialHint") },
  ];
  const experienceOptions: Option<ExperienceLevelType>[] = [
    { value: "beginner", label: t("settings.screens.personal.experienceBeginner"), hint: t("settings.screens.personal.experienceBeginnerHint") },
    { value: "intermediate", label: t("settings.screens.personal.experienceIntermediate"), hint: t("settings.screens.personal.experienceIntermediateHint") },
    { value: "advanced", label: t("settings.screens.personal.experienceAdvanced"), hint: t("settings.screens.personal.experienceAdvancedHint") },
    { value: "pro", label: t("settings.screens.personal.experiencePro"), hint: t("settings.screens.personal.experienceProHint") },
  ];
  const goalOptions: Option<FitnessGoalType>[] = [
    { value: "fat_loss", label: t("settings.screens.personal.goalFatLoss") },
    { value: "muscle_gain", label: t("settings.screens.personal.goalMuscleGain") },
    { value: "strength", label: t("settings.screens.personal.goalStrength") },
    { value: "general_fitness", label: t("settings.screens.personal.goalGeneralFitness") },
    { value: "recomposition", label: t("settings.screens.personal.goalRecomposition") },
    { value: "athletic_performance", label: t("settings.screens.personal.goalAthleticPerformance") },
  ];

  const dirty =
    (gender ?? null) !== data.gender ||
    (dob ?? null) !== data.dateOfBirth ||
    system !== data.measurementSystem ||
    heightCm !== data.heightCm ||
    experience !== data.experienceLevel ||
    (goal ?? null) !== data.primaryGoal;

  const handleDiscard = () => {
    setGender(data.gender ?? undefined);
    setDob(data.dateOfBirth ?? undefined);
    setSystem(data.measurementSystem);
    setHeightCm(data.heightCm);
    setExperience(data.experienceLevel);
    setGoal(data.primaryGoal ?? undefined);
  };

  const handleSave = () => {
    const accountInput: UpdateAccountInput = {};
    if ((gender ?? null) !== data.gender) accountInput.sex = gender ?? null;
    if ((dob ?? null) !== data.dateOfBirth) accountInput.dateOfBirth = dob ?? null;
    if (heightCm !== data.heightCm && heightCm != null && heightCm > 0) {
      accountInput.heightCm = heightCm;
    }
    if (system !== data.measurementSystem) accountInput.measurementSystem = system;
    if (experience !== data.experienceLevel) accountInput.experienceLevel = experience;

    const preferences: UpdatePreferencesInput = {};
    if (goal && goal !== data.primaryGoal) preferences.fitnessPreferences = { primaryGoal: goal };

    save.mutate({ account: accountInput, preferences });
  };

  const imperial = heightCm != null ? cmToFeetInches(heightCm) : { ft: 0, inch: 0 };
  const setHeightFromCm = (text: string) => {
    const n = parseInt(text.replace(/[^0-9]/g, ""), 10);
    setHeightCm(Number.isFinite(n) ? n : null);
  };
  const setFeet = (text: string) => {
    const ft = parseInt(text.replace(/[^0-9]/g, ""), 10) || 0;
    setHeightCm(feetInchesToCm(ft, imperial.inch));
  };
  const setInches = (text: string) => {
    const inch = parseInt(text.replace(/[^0-9]/g, ""), 10) || 0;
    setHeightCm(feetInchesToCm(imperial.ft, inch));
  };

  return (
    <SettingsScaffold
      title={t("settings.screens.personal.title")}
      subtitle={t("settings.screens.personal.subtitle")}
      footer={
        <SaveBar
          dirty={dirty}
          saving={save.isPending}
          error={save.isError}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      }
    >
      <View>
        <FieldLabel>{t("settings.screens.personal.gender")}</FieldLabel>
        <OptionList value={gender} onChange={setGender} options={genderOptions} testID="personal-gender" />
      </View>

      <DateOfBirthField
        value={dob}
        onChange={setDob}
        label={t("settings.screens.personal.dateOfBirth")}
        placeholder={t("settings.screens.personal.dateOfBirthPlaceholder")}
      />

      <View>
        <FieldLabel>{t("settings.screens.personal.measurementSystem")}</FieldLabel>
        <OptionList value={system} onChange={setSystem} options={systemOptions} testID="personal-system" />
      </View>

      <View>
        <FieldLabel>{t("settings.screens.personal.height")}</FieldLabel>
        {system === "metric" ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TextInput
              testID="personal-height-cm"
              value={heightCm != null ? String(heightCm) : ""}
              onChangeText={setHeightFromCm}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="—"
              placeholderTextColor={glass.ink3}
              style={[inputStyle, { flex: 1 }]}
            />
            <Text style={{ fontFamily: sans(600), fontSize: 15, color: glass.ink2, width: 28 }}>cm</Text>
          </View>
        ) : (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TextInput
                testID="personal-height-ft"
                value={heightCm != null ? String(imperial.ft) : ""}
                onChangeText={setFeet}
                keyboardType="number-pad"
                maxLength={1}
                placeholder="—"
                placeholderTextColor={glass.ink3}
                style={[inputStyle, { flex: 1 }]}
              />
              <Text style={{ fontFamily: sans(600), fontSize: 15, color: glass.ink2, width: 22 }}>ft</Text>
            </View>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TextInput
                testID="personal-height-in"
                value={heightCm != null ? String(imperial.inch) : ""}
                onChangeText={setInches}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="—"
                placeholderTextColor={glass.ink3}
                style={[inputStyle, { flex: 1 }]}
              />
              <Text style={{ fontFamily: sans(600), fontSize: 15, color: glass.ink2, width: 22 }}>in</Text>
            </View>
          </View>
        )}
      </View>

      <View>
        <FieldLabel>{t("settings.screens.personal.experience")}</FieldLabel>
        <OptionList value={experience} onChange={setExperience} options={experienceOptions} testID="personal-experience" />
      </View>

      <View>
        <FieldLabel>{t("settings.screens.personal.primaryGoal")}</FieldLabel>
        <OptionList value={goal} onChange={setGoal} options={goalOptions} testID="personal-goal" />
      </View>
    </SettingsScaffold>
  );
}
