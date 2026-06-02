import { useState, useEffect } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";
import { useActiveSessionWithProgress } from "../hooks/useActiveSessionWithProgress";

function formatTimer(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

const TAB_BAR_HEIGHT = 90;

export function FloatingSessionBanner() {
  const { data, isLoading, isError, displayElapsed } = useActiveSessionWithProgress();
  const router = useRouter();
  const segments = useSegments();

  const inAuth = segments[0] === "(auth)";
  const inLiveModal =
    segments[0] === "modals" && segments[1] === "live-session";

  // Lazy useState (not useRef().current) keeps a stable Animated.Value without
  // reading a ref during render — the React Compiler can then optimize this.
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!data || isError) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => {
      pulseAnim.setValue(1);
      pulse.stop();
    };
  }, [data, isError, pulseAnim]);

  if (!data || isLoading || inAuth || inLiveModal) return null;

  const { session, progress } = data;
  const isPaused = session.status === "paused";

  return (
    <Pressable
      onPress={() => router.push(`/modals/live-session?id=${session.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${session.name}, ${formatTimer(displayElapsed)}, tap to view`}
      className="active:opacity-90"
      style={{
        position: "absolute",
        bottom: TAB_BAR_HEIGHT + 8,
        left: 12,
        right: 12,
        height: 52,
        borderRadius: 16,
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderWidth: 1,
        borderColor: isPaused
          ? "#F59E0B30"
          : PROGRESS_COLORS.positive.primary + "30",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
      }}
    >
      <Animated.View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: isPaused
            ? "#F59E0B"
            : PROGRESS_COLORS.positive.primary,
          opacity: isPaused ? 1 : pulseAnim,
        }}
      />

      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          color: PROGRESS_COLORS.primaryText,
          fontSize: 14,
          fontWeight: "600",
        }}
      >
        {session.name}
      </Text>

      <Text
        style={{
          color: isPaused ? "#F59E0B" : PROGRESS_COLORS.positive.primary,
          fontSize: 14,
          fontWeight: "700",
          fontVariant: ["tabular-nums"],
        }}
      >
        {formatTimer(displayElapsed)}
      </Text>

      <View
        style={{
          backgroundColor: PROGRESS_COLORS.tertiaryText + "20",
          borderRadius: 4,
          paddingHorizontal: 6,
          paddingVertical: 2,
        }}
      >
        <Text
          style={{
            color: PROGRESS_COLORS.secondaryText,
            fontSize: 11,
            fontWeight: "600",
          }}
        >
          {progress.completedExercises}/{progress.totalExercises}
        </Text>
      </View>

      <ChevronRight size={16} color={PROGRESS_COLORS.tertiaryText} />
    </Pressable>
  );
}
