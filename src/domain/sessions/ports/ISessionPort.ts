import type { Session, SessionListItem, SessionListParams, LiveSessionProgress } from "../models/Session";

export interface ISessionPort {
  getActiveSession(): Promise<Session | null>;
  getLiveProgress(id: string): Promise<LiveSessionProgress>;
  listSessions(params?: SessionListParams): Promise<SessionListItem[]>;
}
