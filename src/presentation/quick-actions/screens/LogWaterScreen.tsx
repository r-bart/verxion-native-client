import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLogWater } from "../hooks/useLogWater";
import { useDailyWater } from "@/presentation/today/hooks/useDailyWater";
import { X, Droplets } from "lucide-react-native";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

const WATER_GOAL = 2500;
const QUICK_AMOUNTS = [150, 250, 500];

export function LogWaterScreen() {
  const [customValue, setCustomValue] = useState("");
  const router = useRouter();
  const mutation = useLogWater();
  const { data: dailyWater } = useDailyWater();

  const currentMl = dailyWater?.totalMl ?? 0;
  const percentage = Math.min((currentMl / WATER_GOAL) * 100, 100);

  function handleQuickAdd(amountMl: number) {
    mutation.mutate(amountMl, {
      onError: (error) => {
        Alert.alert("Error", error.message || "Failed to log water");
      },
    });
  }

  function handleCustomAdd() {
    const amount = parseInt(customValue, 10);
    if (isNaN(amount) || amount <= 0 || amount > 5000) return;
    mutation.mutate(amount, {
      onSuccess: () => setCustomValue(""),
      onError: (error) => {
        Alert.alert("Error", error.message || "Failed to log water");
      },
    });
  }

  const customAmount = parseInt(customValue, 10);
  const isCustomValid =
    customValue.length > 0 &&
    !isNaN(customAmount) &&
    customAmount > 0 &&
    customAmount <= 5000;

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
          <Droplets size={18} color={PROGRESS_COLORS.body.primary} />
          <Text
            style={{
              ...METRIC_TYPOGRAPHY.metricLabel,
              fontWeight: "600",
              color: PROGRESS_COLORS.primaryText,
            }}
          >
            Log Water
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        {/* Progress Card */}
        <View
          className="rounded-2xl border border-border"
          style={{
            backgroundColor: PROGRESS_COLORS.cardBackground,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <View className="flex-row items-end justify-between" style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 36,
                fontWeight: "700",
                color: PROGRESS_COLORS.body.primary,
              }}
            >
              {currentMl.toLocaleString()}
              <Text style={{ fontSize: 18, fontWeight: "400", color: PROGRESS_COLORS.secondaryText }}>
                {" "}ml
              </Text>
            </Text>
            <Text
              style={{
                ...METRIC_TYPOGRAPHY.cardSubtitle,
                color: PROGRESS_COLORS.secondaryText,
              }}
            >
              / {WATER_GOAL.toLocaleString()} ml
            </Text>
          </View>
          {/* Progress bar */}
          <View
            className="rounded-full overflow-hidden"
            style={{
              height: 10,
              backgroundColor: PROGRESS_COLORS.body.primary + "1A",
            }}
          >
            <View
              className="rounded-full"
              style={{
                height: "100%",
                width: `${percentage}%`,
                backgroundColor: PROGRESS_COLORS.body.primary,
              }}
            />
          </View>
        </View>

        {/* Quick Add */}
        <Text
          style={{
            ...METRIC_TYPOGRAPHY.context,
            color: PROGRESS_COLORS.secondaryText,
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          Quick Add
        </Text>
        <View className="flex-row" style={{ gap: 12, marginBottom: 24 }}>
          {QUICK_AMOUNTS.map((amount) => (
            <Pressable
              key={amount}
              className="flex-1 active:opacity-80"
              onPress={() => handleQuickAdd(amount)}
              disabled={mutation.isPending}
            >
              <View
                className="items-center rounded-2xl border border-border"
                style={{
                  backgroundColor: PROGRESS_COLORS.cardBackground,
                  paddingVertical: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: PROGRESS_COLORS.body.primary,
                  }}
                >
                  +{amount}
                </Text>
                <Text
                  style={{
                    ...METRIC_TYPOGRAPHY.context,
                    color: PROGRESS_COLORS.secondaryText,
                    marginTop: 2,
                  }}
                >
                  ml
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Custom Amount */}
        <Text
          style={{
            ...METRIC_TYPOGRAPHY.context,
            color: PROGRESS_COLORS.secondaryText,
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          Custom Amount
        </Text>
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <View
            className="flex-1 rounded-2xl"
            style={{
              backgroundColor: PROGRESS_COLORS.cardBackground,
              borderWidth: 1,
              borderColor: PROGRESS_COLORS.tertiaryText + "40",
            }}
          >
            <TextInput
              value={customValue}
              onChangeText={setCustomValue}
              placeholder="Amount in ml"
              placeholderTextColor={PROGRESS_COLORS.tertiaryText}
              keyboardType="number-pad"
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: PROGRESS_COLORS.primaryText,
              }}
            />
          </View>
          <Pressable
            onPress={handleCustomAdd}
            disabled={!isCustomValid || mutation.isPending}
            className="active:opacity-80"
            style={{
              backgroundColor: isCustomValid && !mutation.isPending
                ? PROGRESS_COLORS.body.primary
                : PROGRESS_COLORS.cardBackground,
              borderRadius: 16,
              paddingHorizontal: 24,
              paddingVertical: 14,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: isCustomValid && !mutation.isPending
                  ? "#000000"
                  : PROGRESS_COLORS.tertiaryText,
              }}
            >
              Add
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
