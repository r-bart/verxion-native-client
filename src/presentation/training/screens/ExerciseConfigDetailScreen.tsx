import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft, Dumbbell, Clock, Repeat, ListOrdered,
  Info, TrendingDown, Zap, RotateCcw,
} from "lucide-react-native";
import { ErrorState } from "@/presentation/_shared/components/ErrorState";
import { useExerciseConfiguration } from "../hooks/useExerciseConfiguration";
import { TrainingSkeleton } from "../components/TrainingSkeleton";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";
import type { ExerciseConfigSet } from "@/domain/training/models/ExerciseConfiguration";

// --- Set type config ---

const SET_TYPE_META: Record<string, { label: string; color: string; icon: typeof Dumbbell }> = {
  regular: { label: "Regular", color: "#10B981", icon: Dumbbell },
  drop_set: { label: "Drop Set", color: "#EF4444", icon: TrendingDown },
  superset: { label: "Superset", color: "#8B5CF6", icon: Repeat },
  amrap: { label: "AMRAP", color: "#F59E0B", icon: Zap },
  pyramid: { label: "Pyramid", color: "#06B6D4", icon: ListOrdered },
  rest_pause: { label: "Rest-Pause", color: "#EC4899", icon: RotateCcw },
  giant_set: { label: "Giant Set", color: "#F97316", icon: Repeat },
};

// --- Helpers ---

function formatReps(s: ExerciseConfigSet): string {
  if (s.minReps != null && s.maxReps != null && s.minReps !== s.maxReps) {
    return `${s.minReps}-${s.maxReps} reps`;
  }
  if (s.reps != null) return `${s.reps} reps`;
  if (s.maxReps != null) return `${s.maxReps} reps`;
  return "—";
}

function formatWeight(w?: number): string {
  if (w == null) return "";
  return `${w} kg`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

function getConfigArray(config: Record<string, unknown>, key: string): Record<string, unknown>[] | undefined {
  const v = config[key];
  return Array.isArray(v) ? v as Record<string, unknown>[] : undefined;
}

function getConfigNumber(config: Record<string, unknown>, key: string): number | undefined {
  const v = config[key];
  return typeof v === "number" ? v : undefined;
}

function getConfigString(config: Record<string, unknown>, key: string): string | undefined {
  const v = config[key];
  return typeof v === "string" ? v : undefined;
}

function formatRepScheme(rs: Record<string, unknown>): string {
  const min = typeof rs.minReps === "number" ? rs.minReps : undefined;
  const max = typeof rs.maxReps === "number" ? rs.maxReps : undefined;
  if (min != null && max != null && min !== max) return `${min}-${max}`;
  if (max != null) return `${max}`;
  if (min != null) return `${min}`;
  return "—";
}

// --- Shared UI ---

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: PROGRESS_COLORS.cardBackground,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: PROGRESS_COLORS.tertiaryText + "20",
        padding: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
        {icon}
        <Text style={{ fontSize: 14, fontWeight: "600", color: PROGRESS_COLORS.primaryText }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
      <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: "500", color: PROGRESS_COLORS.primaryText }}>{value}</Text>
    </View>
  );
}

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <View
      style={{
        backgroundColor: (color ?? PROGRESS_COLORS.tertiaryText) + "25",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "500", color: color ?? PROGRESS_COLORS.secondaryText }}>{label}</Text>
    </View>
  );
}

// --- Shared sub-components ---

function RepSchemesRow({ config }: { config: Record<string, unknown> }) {
  const repSchemes = getConfigArray(config, "repSchemes");
  if (!repSchemes || repSchemes.length === 0) return null;

  const formatted = repSchemes.map((rs) => formatRepScheme(rs));

  if (formatted.length === 1) {
    return <InfoRow label="Rep range" value={`${formatted[0]} reps`} />;
  }
  return <InfoRow label="Rep ranges" value={formatted.map((r) => `${r}`).join(", ")} />;
}

function CadenceRow({ config }: { config: Record<string, unknown> }) {
  const raw = config.cadence;
  if (!raw || typeof raw !== "object") return null;
  const cadence = raw as Record<string, unknown>;
  const eccentric = typeof cadence.eccentric === "number" ? cadence.eccentric : 0;
  const bottomPause = typeof cadence.bottomPause === "number" ? cadence.bottomPause : 0;
  const concentric = typeof cadence.concentric === "number" ? cadence.concentric : 0;
  const topPause = typeof cadence.topPause === "number" ? cadence.topPause : 0;

  const parts = [eccentric, bottomPause, concentric, topPause];
  if (parts.every((p) => p === 0)) return null;

  return <InfoRow label="Cadence" value={parts.join("-")} />;
}

