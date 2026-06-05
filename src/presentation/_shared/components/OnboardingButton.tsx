import { Pressable, StyleSheet, Text, ActivityIndicator, View } from "react-native";
import { tokens } from "@/presentation/_shared/design/tokens";
import { sans } from "@/presentation/_shared/design/fonts";

type Variant = "primary" | "secondary" | "ghost";

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}

/** Onboarding action button. Mirrors the SPA's Button variants (primary /
 *  secondary / ghost) on the native design system. */
export function OnboardingButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  testID,
}: Props) {
  const isDisabled = disabled || loading;
  const isPrimary = variant === "primary";
  const isGhost = variant === "ghost";

  const bg = isPrimary
    ? isDisabled
      ? tokens.color.card
      : tokens.color.accent
    : isGhost
      ? "transparent"
      : tokens.color.secondary;

  const fg = isPrimary
    ? isDisabled
      ? tokens.text.tertiary
      : tokens.color.accentForeground
    : isGhost
      ? tokens.text.secondary
      : tokens.text.primary;

  return (
    <Pressable
      testID={testID}
      onPress={() => {
        if (!isDisabled) onPress();
      }}
      disabled={isDisabled}
      className="active:opacity-80"
      style={[
        styles.button,
        {
          height: isGhost ? 44 : 52,
          backgroundColor: bg,
          borderWidth: variant === "secondary" ? 1 : 0,
          opacity: isDisabled && !isPrimary ? 0.6 : 1,
        },
      ]}
    >
      {loading && <ActivityIndicator size="small" color={fg} />}
      <Text style={[
        styles.label,
        {
          fontFamily: sans(isPrimary ? 700 : 600),
          fontSize: isGhost ? 14 : 15,
          color: fg,
        },
      ]}>
        {label}
      </Text>
      {/* keep label centered even with a spinner on the left */}
      {loading && <View style={styles.spacer} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: tokens.radius.lg,
    borderColor: tokens.color.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    // Dynamic styles applied inline
  },
  spacer: {
    width: 18,
  },
});
