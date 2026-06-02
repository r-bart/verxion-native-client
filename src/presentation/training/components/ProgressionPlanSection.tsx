import { View, Text } from "react-native";
import { useProgressionPlan } from "../hooks/useProgressionPlan";
import {
  PROGRESS_COLORS,
  METRIC_TYPOGRAPHY,
} from "@/presentation/_shared/constants/progress-colors";

interface ProgressionPlanSectionProps {
  workoutDayId: string;
}

const GATE_BADGE: Record<string, { label: string; color: string }> = {
  ready: { label: "Ready to Progress", color: "#4ADE80" },
  low_readiness: { label: "Low Readiness", color: "#FBBF24" },
  low_adherence: { label: "Low Adherence", color: "#FB923C" },
  insufficient_data: { label: "More Data Needed", color: "#9CA3AF" },
};

const ACTION_BADGE: Record<
  string,
  { label: string; color: string }
> = {
  increase_weight: { label: "\u2191 Weight", color: "#4ADE80" },
  increase_reps: { label: "\u2191 Reps", color: "#60A5FA" },
  increase_sets: { label: "\u2191 Sets", color: "#FBBF24" },
  hold: { label: "Hold", color: "#9CA3AF" },
  deload: { label: "\u2193 Deload", color: "#F87171" },
};

function getConfidenceColor(confidence: number): string {
  if (confidence > 0.7) return "#4ADE80";
  if (confidence > 0.4) return "#FBBF24";
  return "#F87171";
}

export function ProgressionPlanSection({ workoutDayId }: ProgressionPlanSectionProps) {
  const { data, isLoading, isError } = useProgressionPlan(workoutDayId);

  if (isLoading) {
    return null;
  }

  if (isError) {
    return (
      <View style={{ paddingVertical: 12 }}>
        <Text style={{ fontSize: 13, color: PROGRESS_COLORS.tertiaryText, textAlign: "center" }}>
          Could not load progression recommendations
        </Text>
      </View>
    );
  }

  if (data === null || data === undefined) {
    return (
      <View style={{ paddingVertical: 12 }}>
        <Text style={{ fontSize: 13, color: PROGRESS_COLORS.tertiaryText, textAlign: "center" }}>
          Complete a session to see progression recommendations
        </Text>
      </View>
    );
  }

  if (data.exercises.length === 0) {
    return (
      <View style={{ paddingVertical: 12 }}>
        <Text style={{ fontSize: 13, color: PROGRESS_COLORS.tertiaryText, textAlign: "center" }}>
          No exercise recommendations available
        </Text>
      </View>
    );
  }

  const gate = GATE_BADGE[data.globalGate.reason] ?? GATE_BADGE.insufficient_data;

  return (
    <View style={{ gap: 12 }}>
      {/* Section header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text
          style={{
            ...METRIC_TYPOGRAPHY.cardTitle,
            color: PROGRESS_COLORS.primaryText,
          }}
        >
          Next Session
        </Text>
        <View
          style={{
            backgroundColor: gate.color + "20",
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "600", color: gate.color }}>
            {gate.label}
          </Text>
        </View>
      </View>

      {/* Exercise cards */}
      {data.exercises.map((exercise) => {
        const action = ACTION_BADGE[exercise.action] ?? ACTION_BADGE.hold;
        const nextWeight =
          exercise.nextPrescription.weight !== null
            ? `${exercise.nextPrescription.weight}kg`
            : "BW";
        const lastWeight =
          exercise.lastPerformance.weight !== null
            ? `${exercise.lastPerformance.weight}kg`
            : "BW";

        const hasDelta =
          exercise.nextPrescription.weight !== null &&
          exercise.lastPerformance.weight !== null;
        const delta = hasDelta
          ? exercise.nextPrescription.weight! - exercise.lastPerformance.weight!
          : 0;

        const confidenceColor = getConfidenceColor(exercise.confidence);

        return (
          <View
            key={`${exercise.exerciseId}-${exercise.setType}`}
            style={{
              backgroundColor: PROGRESS_COLORS.cardBackground,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: PROGRESS_COLORS.tertiaryText + "20",
              padding: 14,
              gap: 8,
            }}
          >
            {/* Name + action badge */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: PROGRESS_COLORS.primaryText,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {exercise.exerciseName}
              </Text>
              <View
                style={{
                  backgroundColor: action.color + "20",
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  marginLeft: 8,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "600", color: action.color }}>
                  {action.label}
                </Text>
              </View>
            </View>

            {/* Next prescription */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 13, color: PROGRESS_COLORS.primaryText }}>
                Next: {exercise.nextPrescription.sets} x {nextWeight} @ RIR{" "}
                {exercise.nextPrescription.rir}
              </Text>
              <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText }}>
                {exercise.nextPrescription.repRange?.minReps ?? 0}-
                {exercise.nextPrescription.repRange?.maxReps ?? 0} reps
              </Text>
            </View>

            {/* Last performance */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText }}>
                Last: {exercise.lastPerformance.sets} x {lastWeight} &middot;{" "}
                {(exercise.lastPerformance.avgReps ?? 0).toFixed(1)} avg reps
              </Text>
              {hasDelta && delta !== 0 && (
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: delta > 0 ? "#4ADE80" : "#F87171",
                  }}
                >
                  {delta > 0 ? "+" : ""}
                  {delta}kg
                </Text>
              )}
            </View>

            {/* Confidence bar */}
            <View
              style={{
                height: 3,
                backgroundColor: PROGRESS_COLORS.tertiaryText + "30",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${Math.round(exercise.confidence * 100)}%`,
                  height: "100%",
                  backgroundColor: confidenceColor,
                  borderRadius: 2,
                }}
              />
            </View>

            {/* First reasoning line */}
            {exercise.reasoning.length > 0 && (
              <Text
                style={{ fontSize: 11, color: PROGRESS_COLORS.tertiaryText }}
                numberOfLines={1}
              >
                {exercise.reasoning[0]}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
