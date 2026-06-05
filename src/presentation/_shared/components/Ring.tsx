/**
 * Ring — a circular progress ring drawn with Skia. Center content via children.
 * Ported from the design handoff (`lookbook/home/ui.tsx`). Used by the "Hoy"
 * completion ring and any future radial metric.
 */
import { View } from "react-native";
import { Canvas, Path, Skia, Circle } from "@shopify/react-native-skia";

type Props = {
  size: number;
  stroke: number;
  /** 0..1 progress fraction. */
  progress: number;
  color: string;
  track?: string;
  children?: React.ReactNode;
};

export function Ring({
  size,
  stroke,
  progress,
  color,
  track = "rgba(255,255,255,0.1)",
  children,
}: Props) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const oval = Skia.XYWHRect(stroke / 2, stroke / 2, size - stroke, size - stroke);
  const arc = Skia.Path.Make();
  arc.addArc(oval, -90, Math.max(0, Math.min(1, progress)) * 360);

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Canvas style={{ position: "absolute", width: size, height: size }}>
        <Circle cx={cx} cy={cy} r={r} style="stroke" strokeWidth={stroke} color={track} />
        <Path path={arc} style="stroke" strokeWidth={stroke} strokeCap="round" color={color} />
      </Canvas>
      {children}
    </View>
  );
}