// --- Type-specific config renderers ---

function RegularConfig({ config }: { config: Record<string, unknown> }) {
  const sets = getConfigNumber(config, "sets");
  const rir = getConfigNumber(config, "rir");
  const weight = getConfigNumber(config, "weight");
  const restBetweenSets = getConfigNumber(config, "restBetweenSets");

  return (
    <>
      {sets != null && <InfoRow label="Sets" value={`${sets}`} />}
      {weight != null && <InfoRow label="Weight" value={formatWeight(weight)} />}
      {rir != null && <InfoRow label="RIR" value={`${rir}`} />}
      <RepSchemesRow config={config} />
      {restBetweenSets != null && <InfoRow label="Rest between sets" value={formatTime(restBetweenSets)} />}
      <CadenceRow config={config} />
    </>
  );
}

function DropSetConfig({ config }: { config: Record<string, unknown> }) {
  const sets = getConfigNumber(config, "sets") ?? getConfigNumber(config, "totalSets");
  const drops = getConfigNumber(config, "drops");
  const initialWeight = getConfigNumber(config, "initialWeight");
  const reduction = getConfigNumber(config, "weightReductionPercentage");
  const rir = getConfigNumber(config, "rir");
  const restDrops = getConfigNumber(config, "restBetweenDrops");
  const restSets = getConfigNumber(config, "restBetweenSets");

  return (
    <>
      {sets != null && <InfoRow label="Sets" value={`${sets}`} />}
      {drops != null && <InfoRow label="Drops per set" value={`${drops}`} />}
      {initialWeight != null && <InfoRow label="Initial weight" value={formatWeight(initialWeight)} />}
      {reduction != null && <InfoRow label="Weight reduction" value={`${reduction}%`} />}
      {rir != null && <InfoRow label="RIR" value={`${rir}`} />}
      <RepSchemesRow config={config} />
      {restDrops != null && <InfoRow label="Rest between drops" value={formatTime(restDrops)} />}
      {restSets != null && <InfoRow label="Rest between sets" value={formatTime(restSets)} />}
      <CadenceRow config={config} />
    </>
  );
}

function AmrapConfig({ config }: { config: Record<string, unknown> }) {
  const sets = getConfigNumber(config, "sets");
  const timeLimit = getConfigNumber(config, "timeLimit");
  const weight = getConfigNumber(config, "weight");
  const targetReps = getConfigNumber(config, "targetReps");
  const minimumReps = getConfigNumber(config, "minimumReps");
  const rir = getConfigNumber(config, "rir");
  const restSets = getConfigNumber(config, "restBetweenSets");

  return (
    <>
      {sets != null && <InfoRow label="Sets" value={`${sets}`} />}
      {timeLimit != null && <InfoRow label="Time limit" value={formatTime(timeLimit)} />}
      {weight != null && <InfoRow label="Weight" value={formatWeight(weight)} />}
      {targetReps != null && <InfoRow label="Target reps" value={`${targetReps}`} />}
      {minimumReps != null && <InfoRow label="Minimum reps" value={`${minimumReps}`} />}
      {rir != null && <InfoRow label="RIR" value={`${rir}`} />}
      {restSets != null && <InfoRow label="Rest between sets" value={formatTime(restSets)} />}
      <CadenceRow config={config} />
    </>
  );
}

