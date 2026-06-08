/**
 * DietasScreen — "Dietas": the read-only library of diets the agent has built.
 * Browse mode groups by state (active · the completed archive); search / filter /
 * sort flip it into a flat results list. Creating or activating a diet is the
 * agent's job — the foot surface frames it as a request to verxion, never a write.
 * Reads the curated `GET /nutrition/diet-library` once; all browsing is local.
 * Nutrition mirror of `RutinasScreen`.
 */
import { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
} from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";
import { BottomSheet } from "@/presentation/_shared/components/BottomSheet";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { useDietLibrary } from "../hooks/useDietLibrary";
import { useDietLibraryView, type DietSort } from "../hooks/useDietLibraryView";
import { goalLabel } from "../lib/labels";
import { DietLibraryCard } from "../components/DietLibraryCard";
import { DietArchiveRow } from "../components/DietArchiveRow";

const SORTS: DietSort[] = ["recent", "name", "adherence", "kcal"];

/** The filter/sort trigger pill — a translucent glass pill with a leading icon +
 *  label and an optional lava count badge. Local to keep the screen self-contained
 *  (no cross-feature import). Per CLAUDE.md, equal-width pills get `flex:1` on a
 *  plain wrapper View around this, never on the Pressable's style callback. */
function TriggerPill({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 9999,
          backgroundColor: glass.fill2,
          borderWidth: 1,
          borderColor: glass.stroke,
        }}
      >
        {icon}
        <Text
          numberOfLines={1}
          style={{ fontFamily: sans(600), fontSize: 13, color: glass.white }}
        >
          {label}
        </Text>
        {badge != null && badge > 0 && (
          <View
            style={{
              minWidth: 17,
              height: 17,
              paddingHorizontal: 4,
              borderRadius: 9999,
              backgroundColor: glass.lava,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{ fontFamily: sans(700), fontSize: 10.5, color: glass.fgOnLava }}
            >
              {badge}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function BackButton() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.back()}
      accessibilityRole="button"
      accessibilityLabel={t("common.back")}
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface
        radius={19}
        style={{
          width: 38,
          height: 38,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronLeft size={20} color={glass.white} strokeWidth={2} />
      </GlassSurface>
    </Pressable>
  );
}

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
        <Text style={{ fontFamily: sans(600), fontSize: 12, color: glass.lava }}>
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
          <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}>
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
        style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 13 }}
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
          <Text style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }}>
            {t("nutrition.dietas.ask.title")}
          </Text>
          <Text
            style={{
              fontFamily: mono(400),
              fontSize: 11.5,
              color: glass.ink2,
              lineHeight: 16,
            }}
          >
            {t("nutrition.dietas.ask.body")}
          </Text>
        </View>
        <ChevronRight size={18} color="rgba(255,255,255,0.28)" strokeWidth={2} />
      </GlassSurface>
    </Pressable>
  );
}

function Header() {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        gap: 12,
      }}
    >
      <BackButton />
      <Text
        style={{
          fontFamily: sans(700),
          fontSize: 19,
          color: glass.white,
          letterSpacing: -0.4,
        }}
      >
        {t("nutrition.dietas.title")}
      </Text>
    </View>
  );
}

