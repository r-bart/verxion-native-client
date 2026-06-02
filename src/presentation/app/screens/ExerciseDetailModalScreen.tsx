import React from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { useExerciseDetail } from "@/presentation/training/hooks/useExerciseDetail";
import { Skeleton } from "@/presentation/_shared/components/ui/skeleton";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";

export function ExerciseDetailModalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useExerciseDetail(id ?? "");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PROGRESS_COLORS.screenBackground }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontSize: 17, fontWeight: "600", color: PROGRESS_COLORS.primaryText, flex: 1, marginRight: 12 }} numberOfLines={1}>
          {data?.name ?? "Exercise"}
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <X size={22} color={PROGRESS_COLORS.secondaryText} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton className="h-5 w-1/2 rounded-lg" />
          <Skeleton className="h-4 w-1/3 rounded-lg" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-4 w-2/3 rounded-lg" />
          <Skeleton className="h-4 w-3/4 rounded-lg" />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: PROGRESS_COLORS.secondaryText, fontSize: 14, textAlign: "center" }}>
            Could not load exercise details
          </Text>
          <Pressable onPress={() => refetch()} style={{ marginTop: 12 }}>
            <Text style={{ color: PROGRESS_COLORS.positive.primary, fontSize: 14, fontWeight: "600" }}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : data ? (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 48 }}>
          {/* Subtitle */}
          <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText }}>
            {[data.bodyPart, data.equipment].filter(Boolean).join(" · ")}
          </Text>

          {/* Target muscle */}
          {data.target ? <Section label="Target" value={data.target} color="#4ADE80" /> : null}

          {/* Secondary muscles */}
          {data.secondaryMuscles.length > 0 ? (
            <Section label="Secondary" value={data.secondaryMuscles.join(", ")} color="#A78BFA" />
          ) : null}

          {/* Instructions */}
          {data.instructions.length > 0 ? (
            <View style={{ gap: 10 }}>
              <SectionLabel>Instructions</SectionLabel>
              {data.instructions.map((step, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#60A5FA", width: 20, paddingTop: 1 }}>
                    {i + 1}.
                  </Text>
                  <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText, flex: 1, lineHeight: 20 }}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Note */}
          {data.note ? (
            <View style={{ backgroundColor: "#FFFFFF08", borderRadius: 8, padding: 12 }}>
              <Text style={{ fontSize: 12, color: PROGRESS_COLORS.tertiaryText, fontStyle: "italic" }}>
                {data.note}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: 10, fontWeight: "600", color: PROGRESS_COLORS.tertiaryText, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
      {children}
    </Text>
  );
}

function Section({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ gap: 4 }}>
      <SectionLabel>{label}</SectionLabel>
      <Text style={{ fontSize: 13, fontWeight: "600", color }}>{value}</Text>
    </View>
  );
}
