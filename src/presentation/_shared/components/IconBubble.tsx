/**
 * IconBubble — the round tinted icon tile used on card headers and list rows.
 * The caller passes an already-colored icon as children; `bg` is the semantic
 * tint behind it. Ported from the design handoff (`lookbook/foundation`).
 */
import { View } from "react-native";

type Props = {
  bg: string;
  size?: number;
  radius?: number;
  children: React.ReactNode;
};

export function IconBubble({ bg, size = 38, radius, children }: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? size / 2,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </View>
  );
}
