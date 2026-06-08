/**
 * RoutineDashboardSkeleton — loading placeholder for the Rutina segment: a hero
 * block, the next-session row, and a few spine rows as muted glass blocks.
 */
import { View } from "react-native";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";

export function RoutineDashboardSkeleton() {
  return (
    <View style={{ gap: 12 }}>
      <SkeletonBlock height={172} radius={24} />
      <SkeletonBlock height={76} radius={20} />
      <View style={{ gap: 10, marginTop: 4 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} height={56} />
        ))}
      </View>
    </View>
  );
}
