/**
 * EjerciciosSegment — the Entreno landing's "Ejercicios" segment: the exercise
 * library as a searchable, filterable feed. Search + group/equipment filters +
 * sort run client-side over one library read (useExerciseLibraryView); filters
 * live in bottom sheets with removable active chips. Owns its own scroll.
 */
import { useState, useMemo } from "react";
import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { BottomSheet } from "@/presentation/_shared/components/BottomSheet";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { useExerciseLibrary } from "../hooks/useExerciseLibrary";
import {
  useExerciseLibraryView,
  type ExerciseSort,
} from "../hooks/useExerciseLibraryView";
import { ExerciseLibraryRow } from "./ExerciseLibraryRow";
import { SheetOption } from "./SheetOption";
import { FilterPill } from "./FilterPill";
import { SelectSheet } from "./SelectSheet";
import { SegmentError } from "./SegmentError";

const SORTS: ExerciseSort[] = ["name", "logged"];

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

export function EjerciciosSegment() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useExerciseLibrary();
  const view = useExerciseLibraryView(data);
  const [sheet, setSheet] = useState<"filter" | "sort" | null>(null);
  const refresh = usePullToRefresh(refetch);

  const renderExerciseItem = ({ item }: { item: any }) => (
    <View style={{ marginBottom: 8 }}>
      <ExerciseLibraryRow item={item} />
    </View>
  );

  const contentContainerStyle = useMemo(() => ({
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: insets.bottom + 64,
  }), [insets.bottom]);

  if (isLoading) {
    return (
      <View style={{ paddingHorizontal: 16, gap: 8, paddingTop: 8 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <GlassSurface key={i} radius={16} style={{ height: 62 }} />
        ))}
      </View>
    );
  }
  if (isError || !data) {
    return (
      <View style={{ paddingHorizontal: 16 }}>
        <SegmentError onRetry={() => refetch()} />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={{ gap: 12, paddingBottom: 6 }}>
      <GlassSurface
        radius={14}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 9,
          paddingHorizontal: 14,
          height: 44,
        }}
      >
        <Search size={17} color={glass.ink3} strokeWidth={2} />
        <TextInput
          value={view.query}
          onChangeText={view.setQuery}
          placeholder={t("training.exerciseLibrary.search")}
          placeholderTextColor={glass.ink3}
          style={{
            flex: 1,
            fontFamily: sans(500),
            fontSize: 14,
            color: glass.white,
          }}
        />
      </GlassSurface>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <FilterPill
            icon={
              <SlidersHorizontal size={15} color={glass.ink2} strokeWidth={2} />
            }
            label={t("training.exerciseLibrary.filterTitle")}
            onPress={() => setSheet("filter")}
          />
        </View>
        <View style={{ flex: 1 }}>
          <FilterPill
            icon={<ArrowUpDown size={15} color={glass.ink2} strokeWidth={2} />}
            label={t(`training.exerciseSort.${view.sort}`)}
            onPress={() => setSheet("sort")}
          />
        </View>
      </View>

      {(view.group || view.equipment) && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {view.group && (
            <RemovableChip
              label={view.group}
              onRemove={() => view.setGroup(null)}
            />
          )}
          {view.equipment && (
            <RemovableChip
              label={view.equipment}
              onRemove={() => view.setEquipment(null)}
            />
          )}
        </View>
      )}

      <Text style={{ fontFamily: mono(500), fontSize: 11, color: glass.ink3 }}>
        {t("training.exerciseLibrary.lead", { count: view.filtered.length })}
      </Text>
    </View>
  );

  return (
    <>
      <FlatList
        data={view.filtered}
        keyExtractor={(it) => it.id}
        ListHeaderComponent={renderHeader}
        renderItem={renderExerciseItem}
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
            {t("training.exerciseLibrary.empty")}
          </Text>
        }
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<GlassRefreshControl {...refresh} />}
      />

      <BottomSheet
        visible={sheet === "filter"}
        onClose={() => setSheet(null)}
        title={t("training.exerciseLibrary.filterTitle")}
      >
        <Text
          style={{
            fontFamily: mono(600),
            fontSize: 10,
            letterSpacing: 0.8,
            color: glass.ink3,
            textTransform: "uppercase",
            marginBottom: 2,
          }}
        >
          {t("training.exerciseLibrary.groupSection")}
        </Text>
        <SheetOption
          label={t("training.exerciseLibrary.all")}
          selected={view.group === null}
          onPress={() => view.setGroup(null)}
        />
        {data.facets.groups.map((g) => (
          <SheetOption
            key={g}
            label={g}
            selected={view.group === g}
            onPress={() => view.setGroup(view.group === g ? null : g)}
          />
        ))}

        <Text
          style={{
            fontFamily: mono(600),
            fontSize: 10,
            letterSpacing: 0.8,
            color: glass.ink3,
            textTransform: "uppercase",
            marginTop: 10,
            marginBottom: 2,
          }}
        >
          {t("training.exerciseLibrary.equipmentSection")}
        </Text>
        <SheetOption
          label={t("training.exerciseLibrary.all")}
          selected={view.equipment === null}
          onPress={() => view.setEquipment(null)}
        />
        {data.facets.equipment.map((e) => (
          <SheetOption
            key={e}
            label={e}
            selected={view.equipment === e}
            onPress={() => view.setEquipment(view.equipment === e ? null : e)}
          />
        ))}
      </BottomSheet>

      <SelectSheet
        visible={sheet === "sort"}
        onClose={() => setSheet(null)}
        title={t("training.exerciseLibrary.sortTitle")}
        options={SORTS.map((s) => ({
          key: s,
          label: t(`training.exerciseSort.${s}`),
        }))}
        selectedKey={view.sort}
        onSelect={(key) => view.setSort(key)}
      />
    </>
  );
}
