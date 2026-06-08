/**
 * RutinasScreen — "Todas las rutinas": the read-only library of routines the
 * agent has built. Browse mode groups by state (active · draft · paused · the
 * completed archive); search / filter / sort flip it into a flat results list.
 * Creating or activating a routine is the agent's job — the foot surface frames
 * it as a request to verxion, never a write.
 */
import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Check,
  Sparkles,
  ChevronRight,
} from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";
import { BottomSheet } from "@/presentation/_shared/components/BottomSheet";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { DetailScaffold } from "../components/DetailScaffold";
import { FilterPill } from "../components/FilterPill";
import { SegmentError } from "../components/SegmentError";
import { RoutineLibraryCard } from "../components/RoutineLibraryCard";
import { RoutineArchiveRow } from "../components/RoutineArchiveRow";
import { useRoutineLibrary } from "../hooks/useRoutineLibrary";
import {
  useRoutineLibraryView,
  type RoutineSort,
} from "../hooks/useRoutineLibraryView";

const SORTS: RoutineSort[] = ["recent", "name", "adherence"];

function RemovableChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Pressable
      onPress={onRemove}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          paddingLeft: 11,
          paddingRight: 8,
          paddingVertical: 6,
          borderRadius: 9999,
          backgroundColor: glass.lavaBg,
          borderWidth: 1,
          borderColor: glass.lavaBorder,
        }}
      >
        <Text
          style={{ fontFamily: sans(600), fontSize: 12, color: glass.lava }}
        >
          {label}
        </Text>
        <X size={13} color={glass.lava} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          paddingHorizontal: 13,
          paddingVertical: 9,
          borderRadius: 9999,
          backgroundColor: selected ? glass.lavaBg : glass.fill,
          borderWidth: 1,
          borderColor: selected ? glass.lavaBorder : glass.stroke,
        }}
      >
        {selected && <Check size={13} color={glass.lava} strokeWidth={2.6} />}
        <Text
          style={{
            fontFamily: sans(selected ? 600 : 500),
            fontSize: 13,
            color: selected ? glass.lava : glass.ink2,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function SortRow({
  label,
  hint,
  selected,
  onPress,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 11,
          paddingHorizontal: 14,
          borderRadius: 14,
          backgroundColor: selected ? glass.lavaBg : "transparent",
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              fontFamily: sans(selected ? 600 : 500),
              fontSize: 15,
              color: selected ? glass.white : glass.ink2,
            }}
          >
            {label}
          </Text>
          <Text
            style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}
          >
            {hint}
          </Text>
        </View>
        {selected && <Check size={18} color={glass.lava} strokeWidth={2.5} />}
      </View>
    </Pressable>
  );
}

function SectionLabel({
  children,
  spaced,
}: {
  children: string;
  spaced?: boolean;
}) {
  return (
    <Text
      style={{
        fontFamily: mono(600),
        fontSize: 11,
        letterSpacing: 0.6,
        color: glass.ink2,
        textTransform: "uppercase",
        marginTop: spaced ? 22 : 0,
        marginBottom: 10,
      }}
    >
      {children}
    </Text>
  );
}

function AskAgentSurface() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push("/agent" as Href)}
      accessibilityRole="button"
      style={({ pressed }) => ({
        opacity: pressed ? glass.pressOpacity : 1,
        marginTop: 32,
      })}
    >
      <GlassSurface
        radius={18}
        style={{
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 13,
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: glass.lavaBg,
            borderWidth: 1,
            borderColor: glass.lavaBorder,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={18} color={glass.lava} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text
            style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }}
          >
            {t("training.routineLibrary.ask.title")}
          </Text>
          <Text
            style={{
              fontFamily: mono(400),
              fontSize: 11.5,
              color: glass.ink2,
              lineHeight: 16,
            }}
          >
            {t("training.routineLibrary.ask.body")}
          </Text>
        </View>
        <ChevronRight
          size={18}
          color="rgba(255,255,255,0.28)"
          strokeWidth={2}
        />
      </GlassSurface>
    </Pressable>
  );
}

