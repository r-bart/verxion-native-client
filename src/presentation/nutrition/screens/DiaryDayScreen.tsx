/**
 * DiaryDayScreen — "Detalle de día del diario": a closed day's report — consumed
 * vs target macros (with the day classification + adherence), water, the logged
 * meals, and the agent recap. Reads `GET /nutrition/diary-day/{date}` via
 * useDiaryDay (route param `date`). Read-only.
 */
import { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Check, Droplet, UtensilsCrossed } from "lucide-react-native";
import { ScreenBloom } from "@/presentation/_shared/components/ScreenBloom";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { SkeletonBlock } from "@/presentation/_shared/components/SkeletonBlock";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { Chip } from "@/presentation/_shared/components/Chip";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { nInt, nL, dShortDate, dTime } from "../lib/format";
import { mealTypeVisual } from "../lib/mealType";
import { MacroLine } from "../components/MacroLine";
import { useDiaryDay } from "../hooks/useDiaryDay";

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

export function DiaryDayScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { data, isLoading, isError, refetch } = useDiaryDay(date ?? "");
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

  const title = dShortDate(data?.date ?? date) ?? t("nutrition.diaryDay.title");

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <View style={{ gap: 14, paddingTop: 8 }}>
        <SkeletonBlock radius={24} height={150} />
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} radius={16} height={56} />
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
    const meals = data.meals;
    body = (
      <View style={{ gap: 18 }}>
        {/* Consumed-vs-target hero */}
        <GlassSurface radius={24} style={{ padding: 18, gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {data.diet && (
              <Text
                style={{ flex: 1, fontFamily: sans(600), fontSize: 13, color: glass.ink2 }}
                numberOfLines={1}
              >
                {data.diet.name}
              </Text>
            )}
            {data.dayClass && (
              <Chip tone="up" label={t(`nutrition.diaryDay.dayClass.${data.dayClass}`)} />
            )}
          </View>

          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
            <Text style={{ fontFamily: sans(700), fontSize: 32, color: glass.white }}>
              {nInt(data.consumed.kcal)}
            </Text>
            <Text style={{ fontFamily: mono(500), fontSize: 13, color: glass.ink2 }}>
              {t("nutrition.diaryDay.ofTarget", { kcal: nInt(data.targets.kcal) })}
            </Text>
          </View>
          <MacroLine macros={data.consumed} size={12.5} />

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 2 }}>
            {data.adherence != null && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Check size={12} color={glass.up} strokeWidth={2.6} />
                <Text style={{ fontFamily: mono(500), fontSize: 12, color: glass.up }}>
                  {t("nutrition.dietas.adherence", { pct: Math.round(data.adherence) })}
                </Text>
              </View>
            )}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Droplet size={12} color={palette.body.text} strokeWidth={2.2} />
              <Text style={{ fontFamily: mono(500), fontSize: 12, color: glass.ink2 }}>
                {t("nutrition.diaryDay.water", {
                  value: nL(data.water.value),
                  goal: nL(data.waterGoal.value),
                })}
              </Text>
            </View>
          </View>
        </GlassSurface>

        {meals.length > 0 && (
          <View>
            <SectionLabel>
              {t("nutrition.diaryDay.mealsLogged", { count: data.mealsLogged })}
            </SectionLabel>
            <View style={{ gap: 8 }}>
              {meals.map((m) => {
                const visual = mealTypeVisual(m.mealType);
                const time = dTime(m.loggedAt);
                return (
                  <GlassSurface
                    key={m.id}
                    radius={16}
                    style={{ padding: 12, flexDirection: "row", alignItems: "center", gap: 11 }}
                  >
                    <IconBubble bg={glass.lavaBg} size={38}>
                      <visual.Icon size={18} color={glass.lava} strokeWidth={2} />
                    </IconBubble>
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                        <Text
                          style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }}
                          numberOfLines={1}
                        >
                          {m.name}
                        </Text>
                        {time && (
                          <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}>
                            {time}
                          </Text>
                        )}
                      </View>
                      <MacroLine macros={m.macros} />
                    </View>
                  </GlassSurface>
                );
              })}
            </View>
          </View>
        )}

        {data.recap != null && (
          <GlassSurface
            radius={18}
            tintColor={glass.lavaBg}
            fallbackFill={glass.lavaBg}
            style={{ padding: 16, borderColor: glass.lavaBorder, borderWidth: 1 }}
          >
            <Text
              style={{ fontFamily: mono(400), fontSize: 13, lineHeight: 19, color: glass.ink }}
            >
              {data.recap}
            </Text>
          </GlassSurface>
        )}
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
