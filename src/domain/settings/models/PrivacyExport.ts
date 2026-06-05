/**
 * Data-export job (`POST /users/me/export`, `GET /users/me/export/:id`).
 * Server-side lifecycle statuses; the UI represents the no-job state as "idle"
 * separately (a null job), so it is not part of this server enum.
 */
export type PrivacyExportStatus =
  | "requested"
  | "processing"
  | "ready"
  | "downloaded"
  | "expired"
  | "failed";

export interface PrivacyExportJob {
  id: string;
  status: PrivacyExportStatus;
  requestedAt: string | null;
  expiresAt: string | null;
}
