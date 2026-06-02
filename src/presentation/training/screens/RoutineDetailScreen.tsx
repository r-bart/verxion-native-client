import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft, ChevronRight, CalendarDays, Dumbbell, Target, Coffee, Heart, Zap,
  BarChart3, Footprints, Move, BookOpen, Settings2, Activity,
} from "lucide-react-native";
import { StatusBadge } from "@/presentation/_shared/components/StatusBadge";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { useRoutineDetail } from "../hooks/useRoutineDetail";
import { TrainingSkeleton } from "../components/TrainingSkeleton";
import { PROGRESS_COLORS, METRIC_TYPOGRAPHY } from "@/presentation/_shared/constants/progress-colors";
import type { Routine, WorkoutDay } from "@/domain/training/models/Routine";

// --- Helpers ---

function getDurationType(routine: Routine): "fixed_sessions" | "date_range" | "indefinite" {
  if (routine.maxSessions) return "fixed_sessions";
  if (routine.startDate && routine.endDate) return "date_range";
  return "indefinite";
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatGoal(goal: string): string {
  return goal.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// --- Stat Card ---

function StatCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
        aspectRatio: 3 / 2,
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "20",
        padding: 16,
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {icon}
        <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText }}>{label}</Text>
      </View>
      <View>{children}</View>
    </View>
  );
}

// --- Workout Day Row ---

const DAY_TYPE_ICONS: Record<string, { icon: typeof Dumbbell; color: string }> = {
  workout: { icon: Dumbbell, color: "#10B981" },
  rest: { icon: Coffee, color: "#60A5FA" },
  cardio: { icon: Heart, color: "#10B981" },
  deload: { icon: Zap, color: "#10B981" },
  mobility: { icon: Move, color: "#10B981" },
  active_rest: { icon: Activity, color: "#6B7280" },
  conditioning: { icon: Settings2, color: "#10B981" },
  technique: { icon: BookOpen, color: "#10B981" },
  default: { icon: CalendarDays, color: PROGRESS_COLORS.secondaryText },
};

function WorkoutDayRow({ day, index, onPress }: { day: WorkoutDay; index: number; onPress: () => void }) {
  const config = DAY_TYPE_ICONS[day.dayType] ?? DAY_TYPE_ICONS.default;
  const Icon = config.icon;
  const titleText = day.dayType === "rest" ? "Rest" : day.name;

  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-80"
      style={{
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "20",
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minHeight: 88,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: PROGRESS_COLORS.tertiaryText + "30",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: "600", color: PROGRESS_COLORS.secondaryText }}>
          {index + 1}
        </Text>
      </View>

      <Icon size={20} color={config.color} />

      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 15, fontWeight: "500", color: PROGRESS_COLORS.primaryText, marginBottom: 2 }}
          numberOfLines={1}
        >
          {titleText}
        </Text>
        <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText, textTransform: "capitalize" }}>
          {day.dayType.replace(/_/g, " ")}
        </Text>
        {day.description && (
          <Text
            style={{ fontSize: 12, color: PROGRESS_COLORS.tertiaryText, marginTop: 2 }}
            numberOfLines={2}
          >
            {day.description}
          </Text>
        )}
      </View>

      <ChevronRight size={16} color={PROGRESS_COLORS.tertiaryText} />
    </Pressable>
  );
}

// --- Main Screen ---

