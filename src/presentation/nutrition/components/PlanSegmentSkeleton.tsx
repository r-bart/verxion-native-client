/**
 * PlanSegmentSkeleton — loading placeholder for the Plan segment: the diet hero,
 * the intake card, the hydration row, and a few meal-spine rows as muted glass
 * blocks. Mirrors Entreno's `RoutineDashboardSkeleton`.
 */
import { View } from "react-native";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";

export function PlanSegmentSkeleton() {
  return (
    <View style={{ gap: 14 }}>
      <SkeletonBlock height={184} radius={24} />
      <SkeletonBlock height={232} radius={20} />
      <SkeletonBlock height={72} />
      <View style={{ gap: 8, marginTop: 4 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} height={64} />
        ))}
      </View>
    </View>
  );
}
