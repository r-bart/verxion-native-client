/**
 * SesionesSegment — the Entreno landing's "Sesiones" segment: an infinite feed
 * of sessions grouped by routine block, with rutina + sort filters in bottom
 * sheets (no dedicated history screen). Owns its own scroll (a FlatList) so it
 * can paginate; the lead + filter bar are the list header.
 */
import { useState, useMemo } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Layers, ChevronDown, ArrowUpDown } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type {
  SessionSort,
  SessionFeedBlock,
  SessionFeedRow,
} from "@/domain/training/models/SessionFeed";
import { fmtDateRange, fmtTonnes } from "../lib/sessionFormat";
import { useSessionFeed } from "../hooks/useSessionFeed";
import { useRoutines } from "../hooks/useRoutines";
import { SessionBlockHeader } from "./SessionBlockHeader";
import { SessionRecapRow } from "./SessionRecapRow";
import { FilterPill } from "./FilterPill";
import { SelectSheet } from "./SelectSheet";
import { SegmentError } from "./SegmentError";

const SORTS: SessionSort[] = ["recent", "oldest", "volume", "duration"];

type FeedItem =
  | { kind: "header"; block: SessionFeedBlock }
  | { kind: "row"; row: SessionFeedRow };

export function SesionesSegment() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const insets = useSafeAreaInsets();
  const [routineId, setRoutineId] = useState<string | null>(null);
  const [sort, setSort] = useState<SessionSort>("recent");
  const [sheet, setSheet] = useState<"routine" | "sort" | null>(null);

  const feed = useSessionFeed(routineId, sort);
  const { data: routines } = useRoutines();
  const refresh = usePullToRefresh(feed.refetch);

  const routineLabel = routineId
    ? routines?.find((r) => r.id === routineId)?.name ??
      t("training.sessionFeed.allRoutines")
    : t("training.sessionFeed.allRoutines");

  const items: FeedItem[] = feed.blocks.flatMap((b) => [
    { kind: "header", block: b } as FeedItem,
    ...b.sessions.map((r) => ({ kind: "row", row: r } as FeedItem)),
  ]);

  const renderSessionItem = ({ item }: { item: FeedItem }) =>
    item.kind === "header" ? (
      <SessionBlockHeader
        name={item.block.name}
        state={item.block.state}
        dateRange={fmtDateRange(
          locale,
          item.block.dateRange.start,
          item.block.dateRange.end
        )}
        totalVolume={`${fmtTonnes(locale, item.block.totalVolume.value)} t`}
      />
    ) : (
      <View style={{ marginBottom: 8 }}>
        <SessionRecapRow row={item.row} />
      </View>
    );

  const contentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: insets.bottom + 64,
    }),
    [insets.bottom]
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
    return (
      <View style={{ paddingHorizontal: 16 }}>
        <SegmentError onRetry={() => feed.refetch()} />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={{ gap: 14, paddingBottom: 4 }}>
      <View style={{ gap: 2 }}>
        <Text
          style={{
            fontFamily: sans(700),
            fontSize: 20,
            color: glass.white,
            letterSpacing: -0.5,
          }}
        >
          {t("training.sessionFeed.lead", { count: feed.totalCount })}
        </Text>
        <Text
          style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink2 }}
        >
          {t("training.sessionFeed.subtitle")}
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <FilterPill
            icon={<Layers size={15} color={glass.ink2} strokeWidth={2} />}
            label={routineLabel}
            onPress={() => setSheet("routine")}
            trailing={
              <ChevronDown size={14} color={glass.ink3} strokeWidth={2} />
            }
          />
        </View>
        <View style={{ flex: 1 }}>
          <FilterPill
            icon={<ArrowUpDown size={15} color={glass.ink2} strokeWidth={2} />}
            label={t(`training.sessionFeed.sort.${sort}`)}
            onPress={() => setSheet("sort")}
            trailing={
              <ChevronDown size={14} color={glass.ink3} strokeWidth={2} />
            }
          />
        </View>
      </View>
    </View>
  );

  return (
    <>
      <FlatList
        data={items}
        keyExtractor={(it) =>
          it.kind === "header" ? `h-${it.block.id}` : `r-${it.row.id}`
        }
        ListHeaderComponent={renderHeader}
        renderItem={renderSessionItem}
        ListEmptyComponent={
          <Text
            style={{
              fontFamily: mono(400),
              fontSize: 13,
              color: glass.ink3,
              textAlign: "center",
              paddingTop: 24,
            }}
          >
            {t("training.sessionFeed.empty")}
          </Text>
        }
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={<GlassRefreshControl {...refresh} />}
        onEndReachedThreshold={0.5}
        onEndReached={() =>
          feed.hasNextPage && !feed.isFetchingNextPage && feed.fetchNextPage()
        }
        ListFooterComponent={
          feed.isFetchingNextPage ? (
            <ActivityIndicator color={glass.lava} style={{ marginTop: 16 }} />
          ) : null
        }
      />

      <SelectSheet
        visible={sheet === "routine"}
        onClose={() => setSheet(null)}
        title={t("training.sessionFeed.allRoutines")}
        options={[
          { key: "", label: t("training.sessionFeed.allRoutines") },
          ...(routines ?? []).map((r) => ({ key: r.id, label: r.name })),
        ]}
        selectedKey={routineId ?? ""}
        onSelect={(key) => setRoutineId(key || null)}
      />

      <SelectSheet
        visible={sheet === "sort"}
        onClose={() => setSheet(null)}
        title={t("training.sessionFeed.sortTitle")}
        options={SORTS.map((s) => ({ key: s, label: t(`training.sort.${s}`) }))}
        selectedKey={sort}
        onSelect={(key) => setSort(key)}
      />
    </>
  );
}
