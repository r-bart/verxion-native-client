/**
 * Geist + Geist Mono — the verxion type system. Plus Rubik Black, used ONLY for
 * the "verxion" wordmark (the brand logotype: Rubik 900, uppercase, scaleX(1.5),
 * tracking -0.02em — matching the web SPA's BrandLogo and verxion.ai).
 *
 * RN doesn't reliably synthesize weights from a single family, so each weight is
 * loaded as its own family name and referenced via the `sans()` / `mono()`
 * helpers. These are the practical font API for the design system; `tokens.ts`
 * holds the rest of the type scale (sizes, line-heights, roles).
 */
import { useFonts } from "expo-font";
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
  Geist_900Black,
} from "@expo-google-fonts/geist";
import {
  GeistMono_400Regular,
  GeistMono_500Medium,
  GeistMono_600SemiBold,
  GeistMono_700Bold,
} from "@expo-google-fonts/geist-mono";
import { Rubik_900Black } from "@expo-google-fonts/rubik";

/** Load the verxion type system. Call once at the app root and gate render on it. */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
    Geist_900Black,
    GeistMono_400Regular,
    GeistMono_500Medium,
    GeistMono_600SemiBold,
    GeistMono_700Bold,
    Rubik_900Black,
  });
  return loaded;
}

type SansWeight = 400 | 500 | 600 | 700 | 800 | 900;
type MonoWeight = 400 | 500 | 600 | 700;

const SANS: Record<SansWeight, string> = {
  400: "Geist_400Regular",
  500: "Geist_500Medium",
  600: "Geist_600SemiBold",
  700: "Geist_700Bold",
  800: "Geist_800ExtraBold",
  900: "Geist_900Black",
};

const MONO: Record<MonoWeight, string> = {
  400: "GeistMono_400Regular",
  500: "GeistMono_500Medium",
  600: "GeistMono_600SemiBold",
  700: "GeistMono_700Bold",
};

/** Geist Sans family name for a weight (UI, titles, numerals). */
export const sans = (w: SansWeight = 400): string => SANS[w];

/** Geist Mono family name for a weight (body/data — the brand default). */
export const mono = (w: MonoWeight = 400): string => MONO[w];

/** Rubik Black — the wordmark/logotype family. Use only via the `Wordmark` component. */
export const display = (): string => "Rubik_900Black";
