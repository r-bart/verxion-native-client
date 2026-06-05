/**
 * Isotype — the verxion lava mark. `glow` adds the lava drop-shadow.
 * Design-system primitive (used on auth, the agent avatar, cold-start, etc.).
 */
import { View } from "react-native";
import { Image } from "expo-image";
import { tokens } from "@/presentation/_shared/design/tokens";

const SRC = require("../../../../assets/images/verxion-isotype.png");

type Props = { size?: number; glow?: boolean };

export function Isotype({ size = 26, glow = false }: Props) {
  return (
    <View
      style={
        glow
          ? {
              width: size,
              height: size,
              shadowColor: tokens.color.accent,
              shadowOpacity: 0.55,
              shadowRadius: size * 0.42,
              shadowOffset: { width: 0, height: 0 },
            }
          : { width: size, height: size }
      }
    >
      <Image source={SRC} style={{ width: size, height: size }} contentFit="contain" />
    </View>
  );
}
