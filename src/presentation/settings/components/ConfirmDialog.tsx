import { Modal, View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  /** Extra content above the buttons (e.g. a type-to-confirm input). */
  children?: React.ReactNode;
  loading?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  testID?: string;
};

/**
 * Glass confirmation sheet for destructive/irreversible actions (revoke,
 * sign out everywhere, delete account). A bottom sheet over a scrim.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  children,
  loading = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  testID,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}
        onPress={onCancel}
      >
        {/* Stop propagation so taps inside the sheet don't dismiss it. */}
        <Pressable onPress={() => {}} testID={testID}>
          <GlassSurface
            radius={24}
            fallbackFill="#141416"
            style={{ margin: 12, padding: 20, gap: 14 }}
          >
            <Text style={{ fontFamily: sans(800), fontSize: 18, letterSpacing: -0.3, color: glass.white }}>
              {title}
            </Text>
            <Text style={{ fontFamily: mono(400), fontSize: 13, lineHeight: 19, color: glass.ink2 }}>
              {message}
            </Text>
            {children}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <View style={{ flex: 1 }}>
                <OnboardingButton
                  label={t("common.cancel")}
                  variant="secondary"
                  onPress={onCancel}
                  disabled={loading}
                  testID="confirm-cancel"
                />
              </View>
              <View style={{ flex: 1 }}>
                <OnboardingButton
                  label={confirmLabel}
                  onPress={onConfirm}
                  loading={loading}
                  disabled={confirmDisabled}
                  testID="confirm-accept"
                />
              </View>
            </View>
          </GlassSurface>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
