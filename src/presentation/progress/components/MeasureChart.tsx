/**
 * MeasureChart — the "gráfica de verdad" of a measure detail: a Skia area + line
 * over the period's points, the last point haloed, and (when the metric has a
 * goal) a dashed objective line. Tinted to the domain color. No axis chrome — the
 * KPI strip + period picker carry the numbers. Degenerate series render flat.
 */
import { View } from "react-native";
import {
  Canvas,
  Path,
  Circle,
  Skia,
  LinearGradient,
  vec,
  DashPathEffect,
} from "@shopify/react-native-skia";

type Props = {
  values: number[];
  color: string;
  goal?: number | null;
  width: number;
  height?: number;
};

export function MeasureChart({ values, color, goal, width, height = 160 }: Props) {
  const padY = 14;
  const n = values.length;

  // Range spans the data and the goal (so the objective line stays on-canvas).
  const candidates = goal != null ? [...values, goal] : values;
  const min = candidates.length ? Math.min(...candidates) : 0;
  const max = candidates.length ? Math.max(...candidates) : 1;
  const span = max - min || 1;
  const yOf = (v: number) => padY + (1 - (v - min) / span) * (height - padY * 2);
  const xOf = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * width);

  const line = Skia.Path.Make();
  const area = Skia.Path.Make();
  if (n >= 2) {
    values.forEach((v, i) => {
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

  const lastX = xOf(n - 1);
  const lastY = n ? yOf(values[n - 1]) : height / 2;

  const goalLine = Skia.Path.Make();
  if (goal != null) {
    const gy = yOf(goal);
    goalLine.moveTo(0, gy);
    goalLine.lineTo(width, gy);
  }

  return (
    <View style={{ width, height }}>
      <Canvas style={{ width, height }}>
        {n >= 2 && (
          <Path path={area}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, height)}
              colors={[`${color}40`, `${color}00`]}
            />
          </Path>
        )}
        {n >= 2 && (
          <Path path={line} style="stroke" strokeWidth={2.5} strokeCap="round" strokeJoin="round" color={color} />
        )}
        {goal != null && (
          <Path path={goalLine} style="stroke" strokeWidth={1.5} color="#5FE39A" opacity={0.55}>
            <DashPathEffect intervals={[5, 5]} />
          </Path>
        )}
        {n >= 1 && (
          <>
            <Circle cx={lastX} cy={lastY} r={6} color={`${color}33`} />
            <Circle cx={lastX} cy={lastY} r={3.5} color={color} />
          </>
        )}
      </Canvas>
    </View>
  );
}
