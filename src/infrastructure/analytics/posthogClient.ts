/**
 * PostHog client wiring. Instantiates `posthog-react-native` (a native module —
 * requires a dev-client rebuild) and registers it with the vendor-agnostic
 * analytics adapter via `setAnalyticsClient`. Feature code keeps calling
 * `track(...)`; this is the only file that imports the SDK.
 *
 * No-ops cleanly when `EXPO_PUBLIC_POSTHOG_KEY` is unset (e.g. tests), leaving
 * the adapter in its safe no-op state.
 */
import PostHog from "posthog-react-native";
import * as Application from "expo-application";
import { setAnalyticsClient } from "./analytics";

let instance: PostHog | null = null;

export function initPostHog(): PostHog | null {
  if (instance) return instance;

  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
  if (!apiKey) return null;

  instance = new PostHog(apiKey, { host });

  // Tag EVERY event as coming from this native client. Critical because the
  // web SPA fires identical event names (onboarding_started, _completed, …) to
  // the SAME PostHog project — without an explicit flag the two streams are
  // only separable via the implicit `$lib`/`$os` props. `platform`/`client`
  // make native-vs-web a first-class filter in any insight. `appVersion` aids
  // release-over-release comparisons.
  void instance.register({
    platform: "native",
    client: "verxion-native-client",
    app_version: Application.nativeApplicationVersion ?? "unknown",
  });

  // The adapter speaks `Record<string, unknown>`; PostHog wants JSON values.
  // Our event payloads are always JSON-safe, so cast at this one boundary
  // using PostHog's own parameter types (no `any`).
  type CaptureProps = Parameters<PostHog["capture"]>[1];
  type IdentifyProps = Parameters<PostHog["identify"]>[1];
  setAnalyticsClient({
    capture: (event, properties) => instance?.capture(event, properties as CaptureProps),
    identify: (distinctId, properties) => instance?.identify(distinctId, properties as IdentifyProps),
  });
  return instance;
}
