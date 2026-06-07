/**
 * ProgramLibraryScreen — "Programas": the read-only library of programs the agent
 * has built, grouped by state (en curso · en pausa · borradores · archivo).
 * Search + sort flip it into a flat results list. Creating / activating a program
 * is the agent's job — the foot surface frames it as a request to verxion, never
 * a write. Reads the curated library once; browsing is local. Mirrors `DietasScreen`.
 */
import { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import {
  Search,
  ArrowUpDown,
  X,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { BottomSheet } from "@/presentation/_shared/components/BottomSheet";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { usePrograms } from "../hooks/usePrograms";
import { useProgramLibraryView, type ProgramSort } from "../hooks/useProgramLibraryView";
import { ProgramLibraryCard } from "../components/ProgramLibraryCard";
import { ProgramArchiveRow } from "../components/ProgramArchiveRow";

const SORTS: ProgramSort[] = ["recent", "name", "adherence"];

function BackButton() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.push("/today" as Href))}
      accessibilityRole="button"
      accessibilityLabel={t("common.back")}
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface radius={19} style={{ width: 38, height: 38, alignItems: "center", justifyContent: "center" }}>
        <ChevronLeft size={20} color={glass.white} strokeWidth={2} />
      </GlassSurface>
    </Pressable>
  );
}

function SectionLabel({ children, spaced }: { children: string; spaced?: boolean }) {
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

function SortRow({ label, hint, selected, onPress }: { label: string; hint: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }} style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 11, paddingHorizontal: 14, borderRadius: 14, backgroundColor: selected ? glass.lavaBg : "transparent" }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: sans(selected ? 600 : 500), fontSize: 15, color: selected ? glass.white : glass.ink2 }}>{label}</Text>
          <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}>{hint}</Text>
        </View>
        {selected && <Check size={18} color={glass.lava} strokeWidth={2.5} />}
      </View>
    </Pressable>
  );
}

function AskAgentSurface() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push("/agent" as Href)} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1, marginTop: 32 })}>
      <GlassSurface radius={18} style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 13 }}>
        <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: glass.lavaBg, borderWidth: 1, borderColor: glass.lavaBorder, alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={18} color={glass.lava} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }}>{t("program.ask.title")}</Text>
          <Text style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink2, lineHeight: 16 }}>{t("program.ask.body")}</Text>
        </View>
        <ChevronRight size={18} color="rgba(255,255,255,0.28)" strokeWidth={2} />
      </GlassSurface>
    </Pressable>
  );
}

