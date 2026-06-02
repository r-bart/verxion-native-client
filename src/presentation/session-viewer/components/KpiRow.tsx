import { View, Text } from "react-native";
import type { LiveSessionProgress } from "@/domain/sessions/models/Session";
import { Card, CardContent } from "@/presentation/_shared/components/ui/card";
import { formatVolume } from "@/presentation/_shared/lib/format";

interface KpiRowProps {
  progress: LiveSessionProgress["progress"];
  progressionScore?: { progressed: number; total: number };
}

interface KpiItemProps {
  label: string;
  value: string;
  valueColor?: string;
}

function KpiItem({ label, value, valueColor }: KpiItemProps) {
  return (
    <View className="flex-1 items-center">
      {valueColor ? (
        <Text style={{ fontSize: 18, fontWeight: "700", color: valueColor }}>
          {value}
        </Text>
      ) : (
        <Text className="text-lg font-bold text-foreground">{value}</Text>
      )}
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}


export function KpiRow({ progress, progressionScore }: KpiRowProps) {
  let progressionValueColor: string | undefined;
  if (progressionScore && progressionScore.total > 0) {
    if (progressionScore.progressed === progressionScore.total) {
      progressionValueColor = "#4ADE80";
    } else if (progressionScore.progressed > 0) {
      progressionValueColor = "#FFB900";
    } else {
      progressionValueColor = "#8E8E93";
    }
  }

  return (
    <View className="px-6 pb-4">
      <Card>
        <CardContent className="flex-row py-4 px-2">
          <KpiItem label="Volume" value={formatVolume(progress.totalVolume)} />
          <KpiItem label="Sets" value={String(progress.totalSets)} />
          <KpiItem label="Reps" value={String(progress.totalReps)} />
          <KpiItem
            label="Exercises"
            value={`${progress.completedExercises}/${progress.totalExercises}`}
          />
          {progressionScore && progressionScore.total > 0 && (
            <KpiItem
              label="Progressed"
              value={`${progressionScore.progressed}/${progressionScore.total}`}
              valueColor={progressionValueColor}
            />
          )}
        </CardContent>
      </Card>
    </View>
  );
}
