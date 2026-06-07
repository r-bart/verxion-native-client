/**
 * RoutineLibraryCard — the big routine card in "Todas las rutinas": a state
 * eyebrow + days/week, the type bubble with name and goal, then a foot that
 * adapts to state (a draft shows "ver plan"; an active/completed block shows the
 * week cells, score and adherence). Taps through to the routine detail. Mirrors
 * the handoff's `RoutineCard`.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import {
  Target,
  TrendingUp,
  Sparkles,
  Pause,
  ChevronRight,
} from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { Chip } from "@/presentation/_shared/components/Chip";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { DAY_TYPE } from "../lib/dayType";
import { ScoreChip } from "@/presentation/_shared/components/ScoreChip";
import type {
  RoutineLibraryItem,
  RoutineLibraryState,
} from "@/domain/training/models/RoutineLibrary";

const STATE_COLOR: Record<RoutineLibraryState, string> = {
  active: glass.lava,
  draft: palette.insight.text,
  paused: palette.neutral.text,
  completed: glass.up,
};

function StateEyebrow({ state }: { state: RoutineLibraryState }) {
  const { t } = useTranslation();
  const color = STATE_COLOR[state];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {state === "active" && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
          }}
        />
      )}
      {state === "draft" && (
        <Sparkles size={11} color={color} strokeWidth={2.2} />
      )}
      {state === "paused" && (
        <Pause size={11} color={color} strokeWidth={2.2} />
      )}
      <Text
        style={{
          fontFamily: mono(600),
          fontSize: 10,
          letterSpacing: 1,
          color,
          textTransform: "uppercase",
        }}
      >
        {t(`training.routineLibrary.stateEyebrow.${state}`)}
      </Text>
    </View>
  );
}

function WeekCells({
  week,
  weeks,
  weekFraction,
}: {
  week: number;
  weeks: number;
  weekFraction: number | null;
}) {
  const partial =
    weekFraction != null && weekFraction > 0 && weekFraction < 1
      ? weekFraction
      : null;
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {Array.from({ length: weeks }).map((_, i) => {
        const done = i < week - 1;
        const now = i === week - 1;
        return (
          <View
            key={i}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 9999,
              overflow: "hidden",
              backgroundColor: done ? glass.lava : "rgba(255,255,255,0.10)",
            }}
          >
            {now && partial != null && (
              <View
                style={{
                  height: "100%",
                  width: `${Math.max(9, partial * 100)}%`,
                  backgroundColor: glass.lava,
                }}
              />
            )}
            {now && partial == null && (
              <View
                style={{
                  height: "100%",
                  width: "100%",
                  backgroundColor: glass.lava,
                  opacity: 0.5,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

export function RoutineLibraryCard({ item }: { item: RoutineLibraryItem }) {
  const { t } = useTranslation();
  const router = useRouter();
  const cfg = DAY_TYPE[item.type];
  const isDraft = item.state === "draft";
  const isCompleted = item.state === "completed";
  const adherencePct =
    item.sessionsPlanned > 0
      ? Math.round((item.sessionsDone / item.sessionsPlanned) * 100)
      : 0;

  return (
    <Pressable
      onPress={() => router.push(`/workout/rutinas/${item.id}` as Href)}
      accessibilityRole="button"
      accessibilityLabel={`Ver rutina ${item.name}`}
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface radius={20} style={{ padding: 16, gap: 14 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <StateEyebrow state={item.state} />
          <Text
            style={{ fontFamily: mono(500), fontSize: 11, color: glass.ink3 }}
          >
            {t("training.routineLibrary.perWeek", { count: item.perWeek })}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <IconBubble bg={cfg.bg} size={46}>
            <cfg.Icon size={23} color={cfg.color} strokeWidth={2} />
          </IconBubble>
          <View style={{ flex: 1, gap: 6 }}>
            <Text
              style={{
                fontFamily: sans(700),
                fontSize: 18,
                color: glass.white,
                letterSpacing: -0.4,
              }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <View style={{ flexDirection: "row" }}>
              <Chip
                tone="lava"
                icon={<Target size={11} color={glass.lava} strokeWidth={2.2} />}
                label={item.goal}
              />
            </View>
          </View>
        </View>

        {isDraft ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontFamily: mono(500),
                fontSize: 11.5,
                color: glass.ink2,
              }}
            >
              {t("training.routineLibrary.weeksPlanned", { weeks: item.weeks })}
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Text
                style={{
                  fontFamily: sans(600),
                  fontSize: 12.5,
                  color: STATE_COLOR.draft,
                }}
              >
                {t("training.routineLibrary.viewPlan")}
              </Text>
              <ChevronRight
                size={14}
                color={STATE_COLOR.draft}
                strokeWidth={2.2}
              />
            </View>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontFamily: mono(500),
                  fontSize: 12,
                  color: glass.ink2,
                }}
              >
                {isCompleted
                  ? t("training.routineLibrary.completedWeeks", {
                      weeks: item.weeks,
                    })
                  : t("training.routine.week", {
                      week: item.week,
                      weeks: item.weeks,
                    })}
              </Text>
              {!isCompleted && <ScoreChip state={item.scoreState} />}
            </View>

            <WeekCells
              week={item.week}
              weeks={item.weeks}
              weekFraction={item.weekFraction}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontFamily: mono(400),
                  fontSize: 11,
                  color: glass.ink3,
                }}
                numberOfLines={1}
              >
                {t("training.routineLibrary.adherence", {
                  done: item.sessionsDone,
                  planned: item.sessionsPlanned,
                  pct: adherencePct,
                })}
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
              >
                <TrendingUp size={11} color={glass.up} strokeWidth={2.2} />
                <Text
                  style={{
                    fontFamily: mono(500),
                    fontSize: 11,
                    color: glass.up,
                  }}
                >
                  {t("training.routineLibrary.volTrend", {
                    pct: item.volumeTrendPct,
                  })}
                </Text>
              </View>
            </View>
          </View>
        )}
      </GlassSurface>
    </Pressable>
  );
}
