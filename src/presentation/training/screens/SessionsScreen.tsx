import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ScreenSelector } from "@/presentation/_shared/components/ScreenSelector";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { trainingScreens } from "../navigation";
import { useSessionList } from "../hooks/useSessionList";
import { SessionListItemCard } from "../components/SessionListItem";
import { TrainingSkeleton } from "../components/TrainingSkeleton";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";

export function SessionsScreen() {
  const { data, isLoading, isError, refetch } = useSessionList();
  const router = useRouter();

  const bg = { backgroundColor: PROGRESS_COLORS.screenBackground };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ScreenSelector options={trainingScreens} />
        <TrainingSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ScreenSelector options={trainingScreens} />
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (!data || data.length === 0) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ScreenSelector options={trainingScreens} />
        <EmptyState
          icon="🏋️"
          title="No sessions yet"
          message="Complete workout sessions to see your history here."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={bg}>
      <ScreenSelector options={trainingScreens} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionListItemCard
            session={item}
            onPress={() => router.push(`/training/session/${item.id}`)}
          />
        )}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
