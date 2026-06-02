import { View, Text } from "react-native";
import type { PreviousExerciseComparison } from "@/domain/sessions/models/Session";
import type { ProgressionExercise } from "@/domain/training/models/ProgressionPlan";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";
import { formatWeight, formatRepRange } from "@/presentation/_shared/lib/format";

interface NextSetGuideProps {
  completedSets: number;
  plannedSets: number;
  progressionTarget?: ProgressionExercise;
  previousExercise?: PreviousExerciseComparison;
}

const LABEL_STYLE = {
  fontSize: 10,
  fontWeight: "500" as const,
  color: PROGRESS_COLORS.tertiaryText,
  textTransform: "uppercase" as const,
  letterSpacing: 0.5,
} as const;

// React Compiler memoizes renders; no manual React.memo needed.
export function NextSetGuide({
  completedSets,
  plannedSets,
  progressionTarget,
  previousExercise,
}: NextSetGuideProps) {
  const nextSetNumber = completedSets + 1;

  if (nextSetNumber > plannedSets) return null;
  if (!progressionTarget && !previousExercise) return null;

  const prevSet = previousExercise?.sets.find((s) => s.setNumber === nextSetNumber);
  const target = progressionTarget?.nextPrescription;

  if (!target && !prevSet) return null;

  return (
    <View
      style={{
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: PROGRESS_COLORS.tertiaryText + "25",
        gap: 6,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={LABEL_STYLE}>Next</Text>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: PROGRESS_COLORS.primaryText,
          }}
        >
          Set {nextSetNumber} / {plannedSets}
        </Text>
      </View>

      {/* Target row */}
      {target && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ ...LABEL_STYLE, width: 40 }}>Target</Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: PROGRESS_COLORS.primaryText,
            }}
          >
            {formatWeight(target.weight)}
            {" × "}
            {formatRepRange(target.repRange.minReps, target.repRange.maxReps)}
            {" · RIR "}
            {target.rir}
          </Text>
        </View>
      )}

      {/* Last row */}
      {prevSet && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ ...LABEL_STYLE, width: 40 }}>Last</Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: PROGRESS_COLORS.secondaryText,
            }}
          >
            {formatWeight(prevSet.weight)}
            {" × "}
            {prevSet.reps}
            {prevSet.rir != null ? ` · RIR ${prevSet.rir}` : ""}
          </Text>
        </View>
      )}
    </View>
  );
}
