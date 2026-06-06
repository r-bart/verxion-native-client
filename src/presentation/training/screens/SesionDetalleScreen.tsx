/**
 * SesionDetalleScreen — the persisted report of a completed session (read-only):
 * the hero, the agent recap, 6 KPI tiles, the real per-set breakdown by exercise
 * (each taps into the exercise detail), the user's close-out rating + note, and
 * the muscle-group split. Correcting a record is a request to the agent, never a
 * hand edit.
 */
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { ChevronRight, Layers, Star, Activity } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { Isotype } from "@/presentation/_shared/components/Isotype";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { DetailScaffold } from "../components/DetailScaffold";
import { SegmentError } from "../components/SegmentError";
import { SessionDetailHero } from "../components/SessionDetailHero";
import { SessionTiles } from "../components/SessionTiles";
import { SessionExerciseCard } from "../components/SessionExerciseCard";
import { SessionAssessment } from "../components/SessionAssessment";
import { SessionMuscleBars } from "../components/SessionMuscleBars";
import { useSessionDetailView } from "../hooks/useSessionDetailView";

function Section({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {icon}
      <Text
        style={{
          fontFamily: mono(600),
          fontSize: 11,
          letterSpacing: 0.6,
          color: glass.ink2,
          textTransform: "uppercase",
        }}
      >
        {children}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: glass.stroke }} />
    </View>
  );
}

function RecapCard({ message }: { message: string }) {
  const { t } = useTranslation();
  return (
    <GlassSurface
      radius={18}
      tintColor={glass.lavaBg}
      fallbackFill={glass.lavaBg}
      style={{
        padding: 16,
        gap: 10,
        borderColor: glass.lavaBorder,
        borderWidth: 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Isotype size={16} glow />
        <Text
          style={{ fontFamily: sans(700), fontSize: 12, color: glass.lava }}
        >
          {t("training.sessionDetail.recapFrom")}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: mono(400),
          fontSize: 13,
          lineHeight: 19,
          color: glass.ink,
        }}
      >
        {message}
      </Text>
    </GlassSurface>
  );
}

function UserNote({ note }: { note: string }) {
  const { t } = useTranslation();
  return (
    <GlassSurface radius={16} style={{ padding: 14, gap: 6 }}>
      <Text
        style={{
          fontFamily: mono(600),
          fontSize: 10,
          letterSpacing: 0.4,
          color: glass.ink3,
          textTransform: "uppercase",
        }}
      >
        {t("training.sessionDetail.yourNote")}
      </Text>
      <Text
        style={{
          fontFamily: sans(400),
          fontSize: 13.5,
          lineHeight: 19,
          color: glass.ink,
          fontStyle: "italic",
        }}
      >
        “{note}”
      </Text>
    </GlassSurface>
  );
}

function AskAgentSurface() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push("/agent" as Href)}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface
        radius={18}
        style={{
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 13,
        }}
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
          <Isotype size={18} glow />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text
            style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }}
          >
            {t("training.sessionDetail.ask.title")}
          </Text>
          <Text
            style={{
              fontFamily: mono(400),
              fontSize: 11.5,
              color: glass.ink2,
              lineHeight: 16,
            }}
          >
            {t("training.sessionDetail.ask.body")}
          </Text>
        </View>
        <ChevronRight
          size={18}
          color="rgba(255,255,255,0.28)"
          strokeWidth={2}
        />
      </GlassSurface>
    </Pressable>
  );
}

export function SesionDetalleScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useSessionDetailView(id ?? "");

  if (isLoading) {
    return (
      <DetailScaffold title={t("training.screens.sessionDetail")}>
        <View style={{ gap: 12, paddingTop: 4 }}>
          <GlassSurface radius={24} style={{ height: 200 }} />
          <GlassSurface radius={18} style={{ height: 96 }} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassSurface
                key={i}
                radius={16}
                style={{ flex: 1, height: 92 }}
              />
            ))}
          </View>
          {Array.from({ length: 3 }).map((_, i) => (
            <GlassSurface key={i} radius={16} style={{ height: 96 }} />
          ))}
        </View>
      </DetailScaffold>
    );
  }
  if (isError || !data) {
    return (
      <DetailScaffold title={t("training.screens.sessionDetail")}>
        <View style={{ paddingTop: 8 }}>
          <SegmentError onRetry={() => refetch()} />
        </View>
      </DetailScaffold>
    );
  }

  return (
    <DetailScaffold title={data.header.name}>
      <View style={{ paddingTop: 4, gap: 18 }}>
        <SessionDetailHero header={data.header} />
        {data.recap ? <RecapCard message={data.recap} /> : null}
        <SessionTiles tiles={data.tiles} />

        <Section icon={<Layers size={15} color={glass.ink2} strokeWidth={2} />}>
          {t("training.sessionDetail.exercises", {
            count: data.exercises.length,
          })}
        </Section>
        <View style={{ gap: 8 }}>
          {data.exercises.map((exercise) => (
            <SessionExerciseCard
              key={exercise.exerciseId}
              exercise={exercise}
            />
          ))}
        </View>

        {data.assessment && (
          <>
            <Section
              icon={<Star size={15} color={glass.ink2} strokeWidth={2} />}
            >
              {t("training.sessionDetail.yourRating")}
            </Section>
            <SessionAssessment assessment={data.assessment} />
            {data.note && <UserNote note={data.note} />}
          </>
        )}

        {data.muscles.length > 0 && (
          <>
            <Section
              icon={<Activity size={15} color={glass.ink2} strokeWidth={2} />}
            >
              {t("training.sessionDetail.muscleGroups")}
            </Section>
            <SessionMuscleBars muscles={data.muscles} />
          </>
        )}

        <AskAgentSurface />
      </View>
    </DetailScaffold>
  );
}
