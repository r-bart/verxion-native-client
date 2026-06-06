/**
 * DayTimeline — "Tu día": the whole day as a vertical spine (the "espina"),
 * built from the plan — past (logged), a "now" marker, and upcoming (planned)
 * items. Each item with a `ref` expands (accordion, one at a time) into a glass
 * card that lazy-loads its detail.
 */
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import {
  Scale,
  Droplet,
  Footprints,
  HeartPulse,
  Ruler,
  Pill,
  Utensils,
  Dumbbell,
  MessageSquare,
  Check,
  ChevronDown,
  ChevronUp,
  type LucideProps,
} from "lucide-react-native";
import type { ComponentType } from "react";
import type { TimelineEvent, TimelineEventKind, TimelineItemState } from "@/domain/today/models/TodayDashboard";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { formatTime } from "../lib/format";
import { SectionLabel } from "./SectionLabel";
import { TimelineItemCard } from "./TimelineItemCard";

const KIND_ICONS: Record<TimelineEventKind, ComponentType<LucideProps>> = {
  weight: Scale,
  water: Droplet,
  steps: Footprints,
  cardio: HeartPulse,
  perimeter: Ruler,
  supplement: Pill,
  meal: Utensils,
  workout: Dumbbell,
  session: Dumbbell,
  note: MessageSquare,
};

const NODE = 18;
const TIME_W = 46;

function Node({ state }: { state: TimelineItemState }) {
  const done = state === "done";
  const live = state === "in_progress";
  const overdue = state === "overdue";
  const filled = done || live;
  const borderColor = overdue ? palette.neutral.primary : glass.ink3;

  return (
    <View
      style={{
        width: NODE,
        height: NODE,
        borderRadius: 9999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: filled ? glass.lava : "transparent",
        borderWidth: filled ? 0 : 1.5,
        borderColor,
        marginTop: 1,
      }}
    >
      {done && <Check size={11} color={glass.fgOnLava} strokeWidth={3} />}
      {live && <View style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: glass.fgOnLava }} />}
    </View>
  );
}

function NowMarker() {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "center", marginVertical: 4 }}>
      <View style={{ width: TIME_W }} />
      <View style={{ width: NODE, alignItems: "center" }}>
        <View style={{ width: 9, height: 9, borderRadius: 9999, backgroundColor: glass.lava }} />
      </View>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ fontFamily: mono(700), fontSize: 9.5, letterSpacing: 1, color: glass.lava }}>
          {t("today.now").toUpperCase()}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: glass.lavaBorder }} />
      </View>
    </View>
  );
}

function Event({
  event,
  first,
  last,
  open,
  onToggle,
  timed = true,
}: {
  event: TimelineEvent;
  first: boolean;
  last: boolean;
  open: boolean;
  onToggle: () => void;
  /** Timed rows reserve the left hour column; pending (untimed) rows drop it. */
  timed?: boolean;
}) {
  const { i18n } = useTranslation();
  const Icon = KIND_ICONS[event.kind];
  const expandable = event.ref != null;
  const dim = event.state === "upcoming" || event.state === "rest";
  const subtitleColor = event.state === "overdue" ? palette.neutral.primary : glass.ink2;

  return (
    <Pressable onPress={expandable ? onToggle : undefined} disabled={!expandable}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {timed && (
          <Text
            style={{ width: TIME_W, fontFamily: mono(500), fontSize: 11, color: glass.ink3, marginTop: 1 }}
          >
            {event.time != null ? formatTime(event.time, i18n.language) : ""}
          </Text>
        )}

        {/* spine + node */}
        <View style={{ width: NODE, alignItems: "center" }}>
          <View
            style={{
              position: "absolute",
              top: first ? NODE / 2 : 0,
              bottom: last ? undefined : 0,
              height: last ? NODE / 2 : undefined,
              width: 1.5,
              backgroundColor: glass.stroke,
            }}
          />
          <Node state={event.state} />
        </View>

        {/* content */}
        <View style={{ flex: 1, paddingBottom: 14, opacity: dim ? 0.7 : 1 }}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
            <Icon size={15} color={glass.ink2} strokeWidth={2} style={{ marginTop: 1 }} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: sans(700), fontSize: 14, color: glass.white, letterSpacing: -0.2 }}>
                {event.title}
              </Text>
              {event.subtitle != null && (
                <Text style={{ fontFamily: mono(500), fontSize: 11.5, color: subtitleColor }}>
                  {event.subtitle}
                </Text>
              )}
            </View>
            {expandable &&
              (open ? (
                <ChevronUp size={16} color={glass.ink3} strokeWidth={2} style={{ marginTop: 1 }} />
              ) : (
                <ChevronDown size={16} color={glass.ink3} strokeWidth={2} style={{ marginTop: 1 }} />
              ))}
          </View>

          {open && event.ref != null && <TimelineItemCard itemRef={event.ref} />}
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Pending (untimed) items are grouped by type — we don't know what hour the
 * athlete will do each thing, so a flat "no time" list says little. Each
 * non-empty category gets a header; rows render without the hour column.
 */
const PENDING_CATEGORIES: { key: string; kinds: TimelineEventKind[] }[] = [
  { key: "meals", kinds: ["meal"] },
  { key: "supplements", kinds: ["supplement"] },
  { key: "training", kinds: ["workout", "session"] },
  { key: "activity", kinds: ["weight", "water", "steps", "cardio", "perimeter"] },
  { key: "notes", kinds: ["note"] },
];

function CategoryHeader({ label }: { label: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 6,
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontFamily: mono(600),
          fontSize: 9.5,
          letterSpacing: 0.9,
          color: glass.ink3,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: glass.stroke }} />
    </View>
  );
}

export function DayTimeline({ events }: { events: TimelineEvent[] }) {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);

  // Timed items hold the spine (sorted/now-marked); untimed pending items have
  // no hour, so they sit under a "pending" divider at the end.
  const timed = events.filter((e) => e.time != null);
  const untimed = events.filter((e) => e.time == null);
  const firstUpcoming = timed.findIndex((e) => e.state === "upcoming");

  const renderRow = (e: TimelineEvent, i: number, count: number, timed = true) => (
    <Event
      event={e}
      first={i === 0}
      last={i === count - 1}
      timed={timed}
      open={openId === e.id}
      onToggle={() => setOpenId(openId === e.id ? null : e.id)}
    />
  );

  return (
    <View style={{ gap: 12 }}>
      <SectionLabel>{t("today.yourDay")}</SectionLabel>
      <View>
        {timed.map((e, i) => (
          <View key={e.id}>
            {i === firstUpcoming && <NowMarker />}
            {renderRow(e, i, timed.length)}
          </View>
        ))}

        {untimed.length > 0 &&
          PENDING_CATEGORIES.map((cat) => {
            const items = untimed.filter((e) => cat.kinds.includes(e.kind));
            if (items.length === 0) return null;
            return (
              <View key={cat.key}>
                <CategoryHeader label={t(`today.pendingGroups.${cat.key}`)} />
                {items.map((e, i) => (
                  <View key={e.id}>{renderRow(e, i, items.length, false)}</View>
                ))}
              </View>
            );
          })}
      </View>
    </View>
  );
}
