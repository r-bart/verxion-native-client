import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton } from "@/presentation/_shared/components/ui/skeleton";

export function ProgressSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        <View className="flex-row gap-3">
          <Skeleton className="flex-1 h-20" />
          <Skeleton className="flex-1 h-20" />
        </View>
        <View className="flex-row gap-3">
          <Skeleton className="flex-1 h-20" />
          <Skeleton className="flex-1 h-20" />
        </View>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </View>
    </SafeAreaView>
  );
}
