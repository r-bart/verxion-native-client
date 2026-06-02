import { View, Text, Pressable } from "react-native";
import { Target, Dumbbell, Activity } from "lucide-react-native";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";
import type { ExerciseSearchResult } from "@/domain/training/models/Exercise";

function InfoBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: PROGRESS_COLORS.tertiaryText + "25",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 6,
      }}
    >
      {icon}
      <Text style={{ fontSize: 11, color: PROGRESS_COLORS.secondaryText, fontWeight: "500" }}>{label}</Text>
    </View>
  );
}

export function ExerciseBrowserCard({
  exercise,
  onPress,
}: {
  exercise: ExerciseSearchResult;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${exercise.name}`}
      className="active:opacity-80"
      style={{
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "20",
        padding: 16,
      }}
    >
      {/* Name */}
      <Text
        style={{ fontSize: 16, fontWeight: "600", color: PROGRESS_COLORS.primaryText, marginBottom: 10 }}
        numberOfLines={2}
      >
        {exercise.name}
      </Text>

      {/* Badges */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {exercise.targetMuscle && (
          <InfoBadge
            icon={<Target size={12} color={PROGRESS_COLORS.positive.primary} />}
            label={exercise.targetMuscle}
          />
        )}
        {exercise.bodyPart && (
          <InfoBadge
            icon={<Activity size={12} color={PROGRESS_COLORS.secondaryText} />}
            label={exercise.bodyPart}
          />
        )}
        {exercise.equipment && (
          <InfoBadge
            icon={<Dumbbell size={12} color={PROGRESS_COLORS.secondaryText} />}
            label={exercise.equipment}
          />
        )}
      </View>
    </Pressable>
  );
}
