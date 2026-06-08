import { useRef, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { SignInCancelled } from "@/domain/auth";
import { useSignInGoogle } from "../hooks/useSignInGoogle";
import { useSignInApple } from "../hooks/useSignInApple";
import { useSignIn } from "../hooks/useSignIn";
import { useLastAuthProvider } from "../hooks/useLastAuthProvider";
import { AppleSignInButton } from "../components/AppleSignInButton";
import { LastUsedBadge } from "../components/LastUsedBadge";
import { GoogleIcon } from "@/presentation/_shared/components/icons/GoogleIcon";
import { Isotype } from "@/presentation/_shared/components/Isotype";
import { Wordmark } from "@/presentation/_shared/components/Wordmark";
import { tokens } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";

// Taps on the logo needed to reveal the reviewer email/password form. Mirrors
// the web app's `?reviewer=1` gate — a discoverability gesture, not security
// (the server-side AUTH_REVIEWER_EMAILS allowlist is the real protection).
const REVIEWER_GESTURE_TAPS = 7;

type Provider = "google" | "apple" | "reviewer";

export function LoginScreen() {
  const google = useSignInGoogle();
  const apple = useSignInApple();
  const reviewer = useSignIn();
  const { data: lastProvider } = useLastAuthProvider();

  const [showReviewerForm, setShowReviewerForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Which provider was last attempted — so a stale error from an earlier
  // provider can't bleed into the message after switching to another.
  const [lastAttempt, setLastAttempt] = useState<Provider | null>(null);
  const tapCount = useRef(0);

  const isBusy = google.isPending || apple.isPending || reviewer.isPending;

  const handleLogoTap = () => {
    tapCount.current += 1;
    if (tapCount.current >= REVIEWER_GESTURE_TAPS) setShowReviewerForm(true);
  };

  const canSubmitReviewer = email.length > 0 && password.length > 0 && !reviewer.isPending;

  const handleReviewerSignIn = () => {
    if (!canSubmitReviewer) return;
    setLastAttempt("reviewer");
    reviewer.mutate({ email, password });
  };

  // Only the last-attempted provider's error is shown, and cancellation
  // (`SignInCancelled`, e.g. dismissing the Apple sheet) stays silent.
  const activeError =
    lastAttempt === "google"
      ? google.error
      : lastAttempt === "apple"
        ? apple.error
        : lastAttempt === "reviewer"
          ? reviewer.error
          : null;
  const errorMessage =
    activeError && !(activeError instanceof SignInCancelled)
      ? activeError.message || "Sign in failed"
      : null;

  const inputStyle = {
    height: 52,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.color.border,
    backgroundColor: tokens.color.input,
    paddingHorizontal: 16,
    fontFamily: mono(400),
    fontSize: 14,
    color: tokens.text.primary,
  } as const;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: tokens.color.background }}>
      {/* subtle lava glow from the top */}
      <LinearGradient
        colors={["rgba(255,98,98,0.10)", "rgba(255,98,98,0)"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: "46%" }}
        pointerEvents="none"
      />

      <View className="flex-1 justify-center" style={{ paddingHorizontal: 28 }}>
        {/* brand */}
        <Pressable
          onPress={handleLogoTap}
          testID="brand-logo-tap"
          style={{ alignItems: "center", marginBottom: 14 }}
        >
          <Isotype size={68} glow />
          <Wordmark size={32} color={tokens.text.primary} align="center" style={{ marginTop: 18 }} />
        </Pressable>
        <Text
          style={{
            fontFamily: mono(400),
            fontSize: 13,
            lineHeight: 20,
            color: tokens.text.secondary,
            textAlign: "center",
            marginBottom: 52,
          }}
        >
          Keep becoming your best version
        </Text>

        <View style={{ gap: 12 }}>
          <View style={{ position: "relative" }}>
            {lastProvider === "apple" && <LastUsedBadge testID="last-used-apple" />}
            <AppleSignInButton
              disabled={isBusy}
              onPress={() => {
                setLastAttempt("apple");
                apple.mutate();
              }}
            />
            {apple.isPending && (
              <View
                pointerEvents="none"
                style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}
              >
                <ActivityIndicator color={tokens.text.primary} />
              </View>
            )}
          </View>

          <View style={{ position: "relative" }}>
            {lastProvider === "google" && <LastUsedBadge testID="last-used-google" />}
            <Pressable
              testID="google-signin-button"
              onPress={() => {
                if (isBusy) return;
                setLastAttempt("google");
                google.mutate();
              }}
              disabled={isBusy}
              accessibilityLabel="Continuar con Google"
              accessibilityRole="button"
              className="active:opacity-80"
              style={[styles.googleButton, { opacity: isBusy ? 0.6 : 1 }]}
            >
              {google.isPending ? (
                <ActivityIndicator color="#1F1F1F" />
              ) : (
                <>
                  <GoogleIcon size={20} />
                  <Text style={{ fontFamily: sans(600), fontSize: 15, color: "#1F1F1F" }}>Continue with Google</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {showReviewerForm && (
          <View style={{ gap: 12, marginTop: 24 }} testID="reviewer-form">
            <Text
              style={{
                fontFamily: mono(600),
                fontSize: 12,
                letterSpacing: 0.9,
                textTransform: "uppercase",
                color: tokens.text.tertiary,
                textAlign: "center",
              }}
            >
              Reviewer access
            </Text>
            <TextInput
              testID="email-input"
              placeholder="Email"
              placeholderTextColor={tokens.text.tertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              accessibilityLabel="Email"
              style={inputStyle}
            />
            <TextInput
              testID="password-input"
              placeholder="Password"
              placeholderTextColor={tokens.text.tertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              accessibilityLabel="Password"
              style={inputStyle}
            />
            <Pressable
              testID="reviewer-submit"
              onPress={handleReviewerSignIn}
              disabled={!canSubmitReviewer}
              className="active:opacity-80"
              style={{
                backgroundColor: canSubmitReviewer ? tokens.color.accent : tokens.color.card,
                borderRadius: tokens.radius.lg,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: sans(700),
                  fontSize: 15,
                  color: canSubmitReviewer ? tokens.color.accentForeground : tokens.text.tertiary,
                }}
              >
                {reviewer.isPending ? "Signing in..." : "Sign In"}
              </Text>
            </Pressable>
          </View>
        )}

        {errorMessage && (
          <Text
            testID="login-error"
            style={{
              fontFamily: mono(400),
              fontSize: 12,
              lineHeight: 16,
              color: tokens.color.destructive,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            {errorMessage}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    height: 52,
    borderRadius: tokens.radius.lg,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
});
