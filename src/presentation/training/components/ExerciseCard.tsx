import { View, Text, Pressable } from "react-native";
import { Target, Dumbbell, Users, StickyNote } from "lucide-react-native";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";
import type { WorkoutDayExercise } from "@/domain/training/models/Routine";

// --- Set type badge ---

const SET_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  superset: { bg: "#2563EB30", text: "#60A5FA" },
  giant_set: { bg: "#7C3AED30", text: "#A78BFA" },
  drop_set: { bg: "#DC262630", text: "#F87171" },
  rest_pause: { bg: "#CA8A0430", text: "#FBBF24" },
  amrap: { bg: "#16A34A30", text: "#4ADE80" },
  pyramid: { bg: "#4F46E530", text: "#818CF8" },
  regular: { bg: PROGRESS_COLORS.tertiaryText + "30", text: PROGRESS_COLORS.secondaryText },
};

function SetTypeBadge({ setType }: { setType: string }) {
  const colors = SET_TYPE_COLORS[setType] ?? SET_TYPE_COLORS.regular;
  const label = setType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <View style={{ backgroundColor: colors.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
      <Text style={{ fontSize: 11, fontWeight: "600", color: colors.text }}>{label}</Text>
    </View>
  );
}

// --- Set scheme summary ---
// The API returns a minimal config: { sets, rir, weight, seedTag }.
// Rich details (repSchemes, stages, drops) are only available at session time.
// We display what we have: sets count + weight + RIR.

function formatWeight(weight?: number): string {
  if (weight == null) return "";
  return `@ ${weight}kg`;
}

function getSetSchemeSummary(exercise: WorkoutDayExercise): string {
  const st = exercise.setType;
  const config = exercise.single_exercise_config;
  const multi = exercise.multi_exercise;

  if (!st) return "Not configured";

  // Multi-exercise types (superset, giant_set)
  if ((st === "superset" || st === "giant_set") && multi) {
    const rounds = multi.rounds ?? 0;
    const count = multi.exercises?.length ?? 0;
    if (st === "superset" && count > 0) {
      return `${rounds} rounds · ${count} exercises`;
    }
    return `${rounds} rounds × ${count} exercises`;
  }

  // Single-exercise types — use the minimal config
  if (!config) return "Not configured";

  const sets = "sets" in config ? (config.sets ?? 0) : ("totalSets" in config ? (config.totalSets ?? 0) : 0);
  const weight = formatWeight("weight" in config ? config.weight : ("initialWeight" in config ? config.initialWeight : undefined));
  const rir = config.rir != null ? `RIR ${config.rir}` : "";
  const details = [weight, rir].filter(Boolean).join(" · ");

  switch (st) {
    case "regular":
      return `${sets} sets${details ? ` ${details}` : ""}`;
    case "drop_set":
      return `${sets} sets + drops${details ? ` ${details}` : ""}`;
    case "amrap":
      return `${sets} × AMRAP${details ? ` ${details}` : ""}`;
    case "pyramid":
      return `${sets} stages${details ? ` ${details}` : ""}`;
    case "rest_pause":
      return `${sets} sets (rest-pause)${details ? ` ${details}` : ""}`;
    default:
      return `${sets} sets${details ? ` ${details}` : ""}`;
  }
}

// --- Info badges ---

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

// --- Main component ---

export function ExerciseCard({ exercise, index, onPress }: { exercise: WorkoutDayExercise; index: number; onPress?: () => void }) {
  const setType = exercise.setType ?? "regular";
  const schemeSummary = getSetSchemeSummary(exercise);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View configuration for ${exercise.name}`}
      className="active:opacity-80"
      style={{
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "20",
        padding: 16,
      }}
    >
      {/* Header: order + name + badge */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <Text
          style={{ fontSize: 16, fontWeight: "600", color: PROGRESS_COLORS.primaryText, flex: 1, marginRight: 10 }}
          numberOfLines={2}
        >
          {index + 1}. {exercise.name}
        </Text>
        <SetTypeBadge setType={setType} />
      </View>

      {/* Set scheme */}
      <View
        style={{
          borderWidth: 1,
          borderColor: PROGRESS_COLORS.tertiaryText + "30",
          backgroundColor: PROGRESS_COLORS.cardBackground,
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: "500", color: PROGRESS_COLORS.primaryText }}>
          {schemeSummary}
        </Text>
      </View>

      {/* Muscle + equipment badges */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: exercise.notes ? 12 : 0 }}>
        <InfoBadge icon={<Target size={12} color={PROGRESS_COLORS.secondaryText} />} label={exercise.target} />
        {exercise.secondaryMuscles?.slice(0, 2).map((muscle) => (
          <InfoBadge key={muscle} icon={<Users size={12} color={PROGRESS_COLORS.secondaryText} />} label={muscle} />
        ))}
        <InfoBadge icon={<Dumbbell size={12} color={PROGRESS_COLORS.secondaryText} />} label={exercise.equipment} />
      </View>

      {/* Notes */}
      {exercise.notes && (
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 4 }}>
          <StickyNote size={14} color="#FBBF24" style={{ marginTop: 2 }} />
          <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText, flex: 1, lineHeight: 20 }}>
            {exercise.notes}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
