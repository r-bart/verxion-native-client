/**
 * PlanSegmentSkeleton — loading placeholder for the Plan segment: the diet hero,
 * the intake card, the hydration row, and a few meal-spine rows as muted glass
 * blocks. Mirrors Entreno's `RoutineDashboardSkeleton`.
 */
import { View } from "react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";

function Block({ height, radius = 16 }: { height: number; radius?: number }) {
  return <GlassSurface radius={radius} style={{ height }} />;
}

export function PlanSegmentSkeleton() {
  return (
    <View style={{ gap: 14 }}>
      <Block height={184} radius={24} />
      <Block height={232} radius={20} />
      <Block height={72} />
      <View style={{ gap: 8, marginTop: 4 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Block key={i} height={64} />
        ))}
      </View>
    </View>
  );
}
