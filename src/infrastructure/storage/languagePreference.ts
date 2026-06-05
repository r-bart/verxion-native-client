/**
 * Persisted app-language override, in `expo-secure-store`.
 *
 * The app defaults to the device locale (see i18n init); this stores an explicit
 * user choice so it survives restarts. Best-effort, mirroring `onboardingDraft`
 * — a failed read/write just falls back to the device locale. Exposed via the DI
 * container (`languagePreference`) so presentation reaches it through `useDI`,
 * never importing infrastructure directly.
 */
import * as SecureStore from "expo-secure-store";

export type AppLanguage = "en" | "es";

export const SUPPORTED_LANGUAGES: readonly AppLanguage[] = ["en", "es"] as const;

const STORAGE_KEY = "appLanguage";

function isSupported(value: string | null): value is AppLanguage {
  return value === "en" || value === "es";
}

export async function getStoredLanguage(): Promise<AppLanguage | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    return isSupported(raw) ? raw : null;
  } catch {
    return null;
  }
}

export async function setStoredLanguage(language: AppLanguage): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, language);
  } catch {
    // Best-effort — a failed write just means the override isn't remembered.
  }
}
