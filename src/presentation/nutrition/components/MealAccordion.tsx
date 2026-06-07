/**
 * MealAccordion — one meal in the day plan: a tappable header (meal-type icon,
 * name, logged/pending badge, macros) that expands to reveal the meal's food items
 * (each tapping through to its detail). Read-only. Gated expand animation is
 * unnecessary (height is content-driven), so this just toggles visibility.
 */
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { ChevronDown, ChevronUp, Check } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { nInt } from "../lib/format";
import { mealTypeVisual } from "../lib/mealType";
import { MacroLine } from "./MacroLine";
import type { DietDayPlanMeal } from "@/domain/nutrition/models/DietDayPlan";

export function MealAccordion({ meal }: { meal: DietDayPlanMeal }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const visual = mealTypeVisual(meal.mealType);
  const logged = meal.loggedAt != null;

  return (
    <GlassSurface radius={16} style={{ overflow: "hidden" }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
      >
        <View style={{ padding: 13, flexDirection: "row", alignItems: "center", gap: 11 }}>
          <IconBubble bg={glass.lavaBg} size={40}>
            <visual.Icon size={20} color={glass.lava} strokeWidth={2} />
          </IconBubble>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
              <Text
                style={{ fontFamily: sans(600), fontSize: 14, color: glass.white }}
                numberOfLines={1}
              >
                {meal.name}
              </Text>
              {logged && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  <Check size={11} color={glass.up} strokeWidth={2.6} />
                  <Text style={{ fontFamily: sans(600), fontSize: 10, color: glass.up }}>
                    {t("nutrition.dayPlan.logged")}
                  </Text>
                </View>
              )}
            </View>
            <MacroLine macros={meal.macros} />
          </View>
          {open ? (
            <ChevronUp size={18} color={glass.ink3} strokeWidth={2} />
          ) : (
            <ChevronDown size={18} color={glass.ink3} strokeWidth={2} />
          )}
        </View>
      </Pressable>

      {open && meal.items.length > 0 && (
        <View
          style={{
            paddingHorizontal: 13,
            paddingBottom: 13,
            gap: 8,
            borderTopWidth: 1,
            borderTopColor: glass.stroke,
            paddingTop: 12,
          }}
        >
          {meal.items.map((it) => (
            <Pressable
              key={it.id}
              onPress={() =>
                router.push(`/nutrition/alimento/${it.kind}/${it.refId}` as Href)
              }
              accessibilityRole="button"
              style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <Text
                  style={{ flex: 1, fontFamily: sans(500), fontSize: 13, color: glass.ink }}
                  numberOfLines={1}
                >
                  {it.name}
                </Text>
                <Text style={{ fontFamily: mono(500), fontSize: 11.5, color: glass.ink2 }}>
                  {nInt(it.quantity)} {it.unit}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </GlassSurface>
  );
}
