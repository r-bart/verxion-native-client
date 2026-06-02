import { View, Text } from "react-native";
import type { PreviousSessionComparison } from "@/domain/sessions/models/Session";
import { Card, CardContent } from "@/presentation/_shared/components/ui/card";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";

interface PreviousSessionBannerProps {
  current: {
    totalVolume: number;
    totalSets: number;
    totalReps: number;
  };
  previous: PreviousSessionComparison;
  progressionScore?: { progressed: number; total: number };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatVolumeDelta(delta: number): string {
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";
  const abs = Math.abs(delta);
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}t`;
  return `${sign}${Math.round(abs)}kg`;
}

function formatDelta(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}`;
}

function getDeltaColor(value: number): string {
  if (value > 0) return "#4ADE80";
  if (value < 0) return "#F87171";
  return PROGRESS_COLORS.secondaryText;
}

interface DeltaItemProps {
  label: string;
  value: string;
  color: string;
}

function DeltaItem({ label, value, color }: DeltaItemProps) {
  return (
    <View className="flex-1 items-center">
      <Text style={{ color, fontSize: 16, fontWeight: "700" }}>{value}</Text>
      <Text
        style={{
          color: PROGRESS_COLORS.secondaryText,
          fontSize: 11,
          fontWeight: "500",
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function PreviousSessionBanner({
  current,
  previous,
  progressionScore,
}: PreviousSessionBannerProps) {
  const volumeDelta = current.totalVolume - previous.totalVolume;
  const setsDelta = current.totalSets - previous.totalSets;
  const repsDelta = current.totalReps - previous.totalReps;

  return (
    <View className="px-6 pb-4">
      <Card>
        <CardContent className="py-3 px-4">
          <Text
            style={{
              color: PROGRESS_COLORS.secondaryText,
              fontSize: 12,
              fontWeight: "500",
              marginBottom: 8,
            }}
          >
            vs Last Session &middot; {formatDate(previous.date)}
          </Text>
          {progressionScore != null && progressionScore.total > 0 && (
            <Text
              style={{
                color:
                  progressionScore.progressed > 0 ? "#4ADE80" : "#F87171",
                fontSize: 14,
                fontWeight: "700",
                marginBottom: 10,
                marginTop: 2,
              }}
            >
              {progressionScore.progressed > 0 ? "↑" : "↓"}{" "}
              {progressionScore.progressed} of {progressionScore.total}{" "}
              exercise
              {progressionScore.total !== 1 ? "s" : ""} beating last session
            </Text>
          )}
          <View className="flex-row">
            <DeltaItem
              label="Volume"
              value={formatVolumeDelta(volumeDelta)}
              color={getDeltaColor(volumeDelta)}
            />
            <DeltaItem
              label="Sets"
              value={formatDelta(setsDelta)}
              color={getDeltaColor(setsDelta)}
            />
            <DeltaItem
              label="Reps"
              value={formatDelta(repsDelta)}
              color={getDeltaColor(repsDelta)}
            />
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
