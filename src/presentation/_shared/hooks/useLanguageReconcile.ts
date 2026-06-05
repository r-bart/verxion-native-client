import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDI } from "@/infrastructure/di/DIContext";

/**
 * Post-login language reconcile (§8.3). When the user has NOT made an explicit
 * local language choice, adopt the server's `appPreferences.language`
 * (already on the current-user query — no extra fetch).
 *
 * Precedence: explicit local choice > server preference > device locale. So we
 * only apply the server value when there is no stored override, and we never
 * persist it — a later server-side change keeps propagating, and the local
 * store stays reserved for choices the user makes on this device. Runs at most
 * once per session.
 */
export function useLanguageReconcile(opts: {
  enabled: boolean;
  serverLanguage: "en" | "es" | null | undefined;
}) {
  const { enabled, serverLanguage } = opts;
  const { i18n } = useTranslation();
  const getStored = useDI((c) => c.languagePreference.getStoredLanguage);
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !enabled || !serverLanguage) return;
    done.current = true;
    void getStored().then((stored) => {
      if (stored) return; // an explicit local choice always wins
      if (!i18n.language.toLowerCase().startsWith(serverLanguage)) {
        void i18n.changeLanguage(serverLanguage);
      }
    });
  }, [enabled, serverLanguage, getStored, i18n]);
}