function PyramidConfig({ config }: { config: Record<string, unknown> }) {
  const pyramidType = getConfigString(config, "pyramidType") ?? getConfigString(config, "type");
  const stages = getConfigArray(config, "stages");
  const rir = getConfigNumber(config, "rir");
  const restSets = getConfigNumber(config, "restBetweenSets");

  return (
    <>
      {pyramidType && <InfoRow label="Pyramid type" value={pyramidType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())} />}
      {stages && <InfoRow label="Stages" value={`${stages.length}`} />}
      {rir != null && <InfoRow label="RIR" value={`${rir}`} />}
      {restSets != null && <InfoRow label="Rest between sets" value={formatTime(restSets)} />}
      <CadenceRow config={config} />
      {stages && stages.length > 0 && (
        <View style={{ marginTop: 8, gap: 4 }}>
          {stages.map((stage, i) => {
            const w = typeof stage.weight === "number" ? stage.weight : undefined;
            const rep = stage.repScheme && typeof stage.repScheme === "object" ? stage.repScheme as Record<string, unknown> : undefined;
            const repStr = rep ? formatRepScheme(rep) : "—";
            return (
              <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: PROGRESS_COLORS.tertiaryText + "20" }}>
                <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText }}>Stage {i + 1}</Text>
                <Text style={{ fontSize: 12, fontWeight: "500", color: PROGRESS_COLORS.primaryText }}>
                  {repStr} reps{w != null ? ` @ ${w}kg` : ""}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </>
  );
}

function RestPauseConfig({ config }: { config: Record<string, unknown> }) {
  const sets = getConfigNumber(config, "sets") ?? getConfigNumber(config, "totalSets");
  const restPauseSeconds = getConfigNumber(config, "restPauseSeconds");
  const weight = getConfigNumber(config, "weight");
  const rir = getConfigNumber(config, "rir");
  const restSets = getConfigNumber(config, "restBetweenSets");
  const rawMainSet = config.mainSetRepScheme;
  const mainSet = rawMainSet && typeof rawMainSet === "object" ? rawMainSet as Record<string, unknown> : undefined;
  const miniSets = getConfigArray(config, "miniSetRepSchemes");

  const mainRepStr = mainSet ? formatRepScheme(mainSet) : undefined;

  return (
    <>
      {sets != null && <InfoRow label="Sets" value={`${sets}`} />}
      {weight != null && <InfoRow label="Weight" value={formatWeight(weight)} />}
      {mainRepStr && <InfoRow label="Main set reps" value={mainRepStr} />}
      {miniSets && miniSets.length > 0 && (
        <InfoRow label="Mini sets" value={miniSets.map(ms => formatRepScheme(ms)).join(", ")} />
      )}
      {restPauseSeconds != null && <InfoRow label="Rest-pause interval" value={formatTime(restPauseSeconds)} />}
      {rir != null && <InfoRow label="RIR" value={`${rir}`} />}
      {restSets != null && <InfoRow label="Rest between sets" value={formatTime(restSets)} />}
      <CadenceRow config={config} />
    </>
  );
}

function MultiExerciseConfig({ config }: { config: Record<string, unknown> }) {
  const totalRounds = getConfigNumber(config, "totalRounds") ?? getConfigNumber(config, "rounds");
  const exercises = getConfigArray(config, "exercises");
  const restExercises = getConfigNumber(config, "restBetweenExercises");
  const restRounds = getConfigNumber(config, "restBetweenRounds") ?? getConfigNumber(config, "restBetweenSets");

  return (
    <>
      {totalRounds != null && <InfoRow label="Rounds" value={`${totalRounds}`} />}
      {exercises && <InfoRow label="Exercises" value={`${exercises.length}`} />}
      {restExercises != null && <InfoRow label="Rest between exercises" value={formatTime(restExercises)} />}
      {restRounds != null && <InfoRow label="Rest between rounds" value={formatTime(restRounds)} />}
      {exercises && exercises.length > 0 && (
        <View style={{ marginTop: 8, gap: 4 }}>
          {exercises.map((ex, i) => {
            const name = typeof ex.name === "string" ? ex.name : `Exercise ${(typeof ex.order === "number" ? ex.order : i) + 1}`;
            const exConfig = ex.configuration as Record<string, unknown> | undefined;
            const w = exConfig && typeof exConfig.weight === "number" ? exConfig.weight : undefined;
            const rir = exConfig && typeof exConfig.rir === "number" ? exConfig.rir : undefined;
            return (
              <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: PROGRESS_COLORS.tertiaryText + "20" }}>
                <Text style={{ fontSize: 12, color: PROGRESS_COLORS.primaryText, flex: 1 }} numberOfLines={1}>{name}</Text>
                <Text style={{ fontSize: 11, color: PROGRESS_COLORS.secondaryText }}>
                  {[w != null ? `${w}kg` : null, rir != null ? `RIR ${rir}` : null].filter(Boolean).join(" · ") || "—"}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </>
  );
}

function ConfigRenderer({ exerciseType, config }: { exerciseType: string; config: Record<string, unknown> }) {
  switch (exerciseType) {
    case "regular":
      return <RegularConfig config={config} />;
    case "drop_set":
      return <DropSetConfig config={config} />;
    case "amrap":
      return <AmrapConfig config={config} />;
    case "pyramid":
      return <PyramidConfig config={config} />;
    case "rest_pause":
      return <RestPauseConfig config={config} />;
    case "superset":
    case "giant_set":
      return <MultiExerciseConfig config={config} />;
    default:
      return <RegularConfig config={config} />;
  }
}

// --- Sets Breakdown ---

function SetsBreakdown({ sets }: { sets: ExerciseConfigSet[] }) {
  if (sets.length === 0) return null;

  return (
    <SectionCard
      title={`${sets.length} ${sets.length === 1 ? "Set" : "Sets"}`}
      icon={<ListOrdered size={16} color={PROGRESS_COLORS.secondaryText} />}
    >
      <View style={{ gap: 2 }}>
        {sets.map((s, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 8,
              borderTopWidth: i > 0 ? 1 : 0,
              borderTopColor: PROGRESS_COLORS.tertiaryText + "20",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: PROGRESS_COLORS.tertiaryText + "30",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "600", color: PROGRESS_COLORS.secondaryText }}>
                  {s.setNumber}
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: PROGRESS_COLORS.primaryText }}>{formatReps(s)}</Text>
            </View>
            <Text style={{ fontSize: 12, color: PROGRESS_COLORS.secondaryText }}>
              {[
                s.weight != null ? formatWeight(s.weight) : null,
                s.rir != null ? `RIR ${s.rir}` : null,
              ]
                .filter(Boolean)
                .join(" · ") || ""}
            </Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

// --- Main Screen ---

export function ExerciseConfigDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const wdeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useExerciseConfiguration(wdeId);

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

  const typeMeta = SET_TYPE_META[data.exerciseType] ?? SET_TYPE_META.regular;
  const TypeIcon = typeMeta.icon;
  const instructions = data.metadata.instructions?.split("\n").filter(Boolean) ?? [];

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
            <Text style={{ fontSize: 14, color: PROGRESS_COLORS.positive.primary, fontWeight: "600" }}>Back</Text>
          </Pressable>

          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: PROGRESS_COLORS.primaryText,
              marginBottom: 10,
            }}
          >
            {data.metadata.name}
          </Text>

          {/* Set type badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: typeMeta.color + "20",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              alignSelf: "flex-start",
            }}
          >
            <TypeIcon size={14} color={typeMeta.color} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: typeMeta.color }}>{typeMeta.label}</Text>
          </View>
        </View>

        {/* Muscles + Equipment */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Badge label={data.metadata.target} color="#10B981" />
          <Badge label={data.metadata.equipment} color="#3B82F6" />
        </View>

        {/* Configuration */}
        <SectionCard
          title="Configuration"
          icon={<TypeIcon size={16} color={typeMeta.color} />}
        >
          <ConfigRenderer exerciseType={data.exerciseType} config={data.configuration} />
        </SectionCard>

        {/* Sets Breakdown */}
        {data.sets.length > 0 && <SetsBreakdown sets={data.sets} />}

        {/* Rest between exercises */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: PROGRESS_COLORS.cardBackground,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: PROGRESS_COLORS.tertiaryText + "20",
            padding: 16,
          }}
        >
          <Clock size={16} color={PROGRESS_COLORS.secondaryText} />
          <Text style={{ fontSize: 13, color: PROGRESS_COLORS.secondaryText }}>Rest before next exercise</Text>
          <Text style={{ fontSize: 14, fontWeight: "600", color: PROGRESS_COLORS.primaryText, marginLeft: "auto" }}>
            {formatTime(data.restBetweenExercises ?? 0)}
          </Text>
        </View>

        {/* Instructions */}
        {instructions.length > 0 && (
          <SectionCard
            title="Instructions"
            icon={<Info size={16} color={PROGRESS_COLORS.secondaryText} />}
          >
            <View style={{ gap: 10 }}>
              {instructions.map((instruction, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 10 }}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: PROGRESS_COLORS.tertiaryText + "30",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "600", color: PROGRESS_COLORS.secondaryText }}>
                      {i + 1}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, color: PROGRESS_COLORS.primaryText, flex: 1, lineHeight: 20 }}>
                    {instruction}
                  </Text>
                </View>
              ))}
            </View>
          </SectionCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
