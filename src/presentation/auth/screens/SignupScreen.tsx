import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSignUp } from "../hooks/useSignUp";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

export function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const mutation = useSignUp();
  const router = useRouter();

  const canSubmit = name.length > 0 && email.length > 0 && password.length > 0 && !mutation.isPending;

  const handleSignUp = () => {
    if (!canSubmit) return;
    mutation.mutate(
      { name, email, password },
      {
        onSuccess: () => router.replace("/(auth)/login"),
      }
    );
  };

  const inputStyle = {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PROGRESS_COLORS.tertiaryText + "40",
    backgroundColor: PROGRESS_COLORS.cardBackground,
    paddingHorizontal: 16,
    fontSize: 15,
    color: PROGRESS_COLORS.primaryText,
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
      <View className="flex-1 justify-center" style={{ paddingHorizontal: 24 }}>
        <Text
          style={{
            fontSize: 36,
            fontWeight: "700",
            color: PROGRESS_COLORS.primaryText,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Create Account
        </Text>
        <Text
          style={{
            ...METRIC_TYPOGRAPHY.cardSubtitle,
            color: PROGRESS_COLORS.secondaryText,
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          Start your transformation journey
        </Text>

        <View style={{ gap: 16, marginBottom: 24 }}>
          <TextInput
            testID="name-input"
            placeholder="Name"
            placeholderTextColor={PROGRESS_COLORS.tertiaryText}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            style={inputStyle}
          />
          <TextInput
            testID="email-input"
            placeholder="Email"
            placeholderTextColor={PROGRESS_COLORS.tertiaryText}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            style={inputStyle}
          />
          <TextInput
            testID="password-input"
            placeholder="Password"
            placeholderTextColor={PROGRESS_COLORS.tertiaryText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            style={inputStyle}
          />
        </View>

        <Pressable
          onPress={handleSignUp}
          disabled={!canSubmit}
          className="active:opacity-80"
          style={{
            backgroundColor: canSubmit
              ? PROGRESS_COLORS.positive.primary
              : PROGRESS_COLORS.cardBackground,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: canSubmit ? "#000000" : PROGRESS_COLORS.tertiaryText,
            }}
          >
            {mutation.isPending ? "Signing up..." : "Create Account"}
          </Text>
        </Pressable>

        {mutation.isError && (
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.cardSubtitle,
              color: PROGRESS_COLORS.health.primary,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            {mutation.error?.message || "Sign up failed"}
          </Text>
        )}

        <Pressable onPress={() => router.push("/(auth)/login")} style={{ marginTop: 24 }}>
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.cardSubtitle,
              color: PROGRESS_COLORS.secondaryText,
              textAlign: "center",
            }}
          >
            Already have an account?{" "}
            <Text style={{ color: PROGRESS_COLORS.positive.primary, fontWeight: "600" }}>
              Log in here
            </Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
