/**
 * Analytics adapter — a thin indirection so feature code calls `track(...)`
 * without importing a vendor SDK directly.
 *
 * PostHog (`posthog-react-native`) is a native module and requires a dev-client
 * rebuild, so it is wired in a later pass. Until `setAnalyticsClient` is called
 * with a real client at app root, `track`/`identify` are safe no-ops — the
 * onboarding flow runs fully without it, and turning analytics on is a one-line
 * change in `AppProvider` (no edits to any call site).
 */
export interface AnalyticsClient {
  capture(event: string, properties?: Record<string, unknown>): void;
  identify?(distinctId: string, properties?: Record<string, unknown>): void;
}

let client: AnalyticsClient | null = null;

export function setAnalyticsClient(next: AnalyticsClient | null): void {
  client = next;
}

export function track(event: string, properties?: Record<string, unknown>): void {
  client?.capture(event, properties);
  if (__DEV__ && !client) {
    // Surface events during development before PostHog is wired.
    console.log(`[analytics:noop] ${event}`, properties ?? {});
  }
}

export function identify(
  distinctId: string,
  properties?: Record<string, unknown>,
): void {
  client?.identify?.(distinctId, properties);
}
