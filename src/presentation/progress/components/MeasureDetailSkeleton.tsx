/** Loading placeholder for the measure detail screen — value card, chart, rows. */
import { View } from "react-native";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";

export function MeasureDetailSkeleton() {
  return (
    <View style={{ paddingHorizontal: 16, gap: 12, paddingTop: 4 }}>
      <SkeletonBlock height={120} radius={24} />
      <SkeletonBlock height={200} radius={20} />
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonBlock key={i} height={64} />
      ))}
    </View>
  );
}
