import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLogWeight } from "../hooks/useLogWeight";
import { X, Scale } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

export function LogWeightScreen() {
  const [value, setValue] = useState("");
  const router = useRouter();
  const mutation = useLogWeight();

  const numericValue = parseFloat(value);
  const isValid =
    value.length > 0 &&
    !isNaN(numericValue) &&
    numericValue > 0 &&
    numericValue <= 635;

  function handleSave() {
    if (!isValid) return;
    mutation.mutate(numericValue, {
      onSuccess: () => {
        router.back();
      },
      onError: (error) => {
        Alert.alert("Error", error.message || "Failed to log weight");
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
          <Scale size={18} color={PROGRESS_COLORS.health.primary} />
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.metricLabel,
              fontWeight: "600",
              color: PROGRESS_COLORS.primaryText,
            }}
          >
            Log Weight
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View className="flex-1 items-center" style={{ paddingHorizontal: 24, paddingTop: 48 }}>
        <View className="flex-row items-end">
          <TextInput
            testID="weight-input"
            value={value}
            onChangeText={setValue}
            placeholder="0.0"
            placeholderTextColor={PROGRESS_COLORS.tertiaryText}
            keyboardType="decimal-pad"
            autoFocus
            style={{
              fontSize: 72,
              fontWeight: "700",
              color: PROGRESS_COLORS.health.primary,
              textAlign: "center",
              minWidth: 140,
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
            kg
          </Text>
        </View>

        {value.length > 0 && !isValid && (
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.cardSubtitle,
              color: PROGRESS_COLORS.health.primary,
              marginTop: 16,
            }}
          >
            Enter a valid weight (0.1 - 635 kg)
          </Text>
        )}

        <View style={{ width: "100%", marginTop: 48 }}>
          <Pressable
            onPress={handleSave}
            disabled={!isValid || mutation.isPending}
            className="active:opacity-80"
            style={{
              backgroundColor: isValid && !mutation.isPending
                ? PROGRESS_COLORS.health.primary
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
              {mutation.isPending ? "Saving..." : "Save Weight"}
            </Text>
          </Pressable>
        </View>

        {/* Tips */}
        <View
          className="rounded-2xl"
          style={{
            backgroundColor: PROGRESS_COLORS.cardBackground,
            padding: 20,
            marginTop: 32,
            width: "100%",
          }}
        >
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.metricLabel,
              fontWeight: "600",
              color: PROGRESS_COLORS.primaryText,
              marginBottom: 12,
            }}
          >
            Tips
          </Text>
          {["Log at the same time daily", "Use a consistent scale", "Weigh in the morning on empty stomach", "Wear minimal clothing"].map((tip, i) => (
            <Text
              key={i}
              style={{
                ...METRIC_TYPOGRAPHY.cardSubtitle,
                color: PROGRESS_COLORS.secondaryText,
                paddingVertical: 4,
              }}
            >
              · {tip}
            </Text>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
