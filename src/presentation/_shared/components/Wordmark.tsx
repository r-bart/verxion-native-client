/**
 * Wordmark — the "verxion" logotype. Matches the brand collateral (web SPA
 * `BrandLogo`, verxion.ai, OG templates): Rubik Black (900), UPPERCASE,
 * horizontally stretched `scaleX(1.5)`, negative tracking (-0.02em). Never set
 * this type by hand — always render the wordmark through this component.
 */
import { Text, type TextStyle } from "react-native";
import { display } from "@/presentation/_shared/design/fonts";

type Props = {
  /** Font size in px (the visible mark is ~1.5× wider due to scaleX). */
  size?: number;
  color: string;
  /**
   * scaleX origin. "left" keeps the left edge fixed (lockups next to the
   * isotype); "center" stays optically centered (standalone, centered logos).
   */
  align?: "left" | "center";
  style?: TextStyle;
};

export function Wordmark({ size = 18, color, align = "left", style }: Props) {
  return (
    <Text
      allowFontScaling={false}
      accessibilityLabel="verxion"
      style={[
        {
          fontFamily: display(),
          fontSize: size,
          lineHeight: size,
          color,
          textTransform: "uppercase",
          letterSpacing: -0.02 * size,
          transform: [{ scaleX: 1.5 }],
          transformOrigin: align,
        },
        style,
      ]}
    >
      verxion
    </Text>
  );
}
