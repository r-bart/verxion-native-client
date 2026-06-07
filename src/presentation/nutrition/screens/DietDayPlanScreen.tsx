/**
 * DietDayPlanScreen — "Plan de comidas del día": today's resolved plan as a list
 * of expandable meals over a day-total footer, plus supplements and the agent's
 * note. `empty` state (no active diet) invites the user to the agent. Reads
 * `GET /nutrition/diet-day-plan` via useDietDayPlan. Read-only.
 */
import { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { ChevronLeft, ChevronRight, Pill, Sparkles, UtensilsCrossed } from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { nInt } from "../lib/format";
import { supplementTimingLabel } from "../lib/labels";
import { useDietDayPlan } from "../hooks/useDietDayPlan";
import { MealAccordion } from "../components/MealAccordion";
import { MacroLine } from "../components/MacroLine";

function Header() {
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
        {t("nutrition.dayPlan.title")}
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
            {t("nutrition.dayPlan.ask.title")}
          </Text>
          <Text
            style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink2, lineHeight: 16 }}
          >
            {t("nutrition.dayPlan.ask.body")}
          </Text>
        </View>
        <ChevronRight size={18} color="rgba(255,255,255,0.28)" strokeWidth={2} />
      </GlassSurface>
    </Pressable>
  );
}

export function DietDayPlanScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useDietDayPlan();
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
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassSurface key={i} radius={16} style={{ height: 66 }} />
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
  } else if (data.state === "empty" || !data.diet) {
    body = (
      <EmptyState
        icon={<UtensilsCrossed size={30} color={glass.ink2} strokeWidth={1.8} />}
        title={t("nutrition.invite.empty.title")}
        body={t("nutrition.invite.empty.body")}
      />
    );
  } else {
    const meals = [...data.meals].sort((a, b) => a.orderIndex - b.orderIndex);
    body = (
      <View style={{ gap: 18 }}>
        <View>
          <Text
            style={{
              fontFamily: sans(700),
              fontSize: 22,
              color: glass.white,
              letterSpacing: -0.5,
            }}
          >
            {data.diet.name}
          </Text>
          <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink2, marginTop: 4 }}>
            {t("nutrition.plan.week", {
              week: data.diet.week,
              weeks: data.diet.weeks ?? data.diet.week,
            })}
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          {meals.map((m) => (
            <MealAccordion key={m.id} meal={m} />
          ))}
        </View>

        {/* Day total footer */}
        <GlassSurface
          radius={18}
          tintColor={glass.lavaBg}
          fallbackFill={glass.lavaBg}
          style={{ padding: 16, gap: 8, borderColor: glass.lavaBorder, borderWidth: 1 }}
        >
          <Text
            style={{
              fontFamily: mono(600),
              fontSize: 10.5,
              letterSpacing: 0.8,
              color: glass.lava,
              textTransform: "uppercase",
            }}
          >
            {t("nutrition.dayPlan.total")}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
            <Text style={{ fontFamily: sans(700), fontSize: 26, color: glass.white }}>
              {nInt(data.total.kcal)}
            </Text>
            <Text style={{ fontFamily: mono(500), fontSize: 13, color: glass.ink2 }}>
              {t("nutrition.dayPlan.targetKcal", { kcal: nInt(data.diet.targets.kcal) })}
            </Text>
          </View>
          <MacroLine macros={data.total} size={12.5} />
        </GlassSurface>

        {data.supplements.length > 0 && (
          <View>
            <SectionLabel>{t("nutrition.plan.supplements")}</SectionLabel>
            <View style={{ gap: 8 }}>
              {data.supplements.map((s) => (
                <GlassSurface
                  key={s.id}
                  radius={14}
                  style={{ padding: 12, flexDirection: "row", alignItems: "center", gap: 10 }}
                >
                  <Pill size={15} color={palette.insight.text} strokeWidth={2} />
                  <Text
                    style={{ flex: 1, fontFamily: sans(500), fontSize: 13.5, color: glass.ink }}
                  >
                    {s.name}
                  </Text>
                  {s.schedule && (
                    <Text style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink3 }}>
                      {supplementTimingLabel(s.schedule, t)}
                    </Text>
                  )}
                </GlassSurface>
              ))}
            </View>
          </View>
        )}

        {data.agentNote != null && (
          <GlassSurface
            radius={18}
            style={{ padding: 16 }}
          >
            <Text
              style={{ fontFamily: mono(400), fontSize: 13, lineHeight: 19, color: glass.ink }}
            >
              {data.agentNote}
            </Text>
          </GlassSurface>
        )}

        <AskAgentSurface />
      </View>
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
    </View>
  );
}
