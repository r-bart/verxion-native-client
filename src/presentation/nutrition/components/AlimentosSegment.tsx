/**
 * AlimentosSegment — the Nutrición landing's "Alimentos" segment: a searchable,
 * group-filterable library of foods + recipes. Search and the group filter run
 * SERVER-side (the read-model paginates), so each change re-queries. Each row taps
 * through to the food/recipe detail. Read-only. First page only for now (the
 * `hasMore` tail is surfaced as a count, not infinite scroll).
 */
import { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { Search, X, Carrot, ChefHat, Apple, ChevronRight } from "lucide-react-native";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { useFoodLibrary } from "../hooks/useFoodLibrary";
import { MacroLine } from "./MacroLine";
import type { FoodLibraryItem } from "@/domain/nutrition/models/FoodLibrary";

function GroupChip({
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
          paddingHorizontal: 15,
          minHeight: 44,
          justifyContent: "center",
          borderRadius: 9999,
          backgroundColor: selected ? glass.lavaBg : glass.fill,
          borderWidth: 1,
          borderColor: selected ? glass.lavaBorder : glass.stroke,
        }}
      >
        <Text
          style={{
            fontFamily: sans(selected ? 600 : 500),
            fontSize: 12.5,
            color: selected ? glass.lava : glass.ink2,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function FoodRow({ item }: { item: FoodLibraryItem }) {
  const router = useRouter();
  const Icon = item.kind === "recipe" ? ChefHat : Apple;
  const meta = [item.brand, item.group].filter(Boolean).join(" · ");
  return (
    <Pressable
      onPress={() =>
        router.push(`/nutrition/alimento/${item.kind}/${item.id}` as Href)
      }
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface
        radius={16}
        style={{ padding: 12, flexDirection: "row", alignItems: "center", gap: 11 }}
      >
        <IconBubble bg={glass.lavaBg} size={40}>
          <Icon size={19} color={glass.lava} strokeWidth={2} />
        </IconBubble>
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {meta !== "" && (
            <Text
              style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}
              numberOfLines={1}
            >
              {meta}
            </Text>
          )}
          <MacroLine macros={item.macros} />
        </View>
        <ChevronRight size={16} color="rgba(255,255,255,0.28)" strokeWidth={2} />
      </GlassSurface>
    </Pressable>
  );
}

export function AlimentosSegment() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("");
  const { data, isLoading, isError, refetch } = useFoodLibrary({ q, group });
  const refresh = usePullToRefresh(refetch);

  const contentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: insets.bottom + 64,
      flexGrow: 1,
    }),
    [insets.bottom]
  );

  // The library read returns the full group facet universe (not filtered to the
  // current result set), so the chips stay put across searches. `keepPreviousData`
  // keeps them on screen while a new query is in flight. (If the API ever starts
  // returning facets filtered-to-results, hoist these to sticky state.)
  const groups = data?.facets.groups ?? [];

  // API group values are raw lowercase English (the filter sends them verbatim);
  // we only localize the *visible* label, falling back to a capitalized version
  // for any group the i18n map doesn't yet cover.
  const groupLabel = (g: string) =>
    t(`nutrition.foods.groups.${g.toLowerCase()}`, {
      defaultValue: g.charAt(0).toUpperCase() + g.slice(1),
    });

  let list: React.ReactNode;
  if (isLoading) {
    list = (
      <View style={{ gap: 8, marginTop: 4 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <GlassSurface key={i} radius={16} style={{ height: 72 }} />
        ))}
      </View>
    );
  } else if (isError || !data) {
    list = (
      <View style={{ paddingTop: 24 }}>
        <EmptyState
          icon={<Carrot size={30} color={glass.ink2} strokeWidth={1.8} />}
          title={t("nutrition.error.title")}
          body={t("nutrition.error.body")}
        />
      </View>
    );
  } else if (data.items.length === 0) {
    list = (
      <View style={{ paddingTop: 24 }}>
        <EmptyState
          icon={<Search size={30} color={glass.ink2} strokeWidth={1.8} />}
          title={t("nutrition.foods.noResults")}
          body={t("nutrition.foods.noResultsBody")}
        />
      </View>
    );
  } else {
    list = (
      <View style={{ gap: 8 }}>
        <Text
          style={{
            fontFamily: mono(600),
            fontSize: 11,
            letterSpacing: 0.6,
            color: glass.ink2,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          {t("nutrition.foods.count", { count: data.totalCount })}
        </Text>
        {data.items.map((it) => (
          <FoodRow key={`${it.kind}:${it.id}`} item={it} />
        ))}
        {data.hasMore && (
          <Text
            style={{
              fontFamily: mono(400),
              fontSize: 11.5,
              color: glass.ink3,
              textAlign: "center",
              marginTop: 6,
            }}
          >
            {t("nutrition.foods.more", {
              count: data.totalCount - data.items.length,
            })}
          </Text>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={<GlassRefreshControl {...refresh} />}
    >
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
          value={q}
          onChangeText={setQ}
          placeholder={t("nutrition.foods.search")}
          placeholderTextColor={glass.ink3}
          style={{ flex: 1, fontFamily: sans(500), fontSize: 14, color: glass.white }}
        />
        {q !== "" && (
          <Pressable
            onPress={() => setQ("")}
            accessibilityRole="button"
            accessibilityLabel={t("common.close")}
            hitSlop={8}
          >
            <X size={15} color={glass.ink3} strokeWidth={2} />
          </Pressable>
        )}
      </GlassSurface>

      {groups.length > 0 && (
        <View style={{ marginHorizontal: -16, marginBottom: 14 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexDirection: "row", gap: 8, paddingHorizontal: 16 }}
          >
            <GroupChip
              label={t("nutrition.foods.allGroups")}
              selected={group === ""}
              onPress={() => setGroup("")}
            />
            {groups.map((g) => (
              <GroupChip
                key={g}
                label={groupLabel(g)}
                selected={group === g}
                onPress={() => setGroup((p) => (p === g ? "" : g))}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {list}
    </ScrollView>
  );
}
