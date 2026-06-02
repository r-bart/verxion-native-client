import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft, Target, Dumbbell, Users, Activity,
  FileText, User, Calendar,
} from "lucide-react-native";
import { useExerciseDetail } from "../hooks/useExerciseDetail";
import { TrainingSkeleton } from "../components/TrainingSkeleton";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";

const ACCENT = {
  green: PROGRESS_COLORS.positive.primary,
  purple: "#8B5CF6",
  amber: "#F59E0B",
  blue: "#3B82F6",
} as const;

function SectionHeader({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
      {icon}
      <Text style={{ fontSize: 14, fontWeight: "600", color }}>{title}</Text>
    </View>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View
      style={{
        backgroundColor: color + "20",
        borderWidth: 1,
        borderColor: color + "40",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "500", color }}>{label}</Text>
    </View>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "20",
        padding: 16,
        marginBottom: 12,
      }}
    >
      {children}
    </View>
  );
}

export function ExerciseDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { data: exercise, isLoading, error } = useExerciseDetail(id ?? "");

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
        <TrainingSkeleton />
      </SafeAreaView>
    );
  }

  if (error || !exercise) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
        <ErrorState message="Failed to load exercise details." onRetry={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: PROGRESS_COLORS.screenBackground }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back">
          <ChevronLeft size={24} color={PROGRESS_COLORS.primaryText} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: PROGRESS_COLORS.primaryText }} numberOfLines={2}>
            {exercise.name}
          </Text>
          <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText, marginTop: 2 }}>
            {exercise.bodyPart} · {exercise.equipment}
          </Text>
        </View>
        {exercise.isCustom && (
          <View
            style={{
              backgroundColor: ACCENT.purple + "20",
              borderWidth: 1,
              borderColor: ACCENT.purple + "40",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <User size={12} color={ACCENT.purple} />
            <Text style={{ fontSize: 11, fontWeight: "600", color: ACCENT.purple }}>Custom</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Target Muscle */}
        <SectionCard>
          <SectionHeader
            icon={<Target size={16} color={ACCENT.green} />}
            title="Target Muscle"
            color={ACCENT.green}
          />
          <Badge label={exercise.target} color={ACCENT.green} />
        </SectionCard>

        {/* Secondary Muscles */}
        {exercise.secondaryMuscles.length > 0 && (
          <SectionCard>
            <SectionHeader
              icon={<Users size={16} color={ACCENT.purple} />}
              title="Secondary Muscles"
              color={ACCENT.purple}
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {exercise.secondaryMuscles.map((muscle) => (
                <Badge key={muscle} label={muscle} color={ACCENT.purple} />
              ))}
            </View>
          </SectionCard>
        )}

        {/* Equipment */}
        <SectionCard>
          <SectionHeader
            icon={<Dumbbell size={16} color={ACCENT.amber} />}
            title="Equipment"
            color={ACCENT.amber}
          />
          <Badge label={exercise.equipment} color={ACCENT.amber} />
        </SectionCard>

        {/* Body Part */}
        <SectionCard>
          <SectionHeader
            icon={<Activity size={16} color={ACCENT.blue} />}
            title="Body Part"
            color={ACCENT.blue}
          />
          <Badge label={exercise.bodyPart} color={ACCENT.blue} />
        </SectionCard>

        {/* Instructions */}
        {exercise.instructions.length > 0 && (
          <SectionCard>
            <SectionHeader
              icon={<FileText size={16} color={ACCENT.blue} />}
              title="Instructions"
              color={ACCENT.blue}
            />
            {exercise.instructions.map((step, i) => (
              <View key={step} style={{ flexDirection: "row", marginBottom: i < exercise.instructions.length - 1 ? 12 : 0, gap: 12 }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: ACCENT.blue + "20",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 1,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: ACCENT.blue }}>{i + 1}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 14, lineHeight: 22, color: PROGRESS_COLORS.primaryText }}>
                  {step}
                </Text>
              </View>
            ))}
          </SectionCard>
        )}

        {/* Custom Exercise Info */}
        {exercise.isCustom && (
          <SectionCard>
            <SectionHeader
              icon={<User size={16} color={ACCENT.purple} />}
              title="Custom Exercise"
              color={ACCENT.purple}
            />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: exercise.note ? 12 : 0 }}>
              <Calendar size={14} color={PROGRESS_COLORS.secondaryText} />
              <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText }}>
                Created {new Date(exercise.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {exercise.note && (
              <View
                style={{
                  backgroundColor: PROGRESS_COLORS.screenBackground,
                  borderRadius: 10,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: PROGRESS_COLORS.tertiaryText + "30",
                }}
              >
                <Text style={{ fontSize: 13, lineHeight: 20, color: PROGRESS_COLORS.secondaryText }}>
                  {exercise.note}
                </Text>
              </View>
            )}
          </SectionCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
