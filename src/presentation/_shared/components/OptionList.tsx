import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";

export interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface Props<T extends string> {
  value: T | undefined;
  onChange: (value: T) => void;
  options: Option<T>[];
  testID?: string;
}

/**
 * Vertical single-select list — the native equivalent of the SPA's RadioGroup.
 * Large tappable rows with a lava-accent ring + check on the selected option.
 */
export function OptionList<T extends string>({ value, onChange, options, testID }: Props<T>) {
  return (
    <View style={styles.container} testID={testID}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            testID={`option-${opt.value}`}
            onPress={() => onChange(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className="active:opacity-90"
            style={[
              styles.option,
              {
                borderColor: selected ? tokens.color.accent : tokens.color.border,
                backgroundColor: selected ? "rgba(255,98,98,0.08)" : tokens.color.card,
              },
            ]}
          >
            <View style={styles.content}>
              <Text style={[styles.label, { fontFamily: sans(selected ? 700 : 600) }]}>
                {opt.label}
              </Text>
              {opt.hint ? (
                <Text style={styles.hint}>
                  {opt.hint}
                </Text>
              ) : null}
            </View>
            <View
              style={[
                styles.radioButton,
                { borderColor: selected ? tokens.color.accent : tokens.color.border },
              ]}
            >
              {selected ? (
                <View style={styles.radioButtonSelected} />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    color: tokens.text.primary,
  },
  hint: {
    fontFamily: mono(400),
    fontSize: 12,
    color: tokens.text.secondary,
    marginTop: 2,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tokens.color.accent,
  },
});
