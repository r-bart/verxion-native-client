/**
 * Persisted onboarding draft + "started at" timestamp, in `expo-secure-store`.
 *
 * Mirrors the SPA's `onboardingDraft` (localStorage there). Namespaced by
 * userId AND consent version so a draft captured against an older consent
 * version is never resumed — the stepper drops it on load when the server's
 * `currentHealthConsentVersion` has moved on.
 *
 * The store is generic on the draft shape: it takes/returns a plain object so
 * infrastructure never imports the presentation `FormState` type.
 */
import * as SecureStore from "expo-secure-store";

interface DraftKey {
  userId: string;
  consentVersion: string;
}

// SecureStore keys allow only [A-Za-z0-9._-]; userId/consentVersion are
// already in that set, but sanitize defensively so an odd value can't throw.
function sanitize(part: string): string {
  return part.replace(/[^A-Za-z0-9._-]/g, "_");
}

function draftStorageKey({ userId, consentVersion }: DraftKey): string {
  return `onboardingDraft.${sanitize(userId)}.${sanitize(consentVersion)}`;
}

function startedAtStorageKey({ userId, consentVersion }: DraftKey): string {
  return `onboardingStartedAt.${sanitize(userId)}.${sanitize(consentVersion)}`;
}

export async function saveOnboardingDraft<T extends object>(
  key: DraftKey,
  data: T,
): Promise<void> {
  try {
    await SecureStore.setItemAsync(draftStorageKey(key), JSON.stringify(data));
  } catch {
    // Best-effort persistence — a failed write just means no resume later.
  }
}

export async function loadOnboardingDraft<T>(
  key: DraftKey,
): Promise<T | null> {
  try {
    const raw = await SecureStore.getItemAsync(draftStorageKey(key));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function clearOnboardingDraft(key: DraftKey): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(draftStorageKey(key));
    await SecureStore.deleteItemAsync(startedAtStorageKey(key));
  } catch {
    // ignore
  }
}

export async function readOnboardingStartedAt(
  key: DraftKey,
): Promise<number | null> {
  try {
    const raw = await SecureStore.getItemAsync(startedAtStorageKey(key));
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function writeOnboardingStartedAt(
  key: DraftKey,
  startedAt: number,
): Promise<void> {
  try {
    await SecureStore.setItemAsync(startedAtStorageKey(key), String(startedAt));
  } catch {
    // ignore
  }
}
