/**
 * SessionExerciseCard — one exercise in a completed session's breakdown: the
 * name, muscle · equipment · prescription, and the real per-set chips. Taps into
 * the exercise detail. Mirrors the handoff's `SdExercise`.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { fmtPrescription, fmtSet } from "../lib/sessionFormat";
import type { SessionExerciseItem } from "@/domain/training/models/SessionDetailView";

export function SessionExerciseCard({
  exercise,
}: {
  exercise: SessionExerciseItem;
}) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.push(`/workout/ejercicio/${exercise.exerciseId}` as Href)
      }
      accessibilityRole="button"
      accessibilityLabel={`Ver ejercicio ${exercise.name}`}
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface
        radius={16}
        style={{
          padding: 13,
          gap: 11,
          borderWidth: 1,
          borderColor: glass.stroke,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <View style={{ flex: 1, gap: 3 }}>
            <Text
              style={{
                fontFamily: sans(600),
                fontSize: 14.5,
                color: glass.white,
              }}
            >
              {exercise.name}
            </Text>
            <Text
              style={{
                fontFamily: mono(400),
                fontSize: 11.5,
                color: glass.ink2,
              }}
              numberOfLines={1}
            >
              {exercise.muscle} · {exercise.equipment}
              {exercise.prescription
                ? ` · ${fmtPrescription(locale, exercise.prescription)}`
                : ""}
            </Text>
          </View>
          <ChevronRight
            size={15}
            color="rgba(255,255,255,0.26)"
            strokeWidth={2}
            style={{ alignSelf: "center" }}
          />
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {exercise.sets.map((set, i) => (
            <View
              key={`set-${i}-${set.weight}kg-${set.reps}r`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: glass.fill,
                borderWidth: 1,
                borderColor: glass.stroke,
              }}
            >
              <Text
                style={{
                  fontFamily: mono(700),
                  fontSize: 9,
                  color: glass.ink3,
                }}
              >
                {i + 1}
              </Text>
              <Text
                style={{
                  fontFamily: mono(500),
                  fontSize: 11.5,
                  color: glass.ink,
                }}
              >
                {fmtSet(locale, set)}
              </Text>
            </View>
          ))}
        </View>
      </GlassSurface>
    </Pressable>
  );
}
