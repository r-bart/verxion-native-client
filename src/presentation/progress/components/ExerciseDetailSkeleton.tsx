/**
 * ExerciseDetailSkeleton — loading placeholder for the exercise detail screen.
 * `variant="progress"` mirrors the hero + chart + history rows; `variant="guide"`
 * mirrors the gif panel + instruction lines.
 */
import { View } from "react-native";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";

export function ExerciseDetailSkeleton({
  variant = "progress",
}: {
  variant?: "progress" | "guide";
}) {
  if (variant === "guide") {
    return (
      <View style={{ paddingHorizontal: 16, gap: 12, paddingTop: 8 }}>
        <SkeletonBlock height={200} radius={20} />
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} height={20} radius={8} />
        ))}
      </View>
    );
  }
  return (
    <View style={{ paddingHorizontal: 16, gap: 12, paddingTop: 4 }}>
      <SkeletonBlock height={56} radius={16} />
      <SkeletonBlock height={200} radius={20} />
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonBlock key={i} height={64} />
      ))}
    </View>
  );
}
