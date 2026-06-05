/**
 * SesionesSegment — the Entreno landing's "Sesiones" segment: an infinite feed
 * of sessions grouped by routine block, with rutina + sort filters in bottom
 * sheets (no dedicated history screen). Owns its own scroll (a FlatList) so it
 * can paginate; the lead + filter bar are the list header.
 */
import { useMemo, useState } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { Layers, ChevronDown, ArrowUpDown } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { BottomSheet } from "@/presentation/_shared/components/BottomSheet";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { SessionSort, SessionFeedBlock, SessionFeedRow } from "@/domain/training/models/SessionFeed";
import { useSessionFeed } from "../hooks/useSessionFeed";
import { useRoutines } from "../hooks/useRoutines";
import { SessionBlockHeader } from "./SessionBlockHeader";
import { SessionRecapRow } from "./SessionRecapRow";
import { SheetOption } from "./SheetOption";
import { SegmentError } from "./SegmentError";

const SORTS: SessionSort[] = ["recent", "oldest", "volume", "duration"];

type FeedItem =
  | { kind: "header"; block: SessionFeedBlock }
  | { kind: "row"; row: SessionFeedRow };

// flex:1 lives on the row wrapper View (textbook flex), not on this Pressable —
// a flex returned from Pressable's style callback doesn't size the row slot. A
// plain translucent View (not GlassSurface) fills reliably and reads the same.
function FilterButton({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 9999, backgroundColor: glass.fill2, borderWidth: 1, borderColor: glass.stroke }}>
        {icon}
        <Text numberOfLines={1} style={{ flex: 1, fontFamily: sans(600), fontSize: 13, color: glass.white }}>{label}</Text>
        <ChevronDown size={14} color={glass.ink3} strokeWidth={2} />
      </View>
    </Pressable>
  );
}

export function SesionesSegment() {
  const { t } = useTranslation();
  const [routineId, setRoutineId] = useState<string | null>(null);
  const [sort, setSort] = useState<SessionSort>("recent");
  const [sheet, setSheet] = useState<"routine" | "sort" | null>(null);

  const feed = useSessionFeed(routineId, sort);
  const { data: routines } = useRoutines();

  const routineLabel = routineId
    ? routines?.find((r) => r.id === routineId)?.name ?? t("training.sessionFeed.allRoutines")
    : t("training.sessionFeed.allRoutines");

  const items = useMemo<FeedItem[]>(
    () => feed.blocks.flatMap((b) => [{ kind: "header", block: b } as FeedItem, ...b.sessions.map((r) => ({ kind: "row", row: r }) as FeedItem)]),
    [feed.blocks],
  );

  if (feed.isLoading) {
    return (
      <View style={{ paddingHorizontal: 16, gap: 8, paddingTop: 8 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <GlassSurface key={i} radius={16} style={{ height: 70 }} />
        ))}
      </View>
    );
  }
  if (feed.isError) {
    return <View style={{ paddingHorizontal: 16 }}><SegmentError onRetry={() => feed.refetch()} /></View>;
  }

  const Header = (
    <View style={{ gap: 14, paddingBottom: 4 }}>
      <View style={{ gap: 2 }}>
        <Text style={{ fontFamily: sans(700), fontSize: 20, color: glass.white, letterSpacing: -0.5 }}>
          {t("training.sessionFeed.lead", { count: feed.totalCount })}
        </Text>
        <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink2 }}>{t("training.sessionFeed.subtitle")}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <FilterButton icon={<Layers size={15} color={glass.ink2} strokeWidth={2} />} label={routineLabel} onPress={() => setSheet("routine")} />
        </View>
        <View style={{ flex: 1 }}>
          <FilterButton icon={<ArrowUpDown size={15} color={glass.ink2} strokeWidth={2} />} label={t(`training.sort.${sort}`)} onPress={() => setSheet("sort")} />
        </View>
      </View>
    </View>
  );

  return (
    <>
      <FlatList
        data={items}
        keyExtractor={(it) => (it.kind === "header" ? `h-${it.block.id}` : `r-${it.row.id}`)}
        ListHeaderComponent={Header}
        renderItem={({ item }) =>
          item.kind === "header" ? (
            <SessionBlockHeader name={item.block.name} state={item.block.state} dateRange={item.block.dateRange} totalVolume={item.block.totalVolume} />
          ) : (
            <View style={{ marginBottom: 8 }}>
              <SessionRecapRow row={item.row} />
            </View>
          )
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.5}
        onEndReached={() => feed.hasNextPage && !feed.isFetchingNextPage && feed.fetchNextPage()}
        ListFooterComponent={feed.isFetchingNextPage ? <ActivityIndicator color={glass.lava} style={{ marginTop: 16 }} /> : null}
      />

      <BottomSheet visible={sheet === "routine"} onClose={() => setSheet(null)} title={t("training.sessionFeed.allRoutines")}>
        <SheetOption label={t("training.sessionFeed.allRoutines")} selected={routineId === null} onPress={() => { setRoutineId(null); setSheet(null); }} />
        {routines?.map((r) => (
          <SheetOption key={r.id} label={r.name} selected={routineId === r.id} onPress={() => { setRoutineId(r.id); setSheet(null); }} />
        ))}
      </BottomSheet>

      <BottomSheet visible={sheet === "sort"} onClose={() => setSheet(null)} title={t("training.sessionFeed.sortTitle")}>
        {SORTS.map((s) => (
          <SheetOption key={s} label={t(`training.sort.${s}`)} selected={sort === s} onPress={() => { setSort(s); setSheet(null); }} />
        ))}
      </BottomSheet>
    </>
  );
}