export function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useRoutineDetail(id);
  const router = useRouter();

  const bg = { backgroundColor: PROGRESS_COLORS.screenBackground };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <TrainingSkeleton />
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView className="flex-1" style={bg}>
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const { routine, workoutDays } = data;
  const durationType = getDurationType(routine);
  const completedCount = routine.sessionsCompleted;

  return (
    <SafeAreaView className="flex-1" style={bg}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back + Title */}
        <View>
          <Pressable
            onPress={() => router.back()}
            className="active:opacity-70"
            style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 }}
          >
            <ChevronLeft size={20} color={PROGRESS_COLORS.positive.primary} />
            <Text style={{ fontSize: 14, color: PROGRESS_COLORS.positive.primary, fontWeight: "600" }}>
              Back
            </Text>
          </Pressable>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: PROGRESS_COLORS.primaryText,
              marginBottom: 8,
            }}
          >
            {routine.name}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <StatusBadge status={routine.status} />
          </View>

          {routine.description && (
            <Text style={{ ...METRIC_TYPOGRAPHY.cardSubtitle, color: PROGRESS_COLORS.secondaryText, marginTop: 12 }}>
              {routine.description}
            </Text>
          )}
        </View>

        {/* Stats 2x2 Grid */}
        <View style={{ gap: 12 }}>
          {/* Top Row */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            {/* Progress */}
            <StatCard
              icon={<BarChart3 size={16} color={PROGRESS_COLORS.secondaryText} />}
              label="Progress"
            >
              {durationType === "indefinite" ? (
                <>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: PROGRESS_COLORS.primaryText, marginBottom: 2 }}>
                    {completedCount}
                  </Text>
                  <Text style={{ fontSize: 11, color: PROGRESS_COLORS.tertiaryText }}>
                    {completedCount} {completedCount === 1 ? "session" : "sessions"}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: PROGRESS_COLORS.primaryText, marginBottom: 2 }}>
                    {routine.maxSessions ? Math.round((completedCount / routine.maxSessions) * 100) : 0}%
                  </Text>
                  <Text style={{ fontSize: 11, color: PROGRESS_COLORS.tertiaryText }}>
                    {completedCount} / {routine.maxSessions} sessions
                  </Text>
                </>
              )}
            </StatCard>

            {/* Goal */}
            <StatCard
              icon={<Target size={16} color={PROGRESS_COLORS.secondaryText} />}
              label="Goal"
            >
              <Text style={{ fontSize: 15, fontWeight: "500", color: PROGRESS_COLORS.primaryText }}>
                {routine.goal ? formatGoal(routine.goal) : "Not set"}
              </Text>
            </StatCard>
          </View>

          {/* Bottom Row */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            {/* Duration */}
            <StatCard
              icon={<CalendarDays size={16} color={PROGRESS_COLORS.secondaryText} />}
              label="Duration"
            >
              {durationType === "date_range" && routine.startDate && routine.endDate ? (
                <>
                  <Text style={{ fontSize: 13, fontWeight: "500", color: PROGRESS_COLORS.primaryText, marginBottom: 2 }}>
                    {formatDateShort(routine.startDate)} – {formatDateShort(routine.endDate)}
                  </Text>
                </>
              ) : durationType === "fixed_sessions" ? (
                <>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: PROGRESS_COLORS.primaryText, marginBottom: 2 }}>
                    {routine.maxSessions} sessions
                  </Text>
                  <Text style={{ fontSize: 11, color: PROGRESS_COLORS.tertiaryText }}>
                    Fixed sessions
                  </Text>
                </>
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: "500", color: PROGRESS_COLORS.primaryText }}>
                    Indefinite
                  </Text>
                  <Text style={{ fontSize: 16, color: PROGRESS_COLORS.secondaryText }}>∞</Text>
                </View>
              )}
            </StatCard>

            {/* Steps */}
            <StatCard
              icon={<Footprints size={16} color={PROGRESS_COLORS.secondaryText} />}
              label="Steps"
            >
              {routine.trackSteps && routine.dailyStepsTargetTraining ? (
                <>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: PROGRESS_COLORS.primaryText, marginBottom: 2 }}>
                    {routine.dailyStepsTargetTraining.toLocaleString()}
                  </Text>
                  <Text style={{ fontSize: 11, color: PROGRESS_COLORS.tertiaryText }}>
                    steps per day
                  </Text>
                </>
              ) : (
                <Text style={{ fontSize: 13, color: PROGRESS_COLORS.tertiaryText }}>
                  Not set
                </Text>
              )}
            </StatCard>
          </View>
        </View>

        {/* Workout Days */}
        {workoutDays.length > 0 && (
          <View>
            <Text
              style={{
                ...METRIC_TYPOGRAPHY.cardTitle,
                color: PROGRESS_COLORS.primaryText,
                marginBottom: 12,
              }}
            >
              Workout Days ({workoutDays.length})
            </Text>
            <View style={{ gap: 8 }}>
              {workoutDays.map((day, index) => (
                <WorkoutDayRow
                  key={day.id}
                  day={day}
                  index={index}
                  onPress={() => router.push(`/training/day/${day.id}?routineId=${routine.id}`)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
