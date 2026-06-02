import { View, Text } from "react-native";
import { useSession } from "@/presentation/auth/hooks/useSession";
import { useStreaks } from "../hooks/useStreaks";
import { Flame } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function GreetingHeader() {
  const { data: session } = useSession();
  const { data: streaks } = useStreaks();

  const firstName = session?.user.name?.split(" ")[0] ?? "";

  return (
    <View
      className="flex-row items-center justify-between"
      style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}
    >
      <View className="flex-1">
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: PROGRESS_COLORS.primaryText,
          }}
        >
          {getGreeting()}, {firstName}
        </Text>
        <Text
          style={{
            ...METRIC_TYPOGRAPHY.cardSubtitle,
            color: PROGRESS_COLORS.secondaryText,
            marginTop: 4,
          }}
        >
          {formatDate()}
        </Text>
      </View>
      {streaks && streaks.current > 0 && (
        <View
          className="flex-row items-center rounded-full"
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: PROGRESS_COLORS.neutral.background,
            gap: 6,
          }}
        >
          <Flame size={16} color={PROGRESS_COLORS.neutral.primary} />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: PROGRESS_COLORS.neutral.primary,
            }}
          >
            {streaks.current}
          </Text>
        </View>
      )}
    </View>
  );
}
