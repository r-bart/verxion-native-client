/**
 * RoutineDayCard — one day in the routine's rotation: a status node (a check when
 * done, else the type icon), the day-of-week + name + type tag + a "hoy" badge,
 * the focus, and a meta line (exercises · sets · estimate). Today's day opens the
 * prescription; other training days open the day detail; rest days don't tap.
 * Mirrors the handoff's `RtDayCard`.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { Check, ChevronRight } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { DAY_TYPE } from "../lib/dayType";
import type { RoutineDetailDay } from "@/domain/training/models/RoutineDetailView";

export function RoutineDayCard({ day }: { day: RoutineDetailDay }) {
  const { t } = useTranslation();
  const router = useRouter();
  const cfg = DAY_TYPE[day.type];
  const isRest = day.status === "rest";
  const isDone = day.status === "done";
  const tappable = !isRest && day.dayId != null;

  const href: Href | null = !tappable
    ? null
    : day.isToday
    ? (`/workout/prescripcion?dayId=${day.dayId}` as Href)
    : (`/workout/dia/${day.dayId}` as Href);

  const body = (
    <GlassSurface
      radius={16}
      style={{
        padding: 13,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        opacity: isDone ? 0.82 : 1,
      }}
    >
      <IconBubble bg={cfg.bg} size={40} radius={13}>
        {isDone ? (
          <Check size={17} color={cfg.color} strokeWidth={2.6} />
        ) : (
          <cfg.Icon size={17} color={cfg.color} strokeWidth={2} />
        )}
      </IconBubble>

      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <Text
            style={{ fontFamily: mono(500), fontSize: 11, color: glass.ink3 }}
          >
            {day.dayOfWeek}
          </Text>
          <Text
            style={{
              fontFamily: sans(600),
              fontSize: 14.5,
              color: glass.white,
            }}
            numberOfLines={1}
          >
            {day.name}
          </Text>
          {!isRest && (
            <View
              style={{
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 6,
                backgroundColor: cfg.bg,
              }}
            >
              <Text
                style={{
                  fontFamily: sans(600),
                  fontSize: 9.5,
                  color: cfg.color,
                }}
              >
                {t(`training.dayType.${day.type}`)}
              </Text>
            </View>
          )}
          {day.isToday && (
            <View
              style={{
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 6,
                backgroundColor: glass.lava,
              }}
            >
              <Text
                style={{
                  fontFamily: sans(700),
                  fontSize: 9.5,
                  color: glass.fgOnLava,
                }}
              >
                {t("training.routineDetail.today")}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink2 }}
          numberOfLines={1}
        >
          {day.focus}
        </Text>
        {!isRest && (
          <Text
            style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}
            numberOfLines={1}
          >
            {t("training.routineDetail.dayMeta", {
              ex: day.exercisesCount,
              sets: day.setsCount,
              est: day.estimate,
            })}
          </Text>
        )}
      </View>

      {tappable && (
        <ChevronRight
          size={16}
          color="rgba(255,255,255,0.28)"
          strokeWidth={2}
        />
      )}
    </GlassSurface>
  );

  if (!tappable || href == null) return body;

  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      {body}
    </Pressable>
  );
}
