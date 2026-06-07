/**
 * MacroRing — the kcal ring used across Nutrición (Plan intake, meal detail,
 * food detail, diary day). The arc fills to `consumed.kcal / goalKcal` and, within
 * that fill, subdivides into protein · carbs · fat by their caloric contribution
 * (4/4/9 kcal/g) in the canonical macro colors (lava/cyan/amber). Going over the
 * goal caps the fill at 100%. Drawn with Skia. Center content via children.
 *
 * Ported from the handoff's `KcalRing` (`nutricion-core.jsx`).
 */
import { View } from "react-native";
import { Canvas, Path, Skia, Circle } from "@shopify/react-native-skia";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";

type Consumed = { kcal: number; protein: number; carbs: number; fat: number };

type Props = {
  size: number;
  stroke: number;
  consumed: Consumed;
  goalKcal: number;
  track?: string;
  children?: React.ReactNode;
};

const PROTEIN = glass.lava;
const CARBS = palette.body.text;
const FAT = palette.neutral.text;

export function MacroRing({
  size,
  stroke,
  consumed,
  goalKcal,
  track = "rgba(255,255,255,0.1)",
  children,
}: Props) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const oval = Skia.XYWHRect(
    stroke / 2,
    stroke / 2,
    size - stroke,
    size - stroke
  );

  const fill = Math.max(
    0,
    Math.min(1, goalKcal > 0 ? consumed.kcal / goalKcal : 0)
  );
  const pK = consumed.protein * 4;
  const cK = consumed.carbs * 4;
  const fK = consumed.fat * 9;
  const macroTot = pK + cK + fK || 1;

  // Visual gap between segments, only when there's something to split.
  const gapDeg = consumed.kcal > 0 ? 3 : 0;
  const segments: { color: string; kc: number }[] = [
    { color: PROTEIN, kc: pK },
    { color: CARBS, kc: cK },
    { color: FAT, kc: fK },
  ];

  let acc = 0; // accumulated degrees from the 12 o'clock start
  const arcs = segments
    .map((s) => {
      const sweep = (s.kc / macroTot) * fill * 360;
      const start = -90 + acc;
      acc += sweep;
      if (sweep <= 0.5) return null;
      const path = Skia.Path.Make();
      path.addArc(oval, start, Math.max(0, sweep - gapDeg));
      return { path, color: s.color };
    })
    .filter(
      (a): a is { path: ReturnType<typeof Skia.Path.Make>; color: string } =>
        a != null
    );

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Canvas style={{ position: "absolute", width: size, height: size }}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          style="stroke"
          strokeWidth={stroke}
          color={track}
        />
        {arcs.map((a, i) => (
          <Path
            key={i}
            path={a.path}
            style="stroke"
            strokeWidth={stroke}
            strokeCap="round"
            color={a.color}
          />
        ))}
      </Canvas>
      {children}
    </View>
  );
}
