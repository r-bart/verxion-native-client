/**
 * Maps the API `mealType` (the platform enum) to a Lucide icon for the meal
 * spine and intake CTA. The handoff leads each meal with a time-of-day glyph;
 * we key it off `mealType` since the dashboard read-model carries no clock time.
 * Unknown / log-only types fall back to a generic utensils glyph.
 */
import {
  Sunrise,
  Coffee,
  Utensils,
  Apple,
  Zap,
  Dumbbell,
  Moon,
  Cookie,
  type LucideIcon,
} from "lucide-react-native";

const MEAL_ICONS: Record<string, LucideIcon> = {
  breakfast: Sunrise,
  morning_snack: Coffee,
  lunch: Utensils,
  afternoon_snack: Apple,
  pre_workout: Zap,
  post_workout: Dumbbell,
  dinner: Moon,
  evening_snack: Cookie,
};

/** Returns the meal's icon wrapped in an object so consumers render it via
 *  member access (`<visual.Icon />`) — keeps the component reference static at
 *  the render site, the same idiom as `dayKindChip`. */
export function mealTypeVisual(mealType: string): { Icon: LucideIcon } {
  return { Icon: MEAL_ICONS[mealType] ?? Utensils };
}
