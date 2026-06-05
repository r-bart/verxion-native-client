import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";
import { glass } from "@/presentation/_shared/design/glass";
import { mono } from "@/presentation/_shared/design/fonts";

type Props = {
  dirty: boolean;
  saving: boolean;
  canSave?: boolean;
  error?: boolean;
  onSave: () => void;
  onDiscard: () => void;
};

/**
 * Save/discard footer for editable settings screens. Renders only when the
 * form is dirty; the Save button is disabled while saving or when `canSave`
 * is false (e.g. an invalid username).
 */
export function SaveBar({ dirty, saving, canSave = true, error, onSave, onDiscard }: Props) {
  const { t } = useTranslation();
  if (!dirty) return null;

  return (
    <View style={{ gap: 8 }}>
      {error && (
        <Text
          testID="save-error"
          style={{ fontFamily: mono(400), fontSize: 12, color: glass.lava, textAlign: "center" }}
        >
          {t("common.saveError")}
        </Text>
      )}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <OnboardingButton
            label={t("common.discard")}
            variant="secondary"
            onPress={onDiscard}
            disabled={saving}
            testID="settings-discard"
          />
        </View>
        <View style={{ flex: 1 }}>
          <OnboardingButton
            label={t("common.save")}
            onPress={onSave}
            loading={saving}
            disabled={!canSave}
            testID="settings-save"
          />
        </View>
      </View>
    </View>
  );
}
