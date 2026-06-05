/**
 * RoutineDashboardSkeleton — loading placeholder for the Rutina segment: a hero
 * block, the next-session row, and a few spine rows as muted glass blocks.
 */
import { View } from "react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";

function Block({ height, radius = 16 }: { height: number; radius?: number }) {
  return <GlassSurface radius={radius} style={{ height }} />;
}

export function RoutineDashboardSkeleton() {
  return (
    <View style={{ gap: 12 }}>
      <Block height={172} radius={24} />
      <Block height={76} radius={20} />
      <View style={{ gap: 10, marginTop: 4 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Block key={i} height={56} />
        ))}
      </View>
    </View>
  );
}