export function RutinasScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useRoutineLibrary();
  const view = useRoutineLibraryView(data);
  const [sheet, setSheet] = useState<"filter" | "sort" | null>(null);
  const refresh = usePullToRefresh(refetch);

  if (isLoading) {
    return (
      <DetailScaffold title={t("training.screens.routines")}>
        <View style={{ gap: 12, paddingTop: 8 }}>
          <SkeletonBlock radius={14} height={44} />
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} radius={20} height={150} />
          ))}
        </View>
      </DetailScaffold>
    );
  }
  if (isError || !data) {
    return (
      <DetailScaffold title={t("training.screens.routines")}>
        <View style={{ paddingTop: 8 }}>
          <SegmentError onRetry={() => refetch()} />
        </View>
      </DetailScaffold>
    );
  }

  const sections = [
    { key: "active" as const, items: view.groups.active },
    { key: "draft" as const, items: view.groups.draft },
    { key: "paused" as const, items: view.groups.paused },
  ];
  const resultCount = view.results.length;

  return (
    <DetailScaffold title={t("training.screens.routines")} refreshControl={<GlassRefreshControl {...refresh} />}>
      <View style={{ gap: 6, paddingTop: 4, paddingBottom: 14 }}>
        <Text
          style={{
            fontFamily: sans(700),
            fontSize: 22,
            color: glass.white,
            letterSpacing: -0.5,
          }}
        >
          {t("training.routineLibrary.lead", { count: data.routines.length })}
        </Text>
        <Text
          style={{
            fontFamily: mono(400),
            fontSize: 12.5,
            color: glass.ink2,
            lineHeight: 18,
          }}
        >
          {t("training.routineLibrary.subtitle")}
        </Text>
      </View>

      <GlassSurface
        radius={14}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 9,
          paddingHorizontal: 14,
          height: 44,
          marginBottom: 12,
        }}
      >
        <Search size={17} color={glass.ink3} strokeWidth={2} />
        <TextInput
          value={view.query}
          onChangeText={view.setQuery}
          placeholder={t("training.routineLibrary.search")}
          placeholderTextColor={glass.ink3}
          style={{
            flex: 1,
            fontFamily: sans(500),
            fontSize: 14,
            color: glass.white,
          }}
        />
        {view.query !== "" && (
          <Pressable
            onPress={() => view.setQuery("")}
            accessibilityRole="button"
            accessibilityLabel={t("common.close")}
            hitSlop={8}
          >
            <X size={15} color={glass.ink3} strokeWidth={2} />
          </Pressable>
        )}
      </GlassSurface>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <FilterPill
            icon={
              <SlidersHorizontal size={15} color={glass.ink2} strokeWidth={2} />
            }
            label={t("training.routineLibrary.filterTitle")}
            badge={view.filterCount}
            onPress={() => setSheet("filter")}
          />
        </View>
        <View style={{ flex: 1 }}>
          <FilterPill
            icon={<ArrowUpDown size={15} color={glass.ink2} strokeWidth={2} />}
            label={t(`training.routineSort.${view.sort}`)}
            onPress={() => setSheet("sort")}
          />
        </View>
      </View>

      {(view.states.length > 0 || view.goals.length > 0) && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 12,
          }}
        >
          {view.states.map((s) => (
            <RemovableChip
              key={`s:${s}`}
              label={t(`training.routineLibrary.stateLabel.${s}`)}
              onRemove={() => view.toggleState(s)}
            />
          ))}
          {view.goals.map((g) => (
            <RemovableChip
              key={`g:${g}`}
              label={g}
              onRemove={() => view.toggleGoal(g)}
            />
          ))}
        </View>
      )}

      <View style={{ marginTop: 18 }}>
        {view.filtering ? (
          <>
            <SectionLabel>
              {resultCount === 1
                ? t("training.routineLibrary.resultsOne", {
                    count: resultCount,
                  })
                : t("training.routineLibrary.results", { count: resultCount })}
            </SectionLabel>
            {resultCount === 0 ? (
              <GlassSurface
                radius={18}
                style={{ padding: 26, alignItems: "center", gap: 8 }}
              >
                <Search
                  size={24}
                  color="rgba(255,255,255,0.3)"
                  strokeWidth={1.8}
                />
                <Text
                  style={{
                    fontFamily: sans(700),
                    fontSize: 15,
                    color: glass.white,
                  }}
                >
                  {t("training.routineLibrary.noResults")}
                </Text>
                <Text
                  style={{
                    fontFamily: mono(400),
                    fontSize: 12,
                    color: glass.ink2,
                    textAlign: "center",
                  }}
                >
                  {t("training.routineLibrary.noResultsBody")}
                </Text>
              </GlassSurface>
            ) : (
              <View style={{ gap: 12 }}>
                {view.results.map((r) => (
                  <RoutineLibraryCard key={r.id} item={r} />
                ))}
              </View>
            )}
          </>
        ) : data.routines.length === 0 ? (
          <GlassSurface
            radius={18}
            style={{ padding: 26, alignItems: "center", gap: 8 }}
          >
            <Sparkles size={24} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
            <Text
              style={{ fontFamily: sans(700), fontSize: 15, color: glass.white }}
            >
              {t("training.routineLibrary.emptyLibrary")}
            </Text>
            <Text
              style={{
                fontFamily: mono(400),
                fontSize: 12,
                color: glass.ink2,
                textAlign: "center",
              }}
            >
              {t("training.routineLibrary.emptyLibraryBody")}
            </Text>
          </GlassSurface>
        ) : (
          <>
            {sections.map(
              (sec) =>
                sec.items.length > 0 && (
                  <View key={sec.key}>
                    <SectionLabel spaced={sec.key !== "active"}>
                      {t(`training.routineLibrary.sections.${sec.key}`)}
                    </SectionLabel>
                    <View style={{ gap: 12 }}>
                      {sec.items.map((r) => (
                        <RoutineLibraryCard key={r.id} item={r} />
                      ))}
                    </View>
                  </View>
                )
            )}
            {view.groups.completed.length > 0 && (
              <>
                <SectionLabel spaced>
                  {t("training.routineLibrary.sections.completed")}
                </SectionLabel>
                <View style={{ gap: 8 }}>
                  {view.groups.completed.map((r) => (
                    <RoutineArchiveRow key={r.id} item={r} />
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </View>

      <AskAgentSurface />

      <BottomSheet
        visible={sheet === "filter"}
        onClose={() => setSheet(null)}
        title={t("training.routineLibrary.filterTitle")}
      >
        <Text
          style={{
            fontFamily: mono(600),
            fontSize: 10,
            letterSpacing: 0.8,
            color: glass.ink3,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {t("training.routineLibrary.stateSection")}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {data.facets.states.map((s) => (
            <FilterChip
              key={s}
              label={t(`training.routineLibrary.stateLabel.${s}`)}
              selected={view.states.includes(s)}
              onPress={() => view.toggleState(s)}
            />
          ))}
        </View>

        <Text
          style={{
            fontFamily: mono(600),
            fontSize: 10,
            letterSpacing: 0.8,
            color: glass.ink3,
            textTransform: "uppercase",
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          {t("training.routineLibrary.goalSection")}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {data.facets.goals.map((g) => (
            <FilterChip
              key={g}
              label={g}
              selected={view.goals.includes(g)}
              onPress={() => view.toggleGoal(g)}
            />
          ))}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginTop: 20,
          }}
        >
          {view.filterCount > 0 && (
            <Pressable
              onPress={view.clearFilters}
              accessibilityRole="button"
              style={({ pressed }) => ({
                opacity: pressed ? glass.pressOpacity : 1,
                paddingVertical: 13,
                paddingHorizontal: 16,
              })}
            >
              <Text
                style={{
                  fontFamily: sans(600),
                  fontSize: 14,
                  color: glass.ink2,
                }}
              >
                {t("training.routineLibrary.clearAll")}
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setSheet(null)}
            accessibilityRole="button"
            style={({ pressed }) => ({
              flex: 1,
              opacity: pressed ? glass.pressOpacity : 1,
            })}
          >
            <View
              style={{
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: glass.lava,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: sans(700),
                  fontSize: 14,
                  color: glass.fgOnLava,
                }}
              >
                {resultCount === 1
                  ? t("training.routineLibrary.applyOne", {
                      count: resultCount,
                    })
                  : t("training.routineLibrary.apply", { count: resultCount })}
              </Text>
            </View>
          </Pressable>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={sheet === "sort"}
        onClose={() => setSheet(null)}
        title={t("training.routineLibrary.sortTitle")}
      >
        {SORTS.map((s) => (
          <SortRow
            key={s}
            label={t(`training.routineSort.${s}`)}
            hint={t(`training.routineLibrary.sortHint.${s}`)}
            selected={view.sort === s}
            onPress={() => {
              view.setSort(s);
              setSheet(null);
            }}
          />
        ))}
      </BottomSheet>
    </DetailScaffold>
  );
}
