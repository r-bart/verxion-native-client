/** Loading placeholder for "Hoy" — mirrors the screen's rhythm (header, ring + fronts, cards). */
import { View } from "react-native";
import { Skeleton } from "@/presentation/_shared/components/ui/skeleton";

export function TodaySkeleton() {
  return (
    <View style={{ paddingHorizontal: 18, paddingTop: 8, gap: 24 }}>
      {/* header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ gap: 8 }}>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-44" />
        </View>
        <Skeleton className="h-[38px] w-[38px] rounded-full" />
      </View>

      {/* ring + fronts */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
        <Skeleton className="h-32 w-32 rounded-full" />
        <View style={{ flex: 1, gap: 14 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </View>
      </View>

      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </View>
  );
}
