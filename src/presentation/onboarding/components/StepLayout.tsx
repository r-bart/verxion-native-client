import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { tokens } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Footer action buttons, pinned below the scrollable body. */
  footer: React.ReactNode;
  testID?: string;
}

/** Shared scaffold for a form step: heading + scrollable body + pinned footer. */
export function StepLayout({ title, subtitle, children, footer, testID }: Props) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      testID={testID}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 16, gap: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: sans(700), fontSize: 22, letterSpacing: -0.4, color: tokens.text.primary }}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ fontFamily: mono(400), fontSize: 13, lineHeight: 20, color: tokens.text.secondary }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {children}
      </ScrollView>
      <View style={{ gap: 10, paddingTop: 12 }}>{footer}</View>
    </KeyboardAvoidingView>
  );
}
