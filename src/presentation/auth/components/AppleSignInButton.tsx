import * as AppleAuthentication from "expo-apple-authentication";

interface AppleSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Thin wrapper around Apple's native sign-in button. Keeps the
 * `expo-apple-authentication` UI import scoped to one presentational component
 * (the credential flow itself lives in infrastructure).
 */
export function AppleSignInButton({ onPress, disabled }: AppleSignInButtonProps) {
  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
      cornerRadius={16}
      style={{ height: 52, opacity: disabled ? 0.6 : 1 }}
      onPress={() => {
        if (disabled) return;
        onPress();
      }}
    />
  );
}
