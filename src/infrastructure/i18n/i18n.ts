import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import en from "../../../locales/en.json";
import es from "../../../locales/es.json";
import { getStoredLanguage } from "@/infrastructure/storage/languagePreference";

const deviceLanguage = getLocales()[0]?.languageCode ?? "en";
const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: deviceLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Apply a persisted language override over the device locale (best-effort,
// async). No stored choice → keep the device locale picked above.
//
// Deliberate bootstrap exception to the cross-cutting-via-DI convention: that
// rule keeps *presentation* from importing infrastructure directly. This is
// infrastructure→infrastructure (i18n reading the language store) at module
// init, before any React/DI context exists, so it can't go through `useDI`.
// The write path (Settings) still goes through the container. Storage logic
// stays single-sourced in `languagePreference.ts`.
void getStoredLanguage().then((stored) => {
  if (stored && stored !== i18n.language) void i18n.changeLanguage(stored);
});

export default i18n;
