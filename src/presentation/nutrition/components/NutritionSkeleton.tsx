import { View } from "react-native";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";

function SkeletonBox({ width, height }: { width: number | string; height: number }) {
  return (
    <View
      style={{
        width: width as number,
        height,
        borderRadius: 12,
        backgroundColor: PROGRESS_COLORS.cardBackground,
      }}
    />
  );
}

export function NutritionSkeleton() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <SkeletonBox width="100%" height={90} />
      <SkeletonBox width="100%" height={90} />
      <SkeletonBox width="100%" height={90} />
    </View>
  );
}
