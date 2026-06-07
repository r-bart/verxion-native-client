/**
 * FoodDetailScreen — "Detalle de alimento": a single food or recipe. Foods show
 * per-100 / per-serving macros + fiber; recipes add the ingredient list (each
 * ingredient taps through to its own detail) with prep time + totals. Reads
 * `GET /nutrition/food-detail/{kind}/{id}` via useFoodDetail. Read-only.
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
  Apple,
  ChefHat,
  Clock,
  Sparkles,
  UtensilsCrossed,
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
import { useFoodDetail } from "../hooks/useFoodDetail";
import { MacroLine } from "../components/MacroLine";
import type {
  FoodKind,
  RecipeIngredient,
} from "@/domain/nutrition/models/FoodDetail";
import type { MacroSet } from "@/domain/nutrition/models/NutritionDashboard";

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

function MacroBlock({ label, macros }: { label: string; macros: MacroSet }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: mono(500), fontSize: 11, color: glass.ink3 }}>
        {label}
      </Text>
      <MacroLine macros={macros} size={12.5} />
    </View>
  );
}

function IngredientRow({ ingredient }: { ingredient: RecipeIngredient }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() =>
        router.push(
          `/nutrition/alimento/${ingredient.kind}/${ingredient.refId}` as Href
        )
      }
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface radius={14} style={{ padding: 12, gap: 6 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <Text
            style={{ flex: 1, fontFamily: sans(600), fontSize: 13.5, color: glass.white }}
            numberOfLines={1}
          >
            {ingredient.name}
          </Text>
          <Text style={{ fontFamily: mono(500), fontSize: 12, color: glass.ink2 }}>
            {nInt(ingredient.quantity)} {ingredient.unit}
          </Text>
          <ChevronRight size={15} color="rgba(255,255,255,0.28)" strokeWidth={2} />
        </View>
        <MacroLine macros={ingredient.macros} />
      </GlassSurface>
    </Pressable>
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
            {t("nutrition.foodDetail.ask.title")}
          </Text>
          <Text
            style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink2, lineHeight: 16 }}
          >
            {t("nutrition.foodDetail.ask.body")}
          </Text>
        </View>
        <ChevronRight size={18} color="rgba(255,255,255,0.28)" strokeWidth={2} />
      </GlassSurface>
    </Pressable>
  );
}

export function FoodDetailScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { kind, id } = useLocalSearchParams<{ kind: FoodKind; id: string }>();
  const { data, isLoading, isError, refetch } = useFoodDetail(
    (kind as FoodKind) ?? "food",
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
        <GlassSurface radius={24} style={{ height: 140 }} />
        <GlassSurface radius={18} style={{ height: 90 }} />
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
    const isRecipe = data.kind === "recipe";
    const servingLabel = data.serving.label ?? t("nutrition.foodDetail.perServing");
    body = (
      <View style={{ gap: 18 }}>
        <GlassSurface radius={24} style={{ padding: 18, gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
            <IconBubble bg={glass.lavaBg} size={48}>
              {isRecipe ? (
                <ChefHat size={24} color={glass.lava} strokeWidth={2} />
              ) : (
                <Apple size={24} color={glass.lava} strokeWidth={2} />
              )}
            </IconBubble>
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  fontFamily: sans(700),
                  fontSize: 20,
                  color: glass.white,
                  letterSpacing: -0.5,
                }}
                numberOfLines={2}
              >
                {data.name}
              </Text>
              {data.brand && (
                <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink3 }}>
                  {data.brand}
                </Text>
              )}
            </View>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Chip tone="neutral" label={data.group} />
            <Chip
              tone="lava"
              label={t(`nutrition.foodDetail.kind.${data.kind}`)}
            />
            {data.isCustom && (
              <Chip tone="up" label={t("nutrition.foodDetail.custom")} />
            )}
          </View>
        </GlassSurface>

        <GlassSurface radius={18} style={{ padding: 16, gap: 14 }}>
          {data.per100 && (
            <MacroBlock label={t("nutrition.foodDetail.per100")} macros={data.per100} />
          )}
          {data.perServing && (
            <MacroBlock label={servingLabel} macros={data.perServing} />
          )}
          {data.fiber != null && (
            <Text style={{ fontFamily: mono(500), fontSize: 12, color: glass.ink2 }}>
              {t("nutrition.foodDetail.fiber", { grams: nInt(data.fiber) })}
            </Text>
          )}
        </GlassSurface>

        {isRecipe && data.recipe && (
          <View>
            <SectionLabel>{t("nutrition.foodDetail.ingredients")}</SectionLabel>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              <Chip
                tone="neutral"
                label={t("nutrition.foodDetail.servings", {
                  count: data.recipe.servings,
                })}
              />
              {data.recipe.prepTimeMinutes != null && (
                <Chip
                  tone="neutral"
                  icon={<Clock size={12} color={palette.neutral.text} strokeWidth={2.2} />}
                  label={t("nutrition.foodDetail.prepTime", {
                    minutes: data.recipe.prepTimeMinutes,
                  })}
                />
              )}
            </View>
            <View style={{ gap: 8 }}>
              {data.recipe.ingredients.map((ing) => (
                <IngredientRow key={ing.id} ingredient={ing} />
              ))}
            </View>
          </View>
        )}

        {data.agentNote != null && (
          <GlassSurface
            radius={18}
            tintColor={glass.lavaBg}
            fallbackFill={glass.lavaBg}
            style={{ padding: 16, borderColor: glass.lavaBorder, borderWidth: 1 }}
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
        <Header title={data?.name ?? t("nutrition.foodDetail.title")} />
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