export function ProgramLibraryScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = usePrograms();
  const view = useProgramLibraryView(data);
  const [sheet, setSheet] = useState(false);
  const refresh = usePullToRefresh(refetch);

  let body: React.ReactNode;

  if (isLoading) {
    body = (
      <View style={{ gap: 12, paddingTop: 8 }}>
        <GlassSurface radius={14} style={{ height: 44 }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassSurface key={i} radius={20} style={{ height: 168 }} />
        ))}
      </View>
    );
  } else if (isError || !data) {
    body = (
      <EmptyState
        icon={<LayoutGrid size={30} color={glass.ink2} strokeWidth={1.8} />}
        title={t("program.error.title")}
        body={t("program.error.body")}
      />
    );
  } else {
    const resultCount = view.results.length;
    body = (
      <>
        <View style={{ gap: 6, paddingTop: 4, paddingBottom: 14 }}>
          <Text style={{ fontFamily: sans(700), fontSize: 22, color: glass.white, letterSpacing: -0.5 }}>
            {t("program.lead", { count: view.total })}
          </Text>
          <Text style={{ fontFamily: mono(400), fontSize: 12.5, color: glass.ink2, lineHeight: 18 }}>
            {t("program.subtitle")}
          </Text>
        </View>

        <GlassSurface radius={14} style={{ flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 14, height: 44, marginBottom: 12 }}>
          <Search size={17} color={glass.ink3} strokeWidth={2} />
          <TextInput
            value={view.query}
            onChangeText={view.setQuery}
            placeholder={t("program.search")}
            placeholderTextColor={glass.ink3}
            style={{ flex: 1, fontFamily: sans(500), fontSize: 14, color: glass.white }}
          />
          {view.query !== "" && (
            <Pressable onPress={() => view.setQuery("")} accessibilityRole="button" accessibilityLabel={t("common.close")} hitSlop={8}>
              <X size={15} color={glass.ink3} strokeWidth={2} />
            </Pressable>
          )}
        </GlassSurface>

        <Pressable onPress={() => setSheet(true)} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 9999, backgroundColor: glass.fill2, borderWidth: 1, borderColor: glass.stroke }}>
            <ArrowUpDown size={15} color={glass.ink2} strokeWidth={2} />
            <Text numberOfLines={1} style={{ fontFamily: sans(600), fontSize: 13, color: glass.white }}>
              {t(`program.sort.${view.sort}`)}
            </Text>
          </View>
        </Pressable>

        <View style={{ marginTop: 18 }}>
          {view.total === 0 ? (
            <GlassSurface radius={18} style={{ padding: 26, alignItems: "center", gap: 8 }}>
              <Sparkles size={24} color={glass.lava} strokeWidth={1.8} />
              <Text style={{ fontFamily: sans(700), fontSize: 15, color: glass.white }}>{t("program.empty.title")}</Text>
              <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink2, textAlign: "center", lineHeight: 17 }}>{t("program.empty.body")}</Text>
            </GlassSurface>
          ) : view.filtering ? (
            <>
              <SectionLabel>
                {resultCount === 1 ? t("program.resultsOne", { count: resultCount }) : t("program.results", { count: resultCount })}
              </SectionLabel>
              {resultCount === 0 ? (
                <GlassSurface radius={18} style={{ padding: 26, alignItems: "center", gap: 8 }}>
                  <Search size={24} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
                  <Text style={{ fontFamily: sans(700), fontSize: 15, color: glass.white }}>{t("program.noResults")}</Text>
                  <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink2, textAlign: "center" }}>{t("program.noResultsBody")}</Text>
                </GlassSurface>
              ) : (
                <View style={{ gap: 12 }}>
                  {view.results.map((p) =>
                    p.status === "completed" ? <ProgramArchiveRow key={p.id} program={p} /> : <ProgramLibraryCard key={p.id} program={p} />,
                  )}
                </View>
              )}
            </>
          ) : (
            <>
              {view.groups.active.length > 0 && (
                <View>
                  <SectionLabel>{t("program.sections.active")}</SectionLabel>
                  <View style={{ gap: 12 }}>
                    {view.groups.active.map((p) => <ProgramLibraryCard key={p.id} program={p} />)}
                  </View>
                </View>
              )}
              {view.groups.paused.length > 0 && (
                <View>
                  <SectionLabel spaced={view.groups.active.length > 0}>{t("program.sections.paused")}</SectionLabel>
                  <View style={{ gap: 12 }}>
                    {view.groups.paused.map((p) => <ProgramLibraryCard key={p.id} program={p} />)}
                  </View>
                </View>
              )}
              {view.groups.draft.length > 0 && (
                <View>
                  <SectionLabel spaced={view.groups.active.length + view.groups.paused.length > 0}>{t("program.sections.draft")}</SectionLabel>
                  <View style={{ gap: 12 }}>
                    {view.groups.draft.map((p) => <ProgramLibraryCard key={p.id} program={p} />)}
                  </View>
                </View>
              )}
              {view.groups.completed.length > 0 && (
                <>
                  <SectionLabel spaced>{t("program.sections.completed")}</SectionLabel>
                  <View style={{ gap: 8 }}>
                    {view.groups.completed.map((p) => <ProgramArchiveRow key={p.id} program={p} />)}
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
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 12 }}>
          <BackButton />
          <Text style={{ fontFamily: sans(700), fontSize: 19, color: glass.white, letterSpacing: -0.4 }}>{t("program.title")}</Text>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: insets.bottom + 64, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<GlassRefreshControl {...refresh} />}
        >
          {body}
        </ScrollView>
      </SafeAreaView>

      <BottomSheet visible={sheet} onClose={() => setSheet(false)} title={t("program.sortTitle")}>
        {SORTS.map((s) => (
          <SortRow
            key={s}
            label={t(`program.sort.${s}`)}
            hint={t(`program.sortHint.${s}`)}
            selected={view.sort === s}
            onPress={() => {
              view.setSort(s);
              setSheet(false);
            }}
          />
        ))}
      </BottomSheet>
    </View>
  );
}
