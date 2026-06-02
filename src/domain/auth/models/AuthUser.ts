export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
}

export interface AuthSession {
  token: string;
  userId: string;
  expiresAt: Date;
}

export interface SessionData {
  user: AuthUser;
  session: AuthSession;
}
