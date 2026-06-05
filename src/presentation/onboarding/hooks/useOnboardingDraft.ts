import { useDI } from "@/infrastructure/di/DIContext";

/**
 * Encapsulates onboarding draft persistence so the stepper component stays free
 * of storage I/O. The underlying SecureStore wrapper is reached through `useDI`
 * (the `onboardingDraftStore` service) — no direct infrastructure import — and
 * the functions are bound to the active `{ userId, consentVersion }` key,
 * no-opping until both are known.
 *
 * Draft/started-at persistence is durable UI state (resume-where-you-left-off),
 * not domain data, so it is exposed as a DI service rather than a domain Use
 * Case — same treatment as the web SPA.
 */
export function useOnboardingDraft(userId: string | null, consentVersion: string | null) {
  const store = useDI((c) => c.onboardingDraftStore);

  const ready = !!userId && !!consentVersion;
  const key = ready ? { userId: userId!, consentVersion: consentVersion! } : null;

  return {
    ready,
    load: <T>(): Promise<T | null> =>
      key ? store.loadOnboardingDraft<T>(key) : Promise.resolve(null),
    save: <T extends object>(data: T): Promise<void> =>
      key ? store.saveOnboardingDraft(key, data) : Promise.resolve(),
    clear: (): Promise<void> => (key ? store.clearOnboardingDraft(key) : Promise.resolve()),
    readStartedAt: (): Promise<number | null> =>
      key ? store.readOnboardingStartedAt(key) : Promise.resolve(null),
    writeStartedAt: (startedAt: number): Promise<void> =>
      key ? store.writeOnboardingStartedAt(key, startedAt) : Promise.resolve(),
  };
}
