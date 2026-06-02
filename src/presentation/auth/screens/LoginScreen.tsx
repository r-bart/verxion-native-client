import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSignIn } from "../hooks/useSignIn";
import { BrandLogo } from "@/presentation/_shared/components/BrandLogo";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const mutation = useSignIn();
  const router = useRouter();

  const canSubmit = email.length > 0 && password.length > 0 && !mutation.isPending;

  const handleSignIn = () => {
    if (!canSubmit) return;
    mutation.mutate(
      { email, password },
      {
        onSuccess: () => router.replace("/(tabs)/today"),
      }
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
      <View className="flex-1 justify-center" style={{ paddingHorizontal: 24 }}>
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <BrandLogo width={120} height={72} />
        </View>
        <Text
          style={{
            ...METRIC_TYPOGRAPHY.cardSubtitle,
            color: PROGRESS_COLORS.secondaryText,
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          Keep becoming your best version
        </Text>

        <View style={{ gap: 16, marginBottom: 24 }}>
          <TextInput
            testID="email-input"
            placeholder="Email"
            placeholderTextColor={PROGRESS_COLORS.tertiaryText}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            style={{
              height: 52,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: PROGRESS_COLORS.tertiaryText + "40",
              backgroundColor: PROGRESS_COLORS.cardBackground,
              paddingHorizontal: 16,
              fontSize: 15,
              color: PROGRESS_COLORS.primaryText,
            }}
          />
          <TextInput
            testID="password-input"
            placeholder="Password"
            placeholderTextColor={PROGRESS_COLORS.tertiaryText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            style={{
              height: 52,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: PROGRESS_COLORS.tertiaryText + "40",
              backgroundColor: PROGRESS_COLORS.cardBackground,
              paddingHorizontal: 16,
              fontSize: 15,
              color: PROGRESS_COLORS.primaryText,
            }}
          />
        </View>

        <Pressable
          onPress={handleSignIn}
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
              color: canSubmit ? "#FFFFFF" : PROGRESS_COLORS.tertiaryText,
            }}
          >
            {mutation.isPending ? "Signing in..." : "Sign In"}
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
            {mutation.error?.message || "Sign in failed"}
          </Text>
        )}

        <Pressable onPress={() => router.push("/(auth)/signup")} style={{ marginTop: 24 }}>
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.cardSubtitle,
              color: PROGRESS_COLORS.secondaryText,
              textAlign: "center",
            }}
          >
            Don&apos;t have an account?{" "}
            <Text style={{ color: PROGRESS_COLORS.positive.primary, fontWeight: "600" }}>
              Sign up here
            </Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
