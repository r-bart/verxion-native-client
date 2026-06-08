/**
 * DietDetailScreen — "Detalle de dieta": the plan's header (DietDetailHero) over
 * the day's meal spine (each meal opens its detail), then the agent's note and an
 * ask-agent surface. Reads `GET /nutrition/diet-detail/{planId}` via useDietDetail.
 * Read-only: adjusting the diet is a request to the agent, never a write.
 */
import { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { ChevronLeft, ChevronRight, Sparkles, UtensilsCrossed } from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { SectionEmptyNotice } from "@/presentation/_shared/components/SectionEmptyNotice";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { useDietDetail } from "../hooks/useDietDetail";
import { DietDetailHero } from "../components/DietDetailHero";
import { DietMealCard } from "../components/DietMealCard";
import { AgentNoteCard } from "../components/AgentNoteCard";

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
            {t("nutrition.dietDetail.ask.title")}
          </Text>
          <Text
            style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink2, lineHeight: 16 }}
          >
            {t("nutrition.dietDetail.ask.body")}
          </Text>
        </View>
        <ChevronRight size={18} color="rgba(255,255,255,0.28)" strokeWidth={2} />
      </GlassSurface>
    </Pressable>
  );
}

export function DietDetailScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useDietDetail(id ?? "");
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

  const title = data ? data.name.split(" · ")[0] : t("nutrition.dietas.title");

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <View style={{ gap: 14, paddingTop: 8 }}>
        <SkeletonBlock radius={24} height={220} />
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} radius={16} height={64} />
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
    const meals = [...data.meals].sort((a, b) => a.orderIndex - b.orderIndex);
    body = (
      <View style={{ gap: 18 }}>
        <DietDetailHero diet={data} />

        {meals.length === 0 ? (
          <SectionEmptyNotice
            icon={<UtensilsCrossed size={16} color={glass.ink3} strokeWidth={2} />}
            text={t("nutrition.dietDetail.noMeals")}
          />
        ) : (
          <View>
            <SectionLabel>{t("nutrition.dietDetail.daySpine")}</SectionLabel>
            <View style={{ gap: 8 }}>
              {meals.map((m) => (
                <DietMealCard key={m.id} planId={data.id} meal={m} />
              ))}
            </View>
          </View>
        )}

        {data.agentNote != null && <AgentNoteCard message={data.agentNote} />}

        <AskAgentSurface />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: glass.screenBg }}>
      <ScreenBloom />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Header title={title} />
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
