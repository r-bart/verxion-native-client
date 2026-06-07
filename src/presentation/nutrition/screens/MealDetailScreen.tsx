/**
 * MealDetailScreen — "Detalle de comida": one planned meal's header (window +
 * calories + protein) over its food items (with the agent's alternatives) and
 * supplements, then an ask-agent surface. Reads
 * `GET /nutrition/meal-detail/{planId}/{mealId}` via useMealDetail. The route
 * carries the meal id as `id` and the plan id as the `planId` query param.
 * Read-only: changing a meal is a request to the agent.
 */
import { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Beef,
  Pill,
  Sparkles,
  UtensilsCrossed,
  Utensils,
} from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { Chip } from "@/presentation/_shared/components/Chip";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { nInt } from "../lib/format";
import { useMealDetail } from "../hooks/useMealDetail";
import { MealItemRow } from "../components/MealItemRow";

function Header({ title }: { title: string }) {
  const { t } = useTranslation();
  const router = useRouter();
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
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t("common.back")}
        style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
      >
        <GlassSurface
          radius={19}
          style={{ width: 38, height: 38, alignItems: "center", justifyContent: "center" }}
        >
          <ChevronLeft size={20} color={glass.white} strokeWidth={2} />
        </GlassSurface>
      </Pressable>
      <Text
        style={{
          flex: 1,
          fontFamily: sans(700),
          fontSize: 19,
          color: glass.white,
          letterSpacing: -0.4,
        }}
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontFamily: mono(600),
        fontSize: 11,
        letterSpacing: 0.6,
        color: glass.ink2,
        textTransform: "uppercase",
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
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1, marginTop: 28 })}
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
            {t("nutrition.mealDetail.ask.title")}
          </Text>
          <Text
            style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink2, lineHeight: 16 }}
          >
            {t("nutrition.mealDetail.ask.body")}
          </Text>
        </View>
        <ChevronRight size={18} color="rgba(255,255,255,0.28)" strokeWidth={2} />
      </GlassSurface>
    </Pressable>
  );
}

export function MealDetailScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id, planId } = useLocalSearchParams<{ id: string; planId: string }>();
  const { data, isLoading, isError, refetch } = useMealDetail(
    planId ?? "",
    id ?? ""
  );
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
      <View style={{ gap: 14, paddingTop: 8 }}>
        <GlassSurface radius={24} style={{ height: 130 }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassSurface key={i} radius={16} style={{ height: 56 }} />
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
    body = (
      <View style={{ gap: 18 }}>
        <GlassSurface radius={24} style={{ padding: 18, gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
            <IconBubble bg={glass.lavaBg} size={48}>
              <Utensils size={24} color={glass.lava} strokeWidth={2} />
            </IconBubble>
            <Text
              style={{
                flex: 1,
                fontFamily: sans(700),
                fontSize: 22,
                color: glass.white,
                letterSpacing: -0.5,
              }}
              numberOfLines={2}
            >
              {data.name}
            </Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {data.window && (
              <Chip
                tone="neutral"
                icon={<Clock size={12} color={palette.neutral.text} strokeWidth={2.2} />}
                label={data.window}
              />
            )}
            {data.calories != null && (
              <Chip
                tone="lava"
                icon={<Flame size={12} color={glass.lava} strokeWidth={2.2} />}
                label={t("nutrition.dietDetail.kcal", { kcal: nInt(data.calories) })}
              />
            )}
            {data.protein != null && (
              <Chip
                tone="lava"
                icon={<Beef size={12} color={glass.lava} strokeWidth={2.2} />}
                label={t("nutrition.plan.proteinChip", { grams: nInt(data.protein) })}
              />
            )}
          </View>
        </GlassSurface>

        {data.items.length > 0 && (
          <View>
            <SectionLabel>{t("nutrition.mealDetail.items")}</SectionLabel>
            <View style={{ gap: 8 }}>
              {/* MealDetailItem has no id in the read-model; suffix the index so
                  the same food appearing twice doesn't collide on key. */}
              {data.items.map((it, i) => (
                <MealItemRow key={`${it.name}-${i}`} item={it} />
              ))}
            </View>
          </View>
        )}

        {data.supplements.length > 0 && (
          <View>
            <SectionLabel>{t("nutrition.mealDetail.supplements")}</SectionLabel>
            <View style={{ gap: 8 }}>
              {data.supplements.map((s, i) => (
                <GlassSurface
                  key={`${s}-${i}`}
                  radius={14}
                  style={{ padding: 12, flexDirection: "row", alignItems: "center", gap: 10 }}
                >
                  <Pill size={15} color={palette.insight.text} strokeWidth={2} />
                  <Text style={{ fontFamily: sans(500), fontSize: 13.5, color: glass.ink }}>
                    {s}
                  </Text>
                </GlassSurface>
              ))}
            </View>
          </View>
        )}

        <AskAgentSurface />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Header title={data?.name ?? t("nutrition.mealDetail.title")} />
        <ScrollView
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          refreshControl={<GlassRefreshControl {...refresh} />}
        >
          {body}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
