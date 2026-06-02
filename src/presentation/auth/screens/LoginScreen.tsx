import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignInCancelled } from "@/domain/auth";
import { useSignInGoogle } from "../hooks/useSignInGoogle";
import { useSignInApple } from "../hooks/useSignInApple";
import { useSignIn } from "../hooks/useSignIn";
import { AppleSignInButton } from "../components/AppleSignInButton";
import { BrandLogo } from "@/presentation/_shared/components/BrandLogo";
import { GoogleIcon } from "@/presentation/_shared/components/icons/GoogleIcon";
import {
  PROGRESS_COLORS,
  METRIC_TYPOGRAPHY,
} from "@/presentation/_shared/constants/progress-colors";

// Taps on the logo needed to reveal the reviewer email/password form. Mirrors
// the web app's `?reviewer=1` gate — a discoverability gesture, not security
// (the server-side AUTH_REVIEWER_EMAILS allowlist is the real protection).
const REVIEWER_GESTURE_TAPS = 7;

type Provider = "google" | "apple" | "reviewer";

export function LoginScreen() {
  const google = useSignInGoogle();
  const apple = useSignInApple();
  const reviewer = useSignIn();

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

  const canSubmitReviewer =
    email.length > 0 && password.length > 0 && !reviewer.isPending;

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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PROGRESS_COLORS.tertiaryText + "40",
    backgroundColor: PROGRESS_COLORS.cardBackground,
    paddingHorizontal: 16,
    fontSize: 15,
    color: PROGRESS_COLORS.primaryText,
  } as const;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}
    >
      <View className="flex-1 justify-center" style={{ paddingHorizontal: 24 }}>
        <Pressable
          onPress={handleLogoTap}
          testID="brand-logo-tap"
          style={{ alignItems: "center", marginBottom: 24 }}
        >
          <BrandLogo width={120} height={72} />
        </Pressable>
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

        <View style={{ gap: 12 }}>
          <AppleSignInButton
            disabled={isBusy}
            onPress={() => {
              setLastAttempt("apple");
              apple.mutate();
            }}
          />

          <Pressable
            testID="google-signin-button"
            onPress={() => {
              if (isBusy) return;
              setLastAttempt("google");
              google.mutate();
            }}
            disabled={isBusy}
            className="active:opacity-80"
            style={{
              height: 52,
              borderRadius: 16,
              backgroundColor: "#FFFFFF",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              opacity: isBusy ? 0.6 : 1,
            }}
          >
            {google.isPending ? (
              <ActivityIndicator color="#1F1F1F" />
            ) : (
              <>
                <GoogleIcon size={20} />
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#1F1F1F" }}
                >
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {showReviewerForm && (
          <View style={{ gap: 12, marginTop: 24 }} testID="reviewer-form">
            <Text
              style={{
                ...METRIC_TYPOGRAPHY.cardSubtitle,
                color: PROGRESS_COLORS.tertiaryText,
                textAlign: "center",
              }}
            >
              Reviewer access
            </Text>
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
              autoComplete="password"
              style={inputStyle}
            />
            <Pressable
              testID="reviewer-submit"
              onPress={handleReviewerSignIn}
              disabled={!canSubmitReviewer}
              className="active:opacity-80"
              style={{
                backgroundColor: canSubmitReviewer
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
                  color: canSubmitReviewer
                    ? "#FFFFFF"
                    : PROGRESS_COLORS.tertiaryText,
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
              ...METRIC_TYPOGRAPHY.cardSubtitle,
              color: PROGRESS_COLORS.health.primary,
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
