import { Text, View, type TextStyle, type ViewStyle } from "react-native";
import { tokens } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";

/** Shared text-input style for onboarding fields (matches LoginScreen inputs). */
export const inputStyle: TextStyle = {
  height: 52,
  borderRadius: tokens.radius.lg,
  borderWidth: 1,
  borderColor: tokens.color.border,
  backgroundColor: tokens.color.input,
  paddingHorizontal: 16,
  fontFamily: mono(400),
  fontSize: 15,
  color: tokens.text.primary,
};

export function FieldLabel({ children, optional }: { children: string; optional?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
      <Text style={{ fontFamily: sans(600), fontSize: 13, color: tokens.text.primary }}>{children}</Text>
      {optional ? (
        <Text style={{ fontFamily: mono(400), fontSize: 12, color: tokens.text.tertiary }}>Optional</Text>
      ) : null}
    </View>
  );
}

export function FieldGroup({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ gap: 0 }, style]}>{children}</View>;
}
