import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLogSteps } from "../hooks/useLogSteps";
import { useDailySteps } from "@/presentation/today/hooks/useDailySteps";
import { X, Footprints } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

const STEPS_GOAL = 10_000;

export function LogStepsScreen() {
  const [value, setValue] = useState("");
  const router = useRouter();
  const mutation = useLogSteps();
  const { data: currentSteps } = useDailySteps();

  const numericValue = parseInt(value, 10);
  const isValid =
    value.length > 0 &&
    !isNaN(numericValue) &&
    numericValue >= 0 &&
    numericValue <= 200_000;

  const totalAfterLog = (currentSteps ?? 0) + (isValid ? numericValue : 0);
  const goalPercent = Math.min((totalAfterLog / STEPS_GOAL) * 100, 100);

  function handleSave() {
    if (!isValid) return;
    mutation.mutate(numericValue, {
      onSuccess: () => {
        router.back();
      },
      onError: (error) => {
        Alert.alert("Error", error.message || "Failed to log steps");
      },
    });
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
      >
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <X size={24} color={PROGRESS_COLORS.secondaryText} />
        </Pressable>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Footprints size={18} color={PROGRESS_COLORS.neutral.primary} />
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.metricLabel,
              fontWeight: "600",
              color: PROGRESS_COLORS.primaryText,
            }}
          >
            Log Steps
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View className="flex-1 items-center" style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        {/* Current progress */}
        {currentSteps != null && (
          <View
            className="w-full rounded-2xl border border-border"
            style={{
              backgroundColor: PROGRESS_COLORS.cardBackground,
              padding: 20,
              marginBottom: 32,
            }}
          >
            <Text
              style={{
                ...METRIC_TYPOGRAPHY.context,
                color: PROGRESS_COLORS.secondaryText,
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              Step Goal
            </Text>
            <Text
              style={{
                ...METRIC_TYPOGRAPHY.cardSubtitle,
                color: PROGRESS_COLORS.secondaryText,
                marginBottom: 12,
              }}
            >
              Today you&apos;ve logged{" "}
              <Text style={{ color: PROGRESS_COLORS.primaryText, fontWeight: "600" }}>
                {currentSteps.toLocaleString()}
              </Text>{" "}
              steps, {Math.round((currentSteps / STEPS_GOAL) * 100)}% of your {STEPS_GOAL.toLocaleString()} goal
            </Text>
            <View
              className="rounded-full overflow-hidden"
              style={{
                height: 10,
                backgroundColor: PROGRESS_COLORS.health.primary + "1A",
              }}
            >
              <View
                className="rounded-full"
                style={{
                  height: "100%",
                  width: `${Math.min((currentSteps / STEPS_GOAL) * 100, 100)}%`,
                  backgroundColor: PROGRESS_COLORS.health.primary,
                }}
              />
            </View>
          </View>
        )}

        {/* Input */}
        <View className="flex-row items-end">
          <TextInput
            testID="steps-input"
            value={value}
            onChangeText={setValue}
            placeholder="0"
            placeholderTextColor={PROGRESS_COLORS.tertiaryText}
            keyboardType="number-pad"
            autoFocus
            style={{
              fontSize: 72,
              fontWeight: "700",
              color: PROGRESS_COLORS.neutral.primary,
              textAlign: "center",
              minWidth: 160,
            }}
          />
          <Text
            style={{
              fontSize: 28,
              fontWeight: "500",
              color: PROGRESS_COLORS.secondaryText,
              marginLeft: 8,
              marginBottom: 12,
            }}
          >
            steps
          </Text>
        </View>

        {/* Aggregated info */}
        {isValid && (
          <View
            className="rounded-xl"
            style={{
              backgroundColor: PROGRESS_COLORS.cardBackground,
              padding: 12,
              marginTop: 12,
            }}
          >
            <Text
              style={{
                ...METRIC_TYPOGRAPHY.context,
                color: PROGRESS_COLORS.secondaryText,
                textAlign: "center",
              }}
            >
              Total after log:{" "}
              <Text style={{ color: PROGRESS_COLORS.primaryText, fontWeight: "600" }}>
                {totalAfterLog.toLocaleString()}
              </Text>{" "}
              steps ({Math.round(goalPercent)}% of goal)
            </Text>
          </View>
        )}

        {value.length > 0 && !isValid && (
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.cardSubtitle,
              color: PROGRESS_COLORS.health.primary,
              marginTop: 16,
            }}
          >
            Enter a valid number (0 - 200,000)
          </Text>
        )}

        <View style={{ width: "100%", marginTop: 48 }}>
          <Pressable
            onPress={handleSave}
            disabled={!isValid || mutation.isPending}
            className="active:opacity-80"
            style={{
              backgroundColor: isValid && !mutation.isPending
                ? PROGRESS_COLORS.neutral.primary
                : PROGRESS_COLORS.cardBackground,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: isValid && !mutation.isPending
                  ? "#000000"
                  : PROGRESS_COLORS.tertiaryText,
              }}
            >
              {mutation.isPending ? "Saving..." : "Save Steps"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
