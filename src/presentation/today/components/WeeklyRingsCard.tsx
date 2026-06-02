import { View, Text } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { useWeeklyRingsData, type DayRing } from "../hooks/useWeeklyRingsData";
import { Skeleton } from "@/presentation/_shared/components/ui/skeleton";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";

const RING_SIZE = 38;
const STROKE_WIDTH = 4;
const GAP = 2;

const RING_COLORS = {
  training: PROGRESS_COLORS.positive.primary,
  nutrition: PROGRESS_COLORS.neutral.primary,
  steps: PROGRESS_COLORS.body.primary,
};

const RING_BG = PROGRESS_COLORS.secondaryText + "20";

function makeArcPath(
  cx: number,
  cy: number,
  radius: number,
  progress: number
): ReturnType<typeof Skia.Path.Make> {
  const path = Skia.Path.Make();
  if (progress <= 0) return path;

  if (progress >= 1) {
    path.addCircle(cx, cy, radius);
    return path;
  }

  const startAngle = -90;
  const sweepAngle = progress * 360;
  path.addArc(
    { x: cx - radius, y: cy - radius, width: radius * 2, height: radius * 2 },
    startAngle,
    sweepAngle
  );
  return path;
}

function DayRings({ day }: { day: DayRing }) {
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;

  const outerR = RING_SIZE / 2 - STROKE_WIDTH / 2;
  const midR = outerR - STROKE_WIDTH - GAP;
  const innerR = midR - STROKE_WIDTH - GAP;

  const rings = [
    { radius: outerR, progress: day.training, color: RING_COLORS.training },
    { radius: midR, progress: day.nutrition, color: RING_COLORS.nutrition },
    { radius: innerR, progress: day.steps, color: RING_COLORS.steps },
  ];

  return (
    <View className="items-center" style={{ gap: 4 }}>
      <Canvas style={{ width: RING_SIZE, height: RING_SIZE }}>
        {rings.map(({ radius, color, progress }) => (
          <Path
            key={`bg-${color}`}
            path={makeArcPath(cx, cy, radius, 1)}
            style="stroke"
            strokeWidth={STROKE_WIDTH}
            color={RING_BG}
            strokeCap="round"
          />
        ))}
        {rings.map(
          ({ radius, color, progress }) =>
            progress > 0 && (
              <Path
                key={`fg-${color}`}
                path={makeArcPath(cx, cy, radius, progress)}
                style="stroke"
                strokeWidth={STROKE_WIDTH}
                color={color}
                strokeCap="round"
              />
            )
        )}
      </Canvas>
      <Text
        style={{
          ...METRIC_TYPOGRAPHY.context,
          color: day.isToday ? PROGRESS_COLORS.primaryText : PROGRESS_COLORS.secondaryText,
          fontWeight: day.isToday ? "700" : "400",
        }}
      >
        {day.dayLabel}
      </Text>
    </View>
  );
}

function Legend() {
  const items = [
    { label: "Training", color: RING_COLORS.training },
    { label: "Nutrition", color: RING_COLORS.nutrition },
    { label: "Steps", color: RING_COLORS.steps },
  ];

  return (
    <View className="flex-row items-center justify-center" style={{ gap: 16, marginTop: 12 }}>
      {items.map(({ label, color }) => (
        <View key={label} className="flex-row items-center" style={{ gap: 4 }}>
          <View className="rounded-full" style={{ width: 8, height: 8, backgroundColor: color }} />
          <Text style={{ ...METRIC_TYPOGRAPHY.context, color: PROGRESS_COLORS.secondaryText }}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function WeeklyRingsCard() {
  const { days, isLoading } = useWeeklyRingsData();

  if (isLoading) {
    return (
      <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
        <Skeleton className="h-28 w-full rounded-2xl" />
      </View>
    );
  }

  if (days.length === 0) return null;

  return (
    <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
      <View
        className="rounded-2xl border border-border"
        style={{ backgroundColor: PROGRESS_COLORS.cardBackground, padding: 24 }}
      >
        <Text
          style={{
            ...METRIC_TYPOGRAPHY.metricLabel,
            fontWeight: "700",
            color: PROGRESS_COLORS.primaryText,
            marginBottom: 16,
          }}
        >
          This Week
        </Text>
        <View className="flex-row justify-between">
          {days.map((day) => (
            <DayRings key={day.date} day={day} />
          ))}
        </View>
        <Legend />
      </View>
    </View>
  );
}
