/**
 * HistoryLane — one domain's 30-week curve in the Cinta: a Skia area + line with
 * a dashed phase-change line and the shared white playhead (a vertical line + a
 * dot on the curve at the scrub week). Tinted to the domain color.
 */
import { View } from "react-native";
import { Canvas, Path, Circle, Line, Skia, LinearGradient, vec, DashPathEffect } from "@shopify/react-native-skia";
import { glass } from "@/presentation/_shared/design/glass";

type Props = {
  points: number[];
  color: string;
  width: number;
  height?: number;
  scrubIndex: number;
  /** 0..1 x-fraction of the phase change, or null when there's no split. */
  splitFrac?: number | null;
};

export function HistoryLane({ points, color, width, height = 56, scrubIndex, splitFrac }: Props) {
  const padY = 6;
  const n = points.length;
  const min = n ? Math.min(...points) : 0;
  const max = n ? Math.max(...points) : 1;
  const span = max - min || 1;
  const xOf = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * width);
  const yOf = (v: number) => padY + (1 - (v - min) / span) * (height - padY * 2);

  const line = Skia.Path.Make();
  const area = Skia.Path.Make();
  if (n >= 2) {
    points.forEach((v, i) => {
      const x = xOf(i);
      const y = yOf(v);
      if (i === 0) {
        line.moveTo(x, y);
        area.moveTo(x, height);
        area.lineTo(x, y);
      } else {
        line.lineTo(x, y);
        area.lineTo(x, y);
      }
    });
    area.lineTo(width, height);
    area.close();
  }

  const idx = Math.max(0, Math.min(n - 1, scrubIndex));
  const headX = xOf(idx);
  const headY = n ? yOf(points[idx]) : height / 2;
  const splitX = splitFrac != null ? splitFrac * width : null;

  return (
    <View style={{ width, height }}>
      <Canvas style={{ width, height }}>
        {n >= 2 && (
          <Path path={area}>
            <LinearGradient start={vec(0, 0)} end={vec(0, height)} colors={[`${color}33`, `${color}00`]} />
          </Path>
        )}
        {n >= 2 && (
          <Path path={line} style="stroke" strokeWidth={2} strokeCap="round" strokeJoin="round" color={color} />
        )}
        {splitX != null && (
          <Line p1={vec(splitX, 0)} p2={vec(splitX, height)} strokeWidth={1} color="rgba(255,255,255,0.22)">
            <DashPathEffect intervals={[3, 4]} />
          </Line>
        )}
        {/* shared playhead */}
        <Line p1={vec(headX, 0)} p2={vec(headX, height)} strokeWidth={1.5} color={glass.white} opacity={0.65} />
        <Circle cx={headX} cy={headY} r={3.5} color={glass.white} />
      </Canvas>
    </View>
  );
}
