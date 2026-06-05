import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { tokens } from "@/presentation/_shared/design/tokens";
import { mono } from "@/presentation/_shared/design/fonts";
import { copy } from "../../copy";
import type { UsernameAvailability } from "@/presentation/_shared/hooks/useUsernameAvailability";
import { StepLayout } from "../StepLayout";
import { OnboardingButton } from "@/presentation/_shared/components/OnboardingButton";
import { FieldLabel } from "@/presentation/_shared/components/Field";

interface Props {
  value: string;
  onChange: (value: string) => void;
  availability: UsernameAvailability;
  onNext: () => void;
  onBack: () => void;
}

export function UsernameStep({ value, onChange, availability, onNext, onBack }: Props) {
  const c = copy.username;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 320);
    return () => clearTimeout(id);
  }, []);

  const { isAvailable, isValid, isChecking, errorCode } = availability;
  const hasValue = value.trim().length > 0;
  const canProceed = hasValue && isValid && isAvailable && !isChecking;

  const showChecking = hasValue && isChecking;
  const showAvailable = hasValue && !isChecking && isValid && isAvailable && !errorCode;
  const showError = hasValue && !isChecking && (!isValid || !isAvailable || !!errorCode);

  const helper = showChecking
    ? { text: c.checking, color: tokens.text.secondary }
    : showAvailable
      ? { text: c.available, color: tokens.color.success }
      : showError
        ? {
            text: !isValid ? c.invalid : errorCode === "checkError" ? c.checkError : c.taken,
            color: tokens.color.destructive,
          }
        : null;

  const borderColor = showAvailable
    ? tokens.color.success
    : showError
      ? tokens.color.destructive
      : tokens.color.border;

  return (
    <StepLayout
      title={c.title}
      subtitle={c.subtitle}
      testID="step-username"
      footer={
        <>
          <OnboardingButton label={c.next} onPress={onNext} disabled={!canProceed} testID="username-continue" />
          <OnboardingButton label={copy.healthConsent.back} variant="secondary" onPress={onBack} />
        </>
      }
    >
      <View>
        <FieldLabel>{c.label}</FieldLabel>
        <View style={[styles.inputContainer, { borderColor }]}>
          <Text style={styles.atSymbol}>@</Text>
          <TextInput
            ref={inputRef}
            testID="username-input"
            value={value}
            onChangeText={(t) => onChange(t.replace(/^\s+/, ""))}
            placeholder={c.placeholder}
            placeholderTextColor={tokens.text.tertiary}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            maxLength={20}
            style={styles.textInput}
          />
          <View style={styles.statusIcon}>
            {showChecking ? (
              <ActivityIndicator size="small" color={tokens.text.secondary} />
            ) : showAvailable ? (
              <Text style={styles.successIcon}>✓</Text>
            ) : showError ? (
              <Text style={styles.errorIcon}>✕</Text>
            ) : null}
          </View>
        </View>
        {helper ? (
          <Text testID="username-helper" style={[styles.helper, { color: helper.color }]}>
            {helper.text}
          </Text>
        ) : null}
      </View>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    backgroundColor: tokens.color.input,
    paddingHorizontal: 14,
  },
  atSymbol: {
    fontFamily: mono(400),
    fontSize: 15,
    color: tokens.text.tertiary,
    marginRight: 2,
  },
  textInput: {
    flex: 1,
    fontFamily: mono(400),
    fontSize: 15,
    color: tokens.text.primary,
    paddingVertical: 0,
  },
  statusIcon: {
    width: 20,
    alignItems: "center",
  },
  successIcon: {
    color: tokens.color.success,
    fontSize: 15,
    fontWeight: "900",
  },
  errorIcon: {
    color: tokens.color.destructive,
    fontSize: 15,
    fontWeight: "900",
  },
  helper: {
    fontFamily: mono(400),
    fontSize: 12,
    lineHeight: 16,
    marginTop: 8,
  },
});
