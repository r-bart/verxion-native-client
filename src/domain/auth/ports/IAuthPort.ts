import type { SessionData } from "../models/AuthUser";

export interface SignInEmailInput {
  email: string;
  password: string;
}

export interface SignUpEmailInput {
  email: string;
  password: string;
  name: string;
}

export interface IAuthPort {
  signUpEmail(input: SignUpEmailInput): Promise<{ userId: string }>;
  signInEmail(input: SignInEmailInput): Promise<SessionData>;
  signOut(): Promise<void>;
  getSession(): Promise<SessionData | null>;
}
