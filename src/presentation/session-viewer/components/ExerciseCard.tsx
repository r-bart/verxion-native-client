import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type {
  LiveExerciseProgress,
  PreviousExerciseComparison,
} from "@/domain/sessions/models/Session";
import type { ProgressionExercise } from "@/domain/training/models/ProgressionPlan";
import { Card, CardContent, CardHeader } from "@/presentation/_shared/components/ui/card";
import { Badge } from "@/presentation/_shared/components/ui/badge";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";
import {
  computeOverloadStatus,
  computeSetWeightDelta,
  type OverloadStatus,
} from "@/domain/sessions/overload";
import { formatWeight, formatVolume } from "@/presentation/_shared/lib/format";
import { PendingExercisePreview } from "./PendingExercisePreview";
import { NextSetGuide } from "./NextSetGuide";

interface ExerciseCardProps {
  exercise: LiveExerciseProgress;
  previousExercise?: PreviousExerciseComparison;
  progressionTarget?: ProgressionExercise;
}

const statusConfig: Record<
  LiveExerciseProgress["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  completed: { label: "Done", variant: "default" },
  in_progress: { label: "Active", variant: "secondary" },
  not_started: { label: "Pending", variant: "outline" },
  skipped: { label: "Skipped", variant: "destructive" },
};

const setTypeColors: Record<string, string> = {
  superset: "#A78BFA",
  drop_set: "#F87171",
  giant_set: "#60A5FA",
  amrap: "#FBBF24",
  pyramid: "#34D399",
  rest_pause: "#FB923C",
};

const ACTION_CONFIG: Record<
  ProgressionExercise["action"],
  { label: string; color: string }
> = {
  increase_weight: { label: "↑ Weight", color: "#4ADE80" },
  increase_reps:   { label: "↑ Reps",   color: "#60A5FA" },
  increase_sets:   { label: "↑ Sets",   color: "#A78BFA" },
  hold:            { label: "→ Hold",   color: "#FFB900" },
  deload:          { label: "↓ Deload", color: "#F87171" },
};

