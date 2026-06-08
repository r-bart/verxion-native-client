/**
 * Sparkline — a tiny Skia line of a metric's recent points, tinted to the domain
 * color. No axes, no labels: the glanceable trend shape on a Resumen/Métricas
 * card (the handoff's `MiniSpark`). Flat/degenerate series render a baseline.
 */
import { View } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";

type Props = {
  points: number[];
  color: string;
  width?: number;
  height?: number;
};

export function Sparkline({ points, color, width = 88, height = 28 }: Props) {
  const path = Skia.Path.Make();
  const n = points.length;

  if (n >= 2) {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const span = max - min || 1;
    const stepX = width / (n - 1);
    points.forEach((v, i) => {
      const x = i * stepX;
      // y inverted: higher value → higher on screen, with a 2px inset top/bottom
      const y = height - 2 - ((v - min) / span) * (height - 4);
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    });
  } else {
    path.moveTo(0, height / 2);
    path.lineTo(width, height / 2);
  }

  return (
    <View style={{ width, height }}>
      <Canvas style={{ width, height }}>
        <Path
          path={path}
          style="stroke"
          strokeWidth={2}
          strokeCap="round"
          strokeJoin="round"
          color={color}
        />
      </Canvas>
    </View>
  );
}
