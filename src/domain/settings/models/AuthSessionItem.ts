/**
 * An active auth session or OAuth access token, from `GET /auth-sessions`.
 * `display` is a server-formatted device/app label; `kind` distinguishes a
 * first-party browser/app session from a third-party OAuth token.
 */
export type AuthSessionKind = "oauth_access_token" | "session";

export interface AuthSessionItem {
  id: string;
  kind: AuthSessionKind;
  clientId: string | null;
  createdAt: string | null;
  expiresAt: string | null;
  lastActiveAt: string | null;
  ipAddress: string | null;
  isCurrent: boolean;
  display: string;
}

export interface AuthSessionsResult {
  items: AuthSessionItem[];
  total: number;
}

/** Result of `POST /auth-sessions/revoke-all`. */
export interface RevokeAllSessionsResult {
  revokedCount: number;
  keptCurrent: boolean;
}
