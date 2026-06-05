/** Small uppercase mono section label (e.g. "RUTINA · SEMANA 3 / 6", "TU DÍA"). */
import { Text } from "react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { mono } from "@/presentation/_shared/design/fonts";

export function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontFamily: mono(600),
        fontSize: 10,
        letterSpacing: 0.9,
        color: glass.ink3,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Text>
  );
}
