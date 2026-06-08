import { Stack } from "expo-router";

/**
 * Progreso navigator. The landing (`index`) and each subscreen are auto-registered
 * by their files under `app/(tabs)/progress/`; detail screens (Detalle de medida,
 * Detalle de ejercicio) slide in from the right and push over the landing. Lives in
 * presentation so the `app/(tabs)/progress/_layout.tsx` route stays a thin delegator
 * — same split as `NutricionStack` / `EntrenoStack`.
 */
export function ProgresoStack() {
  return <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />;
}
