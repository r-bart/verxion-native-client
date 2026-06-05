/**
 * DayExerciseCard — one exercise in the day's plan: an index rail (tinted on the
 * key lift), the name + "principal" tag, muscle · equipment, the target, the
 * prescription row (sets×reps · RIR · rest · progression), and the last result.
 * Taps into the exercise detail. Mirrors the handoff's `DdExCard`.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { Timer, ChevronRight, TrendingUp } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { DAY_TYPE } from "../lib/dayType";
import type { DayType } from "@/domain/training/models/RoutineDashboard";
import type { DayExerciseItem } from "@/domain/training/models/DayDetailView";

export function DayExerciseCard({
  exercise,
  type,
}: {
  exercise: DayExerciseItem;
  type: DayType;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const cfg = DAY_TYPE[type];

  return (
    <Pressable
      onPress={() =>
        router.push(`/workout/ejercicio/${exercise.exerciseId}` as Href)
      }
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface
        radius={16}
        style={{ padding: 13, flexDirection: "row", gap: 12 }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: exercise.isKey ? cfg.color : glass.stroke,
            backgroundColor: exercise.isKey ? cfg.bg : "transparent",
          }}
        >
          <Text
            style={{
              fontFamily: mono(600),
              fontSize: 12,
              color: exercise.isKey ? cfg.color : glass.ink2,
            }}
          >
            {exercise.index}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 6 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                <Text
                  style={{
                    fontFamily: sans(600),
                    fontSize: 14.5,
                    color: glass.white,
                  }}
                >
                  {exercise.name}
                </Text>
                {exercise.isKey && (
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
                      {t("training.dayDetail.key")}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  fontFamily: mono(400),
                  fontSize: 11.5,
                  color: glass.ink2,
                }}
                numberOfLines={1}
              >
                {exercise.muscle} · {exercise.equipment}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontFamily: sans(700),
                  fontSize: 14,
                  color: glass.white,
                }}
              >
                {exercise.target}
              </Text>
              <Text
                style={{
                  fontFamily: mono(400),
                  fontSize: 9.5,
                  color: glass.ink3,
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                }}
              >
                {t("training.dayDetail.target")}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Text
              style={{ fontFamily: mono(500), fontSize: 12, color: glass.ink }}
            >
              <Text style={{ fontFamily: sans(700), color: glass.white }}>
                {exercise.sets}
              </Text>
              ×{exercise.repRange}
            </Text>
            <Text
              style={{
                fontFamily: mono(400),
                fontSize: 11.5,
                color: glass.ink3,
              }}
            >
              RIR {exercise.rir}
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
            >
              <Timer size={11} color={glass.ink3} strokeWidth={2} />
              <Text
                style={{
                  fontFamily: mono(400),
                  fontSize: 11.5,
                  color: glass.ink3,
                }}
              >
                {exercise.rest}
              </Text>
            </View>
            {exercise.progression && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
              >
                <TrendingUp size={11} color={glass.up} strokeWidth={2.4} />
                <Text
                  style={{
                    fontFamily: mono(500),
                    fontSize: 11.5,
                    color: glass.up,
                  }}
                >
                  {exercise.progression}
                </Text>
              </View>
            )}
          </View>

          {exercise.lastResult && (
            <Text
              style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}
            >
              {t("training.dayDetail.last", { result: exercise.lastResult })}
            </Text>
          )}
        </View>

        <ChevronRight
          size={16}
          color="rgba(255,255,255,0.26)"
          strokeWidth={2}
          style={{ alignSelf: "center" }}
        />
      </GlassSurface>
    </Pressable>
  );
}
