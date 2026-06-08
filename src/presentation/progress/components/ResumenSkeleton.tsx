/** Loading placeholder for the Progreso "Resumen" lens — hero, KPI card, chart, rows. */
import { View } from "react-native";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";

export function ResumenSkeleton() {
  return (
    <View style={{ paddingHorizontal: 16, gap: 12, paddingTop: 4 }}>
      <SkeletonBlock height={140} radius={24} />
      <SkeletonBlock height={96} radius={20} />
      <SkeletonBlock height={180} radius={20} />
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonBlock key={i} height={64} />
      ))}
    </View>
  );
}
