import { Text } from "react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { mono } from "@/presentation/_shared/design/fonts";

/** Uppercase group label that heads a settings section. */
export function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontFamily: mono(600),
        fontSize: 12,
        letterSpacing: 0.9,
        textTransform: "uppercase",
        color: glass.ink3,
        marginBottom: 8,
        marginLeft: 4,
      }}
    >
      {children}
    </Text>
  );
}
