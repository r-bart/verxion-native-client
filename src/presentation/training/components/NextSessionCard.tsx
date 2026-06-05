/**
 * NextSessionCard — the next action in the rotation. Workout variant: a lava
 * glass card with the day-type bubble, "Hoy toca", the day title + focus, the
 * exercise/set/min meta, and a play button that opens today's prescription.
 * Rest variant: a calmer card with the moon bubble and the rest copy. Mirrors
 * the handoff's "Próxima sesión".
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { Play } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { DAY_TYPE } from "../lib/dayType";
import type { NextSession } from "@/domain/training/models/RoutineDashboard";

export function NextSessionCard({ next }: { next: NextSession }) {
  const { t } = useTranslation();
  const router = useRouter();

  if (next.kind === "rest") {
    const rest = DAY_TYPE.rest;
    return (
      <GlassSurface radius={20} fallbackFill={glass.fill} style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 14 }}>
        <IconBubble bg={rest.bg} size={44}>
          <rest.Icon size={22} color={rest.color} strokeWidth={2} />
        </IconBubble>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontFamily: mono(600), fontSize: 10, letterSpacing: 1, color: rest.color, textTransform: "uppercase" }}>
            {t("training.next.rest")}
          </Text>
          <Text style={{ fontFamily: sans(700), fontSize: 17, color: glass.white, letterSpacing: -0.3 }}>
            {next.title}
          </Text>
          <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink2 }}>{next.subtitle}</Text>
        </View>
      </GlassSurface>
    );
  }

  const day = DAY_TYPE[next.type];
  return (
    <GlassSurface
      radius={20}
      tintColor={glass.lavaBg}
      fallbackFill={glass.lavaBg}
      style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 14, borderColor: glass.lavaBorder, borderWidth: 1 }}
    >
      <IconBubble bg={day.bg} size={44}>
        <day.Icon size={22} color={day.color} strokeWidth={2} />
      </IconBubble>

      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ fontFamily: mono(600), fontSize: 10, letterSpacing: 1, color: glass.lava, textTransform: "uppercase" }}>
          {t("training.next.today")}
        </Text>
        <Text style={{ fontFamily: sans(700), fontSize: 17, color: glass.white, letterSpacing: -0.3 }}>
          {next.title} · {next.focus}
        </Text>
        <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink2 }}>
          {t("training.next.meta", { exercises: next.exercisesCount, sets: next.setsCount, min: next.estimatedMin })}
        </Text>
      </View>

      <Pressable
        onPress={() => router.push(`/workout/prescripcion?dayId=${next.dayId}` as Href)}
        accessibilityRole="button"
        accessibilityLabel={t("training.next.start")}
        style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: glass.lava,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: glass.lava,
            shadowOpacity: 0.55,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 0 },
          }}
        >
          <Play size={20} color={glass.fgOnLava} fill={glass.fgOnLava} strokeWidth={0} />
        </View>
      </Pressable>
    </GlassSurface>
  );
}
