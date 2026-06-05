import type { ConsentCategory } from "./inputs";

/**
 * A third-party app authorized via OAuth, from `GET /auth-sessions/apps`.
 * `categories` is the server-computed per-category consent view so the UI can
 * render toggles without re-deriving them from raw scopes.
 */
export interface ConnectedAppCategory {
  key: ConsentCategory;
  active: boolean;
  destructive: boolean;
}

export interface ConnectedApp {
  clientId: string;
  appName: string;
  scopes: string[];
  categories: ConnectedAppCategory[];
  authorizedAt: string | null;
  tokenCount: number;
}
