import { View, Text } from "react-native";
import { tokens } from "@/presentation/_shared/design/tokens";
import { mono } from "@/presentation/_shared/design/fonts";

/**
 * Small lava-tinted pill straddling the top-right of a sign-in button, marking
 * the provider the returning user signed in with last. Absolutely positioned,
 * so the parent must be `position: "relative"` and must not clip overflow.
 */
export function LastUsedBadge({ testID }: { testID?: string }) {
  return (
    <View
      testID={testID}
      pointerEvents="none"
      style={{
        position: "absolute",
        top: -9,
        right: 12,
        zIndex: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: tokens.radius.full,
        backgroundColor: "rgba(255,98,98,0.18)",
        borderWidth: 1,
        borderColor: "rgba(255,98,98,0.40)",
      }}
    >
      <View
        style={{
          width: 5,
          height: 5,
          borderRadius: tokens.radius.full,
          backgroundColor: tokens.color.accent,
        }}
      />
      <Text
        style={{
          fontFamily: mono(600),
          fontSize: 9,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: tokens.color.accent,
        }}
      >
        Last used
      </Text>
    </View>
  );
}
