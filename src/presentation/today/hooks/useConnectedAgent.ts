import { useConnectedApps } from "@/presentation/settings/hooks/useConnectedApps";

/**
 * Whether an AI agent (an OAuth/MCP client like Claude or ChatGPT) is connected.
 *
 * This is the SAME signal the web SPA uses — the connected-apps list — so there
 * is NO ad-hoc empty-state endpoint: it reuses settings' `GET /auth-sessions/apps`
 * (shared query cache via `settingsKeys.connectedApps()`). Drives the empty "Hoy"
 * steps card: step 1 ("connect your agent") flips to done once an app is authorized.
 *
 * v1 treats any authorized app as "the agent" and surfaces the first one's name;
 * refine to a known-agent client-id allowlist if/when we need to.
 */
export function useConnectedAgent() {
  const { data, isLoading } = useConnectedApps();
  const app = data && data.length > 0 ? data[0] : null;
  return { connected: !!app, appName: app?.appName ?? null, isLoading };
}