function formatSetTypeLabel(setType: string): string {
  return setType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatSourceTypeLabel(sourceType: string): string {
  return sourceType.replace(/\b\w/g, (c) => c.toUpperCase());
}

const NEGATIVE_COLOR = "#F87171";

function VolumeDelta({ current, previous }: { current: number; previous: number }) {
  const delta = current - previous;
  if (delta === 0) return null;
  return (
    <Text
      style={{
        fontSize: 10,
        fontWeight: "600",
        color: delta > 0 ? PROGRESS_COLORS.positive.primary : NEGATIVE_COLOR,
      }}
    >
      ({delta > 0 ? "+" : ""}{formatVolume(Math.abs(delta))})
    </Text>
  );
}

// React Compiler memoizes renders; no manual React.memo needed.
export function ExerciseCard({
  exercise,
  previousExercise,
  progressionTarget,
}: ExerciseCardProps) {
  const router = useRouter();
  const config =
    statusConfig[exercise.status] ?? statusConfig["not_started"];
  const isNonRegularSetType = exercise.setType && exercise.setType !== "regular";
  const isNonPlannedSource = exercise.sourceType && exercise.sourceType !== "planned";
  const setTypeColor = isNonRegularSetType
    ? (setTypeColors[exercise.setType] ?? "#9CA3AF")
    : undefined;
  const subtitle = exercise.target || exercise.bodyPart;

  const setsProgress = exercise.planned?.sets
    ? `${exercise.actual.completedSets}/${exercise.planned.sets} sets`
    : `${exercise.actual.completedSets} sets`;

  const overloadBadgeConfig = (() => {
    if (exercise.actual.completedSets === 0) return null;
    const status = computeOverloadStatus(exercise.actual, previousExercise);
    const configs: Record<Exclude<OverloadStatus, "no_data">, { label: string; color: string; bg: string }> = {
      progressed: { label: "↑ Progressed", color: "#4ADE80", bg: "#4ADE8018" },
      maintained: { label: "= Maintained", color: "#8E8E93", bg: "#8E8E9318" },
      below:      { label: "↓ Below prev", color: "#F87171", bg: "#F8717118" },
    };
    return status === "no_data" ? null : configs[status];
  })();

  const actionBadge =
    exercise.status === "not_started" && progressionTarget
      ? (ACTION_CONFIG[progressionTarget.action] ?? null)
      : null;

  return (
    <Pressable
      className="px-6 pb-3"
      onPress={() => router.push(`/modals/exercise-detail/${exercise.exerciseId}`)}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      disabled={!exercise.exerciseId}
    >
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-2 pt-4 px-4">
          <View className="flex-1 mr-2">
            <Text className="text-base font-semibold text-foreground">
              {exercise.exerciseName}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {subtitle}
            </Text>
            {(isNonRegularSetType || isNonPlannedSource) && (
              <View className="flex-row items-center gap-1.5 mt-1">
                {isNonRegularSetType && setTypeColor && (
                  <View
                    style={{
                      backgroundColor: setTypeColor + "20",
                      borderRadius: 4,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ color: setTypeColor, fontSize: 10, fontWeight: "600" }}>
                      {formatSetTypeLabel(exercise.setType)}
                    </Text>
                  </View>
                )}
                {isNonPlannedSource && (
                  <View
                    style={{
                      backgroundColor: PROGRESS_COLORS.secondaryText + "20",
                      borderRadius: 4,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: PROGRESS_COLORS.secondaryText,
                        fontSize: 10,
                        fontWeight: "500",
                      }}
                    >
                      {formatSourceTypeLabel(exercise.sourceType)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <View className="items-end gap-1">
            <Badge variant={config.variant}>
              <Text
                className={`text-xs font-semibold ${
                  config.variant === "default"
                    ? "text-primary-foreground"
                    : config.variant === "secondary"
                    ? "text-secondary-foreground"
                    : config.variant === "destructive"
                    ? "text-destructive-foreground"
                    : "text-foreground"
                }`}
              >
                {config.label}
              </Text>
            </Badge>
            {actionBadge && (
              <View
                style={{
                  backgroundColor: actionBadge.color + "20",
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: actionBadge.color, fontSize: 10, fontWeight: "600" }}>
                  {actionBadge.label}
                </Text>
              </View>
            )}
            <Text
              style={{
                fontSize: 11,
                color: PROGRESS_COLORS.secondaryText,
                fontWeight: "500",
              }}
            >
              {setsProgress}
            </Text>
          </View>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {exercise.actual.sets.length > 0 ? (
            <View>
              <View className="flex-row border-b border-border pb-2 mb-2">
                <Text style={{ width: 32 }} className="text-xs font-medium text-muted-foreground">
                  Set
                </Text>
                <Text style={{ flex: 1 }} className="text-xs font-medium text-muted-foreground text-center">
                  Weight
                </Text>
                <Text style={{ flex: 1 }} className="text-xs font-medium text-muted-foreground text-center">
                  Reps
                </Text>
                <Text style={{ width: 40 }} className="text-xs font-medium text-muted-foreground text-center">
                  RIR
                </Text>
                <Text style={{ flex: 1 }} className="text-xs font-medium text-muted-foreground text-right">
                  Vol
                </Text>
                <Text style={{ width: 44 }} className="text-xs font-medium text-muted-foreground text-right">
                  ▲
                </Text>
              </View>
              {exercise.actual.sets.map((set, idx) => {
                const delta = computeSetWeightDelta(set.weight, previousExercise?.sets, set.setNumber);
                return (
                  <View
                    key={`${exercise.sessionExerciseId}-${set.setNumber}-${idx}`}
                    className="flex-row items-center py-1.5"
                  >
                    <Text style={{ width: 32 }} className="text-sm text-foreground">
                      {set.setNumber}
                    </Text>
                    <Text style={{ flex: 1 }} className="text-sm text-foreground text-center">
                      {formatWeight(set.weight)}
                    </Text>
                    <Text style={{ flex: 1 }} className="text-sm text-foreground text-center">
                      {set.reps}
                    </Text>
                    <Text style={{ width: 40 }} className="text-sm text-muted-foreground text-center">
                      {set.rir != null ? set.rir : "-"}
                    </Text>
                    <Text style={{ flex: 1 }} className="text-sm text-muted-foreground text-right">
                      {formatVolume(set.volume)}
                    </Text>
                    <Text
                      style={{
                        width: 44,
                        fontSize: 10,
                        fontWeight: "600",
                        textAlign: "right",
                        color:
                          delta === null
                            ? PROGRESS_COLORS.tertiaryText
                            : delta > 0
                            ? "#4ADE80"
                            : delta < 0
                            ? "#F87171"
                            : PROGRESS_COLORS.tertiaryText,
                      }}
                    >
                      {delta === null
                        ? "—"
                        : delta === 0
                        ? "="
                        : delta > 0
                        ? `+${formatWeight(delta)}`
                        : `-${formatWeight(Math.abs(delta))}`}
                    </Text>
                  </View>
                );
              })}
              {exercise.status === "in_progress" && exercise.planned?.sets != null && (
                <NextSetGuide
                  completedSets={exercise.actual.completedSets}
                  plannedSets={exercise.planned.sets}
                  progressionTarget={progressionTarget}
                  previousExercise={previousExercise}
                />
              )}
            </View>
          ) : (
            <PendingExercisePreview
              planned={exercise.planned}
              previousExercise={previousExercise}
              progressionTarget={progressionTarget}
            />
          )}
        </CardContent>

        {/* Comparison footer */}
        {(previousExercise || progressionTarget) &&
          exercise.status !== "not_started" &&
          exercise.status !== "in_progress" && (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: PROGRESS_COLORS.tertiaryText + "25",
              backgroundColor: "#FFFFFF08",
              paddingHorizontal: 16,
              paddingVertical: 10,
              gap: 4,
              borderBottomLeftRadius: 14,
              borderBottomRightRadius: 14,
            }}
          >
            {overloadBadgeConfig && (
              <View
                style={{
                  backgroundColor: overloadBadgeConfig.bg,
                  borderRadius: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  alignSelf: "flex-start",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: overloadBadgeConfig.color }}>
                  {overloadBadgeConfig.label}
                </Text>
              </View>
            )}
            {previousExercise && previousExercise.completedSets > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText }}>
                  Last
                </Text>
                <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText, fontWeight: "600" }}>
                  {previousExercise.completedSets}&times;{formatWeight(previousExercise.peakWeight)}
                  {" \u00B7 "}
                  {formatVolume(previousExercise.totalVolume)} vol
                </Text>
                {exercise.actual.completedSets > 0 && (
                  <VolumeDelta
                    current={exercise.actual.totalVolume}
                    previous={previousExercise.totalVolume}
                  />
                )}
              </View>
            )}
            {progressionTarget && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText }}>
                  Target
                </Text>
                <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText, fontWeight: "600" }}>
                  {progressionTarget.nextPrescription.sets}&times;{formatWeight(progressionTarget.nextPrescription.weight)}
                  {progressionTarget.nextPrescription.rir != null &&
                    ` \u00B7 RIR ${progressionTarget.nextPrescription.rir}`}
                </Text>
              </View>
            )}
          </View>
        )}
      </Card>
    </Pressable>
  );
}
