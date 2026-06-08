/**
 * WeekSpine — "La semana · tu rotación": a vertical timeline of the 7 rotation
 * days. Each row is a status node (done = lava + check; now = lava ring; up =
 * gray) joined by a connector, beside a glass card with the day, a type chip and
 * the exercise count. Days route by status: done/up → day detail, now →
 * prescription, live → live session. Rest days aren't tappable. Mirrors the
 * handoff's "Espina semanal".
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { Check } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { dayKindChip } from "../lib/dayType";
import type { SpineDay } from "@/domain/training/models/RoutineDashboard";

const NODE = 22;

function hrefFor(day: SpineDay): Href | null {
  if (day.type === "rest") return null;
  if (day.status === "live") return "/workout/sesion";
  if (day.status === "now") return `/workout/prescripcion?dayId=${day.dayId}` as Href;
  return `/workout/dia/${day.dayId}` as Href;
}

function Node({ status }: { status: SpineDay["status"] }) {
  if (status === "done") {
    return (
      <View style={{ width: NODE, height: NODE, borderRadius: NODE / 2, backgroundColor: glass.lava, alignItems: "center", justifyContent: "center" }}>
        <Check size={13} color={glass.fgOnLava} strokeWidth={3} />
      </View>
    );
  }
  if (status === "now" || status === "live") {
    return (
      <View style={{ width: NODE, height: NODE, borderRadius: NODE / 2, borderWidth: 2.5, borderColor: glass.lava, backgroundColor: glass.lavaBg }} />
    );
  }
  return (
    <View style={{ width: NODE, height: NODE, borderRadius: NODE / 2, borderWidth: 2, borderColor: "rgba(255,255,255,0.18)" }} />
  );
}

function SpineRow({ day, last }: { day: SpineDay; last: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const cfg = dayKindChip(day.type);
  const href = hrefFor(day);

  const card = (
    <GlassSurface radius={16} style={{ flex: 1, padding: 13, flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontFamily: sans(700), fontSize: 15, color: glass.white }}>{day.name}</Text>
          <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 9999, backgroundColor: cfg.bg }}>
            <Text style={{ fontFamily: mono(600), fontSize: 9, letterSpacing: 0.6, color: cfg.color, textTransform: "uppercase" }}>
              {t(`training.dayType.${day.type}`)}
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink2 }}>
          {day.exercisesCount > 0 ? t("training.spine.exercisesCount", { count: day.exercisesCount }) : (day.focus ?? "")}
        </Text>
      </View>
    </GlassSurface>
  );

  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      {/* node + connector column */}
      <View style={{ alignItems: "center", width: NODE }}>
        <Node status={day.status} />
        {!last && <View style={{ flex: 1, width: 2, backgroundColor: "rgba(255,255,255,0.10)", marginTop: 2 }} />}
      </View>

      <View style={{ flex: 1, paddingBottom: last ? 0 : 10 }}>
        {href ? (
          <Pressable onPress={() => router.push(href)} style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}>
            {card}
          </Pressable>
        ) : (
          card
        )}
      </View>
    </View>
  );
}

export function WeekSpine({ spine }: { spine: SpineDay[] }) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: 10 }}>
      <Text
        style={{
          fontFamily: mono(600),
          fontSize: 10,
          letterSpacing: 0.9,
          color: glass.ink3,
          textTransform: "uppercase",
        }}
      >
        {t("training.spine.title")} · {t("training.spine.subtitle")}
      </Text>
      <View>
        {spine.map((day, i) => (
          <SpineRow key={day.dayId} day={day} last={i === spine.length - 1} />
        ))}
      </View>
    </View>
  );
}
