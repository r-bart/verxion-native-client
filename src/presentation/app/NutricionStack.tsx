import { Stack } from "expo-router";

/**
 * Nutrición navigator. The landing (`index`) and each subscreen are
 * auto-registered by their files under `app/(tabs)/nutrition/`; detail screens
 * (dietas, dieta, comida, alimento, plan-comidas, día-diario) slide in from the
 * right and push over the landing. Lives in presentation so the
 * `app/(tabs)/nutrition/_layout.tsx` route stays a thin delegator — same split
 * as `EntrenoStack`.
 */
export function NutricionStack() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    />
  );
}
