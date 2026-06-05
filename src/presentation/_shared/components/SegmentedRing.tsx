/**
 * SegmentedRing — a ring split into one colored arc per item (Skia). Each
 * segment is lit in its own color when "filled", dimmed otherwise, so the ring
 * itself encodes the color↔item mapping. Center content via children.
 *
 * Segments are drawn as FILLED annular sectors with lightly rounded corners
 * (not stroked pills) — so they read as "rounded rectangles bent along the
 * circle", with a controllable corner radius and a constant visual gap.
 */
import { View } from "react-native";
import { Canvas, Path, Skia, type SkPath } from "@shopify/react-native-skia";

export type RingSegment = { color: string; filled: boolean };

type Props = {
  size: number;
  stroke: number;
  segments: RingSegment[];
  /** Visual gap between segments, in degrees. */
  gap?: number;
  /** Corner radius of each segment, in px. Defaults to ~22% of the stroke. */
  cornerRadius?: number;
  /** Opacity of an unfilled segment (kept visible so its color still reads). */
  dimOpacity?: number;
  children?: React.ReactNode;
};

const RAD = Math.PI / 180;

/** Filled annular sector from a0→a1 (deg), outer Ro / inner Ri, rounded corners cr. */
function sectorPath(cx: number, cy: number, Ro: number, Ri: number, a0: number, a1: number, cr: number): SkPath {
  const pt = (r: number, d: number): [number, number] => [cx + r * Math.cos(d * RAD), cy + r * Math.sin(d * RAD)];
  const gO = (cr / Ro) / RAD; // corner angular inset on the outer edge
  const gI = (cr / Ri) / RAD; // ...and the inner edge
  const ovalO = Skia.XYWHRect(cx - Ro, cy - Ro, 2 * Ro, 2 * Ro);
  const ovalI = Skia.XYWHRect(cx - Ri, cy - Ri, 2 * Ri, 2 * Ri);

  const p = Skia.Path.Make();
  const [sx, sy] = pt(Ro, a0 + gO);
  p.moveTo(sx, sy);
  p.arcToOval(ovalO, a0 + gO, a1 - a0 - 2 * gO, false); // outer edge

  let c = pt(Ro, a1);
  let e = pt(Ro - cr, a1);
  p.quadTo(c[0], c[1], e[0], e[1]); // corner: outer → radial (a1)

  [e[0], e[1]] = pt(Ri + cr, a1);
  p.lineTo(e[0], e[1]); // radial edge inward

  c = pt(Ri, a1);
  e = pt(Ri, a1 - gI);
  p.quadTo(c[0], c[1], e[0], e[1]); // corner: radial → inner

  p.arcToOval(ovalI, a1 - gI, -(a1 - a0 - 2 * gI), false); // inner edge (back)

  c = pt(Ri, a0);
  e = pt(Ri + cr, a0);
  p.quadTo(c[0], c[1], e[0], e[1]); // corner: inner → radial (a0)

  [e[0], e[1]] = pt(Ro - cr, a0);
  p.lineTo(e[0], e[1]); // radial edge outward

  c = pt(Ro, a0);
  e = pt(Ro, a0 + gO);
  p.quadTo(c[0], c[1], e[0], e[1]); // corner: radial → outer (close)

  p.close();
  return p;
}

export function SegmentedRing({ size, stroke, segments, gap = 6, cornerRadius, dimOpacity = 0.16, children }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const Ro = size / 2;
  const Ri = size / 2 - stroke;
  const cr = cornerRadius ?? stroke * 0.22;
  const n = Math.max(1, segments.length);
  const slot = 360 / n;

  const arcs = segments.map((seg, i) => {
    const a0 = -90 + i * slot + gap / 2;
    const a1 = -90 + i * slot + slot - gap / 2;
    return { path: sectorPath(cx, cy, Ro, Ri, a0, a1, cr), color: seg.color, opacity: seg.filled ? 1 : dimOpacity };
  });

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Canvas style={{ position: "absolute", width: size, height: size }}>
        {arcs.map((a, i) => (
          <Path key={i} path={a.path} color={a.color} opacity={a.opacity} />
        ))}
      </Canvas>
      {children}
    </View>
  );
}