export function DietasScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useDietLibrary();
  const view = useDietLibraryView(data);
  const [sheet, setSheet] = useState<"filter" | "sort" | null>(null);
  const refresh = usePullToRefresh(refetch);

  const contentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: insets.bottom + 64,
      flexGrow: 1,
    }),
    [insets.bottom]
  );

  let body: React.ReactNode;

  if (isLoading) {
    body = (
      <View style={{ gap: 12, paddingTop: 8 }}>
        <SkeletonBlock radius={14} height={44} />
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} radius={20} height={150} />
        ))}
      </View>
    );
  } else if (isError || !data) {
    body = (
      <EmptyState
        icon={<UtensilsCrossed size={30} color={glass.ink2} strokeWidth={1.8} />}
        title={t("nutrition.error.title")}
        body={t("nutrition.error.body")}
      />
    );
  } else {
    const sections = [{ key: "active" as const, items: view.groups.active }];
    const resultCount = view.results.length;

    body = (
      <>
        <View style={{ gap: 6, paddingTop: 4, paddingBottom: 14 }}>
          <Text
            style={{
              fontFamily: sans(700),
              fontSize: 22,
              color: glass.white,
              letterSpacing: -0.5,
            }}
          >
            {t("nutrition.dietas.lead", { count: data.diets.length })}
          </Text>
          <Text
            style={{
              fontFamily: mono(400),
              fontSize: 12.5,
              color: glass.ink2,
              lineHeight: 18,
            }}
          >
            {t("nutrition.dietas.subtitle")}
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
            placeholder={t("nutrition.dietas.search")}
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
            <TriggerPill
              icon={
                <SlidersHorizontal size={15} color={glass.ink2} strokeWidth={2} />
              }
              label={t("nutrition.dietas.filterTitle")}
              badge={view.filterCount}
              onPress={() => setSheet("filter")}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TriggerPill
              icon={<ArrowUpDown size={15} color={glass.ink2} strokeWidth={2} />}
              label={t(`nutrition.dietas.sort.${view.sort}`)}
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
                label={t(`nutrition.dietas.stateLabel.${s}`)}
                onRemove={() => view.toggleState(s)}
              />
            ))}
            {view.goals.map((g) => (
              <RemovableChip
                key={`g:${g}`}
                label={goalLabel(g, t)}
                onRemove={() => view.toggleGoal(g)}
              />
            ))}
          </View>
        )}

        <View style={{ marginTop: 18 }}>
          {data.diets.length === 0 ? (
            <GlassSurface
              radius={18}
              style={{ padding: 26, alignItems: "center", gap: 8 }}
            >
              <Sparkles size={24} color={glass.lava} strokeWidth={1.8} />
              <Text
                style={{ fontFamily: sans(700), fontSize: 15, color: glass.white }}
              >
                {t("nutrition.dietas.empty.title")}
              </Text>
              <Text
                style={{
                  fontFamily: mono(400),
                  fontSize: 12,
                  color: glass.ink2,
                  textAlign: "center",
                  lineHeight: 17,
                }}
              >
                {t("nutrition.dietas.empty.body")}
              </Text>
            </GlassSurface>
          ) : view.filtering ? (
            <>
              <SectionLabel>
                {resultCount === 1
                  ? t("nutrition.dietas.resultsOne", { count: resultCount })
                  : t("nutrition.dietas.results", { count: resultCount })}
              </SectionLabel>
              {resultCount === 0 ? (
                <GlassSurface
                  radius={18}
                  style={{ padding: 26, alignItems: "center", gap: 8 }}
                >
                  <Search size={24} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
                  <Text
                    style={{
                      fontFamily: sans(700),
                      fontSize: 15,
                      color: glass.white,
                    }}
                  >
                    {t("nutrition.dietas.noResults")}
                  </Text>
                  <Text
                    style={{
                      fontFamily: mono(400),
                      fontSize: 12,
                      color: glass.ink2,
                      textAlign: "center",
                    }}
                  >
                    {t("nutrition.dietas.noResultsBody")}
                  </Text>
                </GlassSurface>
              ) : (
                <View style={{ gap: 12 }}>
                  {view.results.map((d) =>
                    d.state === "completed" ? (
                      <DietArchiveRow key={d.id} item={d} />
                    ) : (
                      <DietLibraryCard key={d.id} item={d} />
                    )
                  )}
                </View>
              )}
            </>
          ) : (
            <>
              {sections.map(
                (sec) =>
                  sec.items.length > 0 && (
                    <View key={sec.key}>
                      <SectionLabel>
                        {t(`nutrition.dietas.sections.${sec.key}`)}
                      </SectionLabel>
                      <View style={{ gap: 12 }}>
                        {sec.items.map((d) => (
                          <DietLibraryCard key={d.id} item={d} />
                        ))}
                      </View>
                    </View>
                  )
              )}
              {(view.groups.draft.length > 0 || view.groups.paused.length > 0) && (
                <View style={{ gap: 12, marginTop: view.groups.active.length ? 22 : 0 }}>
                  {[...view.groups.draft, ...view.groups.paused].map((d) => (
                    <DietLibraryCard key={d.id} item={d} />
                  ))}
                </View>
              )}
              {view.groups.completed.length > 0 && (
                <>
                  <SectionLabel spaced>
                    {t("nutrition.dietas.sections.completed")}
                  </SectionLabel>
                  <View style={{ gap: 8 }}>
                    {view.groups.completed.map((d) => (
                      <DietArchiveRow key={d.id} item={d} />
                    ))}
                  </View>
                </>
              )}
            </>
          )}
        </View>

        <AskAgentSurface />
      </>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Header />
        <ScrollView
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          refreshControl={<GlassRefreshControl {...refresh} />}
        >
          {body}
        </ScrollView>
      </SafeAreaView>

      <BottomSheet
        visible={sheet === "filter"}
        onClose={() => setSheet(null)}
        title={t("nutrition.dietas.filterTitle")}
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
          {t("nutrition.dietas.stateSection")}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(data?.facets.states ?? []).map((s) => (
            <FilterChip
              key={s}
              label={t(`nutrition.dietas.stateLabel.${s}`)}
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
          {t("nutrition.dietas.goalSection")}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(data?.facets.goals ?? []).map((g) => (
            <FilterChip
              key={g}
              label={goalLabel(g, t)}
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
              <Text style={{ fontFamily: sans(600), fontSize: 14, color: glass.ink2 }}>
                {t("nutrition.dietas.clearAll")}
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
                style={{ fontFamily: sans(700), fontSize: 14, color: glass.fgOnLava }}
              >
                {view.results.length === 1
                  ? t("nutrition.dietas.applyOne", { count: view.results.length })
                  : t("nutrition.dietas.apply", { count: view.results.length })}
              </Text>
            </View>
          </Pressable>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={sheet === "sort"}
        onClose={() => setSheet(null)}
        title={t("nutrition.dietas.sortTitle")}
      >
        {SORTS.map((s) => (
          <SortRow
            key={s}
            label={t(`nutrition.dietas.sort.${s}`)}
            hint={t(`nutrition.dietas.sortHint.${s}`)}
            selected={view.sort === s}
            onPress={() => {
              view.setSort(s);
              setSheet(null);
            }}
          />
        ))}
      </BottomSheet>
    </View>
  );
}
