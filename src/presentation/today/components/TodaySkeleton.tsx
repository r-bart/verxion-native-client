/** Loading placeholder for "Hoy" — mirrors the screen's rhythm (header, ring + fronts, cards). */
import { View } from "react-native";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";

export function TodaySkeleton() {
  return (
    <View style={{ paddingHorizontal: 18, paddingTop: 8, gap: 24 }}>
      {/* header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ gap: 8 }}>
          <SkeletonBlock height={12} width={96} radius={6} />
          <SkeletonBlock height={28} width={176} radius={8} />
        </View>
        <SkeletonBlock height={38} width={38} radius={9999} />
      </View>

      {/* ring + fronts */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
        <SkeletonBlock height={128} width={128} radius={9999} />
        <View style={{ flex: 1, gap: 14 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonBlock key={i} height={32} radius={8} />
          ))}
        </View>
      </View>

      <SkeletonBlock height={48} radius={16} />
      <SkeletonBlock height={80} radius={16} />
      <SkeletonBlock height={160} radius={16} />
    </View>
  );
}
