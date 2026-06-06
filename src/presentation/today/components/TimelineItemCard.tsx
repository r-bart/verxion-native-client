/**
 * TimelineItemCard — the glass card a timeline item expands into. Lazy-loads its
 * detail (only when open) and renders a per-kind layout (meal / workout /
 * session / supplement / note / metric). Agent-mockup card styling.
 */
import { View, Text, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react-native";
import type {
  TimelineRef,
  TimelineItemDetail,
  MealDetail,
  WorkoutDetail,
  SessionDetail,
  SupplementDetail,
  NoteDetail,
  MetricDetail,
} from "@/domain/today/models/TodayDashboard";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { useTimelineItemDetail } from "../hooks/useTimelineItemDetail";

function Eyebrow({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontFamily: mono(600),
        fontSize: 9.5,
        letterSpacing: 0.8,
        color: glass.ink3,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Text>
  );
}

function StatPill({ label }: { label: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 9999,
        backgroundColor: glass.fill2,
        borderWidth: 1,
        borderColor: glass.stroke,
      }}
    >
      <Text style={{ fontFamily: mono(500), fontSize: 11, color: glass.ink }}>{label}</Text>
    </View>
  );
}

function MealCard({ d }: { d: MealDetail }) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {d.window != null && <StatPill label={d.window} />}
        {d.calories != null && <StatPill label={`${d.calories} kcal`} />}
        {d.protein != null && <StatPill label={`${d.protein} g prot`} />}
      </View>

      <View style={{ gap: 8 }}>
        {d.items.map((it, i) => (
          <View key={`meal-item-${it.name}-${i}`} style={{ gap: 2 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
              <Text style={{ flex: 1, fontFamily: sans(600), fontSize: 13.5, color: glass.white }}>
                {it.name}
              </Text>
              <Text style={{ fontFamily: mono(500), fontSize: 12, color: glass.ink2 }}>{it.amount}</Text>
            </View>
            {it.alternatives.length > 0 && (
              <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}>
                {t("today.card.alt")}: {it.alternatives.join(" · ")}
              </Text>
            )}
          </View>
        ))}
      </View>

      {d.supplements.length > 0 && (
        <View style={{ gap: 4 }}>
          <Eyebrow>{t("today.fronts.supplements")}</Eyebrow>
          <Text style={{ fontFamily: mono(500), fontSize: 12, color: glass.ink2 }}>
            {d.supplements.join(" · ")}
          </Text>
        </View>
      )}
    </View>
  );
}

function WorkoutCard({ d }: { d: WorkoutDetail }) {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {d.focus != null && <StatPill label={d.focus} />}
        {d.durationMin != null && <StatPill label={`~${d.durationMin} min`} />}
        <StatPill label={`${d.exercises.length} ej.`} />
      </View>
      <View style={{ gap: 7 }}>
        {d.exercises.map((ex, i) => (
          <View key={`exercise-${ex.name}-${i}`} style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            <Text style={{ flex: 1, fontFamily: sans(600), fontSize: 13.5, color: glass.white }}>
              {ex.name}
            </Text>
            <Text style={{ fontFamily: mono(500), fontSize: 12, color: glass.ink2 }}>{ex.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SessionCard({ d }: { d: SessionDetail }) {
  const { t } = useTranslation();
  const stats: [string, string][] = [];
  if (d.durationMin != null) stats.push([t("today.card.duration"), `${d.durationMin} min`]);
  if (d.volumeKg != null) stats.push([t("today.card.volume"), `${d.volumeKg.toLocaleString()} kg`]);
  if (d.sets != null) stats.push([t("today.card.sets"), String(d.sets)]);
  if (d.completionPct != null) stats.push([t("today.card.completion"), `${d.completionPct}%`]);
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
      {stats.map(([label, value], i) => (
        <View key={`stat-${label}-${i}`} style={{ gap: 3, minWidth: 70 }}>
          <Eyebrow>{label}</Eyebrow>
          <Text style={{ fontFamily: sans(700), fontSize: 16, color: glass.white }}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function SupplementCard({ d }: { d: SupplementDetail }) {
  return (
    <View style={{ gap: 9 }}>
      {d.items.map((s, i) => (
        <View key={`supplement-${s.name}-${i}`} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: s.taken ? glass.up : "transparent",
              borderWidth: s.taken ? 0 : 1.5,
              borderColor: glass.ink3,
            }}
          >
            {s.taken && <Check size={11} color={glass.fgOnLava} strokeWidth={3} />}
          </View>
          <Text style={{ flex: 1, fontFamily: sans(600), fontSize: 13.5, color: glass.white }}>
            {s.name}
          </Text>
          <Text style={{ fontFamily: mono(500), fontSize: 12, color: glass.ink2 }}>
            {s.dose}
            {s.timing != null ? ` · ${s.timing}` : ""}
          </Text>
        </View>
      ))}
    </View>
  );
}

function NoteCard({ d }: { d: NoteDetail }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: sans(700), fontSize: 15, color: glass.white, letterSpacing: -0.3 }}>
        {d.title}
      </Text>
      <Text style={{ fontFamily: sans(400), fontSize: 13.5, lineHeight: 19, color: glass.ink }}>
        {d.body}
      </Text>
    </View>
  );
}

function MetricCard({ d }: { d: MetricDetail }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ gap: 2 }}>
        <Text style={{ fontFamily: sans(700), fontSize: 24, color: glass.white, letterSpacing: -0.6 }}>
          {d.value}
        </Text>
        {d.caption != null && (
          <Text style={{ fontFamily: mono(500), fontSize: 11.5, color: glass.ink2 }}>{d.caption}</Text>
        )}
      </View>
      {d.rows.length > 0 && (
        <View style={{ gap: 6 }}>
          {d.rows.map((r, i) => (
            <View key={`metric-${r.label}-${i}`} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink3 }}>{r.label}</Text>
              <Text style={{ fontFamily: mono(500), fontSize: 12, color: glass.ink }}>{r.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function DetailBody({ detail }: { detail: TimelineItemDetail }) {
  switch (detail.kind) {
    case "meal":
      return <MealCard d={detail} />;
    case "workout":
      return <WorkoutCard d={detail} />;
    case "session":
      return <SessionCard d={detail} />;
    case "supplement":
      return <SupplementCard d={detail} />;
    case "note":
      return <NoteCard d={detail} />;
    default:
      return <MetricCard d={detail} />;
  }
}

export function TimelineItemCard({ itemRef }: { itemRef: TimelineRef }) {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useTimelineItemDetail(itemRef, true);

  return (
    <GlassSurface radius={16} style={{ padding: 14, marginTop: 4 }}>
      {isLoading ? (
        <ActivityIndicator color={glass.lava} />
      ) : isError || !data ? (
        <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink2 }}>
          {t("today.card.error")}
        </Text>
      ) : (
        <DetailBody detail={data} />
      )}
    </GlassSurface>
  );
}
