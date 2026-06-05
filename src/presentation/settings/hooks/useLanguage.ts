import { useTranslation } from "react-i18next";
import { useDI } from "@/infrastructure/di/DIContext";

export type Language = "en" | "es";

/**
 * Reads/sets the active app language. react-i18next is the single reactive
 * source of truth (`i18n.language`); the choice is persisted via the DI
 * `languagePreference` service so it survives restarts. No client store needed.
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const persist = useDI((c) => c.languagePreference.setStoredLanguage);

  const language: Language = i18n.language?.toLowerCase().startsWith("es") ? "es" : "en";

  const setLanguage = (next: Language) => {
    if (next === language) return;
    void i18n.changeLanguage(next);
    void persist(next);
  };

  return { language, setLanguage };
}
