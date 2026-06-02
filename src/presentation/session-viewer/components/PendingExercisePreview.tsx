import { View, Text } from "react-native";
import type { PreviousExerciseComparison } from "@/domain/sessions/models/Session";
import type { ProgressionExercise } from "@/domain/training/models/ProgressionPlan";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";
import { formatWeight, formatVolume, formatRepRange } from "@/presentation/_shared/lib/format";

interface PendingExercisePreviewProps {
  planned?: { sets: number; repScheme?: string; weight?: number; rir?: number };
  previousExercise?: PreviousExerciseComparison;
  progressionTarget?: ProgressionExercise;
}

const SECTION_LABEL_STYLE = {
  fontSize: 10,
  fontWeight: "500" as const,
  color: PROGRESS_COLORS.tertiaryText,
  textTransform: "uppercase" as const,
  letterSpacing: 0.5,
  marginBottom: 3,
} as const;

const TABLE_DIVIDER_STYLE = {
  flexDirection: "row" as const,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(255,255,255,0.08)",
  paddingBottom: 6,
  marginBottom: 4,
};

// React Compiler memoizes renders; no manual React.memo needed.
export function PendingExercisePreview({
  planned,
  previousExercise,
  progressionTarget,
}: PendingExercisePreviewProps) {

    // ── MODE A: Full rich preview ─────────────────────────────
    if (progressionTarget) {
      const { nextPrescription, lastPerformance, reasoning } = progressionTarget;
      const hasPrevSets = (previousExercise?.sets.length ?? 0) > 0;
      const tableRows = Math.max(
        hasPrevSets ? previousExercise!.sets.length : 0,
        nextPrescription.sets
      );
      const repRangeStr = formatRepRange(
        nextPrescription.repRange.minReps,
        nextPrescription.repRange.maxReps
      );

      return (
        <View style={{ gap: 12 }}>

          {/* Summary row — Last → Today */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>

            {/* Last session */}
            <View style={{ flex: 1 }}>
              <Text style={SECTION_LABEL_STYLE}>Last session</Text>
              <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText, fontWeight: "600" }}>
                {lastPerformance.sets}×{formatWeight(lastPerformance.weight)}
              </Text>
              <Text style={{ fontSize: 11, color: PROGRESS_COLORS.tertiaryText, marginTop: 1 }}>
                {lastPerformance.avgReps} reps
                {lastPerformance.avgRir != null ? ` · RIR ${lastPerformance.avgRir}` : ""}
                {" · "}{formatVolume(lastPerformance.totalVolume)}
              </Text>
            </View>

            {/* Arrow */}
            <Text style={{ fontSize: 16, color: PROGRESS_COLORS.tertiaryText }}>→</Text>

            {/* Today */}
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={{ ...SECTION_LABEL_STYLE, textAlign: "right" }}>Today</Text>
              <Text style={{ fontSize: 13, color: PROGRESS_COLORS.primaryText, fontWeight: "700" }}>
                {nextPrescription.sets}×{formatWeight(nextPrescription.weight)}
              </Text>
              <Text style={{ fontSize: 11, color: PROGRESS_COLORS.secondaryText, marginTop: 1, textAlign: "right" }}>
                {repRangeStr} reps · RIR {nextPrescription.rir}
              </Text>
            </View>
          </View>

          {/* Set-by-set reference table */}
          {hasPrevSets && tableRows > 0 && (
            <View>
              <View style={TABLE_DIVIDER_STYLE}>
                <Text style={{ width: 32, fontSize: 11, color: PROGRESS_COLORS.tertiaryText, fontWeight: "500" }}>
                  Set
                </Text>
                <Text style={{ flex: 1, fontSize: 11, color: PROGRESS_COLORS.tertiaryText, fontWeight: "500" }}>
                  Last
                </Text>
                <Text style={{ flex: 1, fontSize: 11, color: PROGRESS_COLORS.tertiaryText, fontWeight: "500", textAlign: "right" }}>
                  Target
                </Text>
              </View>
              {Array.from({ length: tableRows }, (_, i) => i + 1).map((setNum) => {
                const prevSet = previousExercise?.sets.find((s) => s.setNumber === setNum);
                return (
                  <View key={setNum} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 5 }}>
                    <Text style={{ width: 32, fontSize: 12, color: PROGRESS_COLORS.tertiaryText }}>
                      {setNum}
                    </Text>
                    <Text style={{ flex: 1, fontSize: 12, color: PROGRESS_COLORS.secondaryText }}>
                      {prevSet
                        ? `${formatWeight(prevSet.weight)} × ${prevSet.reps}${prevSet.rir != null ? ` · RIR ${prevSet.rir}` : ""}`
                        : "—"}
                    </Text>
                    <Text style={{ flex: 1, fontSize: 12, color: PROGRESS_COLORS.primaryText, fontWeight: "600", textAlign: "right" }}>
                      {formatWeight(nextPrescription.weight)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Reasoning chip */}
          {reasoning.length > 0 && (
            <View
              style={{
                backgroundColor: PROGRESS_COLORS.tertiaryText + "12",
                borderRadius: 6,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: PROGRESS_COLORS.secondaryText,
                  fontStyle: "italic",
                  lineHeight: 16,
                }}
              >
                {`"${reasoning[0]}"`}
              </Text>
            </View>
          )}
        </View>
      );
    }

    // ── MODE B: Previous-only ─────────────────────────────────
    if (previousExercise && previousExercise.sets.length > 0) {
      return (
        <View>
          <Text style={{ ...SECTION_LABEL_STYLE, marginBottom: 8 }}>Previous session</Text>
          <View style={TABLE_DIVIDER_STYLE}>
            <Text style={{ width: 32, fontSize: 11, color: PROGRESS_COLORS.tertiaryText, fontWeight: "500" }}>Set</Text>
            <Text style={{ flex: 1, fontSize: 11, color: PROGRESS_COLORS.tertiaryText, fontWeight: "500", textAlign: "center" }}>Weight</Text>
            <Text style={{ flex: 1, fontSize: 11, color: PROGRESS_COLORS.tertiaryText, fontWeight: "500", textAlign: "center" }}>Reps</Text>
            <Text style={{ width: 36, fontSize: 11, color: PROGRESS_COLORS.tertiaryText, fontWeight: "500", textAlign: "center" }}>RIR</Text>
          </View>
          {previousExercise.sets.map((set, idx) => (
            <View key={idx} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 5 }}>
              <Text style={{ width: 32, fontSize: 12, color: PROGRESS_COLORS.tertiaryText }}>{set.setNumber}</Text>
              <Text style={{ flex: 1, fontSize: 12, color: PROGRESS_COLORS.secondaryText, textAlign: "center" }}>{formatWeight(set.weight)}</Text>
              <Text style={{ flex: 1, fontSize: 12, color: PROGRESS_COLORS.secondaryText, textAlign: "center" }}>{set.reps}</Text>
              <Text style={{ width: 36, fontSize: 12, color: PROGRESS_COLORS.tertiaryText, textAlign: "center" }}>{set.rir != null ? set.rir : "—"}</Text>
            </View>
          ))}
        </View>
      );
    }

    // ── MODE C: Fallback ──────────────────────────────────────
    if (planned) {
      return (
        <Text style={{ fontSize: 14, color: PROGRESS_COLORS.secondaryText }}>
          {planned.sets} sets
          {planned.repScheme ? ` × ${planned.repScheme}` : ""}
          {planned.weight ? ` @ ${planned.weight} kg` : ""}
          {planned.rir != null ? ` · RIR ${planned.rir}` : ""}
        </Text>
      );
    }

    return (
      <Text style={{ fontSize: 14, color: PROGRESS_COLORS.tertiaryText }}>Waiting to start</Text>
    );
}
