/**
 * ProgramCouplingCards — the "Lo que acopla" section: a card for the coupled
 * routine (→ its detail) and one for the coupled diet (→ its detail). A missing
 * side renders a dashed empty slot that routes to the agent (coupling is a request
 * to verxion, never a write). Mirrors the handoff `PgdRoutineCard`/`PgdDietCard`.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { Dumbbell, Utensils, ChevronRight, Plus } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { ProgramOverview } from "@/domain/program/models/Program";
import { pgInt } from "../lib/format";

function CoupleCard({
  kind,
  name,
  meta,
  href,
}: {
  kind: "routine" | "diet";
  name: string;
  meta: string;
  href: Href;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const isDiet = kind === "diet";
  const color = isDiet ? palette.body.text : glass.lava;
  const bg = isDiet ? palette.body.background : glass.lavaBg;
  const Icon = isDiet ? Utensils : Dumbbell;
  return (
    <Pressable onPress={() => router.push(href)} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}>
      <GlassSurface radius={16} style={{ padding: 13, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <IconBubble bg={bg} size={44} radius={13}>
          <Icon size={21} color={color} strokeWidth={2} />
        </IconBubble>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontFamily: mono(600), fontSize: 9.5, letterSpacing: 0.6, color: glass.ink3, textTransform: "uppercase" }}>
            {t(isDiet ? "program.detail.dietK" : "program.detail.routineK")}
          </Text>
          <Text style={{ fontFamily: sans(700), fontSize: 15, color: glass.white, letterSpacing: -0.3 }} numberOfLines={1}>
            {name}
          </Text>
          <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink2 }} numberOfLines={1}>
            {meta}
          </Text>
        </View>
        <ChevronRight size={18} color="rgba(255,255,255,0.3)" strokeWidth={2} />
      </GlassSurface>
    </Pressable>
  );
}

function EmptyCouple({ kind }: { kind: "routine" | "diet" }) {
  const { t } = useTranslation();
  const router = useRouter();
  const isDiet = kind === "diet";
  const Icon = isDiet ? Utensils : Dumbbell;
  return (
    <Pressable onPress={() => router.push("/agent")} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}>
      <View style={{ padding: 13, borderRadius: 16, borderWidth: 1, borderColor: glass.stroke, borderStyle: "dashed", flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: glass.stroke, borderStyle: "dashed" }}>
          <Icon size={20} color={glass.ink3} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontFamily: mono(600), fontSize: 9.5, letterSpacing: 0.6, color: glass.ink3, textTransform: "uppercase" }}>
            {t(isDiet ? "program.detail.dietK" : "program.detail.routineK")}
          </Text>
          <Text style={{ fontFamily: sans(600), fontSize: 14, color: glass.ink2 }}>
            {t(isDiet ? "program.detail.emptyDiet" : "program.detail.emptyRoutine")}
          </Text>
          <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}>{t("program.detail.emptyCoupleHint")}</Text>
        </View>
        <Plus size={18} color={glass.ink3} strokeWidth={2} />
      </View>
    </Pressable>
  );
}

export function ProgramCouplingCards({ program }: { program: ProgramOverview }) {
  const { t } = useTranslation();
  const r = program.routine;
  const d = program.dietPlan;

  return (
    <View style={{ gap: 10 }}>
      {r ? (
        <CoupleCard
          kind="routine"
          name={r.name}
          meta={[
            r.type,
            r.totalWeeks > 0 ? t("program.detail.weekShort", { week: r.week, total: r.totalWeeks }) : null,
            r.adherenceScore != null ? t("program.detail.adhShort", { pct: r.adherenceScore }) : null,
          ]
            .filter(Boolean)
            .join(" · ")}
          href={`/workout/rutinas/${r.id}` as Href}
        />
      ) : (
        <EmptyCouple kind="routine" />
      )}

      {d ? (
        <CoupleCard
          kind="diet"
          name={d.name}
          meta={[
            d.calories != null ? `${pgInt(d.calories)} kcal` : null,
            d.protein != null ? `${d.protein} g P` : null,
            d.totalWeeks && d.week != null ? t("program.detail.weekShort", { week: d.week, total: d.totalWeeks }) : null,
          ]
            .filter(Boolean)
            .join(" · ")}
          href={`/nutrition/dieta/${d.id}` as Href}
        />
      ) : (
        <EmptyCouple kind="diet" />
      )}
    </View>
  );
}
