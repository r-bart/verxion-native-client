import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "@/presentation/_shared/design/tokens";
import { mono } from "@/presentation/_shared/design/fonts";

interface Props {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label: string;
  testID?: string;
}

/** Tappable consent row: square check + label. JS-only (no native checkbox). */
export function ConsentCheckbox({ checked, onToggle, label, testID }: Props) {
  return (
    <Pressable
      testID={testID}
      onPress={() => onToggle(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={styles.container}
      className="active:opacity-90"
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? tokens.color.accent : tokens.color.border,
            backgroundColor: checked ? tokens.color.accent : "transparent",
          },
        ]}
      >
        {checked ? (
          <Text style={styles.checkmark}>✓</Text>
        ) : null}
      </View>
      <Text style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    marginTop: 1,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: tokens.color.accentForeground,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 15,
  },
  label: {
    flex: 1,
    fontFamily: mono(400),
    fontSize: 13,
    lineHeight: 19,
    color: tokens.text.secondary,
  },
});
