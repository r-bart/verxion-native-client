/**
 * PlanSegment — the Nutrición landing's primary segment: the active diet at the
 * front (hero), today's intake (kcal ring + macros + next meal), hydration, the
 * day's meal spine, supplements, and the agent's note. Cold-start (fresh/empty)
 * invites the user to the agent. Loading → skeleton; error → retry. Read-only.
 * Mirrors Entreno's `RutinaSegment`.
 */
import { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { UtensilsCrossed } from "lucide-react-native";
import { EmptyState } from "@/presentation/_shared/components/EmptyState";
import { GlassRefreshControl } from "@/presentation/_shared/components/GlassRefreshControl";
import { usePullToRefresh } from "@/presentation/_shared/hooks/usePullToRefresh";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import { useDietDashboard } from "../hooks/useDietDashboard";
import { DietHero } from "./DietHero";
import { TodayIntake } from "./TodayIntake";
import { HydrationCard } from "./HydrationCard";
import { MealSpine } from "./MealSpine";
import { SupplementsList } from "./SupplementsList";
import { AgentNoteCard } from "./AgentNoteCard";
import { NutritionInvite } from "./NutritionInvite";
import { PlanSegmentSkeleton } from "./PlanSegmentSkeleton";

function RetryButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <View
        style={{
          paddingHorizontal: 18,
          paddingVertical: 11,
          borderRadius: 9999,
          backgroundColor: glass.lava,
        }}
      >
        <Text
          style={{ fontFamily: sans(700), fontSize: 14, color: glass.fgOnLava }}
        >
          {t("common.retry")}
        </Text>
      </View>
    </Pressable>
  );
}

export function PlanSegment() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useDietDashboard();
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

  let body: React.ReactNode;
  if (isLoading) {
    body = <PlanSegmentSkeleton />;
  } else if (isError || !data) {
    body = (
      <EmptyState
        icon={
          <UtensilsCrossed size={30} color={glass.ink2} strokeWidth={1.8} />
        }
        title={t("nutrition.error.title")}
        body={t("nutrition.error.body")}
        action={<RetryButton onPress={() => refetch()} />}
      />
    );
  } else if (!data.activeDiet) {
    // Only "empty" (no active diet) shows the cold-start invite. "fresh" means
    // there IS an active diet, the user just hasn't logged intake yet today —
    // render the plan (hero/intake at 0/spine), same as "active". See the
    // platform read-model: state = hasIntakeToday ? "active" : "fresh".
    body = <NutritionInvite state={data.state} />;
  } else {
    body = (
      <View style={{ gap: 14 }}>
        <DietHero diet={data.activeDiet} />
        <TodayIntake
          today={data.today}
          diet={data.activeDiet}
          next={data.next}
        />
        <HydrationCard
          water={data.today.water}
          goal={data.activeDiet.waterGoal}
        />
        <MealSpine meals={data.mealSpine} planId={data.activeDiet.id} />
        <SupplementsList supplements={data.supplements} />
        {data.agentNote != null && <AgentNoteCard message={data.agentNote} />}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      refreshControl={<GlassRefreshControl {...refresh} />}
    >
      {body}
    </ScrollView>
  );
}
